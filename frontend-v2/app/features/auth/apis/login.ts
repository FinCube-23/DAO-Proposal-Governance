import { api } from "@/core/api/client";
import type { LoginPayload, LoginResponse } from "@/core/api/types";
import { AUTH_ENDPOINTS} from "@/core/api/endpoints";

export function login(payload: LoginPayload) {
  return api.post<LoginResponse>(AUTH_ENDPOINTS.BASE + "/login", payload);
}
