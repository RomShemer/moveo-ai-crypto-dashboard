import { apiRequest } from "./api";

/**
 * value: 1 | -1
 */
export async function sendVote(payload) {
  return apiRequest("/api/votes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function removeVote(itemKey) {
  return apiRequest(`/api/votes/${itemKey}`, {
    method: "DELETE",
  });
}

export async function getMyVote(itemKey) {
  const res = await apiRequest(`/api/votes/${itemKey}`);
  return res.value; // 1 | -1 | null
}
