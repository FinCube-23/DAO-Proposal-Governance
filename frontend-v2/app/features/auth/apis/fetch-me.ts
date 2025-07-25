import { api } from "@/lib/api/client";
import { AUTH_ENDPOINTS } from "@/lib/api/endpoints";
import type { FetchMeResponse } from "@/lib/api/types";

export function fetchMe() {
  return api.get<FetchMeResponse>(AUTH_ENDPOINTS.BASE + "/profile");
}
