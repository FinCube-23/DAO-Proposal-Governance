import { api } from "@/lib/api/client";
import type { LoginPayload, LoginResponse } from "@/lib/api/types";
import { AUTH_ENDPOINTS} from "@/lib/api/endpoints";

export function login(payload: LoginPayload) {
  return api.post<LoginResponse>(AUTH_ENDPOINTS.BASE + "/login", payload);
}
