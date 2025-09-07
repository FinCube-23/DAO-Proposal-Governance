import { env } from '@/core/env';

const BASE_URL = env.VITE_BASE_URL || `http://localhost:3000`;
const BASE_USER_MANAGEMENT_SERVICE_URL = `${BASE_URL}/user-management-service/api`;
const BASE_URL_ORGANIZATION = `${BASE_USER_MANAGEMENT_SERVICE_URL}/organizations`;
const BASE_URL_USER = `${BASE_USER_MANAGEMENT_SERVICE_URL}/users/`;
const BASE_URL_DAO = `${BASE_URL}/dao-service/dao`;
const BASE_URL_PROPOSAL = `${BASE_URL}/dao-service/proposal-service`;
const BASE_URL_PROXY = `${BASE_URL}/web3-proxy-service/web3-dao-proxy`;
const BASE_URL_AUDIT = `${BASE_URL}/audit-trail-service`;

export const AUTH_ENDPOINTS = {
  BASE: BASE_USER_MANAGEMENT_SERVICE_URL,
};

export const USER_ENDPOINT = {
  BASE: BASE_URL_USER,
};

export const ORGANIZATION_ENDPOINT = {
  BASE: BASE_URL_ORGANIZATION,
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

export const AUDIT_ENDPOINT = {
  BASE: BASE_URL_AUDIT,
};
