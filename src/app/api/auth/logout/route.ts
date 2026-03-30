import { clearSession } from "@/lib/auth";
import { ok } from "@/lib/utils";
export async function POST() { clearSession(); return ok({ ok: true }); }
