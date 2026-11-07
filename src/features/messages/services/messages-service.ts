"use client";

export interface MessagesServiceStatus {
  ready: boolean;
}

export function getMessagesServiceStatus(): MessagesServiceStatus {
  return { ready: true };
}
