import { api } from "@/core/api/client";
import { USER_ENDPOINT } from "@/core/api/endpoints";
import { FetchMeResponse } from "@/core/api/types";

export function fetchMe() {
  return api.get<FetchMeResponse>(`${USER_ENDPOINT.BASE}/profile`);
}
