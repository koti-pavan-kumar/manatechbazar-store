import { NextResponse } from "next/server";
import { verifyCode } from "@/lib/verification";

export async function POST(req: Request) {
  try {
    const { email, code, type = "REGISTER" } = await req.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and code are required" },
        { status: 400 }
      );
    }

    const result = await verifyCode(email, code, type);

    return NextResponse.json(result, {
      status: result.success ? 200 : 400,
    });
  } catch (error) {
    console.error("Verify email error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
