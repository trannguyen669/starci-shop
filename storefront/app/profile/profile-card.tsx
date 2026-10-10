"use client";

import {
  useEffect,
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
  ApiError,
  apiFetch,
} from "@/lib/api";

type Profile = {
  id: string;
  email: string;
};

export function ProfileCard() {
  const [
    profile,
    setProfile,
  ] =
    useState<Profile | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    unauthorized,
    setUnauthorized,
  ] =
    useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const data =
          await apiFetch<Profile>(
            "/auth/me",
          );

        setProfile(data);
      } catch (error) {
        if (
          error instanceof ApiError
          && error.status === 401
        ) {
          setUnauthorized(true);
          return;
        }
      } finally {
        setLoading(false);
      }
    }

    void loadProfile();
  }, []);

  function logout() {
    localStorage.removeItem(
      "accessToken",
    );

    localStorage.removeItem(
      "user",
    );

    window.dispatchEvent(
      new Event(
        "auth-changed",
      ),
    );

    window.location.href =
      "/login";
  }

  if (loading) {
    return (
      <Typography
        type="body-sm"
      >
        Đang tải hồ sơ...
      </Typography>
    );
  }

  return (
    <Card className="mx-auto max-w-sm">
      <Card.Content className="flex flex-col gap-4 p-6">
        <Typography
          type="h4"
          weight="semibold"
        >
          Hồ sơ của tôi
        </Typography>

        {unauthorized ? (
          <>
            <Typography
              type="body-sm"
              className="text-danger"
            >
              Phiên đăng nhập không
              hợp lệ hoặc đã hết hạn.
            </Typography>

            <Button
              variant="primary"
              onPress={() => {
                window.location.href =
                  "/login";
              }}
            >
              Đăng nhập lại
            </Button>
          </>
        ) : (
          <>
            <Typography
              type="body-sm"
            >
              {profile?.email}
            </Typography>

            <Button
              variant="secondary"
              onPress={logout}
            >
              Đăng xuất
            </Button>
          </>
        )}
      </Card.Content>
    </Card>
  );
}