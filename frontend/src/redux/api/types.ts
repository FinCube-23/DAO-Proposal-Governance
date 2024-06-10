export type CreateMFSPayload = {
    name: string;
    org_email: string;
    wallet_address?: string;
    native_currency?: string;
    certificate?: string;
    dao_id?: number;
};

export type CreateMFSResponse = CreateMFSPayload & {
    id: number;
};

export type AuthMeResponse = {
    id: number;
    sub: string;
    role: string;
    mfs: unknown;
};
