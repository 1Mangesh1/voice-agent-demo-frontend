"use client";

import { useEffect } from "react";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "";

export function Warmup() {
  useEffect(() => {
    if (!BACKEND) return;
    fetch(`${BACKEND}/health`).catch(() => {});
  }, []);
  return null;
}
