import type {
    Request,
    RequestHandler,
    Response,
} from "express";

import type {
    Principal,
} from "../../Shared/types/Principal.js";

import {
    AuthenticationRequiredError,
} from "../../Shared/errors/authentication.errors.js";

import {
    validatedBody,
    validatedParams,
} from "../../Shared/http/validation.middleware.js";

import type {
    TicketService,
    UpdateTicketCommand,
} from "./services/ticket.service.js";

import type {
    ChangeTicketStatusBody,
    CreateTicketBody,
    TicketIdParams,
    UpdateTicketBody,
} from "./ticket.schemas.js";

import {
    serializeTicket,
} from "./ticket.serializer.js";

function requirePrincipal(
    req: Request,
): Principal {

    if (!req.principal){

        throw new AuthenticationRequiredError();

    }

    return req.principal;

}

export function createTicketController(
    service: TicketService,
) {

    const createTicket:
        RequestHandler =
        async (
            req,
            res,
        ) => {

            const actor =
                requirePrincipal(req);

            const body =
                validatedBody<CreateTicketBody>(
                    res,
                );

            const ticket =
                await service.createTicket(
                    actor,
                    {
                        title:
                            body.title,

                        description:
                            body.description,
                    },
                );
            
            const listTickets:
                RequestHandler =
                    async (
                        req,
                        res,
                    ) => {

                        const actor =
                            requirePrincipal(req);

                        const tickets = 
                            await service.listTickets(
                                actor,
                            );

                        res
                        .status(200)
                        .json({

                            data:
                                tickets.map(
                                    serializeTicket,
                                ),
                        });
                    };
            
            const getTicket:
                RequestHandler =
                    async (
                        req,
                        res,
                    ) => {

                        const actor =
                            requirePrincipal(req);

                        const params =
                            validatedParams<TicketIdParams>(
                                res,
                            );
                        
                        const ticket =
                            await service.getTicket(
                                actor,
                                params.ticketId,
                            );

                        res
                        .status(200)
                        .json({
                            data:
                                serializeTicket(
                                    ticket,
                                ),
                        });
                    };
            
            const updateTicket:
                RequestHandler =
                    async (
                        req,
                        res,
                    ) => {

                        const actor =
                            requirePrincipal(req);

                        const params =
                            validatedParams<TicketIdParams>(
                                res,
                            );
                        
                        const body =
                            validatedBody<UpdateTicketBody>(
                                res,
                            );

                        const command:
                            UpdateTicketCommand = {

                                expectedVersion:
                                    body.expectedVersion,

                            };

                        if (
                            body.title !== undefined
                        ) {

                            command.title =
                            body.title;
                        }

                        if (
                            body.description !== undefined
                        ) {

                            command.description =
                            body.description;
                        }

                        const ticket =
                            await service.updateTicket(
                                actor,
                                params.ticketId,
                                command,
                            );

                        res
                        .status(200)
                        .json({
                            data:
                                serializeTicket(
                                    ticket,
                                ),
                        });
                    };

            const changeTicketStatus:
                RequestHandler =
                    async (
                        req,
                        res,
                    ) => {

                        const actor = 
                        requirePrincipal(req);

                        const params =
                        validatedParams<TicketIdParams>(
                            res,
                        );

                        const body =
                        validatedBody<
                        ChangeTicketStatusBody
                        >(
                            res,
                        );

                        
                        const ticket =
                            await service
                                .changeTicketStatus(
                                    actor,
                                    params.ticketId,
                                    {
                                        status:
                                        body.status,

                                        expectedVersion:
                                        body.expectedVersion,
                                    },
                                );

                            res
                            .status(200)
                            .json({
                                data:
                                    serializeTicket(
                                        ticket,
                                    ),
                            });
                    };

            return {
                createTicket,
                listTickets,
                getTicket,
                updateTicket,
                changeTicketStatus,
            };
        }
}