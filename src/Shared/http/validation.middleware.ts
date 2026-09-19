import type {
    RequestHandler,
    Response,
} from "express";

import type {
    ZodType,
} from "zod";

interface RequestSchemas {
    body?: ZodType;
    params?: ZodType;
    query?: ZodType;
}

interface ValidatedRequest {
    body?: unknown;
    params?: unknown;
    query?: unknown;
}

export function validateRequest(
    schemas: RequestSchemas,
): RequestHandler {

    return (
        req,
        res,
        next,
    ) => {

        try {

            const validated:
                ValidatedRequest = {};
            
            if (schemas.body) {

                validated.body =
                schemas.body.parse(
                    req.body,
                );
            }

            if (schemas.params) {

                validated.params =
                schemas.params.parse(
                    req.params,
                );
            }

            if (schemas.query) {

                validated.query =
                schemas.query.parse(
                    req.query,
                );
            }

            res.locals.validatedRequest =
            validated;

            next();
        }

        catch(error) {

            next(error);
        }
    };
}

function validatedRequest(
    res: Response,
): ValidatedRequest {

    return (
        res.locals.validatedRequest ??
        {}
    ) as ValidatedRequest;
}

export function validatedBody<T>(
    res: Response,
): T {

    return validatedRequest(
        res,
    ).body as T;
}

export function validatedParams<T>(
    res: Response,
): T {

    return validatedRequest(
        res,
    ).params as T;
}