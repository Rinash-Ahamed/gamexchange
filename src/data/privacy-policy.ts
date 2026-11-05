import type { LegalPolicy } from "./legal";

/** Published at the business owner's request. See .agent/PRIVACY_POLICY.md for review limits. */
export const privacyPolicy: LegalPolicy = {
  "slug": "privacy-policy",
  "title": "Privacy policy",
  "description": "How GameXchange handles account, delivery, payment, enquiry and customer service information, and how to contact us about your privacy.",
  "updated": "5 November 2026",
  "sections": [
    {
      "id": "who-we-are",
      "title": "Who we are",
      "paragraphs": [
        "GameXchange is operated by GXC Concepts Pvt Ltd. This policy explains how we handle personal information when you use our website, sign in, prepare a purchase, contact our team or receive customer support.",
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
      "id": "customer-accounts-and-delivery",
      "title": "Customer accounts and delivery details",
      "paragraphs": [
        "Customer checkout uses Google sign-in through Firebase Authentication. We receive your verified email address and customer identifier to associate a checkout with your account. Google's sign-in service also processes authentication and technical information under its own privacy policy. We do not receive your Google password or request access to your Gmail mailbox.",
        "Before preparing an order, we ask for the recipient's name, Indian mobile number, house or flat and street address, optional area or landmark, city, state, PIN code and country. We use these details to associate the order with the right customer, provide order support and arrange delivery where a sale and delivery service have been confirmed. A phone number or PIN code entered on this website is not independently verified.",
        "Delivery details are saved with the order record, including when payment has not yet completed. They are available to authorised staff, not published in the product catalogue. We also record the checkout privacy notice version and server receipt time when you affirmatively accept it. This acknowledgment is not consent to marketing.",
        "Checkout is currently a test service: use sample delivery information, no real payment is collected and no shipment is created. Shipping charges and courier coverage are not currently calculated by the website. We do not promise delivery merely because you have entered an address."
      ]
    },
    {
      "id": "payments",
      "title": "Payments and checkout records",
      "paragraphs": [
        "Razorpay provides the hosted payment checkout. When you open it, we provide the order identifier, amount, currency and the name, email and phone used for checkout prefill. Razorpay may process payment, contact, device and transaction information under its own terms and privacy policy. Do not enter real payment information in test checkout.",
        "We store the selected products, quantities and prices, total amount, order status, order and payment references, customer identity and delivery details to validate checkout and support enquiries. We verify payment results on the server and reconcile signed payment notifications. We do not store full payment-card numbers, CVV codes, UPI PINs or banking passwords.",
        "Saving a checkout record or receiving an authorised payment status alone does not mean a payment has been captured or a delivery booked. Current test payments do not reserve or reduce stock and must not be treated as fulfilment orders."
      ]
    },
    {
      "id": "technical-information",
      "title": "Technical information and website preferences",
      "paragraphs": [
        "The website processes technical request information, such as an IP address or available request identifiers, to operate forms and help prevent abuse. Hosting and infrastructure providers may also process request and security logs as part of delivering the service.",
        "When configured on the Contact and Repair forms, Cloudflare Turnstile processes browser and security information to help detect automated submissions. We verify its short-lived challenge result on our server before processing the enquiry. We do not send your name, phone number or repair message to Turnstile's verification endpoint, and do not save challenge tokens with your service record.",
        "Your browser can store a theme preference and cart product identifiers and quantities. Browser session storage is used for the introductory loading screen and may retain customer authentication state for the browser session, with an in-memory fallback if storage is unavailable. We do not save your delivery address in cart storage. Authorised administrators receive a secure session cookie after multi-factor sign-in, subject to a 15-minute inactivity timeout and an eight-hour maximum."
      ]
    },
    {
      "id": "how-we-use-information",
      "title": "How we use information",
      "paragraphs": [
        "We use information to respond to enquiries, discuss product availability and valuations, arrange agreed services, manage repairs and warranties, maintain relevant customer service records and provide support.",
        "We also use necessary information to authenticate customers and authorised staff, validate payments, protect account and administrative access, prevent misuse and meet applicable recordkeeping or legal requirements. Checkout acknowledgment does not subscribe you to promotions or authorise unrelated marketing."
      ]
    },
    {
      "id": "enquiries-and-whatsapp",
      "title": "Enquiries and WhatsApp",
      "paragraphs": [
        "Submitting a WhatsApp enquiry sends its information to our server for validation and preparation of a message link. You must send the prepared message for it to reach the team. If you choose Request a callback on the repair form and agree to the callback notice, we save your name, mobile number, device and issue details, preferred branch, request reference and consent receipt in our private customer service records so authorised staff can contact you. A saved callback request is not a confirmed repair booking. Temporary anti-abuse records are processed separately.",
        "Opening the prepared link passes the message content to WhatsApp. You must review and send the message for it to reach our team through WhatsApp. WhatsApp processes information under its own terms and privacy policy.",
        "Information you share directly with the team, including through WhatsApp, telephone or email, may be retained in those communication systems and recorded where needed to handle your request."
      ]
    },
    {
      "id": "service-providers",
      "title": "Service providers and external links",
      "paragraphs": [
        "We use Google Firebase for customer and administrator authentication, database storage and uploaded images. Our hosting and infrastructure providers process information needed to run and secure the website. Razorpay processes hosted payment checkout and transaction information.",
        "Some existing product images are delivered from an external image provider. Requests for externally hosted images may share technical request information with that provider.",
        "WhatsApp, map links, social media and other external services operate under their own privacy policies. Where an agreed transaction needs a courier, payment provider or another service partner, relevant information may be shared as necessary to carry out that transaction.",
        "Service providers may process information outside your location or outside India, depending on their service configuration and terms. We may also disclose information where required by applicable law."
      ]
    },
    {
      "id": "retention",
      "title": "How long we keep information",
      "paragraphs": [
        "We retain information for the purposes for which it was collected, including account access, checkout and payment reconciliation, support, agreed services, warranties, recordkeeping and applicable legal obligations. Retention depends on the record type and relevant business or legal requirements. This website does not currently apply a general automatic deletion schedule to customer service or checkout records, including incomplete test checkouts.",
        "Records are not automatically erased simply because a few days have passed. A request to erase information will be reviewed alongside any obligation to retain relevant transaction or service records. Provider backups, communication systems and logs may follow separate retention schedules."
      ]
    },
    {
      "id": "security",
      "title": "Keeping information secure",
      "paragraphs": [
        "Administrative access is restricted to approved accounts with verified email addresses and multi-factor authentication. Server-side access checks protect customer service and checkout records and administrative changes. Customer checkout requests use verified account identity and order-ownership checks; signing in as a customer does not grant admin access.",
        "We take reasonable steps to protect information, but no system can guarantee absolute security. Before handing over or selling a device, back up important data and remove personal accounts and payment information where appropriate."
      ]
    },
    {
      "id": "your-requests",
      "title": "Privacy requests and concerns",
      "paragraphs": [
        "Contact support@gamexchange.co.in or call +91 77088 45461 to ask about your information, request a correction or erasure, withdraw consent where applicable, or raise a privacy concern. Include an order or service reference where available, but do not send passwords, PINs, one-time codes or payment-card security information.",
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
        "We may update this policy when our services, data-handling practices or applicable requirements change. The last-updated date appears on this page. Where appropriate, we will provide a revised notice before using information for a materially different purpose."
      ]
    }
  ]
};

