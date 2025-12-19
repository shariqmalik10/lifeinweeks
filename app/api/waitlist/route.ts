import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if Supabase is configured
    const supabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && 
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

    if (supabaseConfigured) {
      // Store email in Supabase
      const supabase = await createClient();
      const { error: dbError } = await supabase
        .from("waitlist")
        .insert({ email: normalizedEmail })
        .select()
        .single();

      if (dbError) {
        // Check for duplicate email
        if (dbError.code === "23505") {
          return NextResponse.json(
            { error: "Email already registered", alreadyRegistered: true },
            { status: 409 }
          );
        }
        console.error("Database error:", dbError);
        return NextResponse.json(
          { error: "Failed to save email" },
          { status: 500 }
        );
      }
    } else {
      console.warn("Supabase not configured, skipping database insert");
    }

    // Send confirmation email via Resend
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      try {
        const resendResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: process.env.RESEND_FROM_EMAIL || "Life in Weeks <onboarding@resend.dev>",
            to: normalizedEmail,
            subject: "Welcome to Life in Weeks - You're on the list!",
            html: `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
              </head>
              <body style="font-family: Georgia, serif; background-color: #09090b; color: #e4e4e7; padding: 40px 20px; margin: 0;">
                <div style="max-width: 500px; margin: 0 auto;">
                  <h1 style="font-size: 32px; font-weight: 400; margin-bottom: 8px; color: #ffffff;">
                    Life in <span style="color: #ef4444; font-style: italic;">Weeks.</span>
                  </h1>
                  
                  <p style="font-size: 16px; line-height: 1.6; color: #a1a1aa; margin-top: 24px;">
                    You're now on the waitlist for beta access.
                  </p>
                  
                  <p style="font-size: 16px; line-height: 1.6; color: #a1a1aa;">
                    We'll notify you as soon as your spot is ready. In the meantime, remember:
                  </p>
                  
                  <div style="border-left: 2px solid #ef4444; padding-left: 16px; margin: 24px 0;">
                    <p style="font-size: 14px; font-style: italic; color: #71717a; margin: 0;">
                      "The clock is a countdown, not a promise."
                    </p>
                  </div>
                  
                  <p style="font-size: 12px; font-style: italic; color: #52525b; margin-top: 40px;">
                    Memento Mori
                  </p>
                </div>
              </body>
              </html>
            `,
          }),
        });

        if (!resendResponse.ok) {
          console.error("Resend API error:", await resendResponse.text());
        }
      } catch (emailError) {
        // Log but don't fail the request if email sending fails
        console.error("Failed to send confirmation email:", emailError);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: "Successfully joined waitlist" 
    });
  } catch (error) {
    console.error("Waitlist signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
