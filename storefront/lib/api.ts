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

  try {
    response = await fetch(
      `${BASE_URL}${path}`,
      {
        ...init,//lấy các tùy chọn do nơi gọi truyền vào

        headers: {
          "Content-Type":
            "application/json",
          ...init?.headers,
        },

        cache: "no-store",
      },
    );
  } catch (cause) {
    throw new Error(
      `Cannot reach backend at ${BASE_URL}${path}`,
      { cause },
    );
  }

  if (!response.ok) {
    throw new Error(
      `Request ${path} failed with ${response.status}`,
    );
  }

  return response.json() as Promise<T>;
}