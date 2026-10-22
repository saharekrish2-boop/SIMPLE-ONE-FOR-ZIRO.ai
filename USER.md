# USER — Cypher

## Target User
Individuals who encounter suspicious links while browsing or receive suspicious SMS messages, emails, or links and need help determining whether they are legitimate or malicious.

## User Profiles

### Primary: General Public
- Non-technical users who receive phishing SMS, fake bank alerts, delivery scam messages
- May have already clicked a link or entered information before seeking help
- Need clear, jargon-free explanations and immediate actionable steps
- May be stressed or worried — respond with calm clarity

### Secondary: Security-Conscious Individuals
- Technically aware users who spot something off and want a second opinion
- May provide additional context (domain history, prior scam attempts)
- Appreciate detailed evidence and technical findings

### Tertiary: Small Business Teams
- Employees forwarding suspicious messages received on business phones
- Need case references for internal reporting and compliance
- May need batch investigation of multiple related messages

## User Inputs (Required)
| Field | Description |
|-------|-------------|
| Link Source | Either a URL observed by the browser extension or a message pasted by the user |
| User Action | What the user did: Hovered / Navigated / Clicked / Opened / Ignored / Entered Information / Unknown |
| Case ID | Auto-assigned by Cypher (user may provide an existing one to continue) |

## User Inputs (Conditional)
| Field | Description |
|-------|-------------|
| Browser URL | URL observed by the extension from a tab or link event |
| Message Text | The full text of the suspicious SMS or message pasted by the user |
| Link(s) | URLs supplied by the user or extracted from messages |

## User Inputs (Optional but Helpful)
- Sender phone number or email address
- Whether the user entered any credentials or OTP
- Whether the user made any payment
- Device type (mobile / desktop)
- Time the message was received

## Interaction Expectations
- User expects a clear risk verdict, not a wall of technical jargon
- User wants to know "am I safe?" and "what should I do next?" answered directly
- User may not know how to extract URLs — Cypher should help identify them from pasted message text
- User may forward raw screenshots — Cypher should be able to work from image descriptions
- User may submit multiple messages and links in one session; each item receives its own evidence and finding trail
- User can communicate in English or Hindi and select the report language
- User can revisit case history and download a complete case file for sharing with an authority
- Authority reports must be presented as drafts and clearly identify their intended recipient

## Browser Extension Experience
- The extension runs quietly in the background and activates when the user visits or hovers over a link
- Local checks happen instantly; backend analysis is triggered only for unknown or suspicious domains
- Warnings appear as a small banner near the address bar or link, never as a full-page block unless the user chooses it
- Each warning shows: risk level, one-sentence reason, and actions (Go back / Continue / Save to case)
- A one-click toggle lets the user pause monitoring on sensitive sites
- The extension never auto-clicks, auto-submits, or modifies page content beyond the warning banner
- Only the domain or URL is transmitted to the backend; page content and credentials stay on the device

## Case History and Export
- Cases persist in the application's built-in private history
- A case timeline shows collection, investigation, risk changes, draft generation, approvals, and submissions
- Users can download case files in JSON for portability and PDF for human review
- Exports include verified evidence, timestamps, report status, unresolved items, and audit events
- Sensitive information is redacted by default and included only when the user explicitly confirms it is required

## Protective Guidance Triggers
If the user reports any of the following, Cypher shifts from investigation to immediate protective action:
- Credentials entered on a suspicious site
- OTP or 2FA code entered
- Payment made (bank transfer, card details, cryptocurrency)
- Personal information shared (ID number, date of birth, address)

In these cases, the first output is a protective action checklist, not the investigation report.
