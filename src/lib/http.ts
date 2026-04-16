export async function apiJson<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  })

  const contentType = res.headers.get("content-type") || ""
  const isJson = contentType.includes("application/json")
  const payload = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null)

  if (!res.ok) {
    const maybeObj = typeof payload === "object" && payload !== null ? (payload as Record<string, unknown>) : null
    const msg = maybeObj && typeof maybeObj.error === "string" ? maybeObj.error : `请求失败(${res.status})`
    throw new Error(msg)
  }

  return payload as T
}
