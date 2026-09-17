import {
    beforeEach,
    describe,
    expect,
    it,
} from "vitest";

import {
    TicketService,
} from "../../Tickets/services/ticket.service.js";

import {
    InMemoryTicketRepository,
} from "../../Tickets/repositories/in-memory-ticket.repository.js";

import {
    ConcurrentTicketModificationError,
    InvalidTicketStateTransitionError,
    TicketForbiddenError,
    TicketNotFoundError,
} from "../../Tickets/domain/ticket.errors.js";

import {
    SUPPORT_A,
    USER_A,
    USER_B,
} from "../../../../tests/fixtures/principals.js";

import {
    TICKET_A_OPEN,
    TICKET_B_OPEN,
} from "../../../../tests/fixtures/tickets.js";

const NOW = 
    new Date(
        "2026-09-16T20:00:00.000Z",
    );

describe(
    "TicketService",
    () => {

        let repository:
            InMemoryTicketRepository;

        let service:
            TicketService;

        beforeEach(
            () => {
                repository =
                    new InMemoryTicketRepository([
                        TICKET_A_OPEN,
                        TICKET_B_OPEN,
                    ]);
                service =
                    new TicketService(
                        repository,
                        () => new Date(NOW),
                    );
            },
        );

        describe(
            "createTicket",
            () => {

                it(
                    "creates an OPEN ticket owned by the authenticated actor",
                    async () => {

                        const ticket =
                            await service.createTicket(
                                USER_A,
                                {
                                    title:
                                        "Password reset issue",

                                    description:
                                        "Unable to reset password",
                                },
                            );

                        expect(
                            ticket.ownerId,
                        ).toBe(
                            USER_A.userId,
                        );

                        expect(
                            ticket.status,
                        ).toBe(
                            "OPEN",
                        );

                        expect(
                            ticket.version,
                        ).toBe(
                            1,
                        );

                        expect(
                            ticket.createdAt,
                        ).toEqual(
                            NOW,
                        );
                    },
                );
            },
        );

        describe(
            "getTicket",
            () => {

                it(
                    "allows a USER to read their own ticket",
                    async () => {

                        const ticket =
                            await service.getTicket(
                                USER_A,
                                TICKET_A_OPEN.id,
                            );
                        
                        expect(
                            ticket.id,
                        ).toBe(
                            TICKET_A_OPEN.id,
                        );
                    },
                );

                it(
                    "concelas another USER's ticket as not found",
                    async () => {
                        
                        await expect(
                            service.getTicket(
                                USER_B,
                                TICKET_A_OPEN.id,
                            ),
                        ).rejects.toBeInstanceOf(
                            TicketNotFoundError,
                        );
                    },
                );

                it(
                    "allows SUPPORT to read any ticket",
                    async () => {

                        const ticket =
                            await service.getTicket(
                                SUPPORT_A,
                                TICKET_A_OPEN.id,
                            );

                        expect(
                            ticket.id,
                        ).toBe(
                            TICKET_A_OPEN.id,
                        );
                    },
                );
            },
        );

        describe(
            "listTickets",
            () => {

                it(
                    "returns only tickets owned by USER",
                    async () => {

                        const tickets =
                            await service.listTickets(
                                USER_A,
                            );

                        expect(
                            tickets[0]?.ownerId,
                        ).toBe(
                            USER_A.userId,
                        );
                    },
                );

                it(
                    "return all tickets to SUPPORT",
                    async () => {

                        const tickets =
                            await service.listTickets(
                                SUPPORT_A,
                            );

                        expect(
                            tickets,
                        ).toHaveLength(
                            2,
                        );
                    },
                );
            },
        );

        describe(
            "updateticket",
            () => {

                it(
                    "allows an owner to update title",
                    async() => {

                        const updated =
                            await service.updateTicket(
                                USER_A,
                                TICKET_A_OPEN.id,
                                {
                                    title:
                                        "Updated login issue",

                                        expectedVersion:
                                        1,
                                },
                            );

                        expect(
                            updated.title,
                        ).toBe(
                            "Updated login issue",
                        );

                        expect(
                            updated.version,
                        ).toBe(
                            2,
                        );
                    },
                );

                it(
                    "conceals another USER's ticket",
                    async () => {

                        await expect(
                            service.updateTicket(
                                USER_B,
                                TICKET_A_OPEN.id,
                            {
                                title:
                                "Unauthorized edit",

                                expectedVersion:
                                1,
                            },
                            ),
                        ).rejects.toBeInstanceOf(
                            TicketNotFoundError,
                        );
                    },
                );

                it(
                    "rejects a stale expected version",
                    async () => {

                        await service.updateTicket(
                            USER_A,
                            TICKET_A_OPEN.id,
                            {
                                title:
                                "First edit",

                                expectedVersion:
                                1,
                            },
                        );

                        await expect(
                            service.updateTicket(
                                USER_A,
                                TICKET_A_OPEN.id,
                                {
                                    description:
                                    "Stale edit",

                                    expectedVersion:
                                    1,
                                },
                            ),
                        ).rejects.toBeInstanceOf(
                            ConcurrentTicketModificationError,
                        );
                    },
                );
            },
        );

        describe(
            "changeTicketStatus",
            () => {

                it(
                    "denies USER status changes",
                    async () => {

                        await expect(
                            service.changeTicketStatus(
                                USER_A,
                                TICKET_A_OPEN.id,
                                {
                                    status:
                                    "IN_PROGRESS",

                                    expectedVersion:
                                    1,
                                },
                            ),
                        ).rejects.toBeInstanceOf(
                            TicketForbiddenError,
                        );
                    },
                );

                it(
                    "allows SUPPORT to perform a valid transition",
                    async () => {

                        const updated =
                        await service.changeTicketStatus(
                            SUPPORT_A,
                            TICKET_A_OPEN.id,
                            {
                                status:
                                    "IN_PROGRESS",

                                expectedVersion:
                                    1,
                            },
                        );

                        expect(
                            updated.status,
                        ).toBe(
                            "IN_PROGRESS",
                        );

                        expect(
                            updated.version,
                        ).toBe(
                            2,
                        );
                    },
                );

                it(
                    "rejects SUPPORT performing an invalid transition",
                    async () => {

                        await expect(
                            service.changeTicketStatus(
                                SUPPORT_A,
                                TICKET_A_OPEN.id,
                                {
                                    status:
                                        "RESOLVED",

                                    expectedVersion:
                                    1,
                                },
                            ),
                        ).rejects.toBeInstanceOf(
                            InvalidTicketStateTransitionError,
                        );
                    },
                );
            },
        );
    },
);