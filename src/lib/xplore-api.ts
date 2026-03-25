const XPLORE_BASE = process.env.XPLORE_API_BASE ?? "https://xplore.api.v2.routerprotocol.com";

export async function xploreGet(
  path: string,
  params: Record<string, string>,
): Promise<{ ok: boolean; status: number; data: unknown }> {
  const url = new URL(path, XPLORE_BASE);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") url.searchParams.set(k, v);
  }
  const response = await fetch(url.toString());
  const data = await response.json();
  return { ok: response.ok, status: response.status, data };
}

export async function xplorePost(
  path: string,
  params: Record<string, string>,
  body?: unknown,
): Promise<{ ok: boolean; status: number; data: unknown }> {
  const url = new URL(path, XPLORE_BASE);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") url.searchParams.set(k, v);
  }
  const response = await fetch(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await response.json();
  return { ok: response.ok, status: response.status, data };
}

export function formatError(status: number, data: unknown) {
  const msg =
    typeof data === "object" && data !== null
      ? (data as Record<string, unknown>).message ??
        (data as Record<string, unknown>).error ??
        data
      : data;
  return {
    isError: true as const,
    content: [{ type: "text" as const, text: JSON.stringify({ error: msg, statusCode: status }) }],
  };
}

export function formatSuccess(data: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data) }],
  };
}
