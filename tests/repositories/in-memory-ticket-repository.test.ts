import {
    describe,
    expect,
    it,
} from "vitest";

import {
    InMemoryTicketRepository,
} from "../../src/Modules/Tickets/repositories/in-memory-ticket.repository.js";

import {
    TICKET_A_OPEN,
} from "../fixtures/tickets.js";

describe(
    "InMemoryTicketRepository",
    () => {

        it(
            "allows only one update for the same expected version",
            async () => {

                const repository =
                    new InMemoryTicketRepository([
                        TICKET_A_OPEN,
                    ]);

                const first =
                    await repository.updateWithVersion(
                        TICKET_A_OPEN.id,
                        1,
                        {
                            title:
                            "First update",
                        },
                        new Date(),
                    );

                expect(
                    first.kind,
                ).toBe(
                    "UPDATED",
                );

                const second =
                    await repository.updateWithVersion(
                        TICKET_A_OPEN.id,
                        1,
                        {
                            description:
                                "Second update",
                        },
                        new Date(),
                    );

                    expect(
                        second,
                    ).toEqual({
                        kind:
                            "VERSION_CONFLICT",

                        currentVersion:
                        2,
                    });
            },
        );
    },
);