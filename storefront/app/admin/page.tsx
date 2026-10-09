"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  Typography,
} from "@heroui/react";

import {
  apiFetch,
} from "@/lib/api";

type AdminResponse = {
  message: string;
};

export default function AdminPage() {
  const [message, setMessage] =
    useState(
      "Đang kiểm tra quyền...",
    );

  useEffect(() => {
    async function load() {
      try {
        const response =
          await apiFetch<AdminResponse>(
            "/admin/stats",
          );

        setMessage(
          response.message,
        );
      } catch {
        setMessage(
          "Bạn không có quyền truy cập.",
        );
      }
    }

    void load();
  }, []);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <Typography
        type="h3"
        weight="semibold"
      >
        Bảng quản trị
      </Typography>

      <Typography type="body">
        {message}
      </Typography>
    </div>
  );
}
