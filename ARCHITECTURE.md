# Cypher Architecture

## Overview
Cypher is a privacy-first, browser-extension-first suspicious link and SMS investigator. It warns users in real time before they open risky links, collects evidence safely, and helps them prepare authority-ready reports.

## Deployment Model
- **Primary interface:** Browser extension (Chrome / Edge / Firefox)
- **Backend:** Local-first web service with optional cloud deep-analysis worker
- **Storage:** Encrypted local database with optional account sync
- **Languages:** English and Hindi

## Components

### 1. Browser Extension
Responsibilities:
- Observe tab navigation and link hover/click events
- Run lightweight local checks instantly
- Send only suspicious/unknown domains to the backend
- Render non-intrusive risk banners
- Allow one-click save-to-case and pause-on-site actions

Data rules:
- Never read page content, cookies, form data, or credentials
- Transmit only the domain or URL for analysis
- Cache local blocklists and heuristics for offline operation
- Store user preferences and recent warnings locally

### 2. Local-First Web Service
Responsibilities:
- Authenticate users and manage private accounts
- Receive URLs from the extension and pasted messages from the website
- Coordinate evidence collection asynchronously
- Persist cases, audit logs, and report drafts
- Generate JSON and PDF exports

Technology sketch:
- Node.js + LangGraph for async investigation workflows
- React website for case review, history, and report drafting
- SQLite for case and audit storage
- AES-256-GCM encryption for case payloads

### 3. Evidence Collection Workers
Responsibilities:
- Read-only domain/WHOIS/SSL/reputation lookups
- Isolated browser inspection of suspicious pages
- Public scam-report searching when configured

Safety rules:
- No credential entry, OTP entry, or form submission
- No CAPTCHA bypass
- No interaction with malicious infrastructure beyond read-only inspection
- Network workers isolated from the public web application

### 4. Analysis & Scoring Engine
Responsibilities:
- Combine local heuristics with backend evidence
- Produce per-item and overall risk scores (0–100)
- Flag urgent protective actions when credentials or payments were entered

### 5. Report Generator
Responsibilities:
- Produce generic evidence reports
- Produce authority-specific drafts (NCRP / I4C, Chakshu / DoT, generic)
- Require human approval before any report is marked ready
- Support English and Hindi output

## Data Flow: Real-Time Warning

```
User hovers/clicks a link
        │
        ▼
┌─────────────────────┐
│  Local extension    │
│  checks (blocklist, │
│  heuristics)        │
└──────────┬──────────┘
           │
    ┌──────┴──────┐
    ▼             ▼
Known bad     Unknown / suspicious
Immediate     Send domain/URL only
warning       to backend
              │
              ▼
       ┌──────────────┐
       │  Backend     │
       │  deep check  │
       │  WHOIS/SSL/  │
       │  reputation  │
       └──────┬───────┘
              │
              ▼
       Risk score + reason
              │
              ▼
       Extension banner
       (Go back / Continue / Save)
```

## Privacy-First Hybrid Policy

| Data | Kept local | Sent to backend | Notes |
|------|-----------|-----------------|-------|
| Visited URLs/domains | Checked locally first | Only if unknown/suspicious | Ephemeral analysis |
| Page content | Yes | No | Never transmitted |
| Cookies / credentials | Yes | No | Never accessed |
| SMS message body | Yes (pasted by user) | No (unless saved to a case) | User-controlled |
| Case files | Encrypted local DB | No (unless sync is enabled) | User-controlled |
| Report drafts | Generated locally | No (unless shared manually) | Download only |

## Security Practices
NIST-inspired, not formally certified:
- **Identify:** inventory data, services, and trust boundaries
- **Protect:** encryption, least privilege, secret isolation, redaction
- **Detect:** audit events, integrity checks, repeated submission attempts
- **Respond:** preserve evidence, surface failures, guide protective actions
- **Recover:** encrypted backups, verifiable audit trail

## Boundaries
See [IDENTITY.md](./IDENTITY.md) for Cypher's full operational boundaries. Architectural boundaries specific to this design:
- No automatic authority submission
- No external AI model access without explicit consent
