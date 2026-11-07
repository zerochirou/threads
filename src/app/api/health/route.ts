import { NextResponse } from "next/server";
import { getDb, schema } from "@/db";

export async function GET() {
  const db = await getDb();
  const users = await db.select().from(schema.user).all();

  return NextResponse.json({ ok: true, usersCount: users.length });
}
