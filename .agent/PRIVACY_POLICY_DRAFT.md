# Privacy policy draft for review

Status: Unapproved. Prepared 30 October 2026. Not published to the public website.

Implementation update for reviewers: a browser-local cart now stores product IDs and quantities. Optional Razorpay test checkout loads the provider's hosted checkout script on the configured cart page and saves product/amount snapshots plus order/payment references in Firestore. Use dummy contact/payment details for testing. The provider may process technical request and checkout/contact information under its own policies. The app does not store card numbers or security codes. The body and protected preview below predate this integration and must both be revised and approved before any live payments or privacy-policy publication. See `RAZORPAY_SETUP.md` for the implemented data flow and limits.

The supplied Word document does not include a privacy policy. This draft combines verified website data flows with proposed retention and support wording that the business must approve. It is not a legal compliance certification.

## Confirm before publication

- Confirm the privacy contact, responsible person and complaint-handling process, including any required escalation details and response procedures.
- Confirm the hosting provider, database and Storage regions, processors, international transfers, provider logs and retention settings. These settings have not been inspected.
- Approve specific retention/deletion schedules for service records, enquiries, WhatsApp, email, backups and security logs. The app currently has no general automatic retention workflow.
- Confirm offline purchases, delivery, identity checks, payments and store-credit practices, plus any marketing consent/opt-out processes. These are not fully verifiable from the repository.
- Confirm how children's information and parental authorisation are handled. No age-verification or parental-consent workflow has been implemented on this site.
- Review notices and consent requirements under applicable Indian law and current commencement dates with a qualified adviser. Set an effective date only after approval.

## Website preview

Sign in to the admin portal and open `/admin/privacy-preview`. The preview reuses the themed policy layout but is protected by admin authentication, marked noindex and omitted from public navigation and sitemap.

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

