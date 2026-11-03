"use client";

import Image from "next/image";
import { useEffect, useState, type FormEvent } from "react";
import { FirebaseError } from "firebase/app";
import {
  getMultiFactorResolver, multiFactor, sendEmailVerification, sendPasswordResetEmail, signInWithEmailAndPassword, signOut,
  TotpMultiFactorGenerator, type MultiFactorError, type MultiFactorResolver, type TotpSecret, type User,
} from "firebase/auth";
import { firebaseClientAuth, firebaseClientConfigured } from "@/lib/firebase/client";
import { adminButtonClass, adminGhostButtonClass, adminInputClass, adminLabelClass } from "./styles";
import { imageLoading } from "@/lib/image-loading";

async function serverIdentity(user: User, checkOnly = false) {
  const response = await fetch("/api/admin/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ idToken: await user.getIdToken(true), checkOnly }),
  });
  const data = await response.json() as { ok?: boolean; error?: string; emailVerified?: boolean };
  if (!response.ok || !data.ok) throw new Error(data.error ?? "Sign-in could not be verified.");
  return data;
}

function errorMessage(error: unknown) {
  if (error instanceof FirebaseError) {
    const messages: Record<string, string> = {
      "auth/invalid-credential": "The email or password is incorrect.",
      "auth/invalid-email": "Enter a valid email address.",
      "auth/wrong-password": "The email or password is incorrect.",
      "auth/user-not-found": "The email or password is incorrect.",
      "auth/invalid-verification-code": "That code is incorrect or expired. Try the current code from your authenticator.",
      "auth/code-expired": "That code has expired. Start again and use the current authenticator code.",
      "auth/invalid-multi-factor-session": "Your sign-in has expired. Start again.",
      "auth/requires-recent-login": "Please start again to confirm your identity.",
      "auth/too-many-requests": "Too many attempts. Please wait before trying again.",
      "auth/network-request-failed": "Unable to connect. Check your connection and try again.",
      "auth/operation-not-allowed": "Admin sign-in is unavailable. Please contact support.",
      "auth/unverified-email": "Verify your email before setting up your authenticator.",
      "auth/unsupported-first-factor": "Authenticator setup is unavailable. Please contact support.",
      "auth/user-disabled": "This account has been disabled. Contact the site owner.",
      "auth/invalid-api-key": "Admin sign-in is unavailable. Please contact support.",
    };
    return messages[error.code] ?? "Authentication could not be completed. Start again or contact the site owner.";
  }
  return error instanceof Error ? error.message : "Sign-in could not be completed. Please try again.";
}

export function FirebaseAdminLogin({ serverConfigured }: { serverConfigured: boolean }) {
  const [email, setEmail] = useState("");
  const [stage, setStage] = useState<"password" | "reset" | "enroll" | "code">("password");
  const [resetCooldown, setResetCooldown] = useState(false);
  const [resolver, setResolver] = useState<MultiFactorResolver | null>(null);
  const [factorUid, setFactorUid] = useState("");
  const [secret, setSecret] = useState<TotpSecret | null>(null);
  const [qr, setQr] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const configured = serverConfigured && firebaseClientConfigured;
  useEffect(() => {
    if (!resetCooldown) return;
    const timer = window.setTimeout(() => setResetCooldown(false), 60000);
    return () => window.clearTimeout(timer);
  }, [resetCooldown]);

  const resetNotice = "If this email belongs to an eligible account, a password-reset link will be sent. Check your inbox and spam folder, then return here to sign in. Your authenticator is still required.";

  const startAgain = async () => {
    setBusy(true);
    try { await signOut(firebaseClientAuth()); }
    catch { /* No browser session survives a page reload: auth uses memory only. */ }
    finally {
      setResolver(null);
      setSecret(null);
      setQr("");
      setFactorUid("");
      setStage("password");
      setError("");
      setNotice("");
      setBusy(false);
    }
  };

  const finish = async (user: User) => {
    await serverIdentity(user);
    // The HTTP-only server cookie is now the only dashboard credential.
    try { await signOut(firebaseClientAuth()); }
    finally { window.location.assign("/admin"); }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy || !configured) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    setError("");
    setNotice("");
    setBusy(true);
    try {
      const auth = firebaseClientAuth();
      if (stage === "reset") {
        if (resetCooldown) return;
        setResetCooldown(true);
        try { await sendPasswordResetEmail(auth, email.trim()); }
        catch (caught) {
          // Do not reveal whether an account exists, even if enumeration protection is disabled.
          if (!(caught instanceof FirebaseError) || !["auth/user-not-found", "auth/user-disabled"].includes(caught.code)) throw caught;
        }
        setNotice(resetNotice);
      } else if (stage === "password") {
        const password = String(data.get("password") ?? "");
        const passwordInput = form.elements.namedItem("password");
        if (passwordInput instanceof HTMLInputElement) passwordInput.value = "";
        const { user } = await signInWithEmailAndPassword(auth, email.trim(), password);
        const identity = await serverIdentity(user, true);
        if (!identity.emailVerified) {
          await sendEmailVerification(user);
          await signOut(auth);
          setNotice("Verification email sent. Open the link in your inbox, then sign in again to set up your authenticator.");
          return;
        }
        const session = await multiFactor(user).getSession();
        const nextSecret = await TotpMultiFactorGenerator.generateSecret(session);
        const QRCode = await import("qrcode");
        const nextQr = await QRCode.toDataURL(nextSecret.generateQrCodeUrl(user.email ?? email, "GameXChange Admin"), { width: 240, margin: 2 });
        setSecret(nextSecret);
        setQr(nextQr);
        setStage("enroll");
      } else {
        const code = String(data.get("code") ?? "").trim();
        if (!/^\d{6}$/.test(code)) throw new Error("Enter the six-digit code from your authenticator.");
        if (stage === "enroll") {
          if (!secret || !auth.currentUser) throw new Error("Setup expired. Start again.");
          await multiFactor(auth.currentUser).enroll(TotpMultiFactorGenerator.assertionForEnrollment(secret, code), "Admin authenticator");
          await signOut(auth);
          setSecret(null);
          setQr("");
          setStage("password");
          setNotice("Authenticator connected. Sign in again with your password and authenticator code to open the dashboard.");
        } else {
          if (!resolver || !factorUid) throw new Error("Sign-in expired. Start again.");
          const { user } = await resolver.resolveSignIn(TotpMultiFactorGenerator.assertionForSignIn(factorUid, code));
          await finish(user);
        }
      }
    } catch (caught) {
      if (stage === "password" && caught instanceof FirebaseError && caught.code === "auth/multi-factor-auth-required") {
        const nextResolver = getMultiFactorResolver(firebaseClientAuth(), caught as MultiFactorError);
        const totp = nextResolver.hints.find((factor) => factor.factorId === TotpMultiFactorGenerator.FACTOR_ID);
        if (!totp) setError("This account needs a TOTP authenticator. Contact the site owner for account recovery.");
        else {
          setResolver(nextResolver);
          setFactorUid(totp.uid);
          setStage("code");
        }
      } else {
        setError(errorMessage(caught));
        if (stage === "password") {
          try { await signOut(firebaseClientAuth()); } catch { /* Fail closed: no admin cookie has been issued. */ }
        }
      }
    } finally { setBusy(false); }
  };

  return (
    <div className="mt-6 space-y-4">
      {!configured && <p role="alert" className="rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger">Admin sign-in is unavailable. Please contact support.</p>}
      {error && <p role="alert" className="rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger">{error}</p>}
      {notice && <p role="status" className="rounded-xl border border-line bg-surface p-4 text-sm text-ink">{notice}</p>}
      <form onSubmit={submit} className="space-y-4" aria-busy={busy}>
        <fieldset disabled={busy || !configured} className="min-w-0 space-y-4 disabled:opacity-60">
          {stage === "password" || stage === "reset" ? (
            <>
              {stage === "reset" && <div><h2 className="font-display text-xl font-semibold uppercase">Reset your password</h2><p className="mt-2 text-sm leading-6 text-muted">Enter your admin email to receive a password reset link. Your authenticator stays connected.</p></div>}
              <div>
                <label htmlFor="admin-email" className={adminLabelClass}>Email</label>
                <input id="admin-email" name="email" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} className={adminInputClass} />
              </div>
              {stage === "password" && <div>
                <label htmlFor="admin-password" className={adminLabelClass}>Password</label>
                <input id="admin-password" name="password" type="password" autoComplete="current-password" required className={adminInputClass} />
              </div>}
            </>
          ) : (
            <>
              <h2 className="font-display text-xl font-semibold uppercase">{stage === "enroll" ? "Set up your authenticator" : "Authenticator code"}</h2>
              {stage === "enroll" && secret ? (
                <div className="space-y-3 text-sm text-muted">
                  <p>Scan this QR code with Google Authenticator, Microsoft Authenticator or another authenticator app.</p>
                  {qr && <Image src={qr} alt="Scan to connect your admin authenticator" width={240} height={240} unoptimized {...imageLoading("visible")} className="mx-auto h-auto max-w-full rounded-xl" />}
                  <p>Or enter this setup key manually:</p>
                  <code className="block select-all break-all rounded-xl border border-line bg-surface p-3 text-ink">{secret.secretKey}</code>
                  <p>Keep this key private. Enter the current six-digit code below to finish setup.</p>
                </div>
              ) : <p className="text-sm text-muted">Enter the current code from your authenticator app.</p>}
              {stage === "code" && resolver && resolver.hints.filter((factor) => factor.factorId === TotpMultiFactorGenerator.FACTOR_ID).length > 1 && (
                <div>
                  <label htmlFor="admin-factor" className={adminLabelClass}>Authenticator</label>
                  <select id="admin-factor" value={factorUid} onChange={(event) => setFactorUid(event.target.value)} className={adminInputClass}>
                    {resolver.hints.filter((factor) => factor.factorId === TotpMultiFactorGenerator.FACTOR_ID).map((factor, index) => <option key={factor.uid} value={factor.uid}>{factor.displayName ?? `Authenticator ${index + 1}`}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label htmlFor="admin-code" className={adminLabelClass}>Six-digit code</label>
                <input key={stage} id="admin-code" name="code" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" minLength={6} maxLength={6} required className={adminInputClass} />
              </div>
            </>
          )}
          <button type="submit" disabled={stage === "reset" && resetCooldown} className={`${adminButtonClass} w-full disabled:cursor-not-allowed disabled:opacity-60`}>{busy ? "Please wait..." : stage === "reset" ? resetCooldown ? "Wait before requesting again" : "Send reset link" : stage === "password" ? "Continue" : stage === "enroll" ? "Connect authenticator" : "Verify and sign in"}</button>
        </fieldset>
      </form>
      {stage === "password" && <button type="button" disabled={busy || !configured} onClick={() => { setError(""); setNotice(""); setStage("reset"); }} className="inline-flex min-h-11 items-center text-sm font-semibold text-accent-text hover:underline disabled:opacity-50">Forgot password?</button>}
      {stage !== "password" && <button type="button" disabled={busy} onClick={() => void startAgain()} className={`${adminGhostButtonClass} w-full`}>{stage === "reset" ? "Back to sign in" : "Start again"}</button>}
      <p className="text-xs text-muted">Admin access requires a verified email and an authenticator code. For a lost authenticator, contact the project owner.</p>
    </div>
  );
}
