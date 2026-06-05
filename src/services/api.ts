export const API_URL = "http://localhost:3001";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`${options?.method ?? "GET"} ${path} failed: ${res.status}`);
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T[]>(path),
  getOne: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(path: string, id: string, body: unknown) =>
    request<T>(`${path}/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  patch: <T>(path: string, id: string, body: unknown) =>
    request<T>(`${path}/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (path: string, id: string) =>
    request<void>(`${path}/${id}`, { method: "DELETE" }),
};
