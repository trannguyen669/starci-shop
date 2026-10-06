import {
  Button,
  Typography,
} from "@heroui/react";

export default function HomePage() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 p-6">
      <div className="flex flex-col gap-3">
        <Typography.Heading
          level={4}
          weight="semibold"
        >
          StarCi Shop
        </Typography.Heading>

        <Typography.Paragraph
          size="sm"
          color="muted"
        >
          Khung UI nền cho cửa hàng — mọi feature sau sẽ render ở đây.
        </Typography.Paragraph>
      </div>

      <Button variant="primary">
        Bắt đầu mua sắm
      </Button>
    </main>
  );
}