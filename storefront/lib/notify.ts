"use client";

import { toast } from "@heroui/react";

export const notify = {
  success(message: string) {
    toast.success(message);
  },

  error(message: string) {
    toast.danger(message);
  },

  warning(message: string) {
    toast.warning(message);
  },

  info(message: string) {
    toast.info(message);
  },
};