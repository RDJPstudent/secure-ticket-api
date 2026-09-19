import type {
    Ticket,
} from "./domain/ticket-types.js";

export interface TicketResponse {

    id: string;
    ownerId: string;

    title: string;
    description: string;

    status:
        Ticket["status"];
    
    version: number;

    createdAt: string;
    updatedAt: string;
}

export function serializeTicket(
    ticket: Ticket,
): TicketResponse {

    return {

        id:
            ticket.id,
        
        ownerId:
            ticket.ownerId,

        title:
            ticket.title,

        description:
            ticket.description,

        status:
            ticket.status,

        version:
            ticket.version,

        createdAt:
            ticket.createdAt.toISOString(),

        updatedAt:
            ticket.updatedAt.toISOString(),
    }
}