"use client";

export interface AccountServiceStatus {
  ready: boolean;
}

export function getAccountServiceStatus(): AccountServiceStatus {
  return { ready: true };
}
