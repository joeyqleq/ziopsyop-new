import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json();

    if (!email || !message) {
      return NextResponse.json(
        { error: "Email and message are required" },
        { status: 400 }
      );
    }

    await resend.emails.send({
      from: "ZIOPSYOP Contact <info@ziopsyop.me>",
      to: "info@ziopsyop.me",
      replyTo: email,
      subject: `[ZIOPSYOP] Message from ${name || "Anonymous"}`,
      text: `From: ${name || "Anonymous"} <${email}>\n\n${message}`,
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
