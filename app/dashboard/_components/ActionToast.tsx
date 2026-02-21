"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

export default function ActionToast({
  message,
  type = "success",
}: {
  message?: string | null;
  type?: "success" | "error" | "info" | "warning";
}) {
  const lastShown = useRef<string | null>(null);

  useEffect(() => {
    if (!message || lastShown.current === `${type}:${message}`) return;
    lastShown.current = `${type}:${message}`;
    toast[type](message);
  }, [message, type]);

  return null;
}
