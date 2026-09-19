import {
    randomUUID,
} from "node:crypto";

import type {
    RequestHandler,
} from "express";

export const requestIdMiddleware:
    RequestHandler = (
        req,
        res,
        next,
    ) => {

        const requestId =
        randomUUID();

        req.requestId =
        requestId;

        res.setHeader(
            "x-request-id",
            requestId,
        );

        next();
    };