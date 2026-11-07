export class HttpError extends Error {
  status: number;
  info?: unknown;

  constructor(message: string, status: number, info?: unknown) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.info = info;
  }
}

export async function swrFetcher<T>(
  url: string,
  fetchImpl: typeof fetch = fetch
): Promise<T> {
  const response = await fetchImpl(url, {
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
    },
  });

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const errorMessage =
      payload &&
      typeof payload === "object" &&
      "error" in payload &&
      typeof (payload as { error?: unknown }).error === "string"
        ? (payload as { error: string }).error
        : `Request failed with status ${response.status}`;
    throw new HttpError(errorMessage, response.status, payload);
  }

  return payload as T;
}
