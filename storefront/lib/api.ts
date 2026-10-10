const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL;

if (!BASE_URL) {
  throw new Error(
    "NEXT_PUBLIC_API_URL is not set",
  );
}

export class ApiError
  extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);

    this.name =
      "ApiError";
  }
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  let response: Response;

  const headers =
    new Headers(
      init?.headers,
    );

  // Chỉ set Content-Type JSON
  // khi request có body.
  if (
    init?.body
    && !headers.has(
      "Content-Type",
    )
  ) {
    headers.set(
      "Content-Type",
      "application/json",
    );
  }

  // Chỉ browser mới có
  // localStorage.
  if (
    typeof window
    !== "undefined"
  ) {
    const accessToken =
      localStorage.getItem(
        "accessToken",
      );

    // Nếu đang có access token,
    // tự gắn Bearer token.
    if (
      accessToken
      && !headers.has(
        "Authorization",
      )
    ) {
      headers.set(
        "Authorization",
        `Bearer ${accessToken}`,
      );
    }
  }

  try {
    response = await fetch(
      `${BASE_URL}${path}`,
      {
        ...init,

        headers,

        // Cho phép browser
        // gửi/nhận httpOnly
        // refresh-token cookie.
        credentials:
          "include",

        cache:
          "no-store",
      },
    );
  } catch (cause) {
    throw new Error(
      `Cannot reach backend at ${BASE_URL}${path}`,
      {
        cause,
      },
    );
  }

  // Backend có response
  // nhưng status không phải 2xx.
  if (!response.ok) {
    throw new ApiError(
      response.status,
      `Request ${path} failed with ${response.status}`,
    );
  }

  return response.json() as Promise<T>;
}