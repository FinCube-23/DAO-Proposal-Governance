import { api } from "@/core/api/client";
import { AUTH_ENDPOINTS } from "@/core/api/endpoints";
import type { FetchMeResponse } from "@/core/api/types";

export function fetchMe() {
  return api.get<FetchMeResponse>(AUTH_ENDPOINTS.BASE + "/profile");
}
