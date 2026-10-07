import {
  Typography,
} from "@heroui/react";

export default function ProductsPage() {
  return (
    <div className="flex flex-col gap-3">
      <Typography
        type="h4"
        weight="semibold"
      >
        Products
      </Typography>

      <Typography color="muted">
        Product catalog will be rendered here.
      </Typography>
    </div>
  );
}