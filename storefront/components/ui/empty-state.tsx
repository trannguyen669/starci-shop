import type { ReactNode } from "react";
import { Typography } from "@heroui/react";

import { Button } from "./button";
import { Card } from "./card";

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps): ReactNode {
  return (
    <Card>
      <Card.Content className="flex flex-col items-center gap-3 p-6 text-center">
        <div className="flex flex-col items-center gap-1.5">
          <Typography
            type="h5"
            weight="semibold"
          >
            {title}
          </Typography>

          <Typography
            type="body-sm"
            color="muted"
          >
            {description}
          </Typography>
        </div>

        {actionLabel ? (
          <Button
            variant="primary"
            onPress={onAction}
          >
            {actionLabel}
          </Button>
        ) : null}
      </Card.Content>
    </Card>
  );
}