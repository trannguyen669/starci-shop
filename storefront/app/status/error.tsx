"use client";

import {
  Typography,
} from "@heroui/react";

export default function StatusError({
  error,
}: {
  error: Error;
}) {
  return (
    <div
      className="py-6"
      data-testid="status-error"
    >
      <Typography
        type="body-sm"
        color="muted"
      >
        {error.message}
      </Typography>
    </div>
  );
}