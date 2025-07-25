
import { api } from "@/lib/api/client";
import type { RegisterPayload, RegisterResponse } from "@/lib/api/types";
import { AUTH_ENDPOINTS} from "@/lib/api/endpoints";

export function register(payload: RegisterPayload) {
  return api.post<RegisterResponse>(AUTH_ENDPOINTS.BASE + "/register", payload);
}
