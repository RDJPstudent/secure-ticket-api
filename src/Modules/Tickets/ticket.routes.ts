import {
    Router,
    type RequestHandler,
} from "express";

import type {
    TicketService,
} from "./services/ticket.service.js";

import {
    createTicketController,
} from "./ticket.controller.js";

import {
    changeTicketStatusBodySchema,
    createTicketBodySchema,
    ticketIdParamsSchema,
    updateTicketBodySchema,
} from "./ticket.schemas.js";

import {
    validateRequest,
} from "../../Shared/http/validation.middleware.js";

export function createTicketRouter(
    service: TicketService,
    principalMiddleware:
        RequestHandler,
): Router {

    const router =
    Router();

    const controller =
    createTicketController(
        service,
    );

    router.use(
        principalMiddleware,
    );

    router.post(
        "/",
        validateRequest({
            body:
                createTicketBodySchema,
        }),
        controller.createTicket,
    );

    router.get(
        "/",
        controller.listTickets,
    );

    router.get(
        "/:ticketId",
        validateRequest({
            params:
                ticketIdParamsSchema,
        }),
        controller.getTicket,
    );

    router.patch(
        "/:ticketId",
        validateRequest({
            params:
                ticketIdParamsSchema,

            body:
                updateTicketBodySchema,
        }),
        controller.updateTicket,
    );

    router.patch(
        "/:ticketId/status",
        validateRequest({
            params:
                ticketIdParamsSchema,

            body:
                changeTicketStatusBodySchema,
        }),
        controller.changeTicketStatus,
    );


    return router;
}