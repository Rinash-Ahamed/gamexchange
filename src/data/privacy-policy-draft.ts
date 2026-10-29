import "server-only";
import type { LegalPolicy } from "./legal";

/** Unapproved draft. Import only in protected admin routes until the business approves publication. */
export const privacyPolicyDraft: LegalPolicy = {
  "slug": "privacy-policy",
  "title": "Privacy policy",
  "description": "How GamexChange handles information collected through website enquiries, customer service and authorised administration.",
  "updated": "30 October 2026",
  "sections": [
    {
      "id": "who-we-are",
      "title": "Who we are",
      "paragraphs": [
        "GamexChange is operated by GXC Concepts Pvt Ltd. This policy explains how we handle personal information when you use our website, contact our team or receive customer support.",
        "For privacy questions or requests, contact support@gamexchange.co.in or +91 77088 45461. Our registered office is No. 7, Shanmuganagar, Sungam Bypass Road, Ramanathapuram, Coimbatore - 641045, Tamil Nadu, India."
      ]
    },
    {
      "id": "information-you-provide",
      "title": "Information you provide",
      "paragraphs": [
        "Enquiries may include your name, mobile number, preferred contact method and branch, and details of your device, repair issue, trade enquiry, gaming session or franchise enquiry. The exact information depends on the form you choose.",
        "When our team creates a customer service record, it may contain your name, phone number, device details, reported issue, ticket reference, repair status, estimated cost, service notes and record dates.",
        "Authorised administrator sign-in uses Firebase Authentication. Account information may include the administrator's email address, Firebase user identifier, authentication details and multi-factor authentication enrolment. Do not include passwords, PINs, one-time codes or payment-card security details in enquiry messages."
      ]
    },
    {
      "id": "technical-information",
      "title": "Technical information and website preferences",
      "paragraphs": [
        "The website processes technical request information, such as an IP address or available request identifiers, to operate forms and help prevent abuse. Hosting and infrastructure providers may also process request and security logs as part of delivering the service.",
        "Your browser can store a theme preference so the website remembers light or dark mode. Browser session storage is also used for the introductory loading screen. Authorised administrators receive a session cookie with an eight-hour lifetime after successful multi-factor sign-in."
      ]
    },
    {
      "id": "how-we-use-information",
      "title": "How we use information",
      "paragraphs": [
        "We use information to respond to enquiries, discuss product availability and valuations, arrange agreed services, manage repairs and warranties, maintain relevant customer service records and provide support.",
        "We also use necessary information to authenticate authorised staff, protect administrative access, prevent misuse and meet applicable recordkeeping or legal requirements. You may contact us if you no longer wish to receive promotional communications."
      ]
    },
    {
      "id": "enquiries-and-whatsapp",
      "title": "Enquiries and WhatsApp",
      "paragraphs": [
        "Submitting a website enquiry sends its information to our server for validation and preparation of a WhatsApp message. The current enquiry endpoint does not save the full enquiry to Firestore; it returns a prepared message link. Temporary anti-abuse records are processed separately.",
        "Opening the prepared link passes the message content to WhatsApp. You must review and send the message for it to reach our team through WhatsApp. WhatsApp processes information under its own terms and privacy policy.",
        "Information you share directly with the team, including through WhatsApp, telephone or email, may be retained in those communication systems and recorded where needed to handle your request."
      ]
    },
    {
      "id": "service-providers",
      "title": "Service providers and external links",
      "paragraphs": [
        "We use Google Firebase for administrator authentication, database storage and uploaded images. Our hosting and infrastructure providers process information needed to run and secure the website.",
        "Some existing product images are delivered from an external image provider. Requests for externally hosted images may share technical request information with that provider.",
        "WhatsApp, map links, social media and other external services operate under their own privacy policies. Where an agreed transaction needs a courier, payment provider or another service partner, relevant information may be shared as necessary to carry out that transaction.",
        "Service providers may process information outside your location or outside India, depending on their service configuration and terms. We may also disclose information where required by applicable law."
      ]
    },
    {
      "id": "retention",
      "title": "How long we keep information",
      "paragraphs": [
        "We retain information for the purposes for which it was collected, including support, agreed services, warranties, recordkeeping and applicable legal obligations. Retention depends on the record type and the relevant business or legal requirements.",
        "Records are not automatically erased simply because a few days have passed. A request to erase information will be reviewed alongside any obligation to retain relevant transaction or service records. Provider backups, communication systems and logs may follow separate retention schedules."
      ]
    },
    {
      "id": "security",
      "title": "Keeping information secure",
      "paragraphs": [
        "Administrative access is restricted to approved accounts with verified email addresses and multi-factor authentication. Server-side access checks protect customer service records and administrative changes.",
        "We take reasonable steps to protect information, but no system can guarantee absolute security. Before handing over or selling a device, back up important data and remove personal accounts and payment information where appropriate."
      ]
    },
    {
      "id": "your-requests",
      "title": "Privacy requests and concerns",
      "paragraphs": [
        "Contact support@gamexchange.co.in to ask about your information, request a correction or erasure, withdraw consent where applicable, or raise a privacy concern. Describe your request without sending passwords, PINs or one-time codes.",
        "We may request reasonable information to verify your identity before acting on a request. Requests will be assessed under applicable law and any relevant recordkeeping obligations. Withdrawing consent may affect services that depend on the information concerned."
      ]
    },
    {
      "id": "children",
      "title": "Children's information",
      "paragraphs": [
        "If you believe a child's personal information has been submitted without appropriate authorisation, contact our support team so we can review the situation and address it in accordance with applicable requirements."
      ]
    },
    {
      "id": "changes",
      "title": "Changes to this policy",
      "paragraphs": [
        "We may update this policy when our services, data-handling practices or applicable requirements change. An approved version will show its effective or last-updated date."
      ]
    }
  ]
};

