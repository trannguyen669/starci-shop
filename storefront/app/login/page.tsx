import {
  Typography,
} from "@heroui/react";

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-3">
      <Typography
        type="h4"
        weight="semibold"
      >
        Login
      </Typography>

      <Typography color="muted">
        Login form will be rendered here.
      </Typography>
    </div>
  );
}