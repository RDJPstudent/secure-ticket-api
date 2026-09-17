import type {
    Ticket,
} from "../domain/ticket-types.js";

import type {
    TicketStatus,
} from "../domain/ticket-status.js";

export interface CreateTicketRecord {
    ownerId: string;

    title: string;
    description: string;

    status: TicketStatus;
    version: number;

    createdAt: Date;
    updateAt: Date;
}

export interface TicketMutation {
    title?: string;
    description?: string;
    status?: TicketStatus;
}

export type TicketUpdateResult =
    |   {
        kind: "UPDATED";
        ticket: Ticket;
        }
    |   {
        kind: "NOT_FOUND";
        }
    |   {
        kind: "VERSION_CONFLICT";
        currentVersion: number;
    };

export interface TicketRepository {

    create(
        record: CreateTicketRecord,
    ): Promise<Ticket>;

    findById(
        ticketId: string,
    ): Promise<Ticket | null>;

    findOwnedById(
        ticketId: string,
        ownerId: string,
    ): Promise<Ticket | null>;

    listAll(): Promise<Ticket[]>;

    listOwnedBy(
        ownerId: string,
    ): Promise<Ticket[]>;

    updateWithVersion(
        ticketId: string,
        expectedVersion: number,
        mutation: TicketMutation,
        updateAt: Date,
    ): Promise<TicketUpdateResult>;
}