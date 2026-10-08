"use client";

import React, {
  FormEvent,
  useState,
} from "react";

import {
  Typography,
} from "@heroui/react";

import {
  Button,
} from "@/components/ui/button";

import {
  Card,
} from "@/components/ui/card";

import {
  Input,
} from "@/components/ui/input";

import {
  apiFetch,
} from "@/lib/api";

import {
  notify,
} from "@/lib/notify";

type RegisterResponse = {
  id: string;
  email: string;
};

export function RegisterForm() {
  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  async function onSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSubmitting(true);

    try {
      await apiFetch<RegisterResponse>(
        "/auth/register",
        {
          method: "POST",
          body: JSON.stringify({
            email,
            password,
          }),
        },
      );

      notify.success(
        "Đăng ký tài khoản thành công",
      );

      setEmail("");
      setPassword("");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Đăng ký thất bại",
      );

      notify.error(
        "Không thể đăng ký tài khoản",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <Card className="mx-auto max-w-sm">
        <Card.Content className="flex flex-col gap-6 p-6">
          <Typography
            type="h4"
            weight="semibold"
          >
            Tạo tài khoản
          </Typography>

          <div className="flex flex-col gap-3">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value,
                )
              }
            />

            <Input
              type="password"
              placeholder="Mật khẩu"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value,
                )
              }
            />
          </div>

          {error ? (
            <Typography
              type="body-sm"
              className="text-danger"
            >
              {error}
            </Typography>
          ) : null}

          <Button
            type="submit"
            variant="primary"
            isDisabled={submitting}
          >
            {submitting
              ? "Đang đăng ký..."
              : "Đăng ký"}
          </Button>
        </Card.Content>
      </Card>
    </form>
  );
}