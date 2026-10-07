import {
  Chip,
  Typography,
} from "@heroui/react";

import {
  apiFetch,
} from "@/lib/api";

type Health = {
  status: string;
};

export default async function StatusPage() {
  try {
    const health =
      await apiFetch<Health>(
        "/health",
      );

    return (
      <section className="mx-auto flex max-w-2xl flex-col gap-3 py-6">
        <Typography
          type="h4"
          weight="semibold"
        >
          Trạng thái dịch vụ
        </Typography>

        <div
          className="flex items-center gap-2"
          data-testid="status-ok"
        >
          <Chip color="success">
            {health.status}
          </Chip>

          <Typography
            type="body-sm"
            color="muted"
          >
            HTTP 200 · backend reachable
          </Typography>
        </div>
      </section>
    );
  } catch (error) {
    return (
      <section className="mx-auto flex max-w-2xl flex-col gap-3 py-6">
        <Typography
          type="h4"
          weight="semibold"
        >
          Trạng thái dịch vụ
        </Typography>

        <div
          className="flex items-center gap-2"
          data-testid="status-error"
        >
          <Chip color="danger">
            unavailable
          </Chip>

          <Typography
            type="body-sm"
            color="muted"
          >
            {error instanceof Error
              ? error.message
              : "Unknown error"}
          </Typography>
        </div>
      </section>
    );
  }
}