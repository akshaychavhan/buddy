"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

// FormData values are `string | File`. Our inputs are <input type="email" />
// and <input type="password" />, so File never occurs — but guard explicitly
// to satisfy SonarLint S6551 and to avoid `[object Object]` stringification
// if the form is ever tampered with.
function getString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export type SignInState = { error: string | null };

export async function signInAction(
  _prevState: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const email = getString(formData, "email").trim();
  const password = getString(formData, "password");

  try {
    await auth.api.signInEmail({
      body: { email, password },
      // eslint-disable-next-line @typescript-eslint/await-thenable
      headers: await headers(),
    });
  } catch (err) {
    return { error: (err as Error).message };
  }

  redirect("/");
}

export type MagicLinkState = { error: string | null; sent: boolean };

export async function magicLinkAction(
  _prevState: MagicLinkState,
  formData: FormData,
): Promise<MagicLinkState> {
  const email = getString(formData, "email").trim();

  try {
    await auth.api.signInMagicLink({
      body: { email },
      // eslint-disable-next-line @typescript-eslint/await-thenable
      headers: await headers(),
    });
  } catch (err) {
    return { error: (err as Error).message, sent: false };
  }

  return { error: null, sent: true };
}
