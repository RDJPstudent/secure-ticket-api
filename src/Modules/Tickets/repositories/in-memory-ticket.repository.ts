import { randomUUID } from "node:crypto";

import type {
    Ticket,
} from "../domain/ticket-types.js";

import type {
    CreateTicketRecord,
    TicketMutation,
    TicketRepository,
    TicketUpdateResult,
} from "./ticket.repository.js";

function cloneTicket(
    ticket: Ticket,
): Ticket {

    return {
        ...ticket,
        createdAt: new Date(ticket.createdAt),
        updateAt: new Date(ticket.updateAt),
    };
}

export class InMemoryTicketRepository
implements TicketRepository {

    private readonly tickets =
    new Map<string, Ticket>();

    constructor(
        initialTickets: Ticket[] = [],
    ) {

        for (const ticket of initialTickets) {
            this.tickets.set(
                ticket.id,
                cloneTicket(ticket),
            );
        }
    }

    async create(
        record: CreateTicketRecord,
    ): Promise<Ticket> {

        const ticket: Ticket = {
            id: randomUUID(),

            ownerId: record.ownerId,

            title: record.title,
            description: record.description,

            status: record.status,
            version: record.version,

            createdAt: new Date(record.createdAt),
            updateAt: new Date(record.updateAt),
        };

        this.tickets.set(
            ticket.id,
            cloneTicket(ticket)
        );

        return cloneTicket(ticket);

    }

    async findById(
    ticketId: string,
    ): Promise<Ticket | null>{

        const ticket =
        this.tickets.get(ticketId);

        return ticket
        ? cloneTicket(ticket)
        : null;

    }

    async findOwnedById(
        ticketId: string,
        ownerId: string,
    ): Promise<Ticket | null> {

        const ticket = this.tickets.get(ticketId);

        if (
            !ticket ||
            ticket.ownerId !== ownerId
        ){
            return null;
        }

        return cloneTicket(ticket)
    }

    async listAll(): Promise<Ticket[]> {

        return Array
        .from(this.tickets.values())
        .map(cloneTicket)
    }

    async listOwnedBy(
        ownerId: string,
    ): Promise<Ticket[]> {

        return Array
        .from(this.tickets.values())
        .filter(
            (ticket) =>
                ticket.ownerId === ownerId,
        )
        .map(cloneTicket);
    }

    async updateWithVersion(
        ticketId: string,
        expectedVersion: number,
        mutation: TicketMutation,
        updateAt: Date,
    ): Promise<TicketUpdateResult> {

        const current =
        this.tickets.get(ticketId);

        if(!current) {
            return {
                kind: "NOT_FOUND",
            };
        }

        const updated: Ticket = {
            ...current,
            ...mutation,

            version:
            current.version + 1,

            updateAt:
            new Date(updateAt),
        };

        this.tickets.set(
            ticketId,
            cloneTicket(updated),
        );

        return {
            kind:"UPDATED",
            ticket: cloneTicket(updated),
        };
    }
}