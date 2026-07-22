import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// ─── Email Templates ───

function welcomeEmail(name: string, penName: string): { subject: string; html: string } {
  const displayName = penName ? `${name} (${penName})` : name;
  return {
    subject: `Welcome to InkReal, ${name}!`,
    html: `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;padding:0;background:#0d0b08;font-family:'Inter',sans-serif;color:#e9e6dd;">
<div style="max-width:600px;margin:0 auto;padding:40px 20px;">
  <div style="text-align:center;margin-bottom:40px;">
    <h1 style="font-family:'Cormorant Garamond',Georgia,serif;font-size:42px;color:#ff9d37;margin:0;letter-spacing:1px;">InkReal</h1>
    <p style="font-size:12px;color:#948766;letter-spacing:3px;text-transform:uppercase;margin-top:4px;">Where Stories Become Reality</p>
  </div>
  <div style="background:#1a1712;border:1px solid #2e2920;border-radius:16px;padding:40px;">
    <h2 style="font-family:'Cormorant Garamond',Georgia,serif;font-size:28px;color:#ff9d37;margin:0 0 20px;">Welcome, ${displayName}</h2>
    <p style="font-size:16px;line-height:1.6;color:#b5ab92;margin:0 0 16px;">You are now part of a living creative universe where stories breathe, voices are heard, and creators build lasting careers.</p>
    <p style="font-size:16px;line-height:1.6;color:#b5ab92;margin:0 0 24px;">InkReal is a global home for writers, readers, poets, storytellers, spoken word artists, educators, and publishers. This is your creative home.</p>
    <div style="background:#0d0b08;border-radius:12px;padding:24px;margin:24px 0;">
      <p style="font-size:14px;color:#948766;margin:0 0 12px;font-weight:600;">Here is what you can do right now:</p>
      <ul style="font-size:14px;color:#b5ab92;line-height:1.8;margin:0;padding-left:20px;">
        <li>Write and publish your first piece in the Writing Studio</li>
        <li>Explore books and creators in Discover</li>
        <li>Join communities of like-minded creators</li>
        <li>Listen to audio stories and spoken word</li>
        <li>Build your personal library</li>
        <li>Track your creative journey with analytics</li>
      </ul>
    </div>
    <div style="text-align:center;margin:32px 0;">
      <blockquote style="font-family:'Cormorant Garamond',Georgia,serif;font-size:22px;font-style:italic;color:#ff9d37;margin:0;padding:0 20px;">"The sky is not the limit. You limit yourself to the sky."</blockquote>
      <p style="font-size:13px;color:#948766;margin-top:8px;">— Jaydin Donough, Founder of InkReal</p>
    </div>
    <a href="https://inkreal.onrender.com/feed" style="display:inline-block;background:#f97c0f;color:#0d0b08;font-size:15px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:24px;">Start Creating</a>
  </div>
  <p style="text-align:center;font-size:12px;color:#5f543d;margin-top:32px;">You received this email because you joined InkReal.<br>You will receive a monthly newsletter with personalized updates and creative inspiration.</p>
</div>
</body></html>`,
  };
}

function monthlyNewsletter(name: string, penName: string): { subject: string; html: string } {
  const displayName = penName ? `${name} (${penName})` : name;
  const month = new Date().toLocaleString("en-US", { month: "long", year: "numeric" });
  return {
    subject: `InkReal Newsletter — ${month}`,
    html: `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;padding:0;background:#0d0b08;font-family:'Inter',sans-serif;color:#e9e6dd;">
<div style="max-width:600px;margin:0 auto;padding:40px 20px;">
  <div style="text-align:center;margin-bottom:40px;">
    <h1 style="font-family:'Cormorant Garamond',Georgia,serif;font-size:36px;color:#ff9d37;margin:0;">InkReal</h1>
    <p style="font-size:11px;color:#948766;letter-spacing:3px;text-transform:uppercase;">${month} Newsletter</p>
  </div>
  <div style="background:#1a1712;border:1px solid #2e2920;border-radius:16px;padding:40px;">
    <h2 style="font-family:'Cormorant Garamond',Georgia,serif;font-size:26px;color:#ff9d37;">Dear ${displayName},</h2>
    <p style="font-size:16px;line-height:1.6;color:#b5ab92;">Here is what is happening in the InkReal universe this month:</p>
    <div style="background:#0d0b08;border-radius:12px;padding:20px;margin:20px 0;"><h3 style="font-size:15px;color:#ff9d37;margin:0 0 12px;">Platform Updates</h3><p style="font-size:14px;color:#b5ab92;line-height:1.6;">New features, improvements, and what is coming next.</p></div>
    <div style="background:#0d0b08;border-radius:12px;padding:20px;margin:20px 0;"><h3 style="font-size:15px;color:#ff9d37;margin:0 0 12px;">Trending Creators</h3><p style="font-size:14px;color:#b5ab92;line-height:1.6;">Discover writers and poets making waves across the InkReal community.</p></div>
    <div style="background:#0d0b08;border-radius:12px;padding:20px;margin:20px 0;"><h3 style="font-size:15px;color:#ff9d37;margin:0 0 12px;">New Releases</h3><p style="font-size:14px;color:#b5ab92;line-height:1.6;">Fresh books, poems, and audio stories published this month.</p></div>
    <div style="background:#0d0b08;border-radius:12px;padding:20px;margin:20px 0;"><h3 style="font-size:15px;color:#ff9d37;margin:0 0 12px;">Writing Achievements</h3><p style="font-size:14px;color:#b5ab92;line-height:1.6;">Celebrate community milestones and creator successes.</p></div>
    <div style="background:#0d0b08;border-radius:12px;padding:20px;margin:20px 0;"><h3 style="font-size:15px;color:#ff9d37;margin:0 0 12px;">Literary Events</h3><p style="font-size:14px;color:#b5ab92;line-height:1.6;">Upcoming writing challenges, book launches, and community gatherings.</p></div>
    <div style="text-align:center;margin:32px 0;">
      <blockquote style="font-family:'Cormorant Garamond',Georgia,serif;font-size:20px;font-style:italic;color:#ff9d37;margin:0;padding:0 20px;">"The sky is not the limit. You limit yourself to the sky."</blockquote>
      <p style="font-size:12px;color:#948766;margin-top:8px;">— Jaydin Donough, Founder of InkReal</p>
    </div>
    <a href="https://inkreal.onrender.com/discover" style="display:inline-block;background:#f97c0f;color:#0d0b08;font-size:15px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:24px;">Explore InkReal</a>
  </div>
  <p style="text-align:center;font-size:12px;color:#5f543d;margin-top:32px;">You receive this newsletter because you are an InkReal member.</p>
</div>
</body></html>`,
  };
}

function creatorReport(name: string, penName: string, stats: { posts: number; likes: number; comments: number; followers: number; reads: number; books: number }): { subject: string; html: string } {
  const displayName = penName ? `${name} (${penName})` : name;
  const month = new Date().toLocaleString("en-US", { month: "long", year: "numeric" });
  return {
    subject: `Your InkReal Monthly Creator Report — ${month}`,
    html: `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;padding:0;background:#0d0b08;font-family:'Inter',sans-serif;color:#e9e6dd;">
<div style="max-width:600px;margin:0 auto;padding:40px 20px;">
  <div style="text-align:center;margin-bottom:40px;">
    <h1 style="font-family:'Cormorant Garamond',Georgia,serif;font-size:36px;color:#ff9d37;margin:0;">InkReal</h1>
    <p style="font-size:11px;color:#948766;letter-spacing:3px;text-transform:uppercase;">Monthly Creator Report — ${month}</p>
  </div>
  <div style="background:#1a1712;border:1px solid #2e2920;border-radius:16px;padding:40px;">
    <h2 style="font-family:'Cormorant Garamond',Georgia,serif;font-size:26px;color:#ff9d37;">Dear ${displayName},</h2>
    <p style="font-size:16px;line-height:1.6;color:#b5ab92;">Here is your creative performance this month:</p>
    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin:24px 0;">
      <div style="background:#0d0b08;border-radius:12px;padding:20px;text-align:center;"><div style="font-size:32px;color:#ff9d37;font-weight:700;">${stats.posts}</div><div style="font-size:12px;color:#948766;">Posts Published</div></div>
      <div style="background:#0d0b08;border-radius:12px;padding:20px;text-align:center;"><div style="font-size:32px;color:#ff9d37;font-weight:700;">${stats.likes}</div><div style="font-size:12px;color:#948766;">Likes Received</div></div>
      <div style="background:#0d0b08;border-radius:12px;padding:20px;text-align:center;"><div style="font-size:32px;color:#ff9d37;font-weight:700;">${stats.comments}</div><div style="font-size:12px;color:#948766;">Comments</div></div>
      <div style="background:#0d0b08;border-radius:12px;padding:20px;text-align:center;"><div style="font-size:32px;color:#ff9d37;font-weight:700;">${stats.followers}</div><div style="font-size:12px;color:#948766;">Followers</div></div>
      <div style="background:#0d0b08;border-radius:12px;padding:20px;text-align:center;"><div style="font-size:32px;color:#ff9d37;font-weight:700;">${stats.reads}</div><div style="font-size:12px;color:#948766;">Total Reads</div></div>
      <div style="background:#0d0b08;border-radius:12px;padding:20px;text-align:center;"><div style="font-size:32px;color:#ff9d37;font-weight:700;">${stats.books}</div><div style="font-size:12px;color:#948766;">Books Published</div></div>
    </div>
    <div style="background:#0d0b08;border-radius:12px;padding:24px;margin:24px 0;">
      <h3 style="font-size:15px;color:#ff9d37;margin:0 0 12px;">Recommendations</h3>
      <ul style="font-size:14px;color:#b5ab92;line-height:1.8;margin:0;padding-left:20px;">
        <li>Publish consistently to grow your readership</li>
        <li>Engage with comments to build community</li>
        <li>Join writing communities to connect with peers</li>
        <li>Explore trending genres for inspiration</li>
      </ul>
    </div>
    <div style="text-align:center;margin:32px 0;">
      <blockquote style="font-family:'Cormorant Garamond',Georgia,serif;font-size:20px;font-style:italic;color:#ff9d37;margin:0;padding:0 20px;">"The sky is not the limit. You limit yourself to the sky."</blockquote>
      <p style="font-size:12px;color:#948766;margin-top:8px;">— Jaydin Donough, Founder of InkReal</p>
    </div>
    <a href="https://inkreal.onrender.com/analytics" style="display:inline-block;background:#f97c0f;color:#0d0b08;font-size:15px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:24px;">View Full Analytics</a>
  </div>
  <p style="text-align:center;font-size:12px;color:#5f543d;margin-top:32px;">You receive this report as an active InkReal creator.</p>
</div>
</body></html>`,
  };
}

function notificationEmail(name: string, subject: string, message: string): { subject: string; html: string } {
  return {
    subject: `InkReal — ${subject}`,
    html: `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;padding:0;background:#0d0b08;font-family:'Inter',sans-serif;color:#e9e6dd;">
<div style="max-width:600px;margin:0 auto;padding:40px 20px;">
  <div style="text-align:center;margin-bottom:40px;"><h1 style="font-family:'Cormorant Garamond',Georgia,serif;font-size:36px;color:#ff9d37;margin:0;">InkReal</h1></div>
  <div style="background:#1a1712;border:1px solid #2e2920;border-radius:16px;padding:40px;">
    <h2 style="font-family:'Cormorant Garamond',Georgia,serif;font-size:24px;color:#ff9d37;">Dear ${name},</h2>
    <p style="font-size:16px;line-height:1.6;color:#b5ab92;">${message}</p>
    <a href="https://inkreal.onrender.com/feed" style="display:inline-block;background:#f97c0f;color:#0d0b08;font-size:15px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:24px;margin-top:20px;">Open InkReal</a>
  </div>
</div>
</body></html>`,
  };
}

// ─── Main Handler ───

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Fetch Resend API key from app_secrets table (service role bypasses RLS)
    const { data: secretRow } = await supabase
      .from("app_secrets")
      .select("key_value")
      .eq("key_name", "RESEND_API_KEY")
      .limit(1)
      .single();

    const resendApiKey = secretRow?.key_value || null;

    if (req.method === "POST") {
      const { to, name, penName, type, subject, message, stats, userId } = await req.json();

      if (!to) {
        return new Response(JSON.stringify({ error: "Recipient email is required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      let emailContent: { subject: string; html: string };
      switch (type) {
        case "welcome": emailContent = welcomeEmail(name || "Creator", penName || ""); break;
        case "monthly_newsletter": emailContent = monthlyNewsletter(name || "Creator", penName || ""); break;
        case "creator_report": emailContent = creatorReport(name || "Creator", penName || "", stats || { posts: 0, likes: 0, comments: 0, followers: 0, reads: 0, books: 0 }); break;
        case "notification": emailContent = notificationEmail(name || "Creator", subject || "Notification", message || ""); break;
        default:
          return new Response(JSON.stringify({ error: "Unknown email type" }), {
            status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
      }

      let sendStatus = "sent";
      let errorMessage: string | null = null;

      if (resendApiKey) {
        try {
          const resendResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { "Authorization": `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              from: "InkReal <noreply@resend.dev>",
              to: [to],
              subject: emailContent.subject,
              html: emailContent.html,
            }),
          });

          if (!resendResponse.ok) {
            const errorData = await resendResponse.text();
            sendStatus = "failed";
            errorMessage = `Resend API error: ${resendResponse.status} ${errorData}`;
          }
        } catch (err) {
          sendStatus = "failed";
          errorMessage = err instanceof Error ? err.message : "Failed to send via Resend";
        }
      } else {
        sendStatus = "pending";
        errorMessage = "RESEND_API_KEY not found in app_secrets table.";
      }

      await supabase.from("email_queue").insert({
        user_id: userId || null,
        email: to,
        name: name || "",
        pen_name: penName || "",
        email_type: type,
        subject: emailContent.subject,
        body: emailContent.html,
        status: sendStatus,
        sent_time: sendStatus === "sent" ? new Date().toISOString() : null,
        error_message: errorMessage,
      });

      return new Response(
        JSON.stringify({
          success: sendStatus === "sent",
          status: sendStatus,
          message: sendStatus === "sent" ? "Email sent successfully via Resend" : errorMessage,
          subject: emailContent.subject,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // GET: Process pending queue (retry failed emails)
    if (req.method === "GET") {
      const { data: pendingEmails } = await supabase
        .from("email_queue")
        .select("*")
        .in("status", ["pending", "failed"])
        .lt("retry_count", 3)
        .order("created_at", { ascending: true })
        .limit(50);

      let processed = 0;
      let sent = 0;

      for (const emailEntry of pendingEmails || []) {
        processed++;
        if (resendApiKey) {
          try {
            const resendResponse = await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: { "Authorization": `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
              body: JSON.stringify({
                from: "InkReal <noreply@resend.dev>",
                to: [emailEntry.email],
                subject: emailEntry.subject,
                html: emailEntry.body,
              }),
            });

            if (resendResponse.ok) {
              await supabase.from("email_queue").update({
                status: "sent", sent_time: new Date().toISOString(), error_message: null,
              }).eq("id", emailEntry.id);
              sent++;
            } else {
              const errorData = await resendResponse.text();
              await supabase.from("email_queue").update({
                status: "failed", retry_count: emailEntry.retry_count + 1,
                error_message: `Resend error: ${resendResponse.status} ${errorData}`,
              }).eq("id", emailEntry.id);
            }
          } catch (err) {
            await supabase.from("email_queue").update({
              status: "failed", retry_count: emailEntry.retry_count + 1,
              error_message: err instanceof Error ? err.message : "Unknown error",
            }).eq("id", emailEntry.id);
          }
        } else {
          await supabase.from("email_queue").update({
            retry_count: emailEntry.retry_count + 1,
          }).eq("id", emailEntry.id);
        }
      }

      return new Response(
        JSON.stringify({ success: true, processed, sent, hasResendKey: !!resendApiKey }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
