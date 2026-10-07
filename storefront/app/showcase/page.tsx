"use client";

import { useState,useEffect } from "react";
import { Typography } from "@heroui/react";

import { EmptyState } from "@/components/ui/empty-state";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { ErrorFallback } from "@/components/ui/error-fallback";
import { ProductCardSkeleton } from "@/components/ui/product-card-skeleton";

function BrokenComponent() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  throw new Error(
    "Intentional showcase error",
  );
}

export default function ShowcasePage() {
  const [showBroken, setShowBroken] =
    useState(true);

  const [boundaryKey, setBoundaryKey] =
    useState(0);

  function retry() {
    setShowBroken(false);
    setBoundaryKey((value) => value + 1);
  }

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-3">
        <Typography type="h4">
          Empty State
        </Typography>

        <EmptyState
          title="Không có sản phẩm"
          description="Danh sách hiện đang trống."
          actionLabel="Khám phá sản phẩm"
          onAction={() => {
            console.log("Empty state action");
          }}
        />
      </section>

      <section className="flex flex-col gap-3">
        <Typography type="h4">
          Loading Skeleton
        </Typography>

        <div className="grid gap-4 md:grid-cols-3">
          <ProductCardSkeleton />
          <ProductCardSkeleton />
          <ProductCardSkeleton />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <Typography type="h4">
          Error Boundary
        </Typography>

        <ErrorBoundary
          key={boundaryKey}
          fallback={
            <ErrorFallback
              onRetry={retry}
            />
          }
        >
          {showBroken ? (
            <BrokenComponent />
          ) : (
            <Typography color="muted">
              Component đã được khôi phục.
            </Typography>
          )}
        </ErrorBoundary>
      </section>
    </div>
  );
}