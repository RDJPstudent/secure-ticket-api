import * as z from "zod";

import {
    TICKET_STATUSES,
} from "./domain/ticket-status.js";

export const ticketIdParamsSchema =
    z.object({

        ticketId:
            z.string()
            .trim()
            .min(1),

    }).strict();

export const createTicketBodySchema =
    z.object({

        title:
        z.string()
        .trim()
        .min(5)
        .max(120),

        description:
        z.string()
        .trim()
        .min(1)
        .max(5000),

    }).strict();

export const updateTicketBodySchema =
    z.object({

        title:
        z.string()
        .trim()
        .min(5)
        .max(120)
        .optional(),

        description:
        z.string()
        .trim()
        .min(1)
        .max(5000)
        .optional(),

        expectedVersion:
        z.number()
        .int()
        .positive(),

    })
    .strict()
    .refine(
        (value) =>
            value.title !== undefined ||
            value.description !== undefined,

            {
                message:
                "At least one mutable ticket property is required.",
            },
    );

export const changeTicketStatusBodySchema =
    z.object({

        status:
            z.enum(
                TICKET_STATUSES,
            ),

        expectedVersion:
            z.number()
            .int()
            .positive(),

    }).strict();

export type CreateTicketBody =
    z.infer<
        typeof createTicketBodySchema
        >;

export type UpdateTicketBody =
    z.infer<
        typeof updateTicketBodySchema
        >;

export type ChangeTicketStatusBody =
    z.infer<
        typeof changeTicketStatusBodySchema
        >;

export type TicketIdParams =
    z.infer<
    typeof ticketIdParamsSchema
    >;