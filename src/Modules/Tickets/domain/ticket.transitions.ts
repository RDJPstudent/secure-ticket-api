import type {
    TicketStatus,
} from "./ticket-status.js";

const ALLOWED_TRANSITION:
    Readonly<Record<TicketStatus, readonly TicketStatus[]>> = {

        OPEN: [
            "IN_PROGRESS",
        ],

        IN_PROGRESS: [
            "RESOLVED",
        ],

        RESOLVED: [
            "IN_PROGRESS",
            "CLOSED",
        ],
        CLOSED: [],
    };

export function canTransitionTicketStatus(
    current: TicketStatus,
    requested: TicketStatus,
): boolean {

    return ALLOWED_TRANSITION[
        current
    ].includes(requested)
}