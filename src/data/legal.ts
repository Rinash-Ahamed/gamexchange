export type LegalSection = { id: string; title: string; paragraphs: string[] };
export type LegalPolicy = { slug: string; title: string; description: string; updated: string; sections: LegalSection[] };

/** Supplied business terms, copy-edited without changing conditions or consumer protections. */
export const businessDetails = {
  "brand": "GamexChange",
  "entity": "GXC Concepts Pvt Ltd",
  "address": "No. 7, Shanmuganagar, Sungam Bypass Road, Ramanathapuram, Coimbatore - 641045, Tamil Nadu, India",
  "cin": "U52398TZ2022PTC038675",
  "email": "support@gamexchange.co.in",
  "phone": "+917708845461",
  "phoneDisplay": "+91 77088 45461",
  "about": [
    "GamexChange is a gaming retail brand operated by GXC Concepts Pvt Ltd, offering new and pre-owned gaming consoles, video games, controllers, gaming accessories, buying and exchange services, Game Zone experiences, and gaming console repair and servicing solutions.",
    "Through our retail stores, franchise network and authorised sales channels, we aim to provide customers with reliable gaming products, gaming experiences and customer service."
  ]
};

export const terms: LegalPolicy = {
  "slug": "terms",
  "title": "Terms and conditions",
  "description": "The terms governing your use of the GamexChange website and our products and services.",
  "updated": "29 October 2026",
  "sections": [
    {
      "id": "acceptance",
      "title": "Acceptance of terms",
      "paragraphs": [
        "The domain name www.gamexchange.co.in (hereinafter referred to as the “Website”) is operated by GXC Concepts Pvt Ltd, under its gaming retail brand GamexChange, having its registered office at No. 7, Shanmuganagar, Sungam Bypass Road, Ramanathapuram, Coimbatore - 641045, Tamil Nadu, India (hereinafter referred to as “GamexChange”, “GXC”, “we”, “us” or “our”).",
        "Your access to and use of this Website, including its services, features and tools, are governed by these Terms and Conditions and the applicable policies published on the Website. Any additional terms or policies relating to specific products or services shall be read together with these Terms and Conditions.",
        "By accessing or using this Website, placing an order, purchasing a product or using any of our services, you agree to comply with these Terms and Conditions and the applicable policies of GamexChange."
      ]
    },
    {
      "id": "accounts",
      "title": "Account security",
      "paragraphs": [
        "These Terms and Conditions govern your access to and use of the Website. You are responsible for maintaining the confidentiality of your account credentials and for activities carried out through your account. You must notify us promptly if you become aware of any unauthorised access to or use of your account."
      ]
    },
    {
      "id": "updates",
      "title": "Changes to these terms",
      "paragraphs": [
        "GamexChange reserves the right to modify, update or revise the Website, its features and these Terms and Conditions from time to time. Any changes will be published on the Website with the relevant revision date. Your continued use of the Website after such changes take effect will be subject to the revised terms, to the extent permitted by applicable law."
      ]
    },
    {
      "id": "communications",
      "title": "Electronic communications",
      "paragraphs": [
        "You agree that we may communicate with you electronically regarding your orders, purchases, payments, deliveries, warranties, service requests, account activities and other customer support matters. Where you have provided the necessary consent or where otherwise permitted by law, we may also send promotional communications to your registered email address or mobile number. You may opt out of promotional communications in accordance with the applicable process."
      ]
    },
    {
      "id": "orders",
      "title": "Availability and order acceptance",
      "paragraphs": [
        "GamexChange will not be responsible for delays or interruptions caused by circumstances beyond our reasonable control, subject to applicable law. All orders are subject to product availability, payment verification and acceptance by GamexChange. We reserve the right to decline or cancel an order where reasonably necessary, including in cases of product unavailability, suspected fraudulent activity or material pricing errors, subject to applicable law and our published policies."
      ]
    },
    {
      "id": "prices",
      "title": "Prices and remedies",
      "paragraphs": [
        "Product prices, offers, availability and promotional terms may change from time to time. The price applicable to an order will be communicated at the time of purchase or checkout. Any cancellation, refund or other remedy arising from an order will be handled in accordance with our applicable policies and statutory obligations."
      ]
    },
    {
      "id": "governing-law",
      "title": "Governing law and consumer rights",
      "paragraphs": [
        "All transactions conducted through the Website and services offered by GXC Concepts Pvt Ltd under the GamexChange brand are subject to applicable laws of India.",
        "These Terms and Conditions shall be governed by the laws of India. Any disputes shall be handled by the competent courts or other appropriate forums having jurisdiction under applicable law. Nothing in these terms limits any statutory rights or remedies available to consumers."
      ]
    }
  ]
};

export const policies: LegalPolicy[] = [
  {
    "slug": "returns-and-refunds",
    "title": "Cancellation, returns and refunds",
    "description": "How cancellations, returns, replacements, refunds and standard warranty requests are handled.",
    "updated": "29 October 2026",
    "sections": [
      {
        "id": "overview",
        "title": "Overview",
        "paragraphs": [
          "This Cancellation, Return & Refund Policy applies to purchases made through the official GamexChange website and other authorised sales channels operated by GXC Concepts Pvt Ltd."
        ]
      },
      {
        "id": "order-cancellation",
        "title": "Order Cancellation",
        "paragraphs": [
          "Customers wishing to cancel an order must contact GamexChange customer support at support@gamexchange.co.in or +91 77088 45461, quoting their order number.",
          "Cancellation requests will be reviewed based on the order status. Orders that have already been dispatched may not be eligible for cancellation through the standard cancellation process. Any applicable remedies will be subject to our published policies and applicable consumer protection laws."
        ]
      },
      {
        "id": "damaged-defective-or-incorrect-products",
        "title": "Damaged, Defective or Incorrect Products",
        "paragraphs": [
          "If you receive a damaged, defective or incorrect product, please contact our customer support team within 48 hours of delivery, where reasonably possible, and provide your order details, photographs or videos showing the issue.",
          "We will review the complaint and determine the appropriate resolution, which may include inspection, repair, replacement or refund, depending on the circumstances, the applicable product policy and the rights available under applicable law.",
          "Customers should retain the product, packaging and included accessories until the complaint has been resolved."
        ]
      },
      {
        "id": "returns-of-pre-owned-products",
        "title": "Returns of Pre-Owned Products",
        "paragraphs": [
          "Pre-owned gaming consoles, games, controllers and accessories may be eligible for return, replacement or service where a qualifying defect, incorrect delivery or other eligible issue is established.",
          "Eligibility will depend on the product listing, condition at delivery, applicable warranty and return policy, and the nature of the reported issue.",
          "Products showing signs of misuse, unauthorised modification or damage caused after delivery may be excluded from voluntary return or warranty coverage where permitted by law. Such exclusions will not affect any mandatory consumer rights."
        ]
      },
      {
        "id": "product-inspection-and-replacement",
        "title": "Product Inspection and Replacement",
        "paragraphs": [
          "Where a product is reported as defective or non-functional, GamexChange may arrange an inspection or request the product to be returned for testing.",
          "If the reported issue is verified, we will offer an appropriate remedy in accordance with the applicable policy and law. A replacement will be subject to stock availability. If a suitable replacement is unavailable, an eligible refund or other legally required remedy will be arranged.",
          "If testing does not reproduce the reported issue, we will communicate the findings to the customer. Any applicable return shipping or inspection charges must be disclosed in advance and comply with applicable law and the published policy."
        ]
      },
      {
        "id": "warranty-on-pre-owned-hardware",
        "title": "Warranty on Pre-Owned Hardware",
        "paragraphs": [
          "Certain pre-owned gaming consoles and hardware products may include a limited warranty, with the duration specified on the product listing, invoice or warranty documentation.",
          "Customers should report suspected functionality issues promptly and provide proof of purchase when requesting warranty support.",
          "Warranty claims will be assessed according to the applicable warranty terms. Depending on the circumstances, the remedy may include repair, replacement or refund where applicable.",
          "Warranty coverage may exclude damage caused by physical impact, liquid exposure, misuse, unauthorised repairs, modifications or tampering with warranty seals, to the extent permitted by law. Any applicable exclusions will be communicated in the warranty documentation."
        ]
      },
      {
        "id": "manufacturer-warranty-on-new-products",
        "title": "Manufacturer Warranty on New Products",
        "paragraphs": [
          "New products may carry a manufacturer's warranty where specified in the product description or accompanying documentation.",
          "Customers may be directed to an authorised manufacturer service centre for warranty assessment or repair, where appropriate. GamexChange will provide reasonable assistance with relevant purchase documentation and warranty information.",
          "Manufacturer warranty terms, coverage and exclusions will be determined by the applicable manufacturer's policy, without limiting any rights the customer may have against the seller under applicable law."
        ]
      },
      {
        "id": "cancellation-charges",
        "title": "Cancellation Charges",
        "paragraphs": [
          "Any cancellation or payment-processing charges will be communicated clearly before the transaction is completed, where applicable.",
          "No cancellation or processing fee will be charged where the cancellation results from our inability to fulfil the order, including confirmed stock unavailability or an error attributable to GamexChange, unless otherwise permitted by applicable law.",
          "Any deduction from a refund must be lawful, disclosed and consistent with the applicable policy and payment-provider requirements."
        ]
      },
      {
        "id": "cancellation-after-dispatch",
        "title": "Cancellation After Dispatch",
        "paragraphs": [
          "Cancellation requests received after dispatch will be assessed according to the order status and applicable shipping, return and refund policies.",
          "Customers should contact our support team for instructions rather than refusing delivery or returning a product without authorization. This does not affect any statutory rights or remedies available to the customer."
        ]
      },
      {
        "id": "eligible-refund-situations",
        "title": "Eligible Refund Situations",
        "paragraphs": [
          "Refunds may be considered in the following circumstances, subject to verification and applicable law:",
          "Damaged or defective products: Where the reported issue is verified and a refund is the appropriate remedy.",
          "Incorrect products delivered: Where the product supplied does not match the confirmed order.",
          "Order cancellation before dispatch: Where cancellation is accepted under the applicable policy.",
          "Product unavailable: Where an order cannot be fulfilled due to stock unavailability after payment.",
          "Other legally eligible cases: As required by applicable consumer protection laws or the relevant transaction terms.",
          "Where a replacement is requested but an appropriate replacement is unavailable, we will communicate the available resolution."
        ]
      },
      {
        "id": "refund-processing-time",
        "title": "Refund Processing Time",
        "paragraphs": [
          "Once a refund has been approved, we will initiate processing within a reasonable timeframe and communicate the expected processing period.",
          "The time taken for the amount to appear in the customer's account may vary depending on the payment method, bank, card issuer or payment service provider.",
          "If a refund has not been received within the communicated timeframe, customers may contact our support team with the order number and payment details, excluding passwords, PINs and OTPs."
        ]
      },
      {
        "id": "refund-method",
        "title": "Refund Method",
        "paragraphs": [
          "Approved refunds will ordinarily be processed to the original payment method used for the purchase.",
          "Where the original payment method cannot receive the refund or another arrangement is necessary, an alternative method may be used with the customer's agreement and in accordance with applicable law and payment-provider requirements.",
          "Refunds will not be converted into store credit without the customer's agreement, except where otherwise lawfully agreed as part of a specific transaction."
        ]
      },
      {
        "id": "conditions-for-return-requests",
        "title": "Conditions for Return Requests",
        "paragraphs": [
          "To help us process a return request efficiently, customers should:",
          "Provide a valid order number or proof of purchase.",
          "Clearly explain the reason for the return.",
          "Share supporting photographs or videos when requested.",
          "Keep the product and its included accessories available for inspection.",
          "Follow the return instructions provided by customer support.",
          "Products should not be shipped back without first obtaining the applicable return instructions."
        ]
      },
      {
        "id": "repair-and-service-requests",
        "title": "Repair and Service Requests",
        "paragraphs": [
          "Repair and service requests are handled separately from product return requests.",
          "The diagnosis, estimated repair cost, parts availability, turnaround time and any service warranty will be communicated as applicable. Customers should back up important data before submitting a device for service, as data preservation cannot be guaranteed unless expressly agreed.",
          "Repair charges, if applicable, will be communicated before the repair is authorised."
        ]
      },
      {
        "id": "contact-customer-support",
        "title": "Contact Customer Support",
        "paragraphs": [
          "For order cancellations, returns, replacement requests, refund enquiries or warranty claims, please contact:",
          "GamexChange, operated by GXC Concepts Pvt Ltd.",
          "Registered office: No. 7, Shanmuganagar, Sungam Bypass Road, Ramanathapuram, Coimbatore - 641045, Tamil Nadu, India.",
          "Email: support@gamexchange.co.in",
          "Phone: +91 77088 45461",
          "Website: www.gamexchange.co.in",
          "Please include your order number and a brief description of the issue so our team can assist you."
        ]
      }
    ]
  },
  {
    "slug": "pre-owned-products",
    "title": "Pre-owned product disclaimer",
    "description": "What to know about the condition, packaging, compatibility and included content of pre-owned products.",
    "updated": "29 October 2026",
    "sections": [
      {
        "id": "overview",
        "title": "Overview",
        "paragraphs": [
          "Pre-owned gaming products sold by GamexChange may have been previously owned or used. Customers are advised to review the product description, condition and included accessories before completing their purchase."
        ]
      },
      {
        "id": "game-codes-and-digital-content",
        "title": "Game Codes and Digital Content",
        "paragraphs": [
          "Downloadable content (DLC), digital game codes, promotional codes, subscription benefits and other digital content may not be included with pre-owned games unless explicitly mentioned in the product listing."
        ]
      },
      {
        "id": "manuals-and-documentation",
        "title": "Manuals and Documentation",
        "paragraphs": [
          "Original manuals, instruction booklets and printed documentation may not be included with pre-owned products."
        ]
      },
      {
        "id": "game-cover-artwork",
        "title": "Game Cover Artwork",
        "paragraphs": [
          "The cover artwork or packaging design may differ from the images displayed on our website due to variations in product editions, regional releases or manufacturer updates."
        ]
      },
      {
        "id": "disc-cases-and-holders",
        "title": "Disc Cases and Holders",
        "paragraphs": [
          "Pre-owned game cases may have minor cosmetic wear. Internal disc holders or clips may have minor damage, provided this does not affect the product's stated functionality."
        ]
      },
      {
        "id": "game-region-compatibility",
        "title": "Game Region Compatibility",
        "paragraphs": [
          "Game discs and consoles may have region-specific compatibility requirements. Customers should check compatibility with their gaming system before purchasing. Any compatibility information provided in the product listing should be reviewed carefully."
        ]
      },
      {
        "id": "free-digital-upgrades",
        "title": "Free Digital Upgrades",
        "paragraphs": [
          "Free or paid digital upgrades, enhanced editions, downloadable features and next-generation upgrade benefits are not guaranteed unless expressly stated in the product listing."
        ]
      },
      {
        "id": "packaging-condition",
        "title": "Packaging Condition",
        "paragraphs": [
          "Pre-owned game cases, boxes and packaging may have minor scratches, marks or cosmetic imperfections that do not affect gameplay or the stated functionality of the product."
        ]
      },
      {
        "id": "product-condition-and-inspection",
        "title": "Product Condition and Inspection",
        "paragraphs": [
          "Product condition and included accessories will be described as accurately as reasonably possible. Customers may contact our support team for clarification before placing an order."
        ]
      },
      {
        "id": "warranty-coverage",
        "title": "Warranty Coverage",
        "paragraphs": [
          "Any applicable warranty, its duration and exclusions will be specified in the relevant product listing or warranty documentation.",
          "These disclaimers do not limit any mandatory consumer rights or remedies available under applicable law."
        ]
      }
    ]
  },
  {
    "slug": "shipping-and-delivery",
    "title": "Shipping and delivery",
    "description": "Order processing, dispatch, tracking and delivery arrangements.",
    "updated": "29 October 2026",
    "sections": [
      {
        "id": "overview",
        "title": "Overview",
        "paragraphs": [
          "GamexChange, operated by GXC Concepts Pvt Ltd, aims to process and deliver orders safely and efficiently throughout our serviceable delivery locations in India."
        ]
      },
      {
        "id": "shipping-charges",
        "title": "Shipping Charges",
        "paragraphs": [
          "Applicable shipping charges, if any, will be displayed during checkout or communicated before order confirmation. Free shipping may be offered on eligible orders or during specific promotional periods."
        ]
      },
      {
        "id": "packaging-and-handling",
        "title": "Packaging and Handling",
        "paragraphs": [
          "We take reasonable care to package gaming consoles, game discs, controllers and accessories securely to minimise the risk of damage during transportation."
        ]
      },
      {
        "id": "order-processing-and-dispatch",
        "title": "Order Processing and Dispatch",
        "paragraphs": [
          "Orders will generally be processed on business days after successful payment verification and order confirmation.",
          "Where operationally feasible, orders confirmed before the applicable daily cut-off time may be dispatched on the same business day. Orders placed after the cut-off time, on Sundays or on public holidays may be processed on the next business day.",
          "Dispatch timelines may vary depending on product availability, location and operational requirements."
        ]
      },
      {
        "id": "courier-and-delivery-partners",
        "title": "Courier and Delivery Partners",
        "paragraphs": [
          "We may use established third-party courier and logistics providers to deliver orders. The courier partner will be selected based on serviceability, delivery location and operational availability."
        ]
      },
      {
        "id": "estimated-delivery-time",
        "title": "Estimated Delivery Time",
        "paragraphs": [
          "Estimated delivery timelines depend on the destination, courier service and other logistical factors.",
          "Delivery estimates will be communicated during checkout, order confirmation or dispatch wherever available. Remote locations and areas with limited courier service may require additional time."
        ]
      },
      {
        "id": "delivery-delays",
        "title": "Delivery Delays",
        "paragraphs": [
          "Although we make reasonable efforts to meet estimated delivery timelines, delays may occur due to weather conditions, transport disruptions, operational issues, public holidays or other circumstances beyond our reasonable control.",
          "Customers may contact our support team for assistance with delayed or undelivered orders."
        ]
      },
      {
        "id": "shipment-tracking",
        "title": "Shipment Tracking",
        "paragraphs": [
          "Where tracking facilities are available, shipment details and tracking information will be shared through the registered email address, mobile number or other available communication channel after dispatch.",
          "Customers are advised to use the tracking details to monitor their shipment status."
        ]
      },
      {
        "id": "pre-orders",
        "title": "Pre-Orders",
        "paragraphs": [
          "For eligible pre-order products, the expected dispatch date will be communicated at the time of purchase or through subsequent updates.",
          "Release dates and availability may change due to manufacturer or distributor decisions. Where a pre-order cannot be fulfilled, the customer will be informed and an applicable refund or other remedy will be provided in accordance with the relevant policy and applicable law."
        ]
      },
      {
        "id": "products-sent-to-gamexchange",
        "title": "Products Sent to GamexChange",
        "paragraphs": [
          "Where GamexChange accepts gaming products from customers for purchase, exchange or another authorised transaction, the applicable shipping or collection arrangements will be communicated separately.",
          "Any shipping reimbursement, collection charge or other applicable condition must be confirmed with the customer before the transaction is finalized."
        ]
      },
      {
        "id": "incorrect-address-or-failed-delivery",
        "title": "Incorrect Address or Failed Delivery",
        "paragraphs": [
          "Customers are responsible for providing accurate delivery details at checkout.",
          "If delivery fails because of an incorrect address, unavailable recipient or other delivery issue, our support team may coordinate with the customer and courier partner to determine the next steps. Any additional charges, where applicable, will be communicated in advance and handled in accordance with applicable law."
        ]
      },
      {
        "id": "damaged-or-incorrect-deliveries",
        "title": "Damaged or Incorrect Deliveries",
        "paragraphs": [
          "If a product arrives damaged, defective or different from the item ordered, customers should contact support@gamexchange.co.in or +91 77088 45461 as soon as reasonably possible.",
          "Please provide the order number and supporting photographs or videos where available so our team can investigate and arrange an appropriate resolution under our Return, Replacement and Refund Policy."
        ]
      },
      {
        "id": "contact-information",
        "title": "Contact Information",
        "paragraphs": [
          "GamexChange, operated by GXC Concepts Pvt Ltd.",
          "Registered office: No. 7, Shanmuganagar, Sungam Bypass Road, Ramanathapuram, Coimbatore - 641045, Tamil Nadu, India.",
          "Email: support@gamexchange.co.in",
          "Phone: +91 77088 45461",
          "Website: www.gamexchange.co.in",
          "For shipping enquiries, order tracking and delivery assistance, please contact our customer support team."
        ]
      }
    ]
  },
  {
    "slug": "trade-in",
    "title": "Trade-in policy",
    "description": "Inspection, valuation, payment and ownership terms when selling products to GamexChange.",
    "updated": "29 October 2026",
    "sections": [
      {
        "id": "overview",
        "title": "Overview",
        "paragraphs": [
          "Applicable to customers selling eligible gaming products to GamexChange for cash payment or store credit."
        ]
      },
      {
        "id": "ownership-and-authorization",
        "title": "Ownership and Authorization",
        "paragraphs": [
          "You confirm that you are the legal owner of the gaming products you wish to sell or are legally authorised to sell them on behalf of the owner. Products must not be stolen, counterfeit or subject to any third-party ownership claim."
        ]
      },
      {
        "id": "accurate-product-information",
        "title": "Accurate Product Information",
        "paragraphs": [
          "You agree to provide accurate and complete information about the products you wish to sell, including the brand, model, age, condition, functionality, accessories and any known defects."
        ]
      },
      {
        "id": "product-valuation-and-acceptance",
        "title": "Product Valuation and Acceptance",
        "paragraphs": [
          "All products submitted for sale are subject to inspection, functionality testing and valuation by GamexChange. The final offer may depend on the product's condition, market demand, resale value, included accessories and applicable testing results.",
          "GamexChange reserves the right to decline a product that does not meet its acceptance criteria."
        ]
      },
      {
        "id": "transfer-of-ownership",
        "title": "Transfer of Ownership",
        "paragraphs": [
          "Once GamexChange has accepted the product, the agreed transaction has been completed, and payment or store credit has been issued in accordance with the confirmed terms, ownership of the product will transfer to GXC Concepts Pvt Ltd or its designated purchasing entity."
        ]
      },
      {
        "id": "final-sale-and-transaction-completion",
        "title": "Final Sale and Transaction Completion",
        "paragraphs": [
          "Completed sell transactions cannot ordinarily be cancelled or reversed once ownership has transferred and payment has been made, except where required by applicable law or agreed by GamexChange.",
          "Customers should review and confirm the final valuation and payment terms before completing the transaction."
        ]
      },
      {
        "id": "shipping-products-for-inspection",
        "title": "Shipping Products for Inspection",
        "paragraphs": [
          "Where a sell order is accepted for remote processing, customers must dispatch the product to the address provided by GamexChange within the communicated timeframe.",
          "If the product is not dispatched within the specified period, the quotation may expire and a revised valuation may be required."
        ]
      },
      {
        "id": "shipping-and-collection-arrangements",
        "title": "Shipping and Collection Arrangements",
        "paragraphs": [
          "Shipping, pickup availability and any reimbursement of shipping costs will be communicated during the sell-order process.",
          "Any applicable shipping reimbursement, eligibility conditions and limits must be confirmed before dispatch. Customers should retain proof of shipment until the product has been received and inspected."
        ]
      },
      {
        "id": "transit-damage-and-packaging",
        "title": "Transit Damage and Packaging",
        "paragraphs": [
          "Customers are responsible for packing products securely when arranging their own shipment. GamexChange will communicate the applicable process for reporting transit damage or loss, taking into account the agreed shipping arrangement and applicable law."
        ]
      },
      {
        "id": "product-condition-on-arrival",
        "title": "Product Condition on Arrival",
        "paragraphs": [
          "Products must be sent in the condition described during the initial quotation process. Customers should disclose physical damage, missing components, previous repairs, hardware faults or other material issues before dispatch.",
          "Any material discrepancy identified during inspection may result in a revised valuation or rejection of the product."
        ]
      },
      {
        "id": "console-and-accessory-acceptance",
        "title": "Console and Accessory Acceptance",
        "paragraphs": [
          "Gaming consoles, controllers and accessories are subject to functionality checks and physical inspection.",
          "Products with significant physical damage, missing essential components, unauthorised modifications or other material defects may be declined or assigned a revised valuation.",
          "Customers must disclose any known faults and remove personal accounts, payment information and personal data before handing over a device."
        ]
      },
      {
        "id": "game-discs-and-physical-games",
        "title": "Game Discs and Physical Games",
        "paragraphs": [
          "Game discs will be inspected for scratches, cracks, damage and functionality. Discs that cannot be read or do not meet our acceptance standards may be declined or assigned a revised valuation.",
          "Game cases, artwork, manuals and other accessories should be included if specified in the quotation. Their absence or condition may affect the final offer."
        ]
      },
      {
        "id": "inspection-and-testing",
        "title": "Inspection and Testing",
        "paragraphs": [
          "GamexChange may conduct appropriate functionality tests to verify the condition of the submitted product.",
          "The inspection period and expected completion time will be communicated when the sell order is received. Processing times may vary depending on the product category, volume of submissions and technical testing requirements."
        ]
      },
      {
        "id": "revised-valuation",
        "title": "Revised Valuation",
        "paragraphs": [
          "If the inspection reveals a material difference between the declared condition and the actual condition, GamexChange may provide a revised quotation explaining the relevant adjustment.",
          "The customer may accept or decline the revised quotation. If the quotation is declined, the product will be returned or otherwise handled according to the agreed return procedure and applicable law. Any return shipping charges will be disclosed before the transaction proceeds."
        ]
      },
      {
        "id": "packaging-and-missing-components",
        "title": "Packaging and Missing Components",
        "paragraphs": [
          "Missing original packaging, manuals, cables, controllers or other components may affect the final valuation if those items were included in the original quotation.",
          "Any deductions for packaging or missing components will be based on the disclosed valuation criteria and communicated to the customer before final acceptance."
        ]
      },
      {
        "id": "cash-payment-and-store-credit",
        "title": "Cash Payment and Store Credit",
        "paragraphs": [
          "Eligible sell orders may be settled through an approved payment method or store credit, depending on the options offered for the transaction.",
          "The payment method, final amount and expected settlement timeline will be communicated before the transaction is completed.",
          "Payments may be subject to identity verification and other legally required checks. Store credit will be subject to its stated terms, validity and redemption conditions."
        ]
      },
      {
        "id": "account-removal-and-device-security",
        "title": "Account Removal and Device Security",
        "paragraphs": [
          "Before selling a console or electronic device, customers must sign out of personal accounts, remove account locks where possible, disable applicable tracking or activation locks, and back up any personal data they wish to retain.",
          "GamexChange is not responsible for personal data left on a device after it has been transferred, subject to applicable law and any separate agreement."
        ]
      },
      {
        "id": "fraud-prevention-and-verification",
        "title": "Fraud Prevention and Verification",
        "paragraphs": [
          "GamexChange may request reasonable proof of identity, ownership or purchase where necessary to verify a transaction or comply with applicable law.",
          "We may suspend, reject or investigate a sell order where there are reasonable concerns about ownership, authenticity, fraud or compliance."
        ]
      },
      {
        "id": "right-to-decline-products",
        "title": "Right to Decline Products",
        "paragraphs": [
          "GamexChange reserves the right to reject products that are counterfeit, stolen, reported lost, subject to ownership disputes, materially misrepresented or otherwise unsuitable for acceptance.",
          "Any product already received but not accepted will be handled through the communicated return or collection process, subject to applicable law."
        ]
      },
      {
        "id": "policy-updates",
        "title": "Policy Updates",
        "paragraphs": [
          "GXC Concepts Pvt Ltd may update this Trade-In Policy from time to time. The current version will be published on the official GamexChange website.",
          "Changes will not override transaction terms already agreed with a customer or rights protected under applicable law."
        ]
      },
      {
        "id": "contact-information",
        "title": "Contact Information",
        "paragraphs": [
          "GamexChange, operated by GXC Concepts Pvt Ltd.",
          "Registered office: No. 7, Shanmuganagar, Sungam Bypass Road, Ramanathapuram, Coimbatore - 641045, Tamil Nadu, India.",
          "Email: support@gamexchange.co.in",
          "Phone: +91 77088 45461",
          "Website: www.gamexchange.co.in",
          "For sell-order enquiries, product valuation, inspection updates or payment assistance, please contact our customer support team."
        ]
      }
    ]
  },
  {
    "slug": "store-credit",
    "title": "Wallet and store credit",
    "description": "Terms for eligible store credit and wallet features where available.",
    "updated": "29 October 2026",
    "sections": [
      {
        "id": "wallet-account-creation",
        "title": "Wallet Account Creation",
        "paragraphs": [
          "A GamexChange Wallet account may be made available to registered customers for managing eligible store credit associated with their transactions."
        ]
      },
      {
        "id": "existing-customers",
        "title": "Existing Customers",
        "paragraphs": [
          "Eligible existing customers may access wallet or store credit features through their registered GamexChange account, where such functionality is available."
        ]
      },
      {
        "id": "credit-for-sell-orders",
        "title": "Credit for Sell Orders",
        "paragraphs": [
          "If a customer selects store credit as the payment option for an eligible sell order, the approved credit amount will be added to their GamexChange Wallet after the product has completed the required inspection and verification process and the transaction has been approved."
        ]
      },
      {
        "id": "use-of-store-credit",
        "title": "Use of Store Credit",
        "paragraphs": [
          "GamexChange Wallet credit may be used toward eligible purchases through the official GamexChange website or other authorised channels where wallet redemption is supported.",
          "Store credit is not redeemable for cash and is not transferable to another customer, except where required by applicable law or expressly authorised by GXC Concepts Pvt Ltd."
        ]
      },
      {
        "id": "store-credit-value",
        "title": "Store Credit Value",
        "paragraphs": [
          "Unless otherwise specified, ₹1 in GamexChange Wallet credit is equivalent to ₹1 when applied toward an eligible purchase."
        ]
      },
      {
        "id": "eligible-purchases",
        "title": "Eligible Purchases",
        "paragraphs": [
          "Store credit may be used toward eligible gaming consoles, video games, controllers, accessories and other products offered by GamexChange, subject to product availability, applicable redemption conditions and any exclusions disclosed before purchase."
        ]
      },
      {
        "id": "validity-of-store-credit",
        "title": "Validity of Store Credit",
        "paragraphs": [
          "The validity period and any applicable conditions for GamexChange Wallet credit will be communicated when the credit is issued. Any expiry or restriction will be subject to applicable law and the terms agreed with the customer."
        ]
      },
      {
        "id": "wallet-balance-and-transaction-history",
        "title": "Wallet Balance and Transaction History",
        "paragraphs": [
          "Customers may check their available store credit and eligible transaction history through their account or by contacting customer support, depending on the available website functionality."
        ]
      },
      {
        "id": "incorrect-transactions-and-support",
        "title": "Incorrect Transactions and Support",
        "paragraphs": [
          "If a customer believes their wallet balance is incorrect or eligible store credit has not been credited, they should contact GamexChange customer support with the relevant transaction details.",
          "We will review the issue and make any necessary correction after verification."
        ]
      },
      {
        "id": "misuse-and-security",
        "title": "Misuse and Security",
        "paragraphs": [
          "Customers are responsible for protecting their account credentials and promptly reporting suspected unauthorised access or misuse.",
          "GXC Concepts Pvt Ltd may investigate suspected fraudulent activity and restrict wallet access where reasonably necessary and permitted by applicable law."
        ]
      },
      {
        "id": "policy-updates",
        "title": "Policy Updates",
        "paragraphs": [
          "GXC Concepts Pvt Ltd may revise this policy from time to time. Updates will be published on the official GamexChange website. Changes will not override rights already accrued to customers or any mandatory rights under applicable law."
        ]
      },
      {
        "id": "contact-information",
        "title": "Contact Information",
        "paragraphs": [
          "GamexChange, operated by GXC Concepts Pvt Ltd.",
          "Registered office: No. 7, Shanmuganagar, Sungam Bypass Road, Ramanathapuram, Coimbatore - 641045, Tamil Nadu, India.",
          "Email: support@gamexchange.co.in",
          "Phone: +91 77088 45461",
          "Website: www.gamexchange.co.in",
          "For assistance with wallet balances, store credit or redemption, please contact our customer support team."
        ]
      }
    ]
  },
  {
    "slug": "extended-warranty",
    "title": "Extended warranty",
    "description": "Eligibility, coverage, exclusions and claims for separately purchased warranty plans.",
    "updated": "29 October 2026",
    "sections": [
      {
        "id": "extended-warranty-purchase",
        "title": "Extended Warranty Purchase",
        "paragraphs": [
          "The extended warranty is a separate protection plan and is not automatically included with the purchase of any product unless expressly stated. It must be purchased separately and confirmed as part of the order."
        ]
      },
      {
        "id": "warranty-coverage",
        "title": "Warranty Coverage",
        "paragraphs": [
          "Extended warranty coverage applies only to the specific gaming console or hardware product identified in the warranty confirmation.",
          "Unless expressly included in the warranty documentation, coverage does not extend to accompanying accessories, controllers, cables, batteries, consumables, display equipment, external storage devices or other auxiliary components."
        ]
      },
      {
        "id": "covered-hardware-failures",
        "title": "Covered Hardware Failures",
        "paragraphs": [
          "Subject to the applicable warranty plan, coverage may include eligible internal hardware failures arising during normal use.",
          "Damage caused by misuse, negligence, liquid exposure, physical impact, unauthorised repairs, unauthorised modifications or other expressly excluded circumstances may not be covered, subject to applicable law and the terms disclosed at purchase."
        ]
      },
      {
        "id": "warranty-claims-and-resolution",
        "title": "Warranty Claims and Resolution",
        "paragraphs": [
          "All warranty claims are subject to product inspection and verification.",
          "Where a claim is approved, GamexChange will generally arrange repair first. If the product cannot reasonably be repaired, an appropriate replacement or other eligible remedy may be offered according to the warranty plan, stock availability and applicable law.",
          "If the original model or edition is unavailable, a comparable product with suitable specifications may be offered with the customer's agreement, subject to the applicable warranty terms and legal requirements."
        ]
      },
      {
        "id": "shipping-and-collection",
        "title": "Shipping and Collection",
        "paragraphs": [
          "Shipping, pickup and return delivery arrangements for approved extended warranty claims will be governed by the specific warranty plan.",
          "Any applicable charges, service locations and collection conditions will be communicated to the customer before the claim is processed."
        ]
      },
      {
        "id": "warranty-claim-processing-time",
        "title": "Warranty Claim Processing Time",
        "paragraphs": [
          "The time required to complete a warranty claim depends on the nature of the fault, inspection results, parts availability and repair or replacement requirements.",
          "GamexChange will communicate the expected processing timeline after the product has been assessed. Any service commitment expressly provided in the purchased warranty plan will apply subject to its stated conditions."
        ]
      },
      {
        "id": "extended-warranty-for-pre-owned-products",
        "title": "Extended Warranty for Pre-Owned Products",
        "paragraphs": [
          "For eligible pre-owned gaming hardware, the extended warranty will begin after the standard warranty period included with the product has expired, provided this arrangement is expressly stated in the product listing or warranty documentation."
        ]
      },
      {
        "id": "extended-warranty-for-new-products",
        "title": "Extended Warranty for New Products",
        "paragraphs": [
          "For eligible new gaming hardware, the extended warranty will ordinarily begin after the manufacturer's warranty expires, provided this arrangement is specified in the purchased plan.",
          "The customer must retain the invoice and manufacturer warranty documentation, where applicable."
        ]
      },
      {
        "id": "replacement-products",
        "title": "Replacement Products",
        "paragraphs": [
          "Where a replacement is approved under the extended warranty, the replacement product and its condition will be determined in accordance with the applicable warranty plan.",
          "Depending on the plan, a replacement may be new or pre-owned. The customer will be informed of the proposed replacement before it is finalized."
        ]
      },
      {
        "id": "purchase-eligibility",
        "title": "Purchase Eligibility",
        "paragraphs": [
          "An extended warranty may be purchased only for eligible products and within the purchase period specified in the relevant plan.",
          "Availability, pricing, coverage duration and eligibility conditions will be displayed during checkout or communicated by an authorised GamexChange representative."
        ]
      },
      {
        "id": "tampering-and-unauthorized-repairs",
        "title": "Tampering and Unauthorized Repairs",
        "paragraphs": [
          "Warranty coverage may be affected by unauthorised repairs, modifications, removal or tampering with warranty seals, or other interference with the product, where such conduct is excluded under the applicable warranty terms and permitted by law.",
          "Customers should contact GamexChange before arranging third-party repairs for a product covered by an active extended warranty."
        ]
      },
      {
        "id": "unauthorized-software-and-device-modification",
        "title": "Unauthorized Software and Device Modification",
        "paragraphs": [
          "Coverage may exclude faults directly resulting from unauthorised software modifications, jailbreaking, circumvention of security protections or other prohibited alterations, where specified in the applicable warranty terms and permitted by law.",
          "Installing software or using a device in a manner that does not cause a covered fault will not automatically invalidate coverage unless the applicable plan or law provides otherwise."
        ]
      },
      {
        "id": "warranty-documentation",
        "title": "Warranty Documentation",
        "paragraphs": [
          "Customers should retain their purchase invoice, warranty confirmation and relevant service records when requesting support.",
          "GamexChange may request these documents to verify eligibility and process a claim."
        ]
      },
      {
        "id": "policy-updates",
        "title": "Policy Updates",
        "paragraphs": [
          "GXC Concepts Pvt Ltd may update this policy from time to time. The current version will be published on the official GamexChange website.",
          "Updates will not retrospectively remove coverage already purchased or override mandatory consumer rights."
        ]
      },
      {
        "id": "contact-information",
        "title": "Contact Information",
        "paragraphs": [
          "GamexChange, operated by GXC Concepts Pvt Ltd.",
          "Registered office: No. 7, Shanmuganagar, Sungam Bypass Road, Ramanathapuram, Coimbatore - 641045, Tamil Nadu, India.",
          "Email: support@gamexchange.co.in",
          "Phone: +91 77088 45461",
          "Website: www.gamexchange.co.in",
          "For extended warranty enquiries, claim assistance or service updates, please contact our customer support team."
        ]
      }
    ]
  }
];

