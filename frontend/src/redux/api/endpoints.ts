const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000";
const BASE_USER_MANAGEMENT_SERVICE_URL = "http://localhost:3001";
const BASE_URL_AUTH = BASE_USER_MANAGEMENT_SERVICE_URL  + "/auth";
const BASE_URL_MFS = BASE_USER_MANAGEMENT_SERVICE_URL + "/mfs-business";
const BASE_URL_DAO = BASE_URL + "/dao-service/dao";
const BASE_URL_PROPOSAL = BASE_URL + "/dao-service/proposal-service";
const BASE_URL_PROXY = BASE_URL + "/web3-proxy-service/web3-dao-proxy";

export const AUTH_ENDPOINTS = {
  BASE: BASE_URL_AUTH,
};

export const MFS_ENDPOINT = {
  BASE: BASE_URL_MFS,
};

export const DAO_ENDPOINT = {
  BASE: BASE_URL_DAO,
};

export const PROPOSAL_ENDPOINT = {
  BASE: BASE_URL_PROPOSAL,
};

export const PROXY_ENDPOINT = {
  BASE: BASE_URL_PROXY,
};
