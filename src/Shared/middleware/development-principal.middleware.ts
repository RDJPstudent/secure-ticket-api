import type {
    RequestHandler,
} from "express";

import {
    USER_ROLES,
    type UserRole,
} from "../types/Principal.js";

import {
    AuthenticationRequiredError,
} from "../errors/authentication.errors.js";

function isUserRole(
    value: string,
): value is UserRole {

    return USER_ROLES.some(
        (role) =>
            role === value,
    );
}

export const developmentPrincipalMiddleware:
    RequestHandler = (
        req,
        _res,
        next,
    ) => {

        if ( process.env.NODE_ENV !==
            "development"
            &&
            process.env.NODE_ENV !==
            "test"
        ) {

            next(
                new AuthenticationRequiredError(),
            );

            return;
        }

        const userId =
        req.header(
            "x-dev-user-id",
        );

        const role =
        req.header(
            "x-dev-user-role",
        );

        if (
            !userId ||
            !role ||
            !isUserRole(role)
        ) {

            next(
                new AuthenticationRequiredError(),
            );

            return;
        }

        req.principal = {
            userId,
            role,
        };

        next();
    };