import type {
    Principal,
} from "./Principal.js";

declare global {

    namespace Express {

        interface Request {
            principal?: Principal;
            requestId?: string;
        }
    }
}

export {};