const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000";
const BASE_URL_AUTH = BASE_URL + "/authentication";
const BASE_URL_MFS = BASE_URL + "/mfs-business";

export const AUTH_ENDPOINTS = {
    BASE: BASE_URL_AUTH,
}

export const MFS_ENDPOINT = {
    BASE: BASE_URL_MFS,
}