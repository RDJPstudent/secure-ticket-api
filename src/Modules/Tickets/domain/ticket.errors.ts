import type { TicketStatus } from "./ticket-status.js";

export class TicketNotFoundError extends Error {
    constructor() {
        super("Ticket was not found.");
        this.name = "TicketNotFoundError";
    }
}

export class TicketForbiddenError extends Error {
    constructor(operation: string) {
        super(`Actor is not permitted to ${operation}.`);
        this.name = "TicketForbiddenError";
    }
}

export class InvalidTicketStateTransitionError extends Error {
    constructor(
        public readonly currentStatus: TicketStatus,
        public readonly requestedStatus: TicketStatus,
    ) {
        super(
            `Ticket cannot transition from ${currentStatus} to ${requestedStatus}.`,
        );

        this.name = "InvalidTicketStateTransitionError";
    }
}

export class ConcurrentTicketModificationError extends Error {
    constructor(
        public readonly expectedVersion: number,
        public readonly currentVersion: number,
    ) {
        super(
            `Expected ticket version ${expectedVersion}, but current version is ${currentVersion}.`,
        );

        this.name = "ConcurrentTicketModificationError";
    }
}

export class InvalidTicketUpdateError extends Error {
    constructor() {
        super("Ticket update requires at least one mutable property.");
        this.name = "InvalidTicketUpdateError";
    }
}