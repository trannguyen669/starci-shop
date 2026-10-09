const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL;

if (!BASE_URL) {
  throw new Error(
    "NEXT_PUBLIC_API_URL is not set",
  );
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  let response: Response;

  const headers =
    new Headers(init?.headers);

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

  // Nếu đang chạy ở browser,
  // lấy access token để gửi Bearer.
  if (
    typeof window !== "undefined"
  ) {
    const accessToken =
      localStorage.getItem(
        "accessToken",
      );

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

        // Quan trọng:
        // browser gửi/nhận
        // refresh-token cookie.
        credentials: "include",

        cache: "no-store",
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

  if (!response.ok) {
    throw new Error(
      `Request ${path} failed with ${response.status}`,
    );
  }

  return response.json() as Promise<T>;
}