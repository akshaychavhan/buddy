import { Resend } from "resend";

// Lazy singleton — Resend is only constructed on the first send call. Prevents
// build-time / module-load failures when RESEND_API_KEY isn't set (e.g. in CI
// or before the user has signed up for a Resend account).
let resend: Resend | null = null;

function getResend(): Resend {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error(
        "RESEND_API_KEY is not set. Add it to .env.local before sending email.",
      );
    }
    resend = new Resend(apiKey);
  }
  return resend;
}

const FROM = process.env.EMAIL_FROM ?? "Buddies <onboarding@resend.dev>";

type SendMagicLinkArgs = {
  email: string;
  url: string;
};

export async function sendMagicLink({ email, url }: SendMagicLinkArgs) {
  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: "Sign in to Buddies",
    html: `
      <p>Hello,</p>
      <p>Click the link below to sign in to Buddies:</p>
      <p><a href="${url}">Sign in to Buddies</a></p>
      <p>This link expires in 10 minutes. If you didn't request it, ignore this email.</p>
    `,
  });
}
