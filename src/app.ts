import express, {
    type Express,
    type RequestHandler,
} from "express";

import type {
    TicketService,
} from "./Modules/Tickets/services/ticket.service.js";

import {
    createTicketRouter,
} from "./Modules/Tickets/ticket.routes.js";

import {
    requestIdMiddleware,
} from "./Shared/http/request-id.middleware.js";

import {
    notFoundHandler,
} from "./Shared/http/not-found-handler.js";

import {
    errorHandler,
} from "./Shared/http/error-handler.js";

export interface AppDependencies {

    ticketService:
        TicketService;

    principalMiddleware:
        RequestHandler;

}

export function createApp(
    dependencies:
        AppDependencies,
): Express {

    const app =
    express();

    app.disable(
        "x-powered-by",
    );

    app.use(
        requestIdMiddleware,
    );

    app.use(
        express.json({
            limit: "32kb",
        }),
    );

    app.get(
        "/health",
        (_req, res) => {

            res
            .status(200)
            .json({
                status:
                "ok",
            });
        },
    );

    app.use(
        "/api/v1/tickets",

        createTicketRouter(
            dependencies.ticketService,
            dependencies.principalMiddleware,
        ),
    );

    app.use(
        notFoundHandler,
    );

    app.use(
        errorHandler,
    );

    return app;
}