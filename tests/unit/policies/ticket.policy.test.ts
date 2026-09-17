import {
    describe,
    expect,
    it,
} from "vitest";

import {
    canChangeTicketStatus,
    canEditTicket,
    canListUsers,
    canReadTicket,
} from "../../../src/Modules/Tickets/policies/ticket.policy.js";

import {
    SUPPORT_A,
    USER_A,
    USER_B,
} from "../../fixtures/principals.js";

import {
    TICKET_A_OPEN,
} from "../../fixtures/tickets.js";

describe("ticket authorization policy", () => {

    describe("read ticket", () => {

        it(
            "allows a USER to read their own ticket",
            () => {

                expect(
                    canReadTicket(
                        USER_A,
                        TICKET_A_OPEN,
                    ),
                ).toBe(true)
            },
        );

        it(
            "denies a USER reading another user's ticket",
            () => {

                expect(
                    canReadTicket(
                        USER_B,
                        TICKET_A_OPEN,
                    ),
                ).toBe(false);
            },
        );

        it(
            "allows SUPPORT to read any ticket",
            () => {

                expect(
                    canReadTicket(
                        SUPPORT_A,
                        TICKET_A_OPEN,
                    ),
                ).toBe(true);
            },
        );
    });

    describe("edit ticket", () => {

        it(
            "allows an owner to edit their ticket",
            () => {

                expect(
                    canEditTicket(
                        USER_A,
                        TICKET_A_OPEN,
                    ),
                ).toBe(true);
            },
        );

        it(
            "denies another USER editing the ticket",
            () => {

                expect(
                    canEditTicket(
                        USER_B,
                        TICKET_A_OPEN,
                    ),
                ).toBe(false);
            },
        );

        it(
            "allows SUPPORT to edit a ticket",
            () => {

                expect(
                    canEditTicket(
                        SUPPORT_A,
                        TICKET_A_OPEN,
                    ),
                ).toBe(true);
            },
        );
    });

    describe("ticket status", () => {

        it(
            "denies USER status changes",
            () => {

                expect(canChangeTicketStatus(USER_A),
                ).toBe(false);
            },
        );

        it(
            "allows SUPPORT to request status changes",
            () => {

                expect(canChangeTicketStatus(SUPPORT_A),
                ).toBe(true);
            },
        );
    });

describe("user listing", ()=> {
    it(
        "denies USER access to the user list",
        () => {

             expect(
                canListUsers(USER_A),
            ).toBe(false);
        },
    );

    it(
        "allows SUPPORT access to the user list",
        () => {

            expect(
                canListUsers(SUPPORT_A)
            ).toBe(true);
            },
        );
     });
});