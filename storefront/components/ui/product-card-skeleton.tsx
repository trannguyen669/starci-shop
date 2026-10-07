import { Skeleton } from "@heroui/react";

import { Card } from "./card";

export function ProductCardSkeleton() {
  return (
    <Card>
      <Card.Content className="flex flex-col gap-3 p-4">
        <Skeleton className="h-32 w-full rounded-xl" />

        <Skeleton className="h-3 w-3/5 rounded-lg" />

        <Skeleton className="h-3 w-2/5 rounded-lg" />
      </Card.Content>
    </Card>
  );
}