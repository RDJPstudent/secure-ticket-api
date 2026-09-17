export const TICKET_STATUSES = [
    "OPEN",
    "IN_PROGRESS",
    "RESOLVED",
    "CLOSED",
] as const;

export type TicketStatus =(
    typeof TICKET_STATUSES)[number];