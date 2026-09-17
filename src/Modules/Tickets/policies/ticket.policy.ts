import type {
    Ticket,
} from "../domain/ticket-types.js";

import type {
    Principal,
} from "../../../Shared/Types/Principal.js";

function isSupport(
    actor: Principal,
): boolean {

    return actor.role ==="SUPPORT";
}

function ownsTicket(
    actor: Principal,
    ticket:Ticket,
): boolean {

    return ticket.ownerId === actor.userId;
}

export function canReadTicket(
    actor: Principal,
    ticket: Ticket,
): boolean {
    
    return (
        isSupport(actor) ||
        ownsTicket(actor, ticket)
    );
}

export function canEditTicket(
    actor: Principal,
    ticket: Ticket,
): boolean {

    return(
        isSupport(actor) ||
        ownsTicket(actor, ticket)
    );
}

export function canChangeTicketStatus(
    actor: Principal,
): boolean {

    return isSupport(actor);
}

export function canListUsers(
    actor:Principal,
): boolean {

    return isSupport(actor);
}
