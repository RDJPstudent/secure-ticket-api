import type { TicketStatus } from "./ticket-status.js";

export interface Ticket {
    id: string;
    ownerId: string;

    title: string;
    description: string;

    status: TicketStatus;
    version: number;

    createdAt: Date;
    updateAt: Date
}