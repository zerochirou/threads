"use client";

export interface SettingsServiceStatus {
  ready: boolean;
}

export function getSettingsServiceStatus(): SettingsServiceStatus {
  return { ready: true };
}
