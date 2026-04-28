import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { buildSignedUpload } from "@/lib/cloudinary";

export async function POST() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const params = buildSignedUpload();
  return NextResponse.json(params);
}
