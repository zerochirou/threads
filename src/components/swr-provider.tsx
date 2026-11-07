"use client";

import * as React from "react";
import { SWRConfig } from "swr";
import { swrFetcher } from "@/lib/fetcher";

export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher: (url: string) => swrFetcher(url),
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        shouldRetryOnError: false,
        dedupingInterval: 2000,
        keepPreviousData: true,
      }}
    >
      {children}
    </SWRConfig>
  );
}
