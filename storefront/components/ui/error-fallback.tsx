import { Alert } from "@heroui/react";

import { Button } from "./button";

type ErrorFallbackProps = {
  onRetry?: () => void;
};

export function ErrorFallback({
  onRetry,
}: ErrorFallbackProps) {
  return (
    <Alert status="danger">
      <Alert.Indicator />

      <Alert.Content>
        <Alert.Title>
          Đã có lỗi xảy ra
        </Alert.Title>

        <Alert.Description>
          Không tải được phần này. Thử lại nhé.
        </Alert.Description>
      </Alert.Content>

      {onRetry ? (
        <Button
          variant="danger-soft"
          onPress={onRetry}
        >
          Thử lại
        </Button>
      ) : null}
    </Alert>
  );
}