import {
  Spinner,
} from "@heroui/react";

export default function Loading() {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="flex min-h-40 items-center justify-center"
    >
      <Spinner />
    </div>
  );
}