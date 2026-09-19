import type {
    Principal,
} from "../../../Shared/types/Principal.js";

import type {
    Ticket,
} from "../domain/ticket-types.js";

import type {
    TicketStatus,
} from "../domain/ticket-status.js";

import {
    canTransitionTicketStatus,
} from "../domain/ticket.transitions.js";

import {
    ConcurrentTicketModificationError,
    InvalidTicketStateTransitionError,
    InvalidTicketUpdateError,
    TicketForbiddenError,
    TicketNotFoundError,
} from "../domain/ticket.errors.js";

import {
    canChangeTicketStatus,
    canEditTicket,
} from "../policies/ticket.policy.js";

import type {
    TicketMutation,
    TicketRepository,
} from "../repositories/ticket.repository.js";

export interface CreateTicketCommand {
    title: string;
    description: string;
}

export interface UpdateTicketCommand {
    title?: string;
    description?: string;

    expectedVersion: number;
}

export interface ChangeTicketStatusCommand {
    status: TicketStatus;

    expectedVersion: number;
}

export type Clock =
    () => Date;

export class TicketService {

    constructor(
        private readonly repository:
            TicketRepository,

        private readonly clock: Clock =
            () => new Date(),
    ) {}

    async createTicket(
        actor: Principal,
        command: CreateTicketCommand,
    ): Promise<Ticket> {

        const now =
            this.clock();

            return this.repository.create({
                ownerId:
                    actor.userId,

                title:
                    command.title,

                description:
                    command.description,

                status:
                    "OPEN",

                version:
                    1,

                createdAt:
                    now,
                
                updateAt:
                    now,
            });
    }

    async getTicket(
        actor: Principal,
        ticketId: string,
    ): Promise<Ticket> {

        const ticket =
            await this.findVisibleTicket(
                actor,
                ticketId,
            );

        if (!ticket) {
            throw new TicketNotFoundError();
        }

        return ticket;
    }

    async listTickets(
        actor: Principal,
    ): Promise<Ticket[]> {

        if (
            actor.role === "SUPPORT"
        ) {
            return this.repository.listAll();
        }

        return this.repository.listOwnedBy(
            actor.userId,
        );
    }

    async updateTicket(
        actor: Principal,
        ticketId: string,
        command: UpdateTicketCommand,
    ): Promise<Ticket> {

        if (
            command.title === undefined &&
            command.description === undefined
        ) {
            throw new InvalidTicketUpdateError();
        }

        const ticket =
            await this.findVisibleTicket(
                actor,
                ticketId,
            );
        
        if (!ticket) {
            throw new TicketNotFoundError();
        }

        if (
            !canEditTicket(
                actor,
                ticket,
            )
        ) {
            throw new TicketForbiddenError(
                "edit this ticket",
            );
        }

        this.assertExpectedVersion(
            ticket,
            command.expectedVersion,
        );

        const mutation:
            TicketMutation = {};

        if (
            command.title !== undefined
        ) {
            mutation.title =
                command.title;
        }

        if (
            command.description !== undefined
        ) {
            mutation.description =
                command.description;
        }

        return this.performVersionUpdate(
            ticketId,
            command.expectedVersion,
            mutation,
        );
    }

    async changeTicketStatus(
        actor: Principal,
        ticketId: string,
        command: ChangeTicketStatusCommand,
    ): Promise<Ticket> {

        if (
            !canChangeTicketStatus(actor)
        ) {
            throw new TicketForbiddenError(
                "change ticket status",
            );
        }

        const ticket =
        await this.repository.findById(
            ticketId,
        );

        if (!ticket) {
            throw new TicketNotFoundError();
        }

        this.assertExpectedVersion(
            ticket,
            command.expectedVersion,
        );

        if (
            !canTransitionTicketStatus(
                ticket.status,
                command.status,
            )
        ) {
            throw new InvalidTicketStateTransitionError(
                ticket.status,
                command.status,
            );
        }

        return this.performVersionUpdate(
            ticketId,
            command.expectedVersion,
            {
                status:
                    command.status,
            },
        );
    }

    private async findVisibleTicket(
        actor: Principal,
        ticketId: string,
    ): Promise<Ticket | null> {

        if (
            actor.role === "SUPPORT"
        ) {
            return this.repository.findById(
                ticketId,
            );
        }

        return this.repository.findOwnedById(
            ticketId,
            actor.userId,
        );
    }
    
    private assertExpectedVersion(
        ticket: Ticket,
        expectedVersion: number,
    ): void {

        if (
            ticket.version !== expectedVersion 
        ) {
            throw new ConcurrentTicketModificationError(
                expectedVersion,
                ticket.version,
            );
        }
    }

    private async performVersionUpdate(
        ticketId: string,
        expectedVersion: number,
        mutation: TicketMutation,
    ): Promise<Ticket> {

        const result =
            await this.repository.updateWithVersion(
                ticketId,
                expectedVersion,
                mutation,
                this.clock(),
            );

        switch (result.kind) {

            case "UPDATED":
                return result.ticket;
            
            case "NOT_FOUND":
                throw new TicketNotFoundError();

            case "VERSION_CONFLICT":
                throw new ConcurrentTicketModificationError(
                    expectedVersion,
                    result.currentVersion,
                );
        }
    }
}