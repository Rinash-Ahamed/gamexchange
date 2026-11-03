# Gmail notifications

## Current status

The confirmed notification recipient is finance.gxc@gmail.com and the requested provider is Gmail. The .env.example file now documents the intended server-only SMTP settings. The mail transport, custom purchase/repair templates, durable delivery/retry and event integration are not implemented yet. Adding environment values alone does not send email. No test mail has been sent.

Customer Google sign-in is independent of Gmail SMTP. Shopper login does not require an App Password and must never request access to the shopper's mailbox. Generate the password only for the business account that will send notifications.

## Create an App Password

1. Sign in to the intended sending Gmail account.
2. Enable 2-Step Verification in Google Account > Security.
3. Open [App Passwords](https://myaccount.google.com/apppasswords), name the app GameXchange Website and create its password.
4. Copy the generated 16-character password into SMTP_PASS in .env.local and Vercel server environment settings, without the display spaces. Do not paste it in chat, source code, documentation or NEXT_PUBLIC_ variables.
5. Set SMTP_USER to that sending account's full Gmail address. The password must belong to SMTP_USER, not merely to the notification recipient.

App Passwords may be unavailable for organizational accounts, Advanced Protection or security-key-only 2-Step Verification. Changing the Google account password revokes existing App Passwords; create a replacement if needed. Prefer OAuth for a future production-grade Gmail integration where feasible.

## Variables

```dotenv
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-sending-account@gmail.com
SMTP_PASS=your-16-character-app-password
MAIL_FROM_NAME=GameXchange
NOTIFICATION_EMAIL=finance.gxc@gmail.com
```

The intended sender address is SMTP_USER; MAIL_FROM_NAME is its display name, not an arbitrary sender address. Port 465 uses TLS from connection start. Do not disable certificate verification. These variables are configuration preparation only until the server mailer is implemented. Restart locally or redeploy after environment changes when the integration is available.

Future implementation must escape customer text in HTML, provide plain-text alternatives, omit secrets and payment-card data, distinguish sandbox from paid live orders, avoid duplicate purchase notifications across webhook/callback retries and avoid claiming a repair booking merely from a WhatsApp draft. Finance email must not be the only durable record of a paid order.

References reviewed on 2026-11-03: [Google App Password instructions](https://support.google.com/accounts/answer/185833?hl=en) and [Gmail SMTP/TLS settings](https://developers.google.com/workspace/gmail/imap/imap-smtp).
