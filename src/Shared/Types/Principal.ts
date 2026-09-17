export const USER_ROLES = [
    "USER",
    "SUPPORT",
] as const;

export type UserRole = (
    typeof USER_ROLES)[number];

export interface Principal {
    userId: string;
    role: UserRole;
}