import type {
    ErrorRequestHandler,
} from "express";

import {
    ZodError,
} from "zod";

import {
    AuthenticationRequiredError,
} from "../errors/authentication.errors.js";

import {
    ConcurrentTicketModificationError,
    InvalidTicketStateTransitionError,
    InvalidTicketUpdateError,
    TicketForbiddenError,
    TicketNotFoundError,
} from "../../Modules/Tickets/domain/ticket.errors.js";

function sendError(
    res: Parameters<
    ErrorRequestHandler
    >[2],
    status: number,
    code: string,
    message: string,
    requestId: string,
    details: unknown[] = [],
): void {

    res
    .status(status)
    .json({

        error: {
            code,
            message,
            details,
            requestId,
        },
    });
}

export const errorHandler:
    ErrorRequestHandler = (
        error,
        req,
        res,
        _next,
    ) => {

        const requestId =
        req.requestId ??
        "unknown";

        if (
            error instanceof ZodError
        ) {

            sendError(
                res,
                400,
                "VALIDATION_ERROR",
                "The request contains invalid data.",
                requestId,
                error.issues.map(
                    (issue) => ({

                        field:
                            issue.path.join("."),

                        issue:
                            issue.message,

                    }),
                ),
            );

            return;

        }

        if (
            error instanceof
            AuthenticationRequiredError
        ) {

            sendError(
                res,
                401,
                "AUTHENTICATION_REQUIRED",
                "Authetincation is required.",
                requestId,
            );

            return;
        }

        if (
            error instanceof
            TicketNotFoundError
        ) {

            sendError(
                res,
                404,
                "RESOURCE_NOT_FOUND",
                "The requested resource was not found.",
                requestId,
            );

            return;
        }

        if (
            error instanceof
            TicketForbiddenError
        ) {

            sendError(
                res,
                403,
                "FORBIDDEN",
                "The requested operation is not permitted.",
                requestId,
            );

            return;
        }

        if (
            error instanceof
            InvalidTicketStateTransitionError
        ) {

            sendError(
                res,
                409,
                "INVALID_STATE_TRANSITION",
                "The requested ticket state transition is not permitted.",
                requestId,
            );

            return;
        }

        if (
            error instanceof
            ConcurrentTicketModificationError
        ) {

            sendError(
                res,
                409,
                "CONCURRENT_MODIFICATION",
                "The ticket has changed since it was last read.",
                requestId,
            );

            return;
        }

        if (
            error instanceof
            InvalidTicketUpdateError
        ) {

            sendError(
                res,
                400,
                "VALIDATION_ERROR",
                "Thie ticket update contains no mutable properties.",
                requestId,
            );

            return;
        }

        const possibleHttpError =
            error as {
                status?: unknown;
                type?: unknown;
            };

        if (
            possibleHttpError.status === 400
            &&
            possibleHttpError.type ===
                "entity.parse.failed"
        ) {

            sendError(
                res,
                400,
                "INVALID_JSON",
                "The request body contains invalid JSON.",
                requestId,
            );

            return;
        }

        console.error(
            "Unhandled request error",
            {
                requestId,
                error,
            },
        )

        sendError(
            res,
            500,
            "INTERNAL_ERROR",
            "An unexpected error occurred.",
            requestId,
        );
    };