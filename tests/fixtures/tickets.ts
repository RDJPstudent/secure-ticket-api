import type {
    Ticket,
} from "../../src/Modules/Tickets/domain/ticket-types.js";

const CREATED_AT =
    new Date("2026-01-01T12:00:00.000Z");

    export const TICKET_A_OPEN: Ticket = {
        id: "ticket-a-open",
        ownerId: "user-a",

        title: "Website login issue",
        description: "Unable to authenticate.",

        status: "OPEN",
        version: 1,

        createdAt: CREATED_AT,
        updateAt: CREATED_AT,
    };

export const TICKET_B_OPEN: Ticket = {
    id: "ticket-b-open",
    ownerId: "user-b",

    title: "Network connection issue",
    description: "Unable to access network.",

    status: "OPEN",
    version: 1,

    createdAt: CREATED_AT,
    updateAt: CREATED_AT,
};