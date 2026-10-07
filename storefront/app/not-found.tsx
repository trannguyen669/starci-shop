import Link from "next/link";
import {
  Typography,
} from "@heroui/react";

export default function NotFound() {
  return (
    <div className="flex min-h-60 flex-col items-start justify-center gap-4">
      <Typography
        type="h4"
        weight="semibold"
      >
        404 — Not found
      </Typography>

      <Typography color="muted">
        Trang bạn đang tìm không tồn tại.
      </Typography>

      <Link
        href="/"
        className="rounded-lg bg-accent px-4 py-2 font-medium text-accent-foreground"
      >
        Back home
      </Link>
    </div>
  );
}