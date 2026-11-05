# Privacy policy publication and review record

5 November 2026 follow-up: public policy now describes explicit repair callback consent and private service-record storage plus configured Cloudflare Turnstile security processing. Names, phones and repair text are not posted to Siteverify; only the challenge token and server secret are posted. Policy date updated to 5 November. Source changes only, not a deployment or legal compliance certification. Callback and provider/browser persistence verification remain pending. See ENQUIRY_SETUP.md.

Status: Publication requested by the business owner on 3 November 2026. Public source: src/data/privacy-policy.ts, rendered at /policies/privacy-policy. Footer, policy directory, metadata and sitemap use the public policy. Actual production deployment and legal compliance have not been verified. No lawyer approval is claimed.

Current public source additionally covers customer Google/Firebase sign-in, session authentication storage, Indian recipient/address/phone fields, checkout snapshots including abandoned/unpaid test records, Razorpay prefill and references, admin-only access, checkout consent receipt, no marketing opt-in, purpose-limited sharing, retention limitations and privacy requests. Real payments, shipping fees/serviceability, courier dispatch and Gmail notifications remain unimplemented. Use sample shipping/payment details during testing. This paragraph supersedes the historical text below; the public source is authoritative and must be maintained rather than copying the old body.

Checkout consent is an unchecked native required checkbox, validated as literal true and the current notice version on the server. New order records store the acceptance receipt time from the server and notice version 2026-11-03-v1. This is checkout-specific acknowledgment, not marketing consent, age verification, a legal compliance certification or retroactive consent for earlier Google authentication. The policy link opens independently without losing form input. No IP address or extra customer identifiers are added to the consent receipt. Change the version when materially changing the notice.

The public policy is now published in code at the owner's explicit request, not held behind admin review. The legacy /admin/privacy-preview route remains admin-protected and redirects to the public policy. The historical content below is retained only as drafting context; it is not the live policy body.

The supplied Word document does not include a privacy policy. This draft combines verified website data flows with proposed retention and support wording that the business must approve. It is not a legal compliance certification.

## Remaining business/legal review

- Confirm the privacy contact, responsible person and complaint-handling process, including any required escalation details and response procedures.
- Confirm the hosting provider, database and Storage regions, processors, international transfers, provider logs and retention settings. These settings have not been inspected.
- Approve specific retention/deletion schedules for service records, enquiries, WhatsApp, email, backups and security logs. The app currently has no general automatic retention workflow.
- Confirm offline purchases, delivery, identity checks, payments and store-credit practices, plus any marketing consent/opt-out processes. These are not fully verifiable from the repository.
- Confirm how children's information and parental authorisation are handled. No age-verification or parental-consent workflow has been implemented on this site.
- Review notices and consent requirements under applicable Indian law and current commencement dates with a qualified adviser. Set an effective date only after approval.

## Website preview

Open /policies/privacy-policy to read the published source in the themed legal layout. No deployed browser check was performed for this update.

## Who we are

GamexChange is operated by GXC Concepts Pvt Ltd. This policy explains how we handle personal information when you use our website, contact our team or receive customer support.

For privacy questions or requests, contact support@gamexchange.co.in or +91 77088 45461. Our registered office is No. 7, Shanmuganagar, Sungam Bypass Road, Ramanathapuram, Coimbatore - 641045, Tamil Nadu, India.

## Information you provide

Enquiries may include your name, mobile number, preferred contact method and branch, and details of your device, repair issue, trade enquiry, gaming session or franchise enquiry. The exact information depends on the form you choose.

When our team creates a customer service record, it may contain your name, phone number, device details, reported issue, ticket reference, repair status, estimated cost, service notes and record dates.

Authorised administrator sign-in uses Firebase Authentication. Account information may include the administrator's email address, Firebase user identifier, authentication details and multi-factor authentication enrolment. Do not include passwords, PINs, one-time codes or payment-card security details in enquiry messages.

## Technical information and website preferences

The website processes technical request information, such as an IP address or available request identifiers, to operate forms and help prevent abuse. Hosting and infrastructure providers may also process request and security logs as part of delivering the service.

Your browser can store a theme preference so the website remembers light or dark mode. Browser session storage is also used for the introductory loading screen. Authorised administrators receive a session cookie with an eight-hour lifetime after successful multi-factor sign-in.

## How we use information

We use information to respond to enquiries, discuss product availability and valuations, arrange agreed services, manage repairs and warranties, maintain relevant customer service records and provide support.

We also use necessary information to authenticate authorised staff, protect administrative access, prevent misuse and meet applicable recordkeeping or legal requirements. You may contact us if you no longer wish to receive promotional communications.

## Enquiries and WhatsApp

Submitting a website enquiry sends its information to our server for validation and preparation of a WhatsApp message. The current enquiry endpoint does not save the full enquiry to Firestore; it returns a prepared message link. Temporary anti-abuse records are processed separately.

Opening the prepared link passes the message content to WhatsApp. You must review and send the message for it to reach our team through WhatsApp. WhatsApp processes information under its own terms and privacy policy.

Information you share directly with the team, including through WhatsApp, telephone or email, may be retained in those communication systems and recorded where needed to handle your request.

## Service providers and external links

We use Google Firebase for administrator authentication, database storage and uploaded images. Our hosting and infrastructure providers process information needed to run and secure the website.

Some existing product images are delivered from an external image provider. Requests for externally hosted images may share technical request information with that provider.

WhatsApp, map links, social media and other external services operate under their own privacy policies. Where an agreed transaction needs a courier, payment provider or another service partner, relevant information may be shared as necessary to carry out that transaction.

Service providers may process information outside your location or outside India, depending on their service configuration and terms. We may also disclose information where required by applicable law.

## How long we keep information

We retain information for the purposes for which it was collected, including support, agreed services, warranties, recordkeeping and applicable legal obligations. Retention depends on the record type and the relevant business or legal requirements.

Records are not automatically erased simply because a few days have passed. A request to erase information will be reviewed alongside any obligation to retain relevant transaction or service records. Provider backups, communication systems and logs may follow separate retention schedules.

## Keeping information secure

Administrative access is restricted to approved accounts with verified email addresses and multi-factor authentication. Server-side access checks protect customer service records and administrative changes.

We take reasonable steps to protect information, but no system can guarantee absolute security. Before handing over or selling a device, back up important data and remove personal accounts and payment information where appropriate.

## Privacy requests and concerns

Contact support@gamexchange.co.in to ask about your information, request a correction or erasure, withdraw consent where applicable, or raise a privacy concern. Describe your request without sending passwords, PINs or one-time codes.

We may request reasonable information to verify your identity before acting on a request. Requests will be assessed under applicable law and any relevant recordkeeping obligations. Withdrawing consent may affect services that depend on the information concerned.

## Children's information

If you believe a child's personal information has been submitted without appropriate authorisation, contact our support team so we can review the situation and address it in accordance with applicable requirements.

## Changes to this policy

We may update this policy when our services, data-handling practices or applicable requirements change. An approved version will show its effective or last-updated date.

## Drafting references

- [Firebase privacy and processing information](https://firebase.google.com/support/privacy).
- [MeitY Digital Personal Data Protection Rules 2025](https://www.meity.gov.in/documents/act-and-policies/digital-personal-data-protection-rules-2025-gDOxUjMtQWa?pageTitle=Digital-Personal-Data-Protection-Rules-2025).

These references support review of provider processing and applicable notice requirements; this draft does not claim all legal requirements or business practices have been verified.

