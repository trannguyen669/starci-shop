"use client";

import {
  type FormEventHandler,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

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

type UserRole =
  | "user"
  | "admin";

type AuthUser = {
  id: string;
  email: string;
  role: UserRole;
};

type LoginResponse = {
  accessToken: string;
  user: AuthUser;
};

export function LoginForm() {
  const router =
    useRouter();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const onSubmit:
    FormEventHandler<HTMLFormElement> =
    async (event) => {
      event.preventDefault();

      setError("");
      setSubmitting(true);

      try {
        const response =
          await apiFetch<LoginResponse>(
            "/auth/login",
            {
              method: "POST",

              body: JSON.stringify({
                email,
                password,
              }),
            },
          );

        // Access token:
        // FE cần dùng để gọi
        // protected APIs.
        localStorage.setItem(
          "accessToken",
          response.accessToken,
        );

        // Lưu thông tin user
        // để UI biết role.
        localStorage.setItem(
          "user",
          JSON.stringify(
            response.user,
          ),
        );

        // Báo cho HeaderNav biết
        // trạng thái auth đã thay đổi.
        window.dispatchEvent(
          new Event(
            "auth-changed",
          ),
        );

        notify.success(
          "Đăng nhập thành công",
        );

        router.push("/");
      } catch {
        setError(
          "Email hoặc mật khẩu không đúng.",
        );

        notify.error(
          "Đăng nhập thất bại",
        );
      } finally {
        setSubmitting(false);
      }
    };

  return (
    <form onSubmit={onSubmit}>
      <Card className="mx-auto max-w-sm">
        <Card.Content className="flex flex-col gap-6 p-6">
          <Typography
            type="h4"
            weight="semibold"
          >
            Đăng nhập
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
            isDisabled={
              submitting
            }
          >
            {submitting
              ? "Đang đăng nhập..."
              : "Đăng nhập"}
          </Button>
        </Card.Content>
      </Card>
    </form>
  );
}