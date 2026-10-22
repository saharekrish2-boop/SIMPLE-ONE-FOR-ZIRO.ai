import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Activity, ArrowDownToLine, ArrowRight, ArrowUpRight, Check, CheckCheck,
  ChevronRight, CircleHelp, ClipboardCheck, Clock3, Eye, EyeOff, FileJson, FileText,
  Fingerprint, Globe2, History, House, Languages, Link2, LoaderCircle, LockKeyhole,
  LogIn, LogOut, MessageSquare, Plus, Radar, Search, Shield,
  ShieldCheck, ShieldQuestion, Sparkles, Terminal, X,
} from 'lucide-react';
import '@fontsource-variable/hubot-sans/wdth.css';
import '@fontsource-variable/instrument-sans';
import './style.css';

const IMAGES = {
  hero: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=1800&auto=format&fit=crop',
  privacy: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1400&auto=format&fit=crop',
};

const COPY = {
  en: {
    workspace: 'Investigation workspace', personal: 'PERSONAL WORKSPACE', investigate: 'New investigation', history: 'Case history',
    noHistory: 'No investigations yet', noHistoryHint: 'Your cases will appear here.', signInHistory: 'Log in to view your case history.',
    localWorkspace: 'LOCAL WORKSPACE', localOnly: 'No automatic submission', localHint: 'You stay in control of every report.',
    connected: 'API connected', disconnected: 'API unavailable', checking: 'Connecting to workspace', language: 'Switch language',
    login: 'Log in', signup: 'Sign up', logout: 'Log out', identity: 'Signed in as',
    authEyebrow: 'PRIVATE BY DESIGN', authTitle: 'Your investigation starts here.',
    authSubtitle: 'A dedicated workspace to inspect suspicious messages, understand the evidence, and decide what to do next.',
    welcome: 'Welcome back', createAccount: 'Create your account', loginHint: 'Log in to access your private case history.',
    registerHint: 'Keep your investigations together in one local workspace.', name: 'Full name', email: 'Email address', password: 'Password',
    namePlaceholder: 'Your name', emailPlaceholder: 'you@example.com', passwordPlaceholder: 'At least 12 characters',
    passwordHint: 'Use at least 12 characters.', passwordInvalid: 'Your password must contain at least 12 characters.',
    showPassword: 'Show password', hidePassword: 'Hide password',
    loginSubmit: 'Log in to workspace', registerSubmit: 'Create account', authenticating: 'Please wait…',
    authFoot: 'Your account is managed by this local deployment. No API keys are stored in the frontend.',
    privacyTitle: 'Private, not opaque.', privacySubtitle: 'Know what stays here. Choose what leaves.',
    encryptionTitle: 'Local data protection', encryption: 'Case data is encrypted locally with a key managed by this deployment. This is not a claim of formal security or regulatory compliance.',
    networkTitle: 'Network checks are opt-in', networkExplanation: 'DNS, RDAP and TLS checks, plus optional reputation services, send hostnames to external services — never your message text.',
    aiTitle: 'AI is your choice', aiExplanation: 'Optional AI analysis sends sanitized message text and findings to an external LLM. Sanitization does not guarantee removal of all sensitive information.',
    reviewTitle: 'Review before any action', reviewExplanation: 'Reports are drafts for your review. Approval does not submit anything to an authority.',
    featureEvidence: 'Evidence, not assumptions', featureEvidenceHint: 'Verified sources are separated from suspected signals.',
    featureAudit: 'A traceable investigation', featureAuditHint: 'Inspect the timeline, results and recorded hashes.',
    featureReports: 'Reports you control', featureReportsHint: 'Review a full draft, approve locally, then export.',
    dashboardEyebrow: 'MESSAGE & LINK TRIAGE', dashboardTitle: 'Make sense of the suspicious.',
    dashboardSubtitle: 'Start with the message. Follow the evidence. Keep the decision yours.',
    totalCases: 'Total cases', activeCases: 'In progress', highRiskCases: 'High / critical', actualCounts: 'From your saved case history',
    consoleEyebrow: 'AGENT CONSOLE', consoleGreeting: 'Hello', consoleIntro: 'I’m Cypher, your AI Suspicious Link & SMS Investigator.',
    consoleAsk: 'Paste a suspicious SMS, link, or message below and I’ll investigate it safely.',
    smsLabel: 'Suspicious message', smsPlaceholder: 'Paste the suspicious SMS or message here. Links inside it are treated as text, never opened by this interface.',
    linkLabel: 'Suspicious link', linkOptional: 'optional', linkPlaceholder: 'Paste the link here if you have it on its own. It stays as text and is only inspected read-only.',
    actionLabel: 'What did you do?', actionDidNotClick: 'Did not click', actionOpenedLink: 'Opened link',
    Clicked: 'Clicked', Opened: 'Opened', Ignored: 'Ignored', 'Entered Information': 'Entered information', Unknown: 'Unknown',
    investigateCta: 'Investigate with Cypher', consoleInvalid: 'Paste the suspicious message or the link first.',
    messages: 'Messages', message: 'Message',
    options: 'INVESTIGATION PERMISSIONS', networkConsent: 'Allow network checks', networkDisclosure: 'Optional DNS / RDAP / TLS and reputation lookups send hostnames externally, never message text.',
    aiConsent: 'Allow external AI analysis', aiDisclosure: 'Sanitized text and findings are sent to an external LLM. Avoid including personal information.',
    aiUnavailable: 'AI is not available on this deployment.', networkUnavailable: 'Network checks are unavailable.',
    reportLanguage: 'Report language', investigationLanguage: 'Investigation language', english: 'English', hindi: 'Hindi',
    starting: 'Creating investigation…', localAnalysis: 'Local analysis runs without network permission.',
    activityTitle: 'What Cypher is doing', activityHint: 'Statuses come from the live case record. A check this deployment cannot run is shown as unavailable, never as passed.',
    stepUrls: 'Extracting URLs', stepSms: 'Analyzing message content', stepReputation: 'Checking domain reputation',
    stepScam: 'Searching public scam reports', stepBrowser: 'Opening the link in an isolated browser',
    stepScore: 'Calculating the risk score', stepNext: 'Generating recommendations',
    activityDone: 'Complete', activityRunning: 'In progress', activityBlocked: 'Not configured', activityWaiting: 'Waiting', activityDeclined: 'Not approved',
    stepWaiting: 'Runs after you submit', networkNotApproved: 'Network checks were not approved for this case.',
    resultsTitle: 'Investigation results', openCaseFile: 'Open full case file',
    protocol: 'How Cypher investigates', protocolHint: 'From raw message to a reviewable record.',
    safeTitle: 'Don’t interact with the link.', safeHint: 'If you shared an OTP, password or banking information, contact your bank through a trusted channel immediately.',
    promisesLabel: 'In every case', promise1: 'Links are never opened for you.', promise2: 'External requests carry hostnames, not your message text.', promise3: 'Nothing is sent without your approval.',
    emptyNote: 'No invented scores. No assumed outcomes.', emptyHint: 'Risk, evidence and recommendations appear only after an investigation.',
    cases: 'CASES', refresh: 'Refresh history', searchCases: 'Search case history', allCases: 'All cases', caseSearchPlaceholder: 'Search title or case ID', noMatches: 'No matching cases',
    loading: 'Loading…', error: 'Something went wrong', dismiss: 'Dismiss message', retry: 'Retry connection', sessionExpired: 'Your session has expired. Please log in again.',
    requestError: 'The request could not be completed.', connectionError: 'Cannot reach the local API. Check that the backend is running.',
    case: 'Case', caseId: 'Case ID', created: 'Created', updated: 'Updated', caseReference: 'Authority reference', Pending: 'Pending',
    queued: 'Queued', investigating: 'Investigating', complete: 'Complete', failed: 'Failed',
    LOW: 'Low', MEDIUM: 'Medium', HIGH: 'High', CRITICAL: 'Critical', UNCERTAIN: 'Uncertain',
    overview: 'Overview', evidence: 'Evidence', report: 'Report', audit: 'Audit trail',
    back: 'New investigation', download: 'Export', exportJson: 'Download JSON', exportPdf: 'Download PDF', exporting: 'Preparing export…',
    running: 'Investigation in progress', runningHint: 'This case and its history refresh every 1.5 seconds. Results may change as checks finish.',
    failedHint: 'The investigation failed. Review available evidence and unresolved checks before taking action.',
    riskAssessment: 'RISK ASSESSMENT', riskScore: 'Risk score', outOf: 'out of 100', noScore: 'Not scored',
    uncertainty: 'Uncertainty matters', uncertaintyHint: 'A score is not proof. Missing evidence and unavailable checks can limit confidence.',
    summary: 'Investigation summary', noSummary: 'No summary is available yet.',
    originalMessages: 'Submitted messages · redacted', recordedAction: 'Recorded action', extractedUrls: 'Extracted URLs · not clickable', noUrls: 'No URLs recorded.',
    findings: 'Findings', observed: 'Observed', suspected: 'Suspected', reason: 'Reason', evidenceReferences: 'Evidence references',
    noFindings: 'No findings recorded yet.', nextSteps: 'Recommended next steps', noSteps: 'No recommended steps are available yet.',
    unresolved: 'Unresolved questions', noneUnresolved: 'No unresolved questions were recorded.',
    aiAnalysis: 'AI analysis', not_requested: 'Not requested', unavailable: 'Unavailable', noAI: 'No AI analysis text is available.',
    pending: 'Pending', planTitle: 'Check planning loop', planPending: 'The planning loop has not started yet.', planNotUsed: 'Planning runs only with AI and network consent. Without AI, the full deterministic suite always runs.', planFollowUps: 'Follow-up round', planAdded: 'added as evidence', planFailed: 'not added', planDnsOnly: 'DNS resolution only',
    evidenceHint: 'Inspect actual sources, retrieval times and check details. Unavailable checks are not verified evidence.',
    verified: 'Verified', source: 'Source', sourceUrl: 'Source URL', retrieved: 'Retrieved', details: 'Recorded details', item: 'Message reference',
    unavailableReason: 'Unavailable reason', noEvidence: 'No evidence recorded yet.', noDetails: 'No details recorded.',
    prepareReport: 'Prepare a report', reportHint: 'Generate a reviewable draft from the case. Confirmed facts only; suspected findings are not confirmed facts.',
    authority: 'Reporting authority', ncrp: 'National Cyber Crime Reporting Portal (NCRP)', chakshu: 'Chakshu · suspected fraud communication', generic: 'General incident record',
    authorityGuidance: 'Authority guidance', authoritySource: 'Official source', generateReport: 'Generate draft', regenerating: 'Generate a new draft', generating: 'Preparing draft…',
    draftPreview: 'Full draft preview', noReport: 'No report draft yet', noReportHint: 'Select an authority and language, then generate a draft to review.',
    'Awaiting Approval': 'Awaiting approval', Approved: 'Approved', approve: 'Approve reviewed draft', approving: 'Approving…',
    approvalHint: 'Read the entire draft before approving. Approval records your review only.',
    approvedHint: 'Approved for your records. This is review only — nothing has been submitted externally.',
    submissionNotice: 'Cypher does not submit reports to authorities. You must use the official reporting channel yourself.',
    reportId: 'Report ID', draftLanguage: 'Draft language', draftTarget: 'Draft authority', reportPending: 'A report can be prepared once the investigation finishes.',
    regenerateHint: 'Generating again replaces the current draft and requires a new approval.',
    auditHint: 'Chronological events recorded by the backend. Hashes are shown as recorded, not a claim of tamper-proof certification.',
    event: 'Event', result: 'Result', recordedHash: 'Recorded hash', noAudit: 'No audit events recorded yet.',
    notAvailable: 'Not available', privacy: 'Privacy & control', privacyFooter: 'Local-first. Evidence-led. Human-reviewed.',
    landKicker: 'SUSPICIOUS LINK & SMS INVESTIGATOR',
    landGiantA: 'Think', landGiantB: 'before you', landGiantC: 'click.',
    landLede: 'Cypher inspects suspicious links and messages, gathers verifiable evidence and explains the risk — before you act, with your consent at every step.',
    landStart: 'Open your workspace', landLogin: 'I already have an account',
    landReturn: 'Return to your workspace', home: 'Home',
    landOffline: 'The local API is unreachable. Start the backend, then reload.',
    briefEyebrow: 'WHAT CYPHER DOES', briefStatement: 'Evidence first. The decision stays yours.',
    briefCopy1: 'Paste a suspicious SMS or link, or review what flagged your attention. Cypher extracts URLs, runs local checks and, with your permission, DNS, registry and TLS checks on the hostname alone.',
    briefCopy2: 'Verified facts, suspicions and unknowns are kept apart. Every risk score comes with the evidence behind it — and with what could not be checked.',
    methodEyebrow: 'HOW AN INVESTIGATION RUNS', methodTitle: 'Four honest steps.',
    landStep1: 'Collect', landStep1Hint: 'Record the message and extract links as text. Nothing is opened by the interface.',
    landStep2: 'Investigate', landStep2Hint: 'Local heuristics first; consented network checks send only hostnames.',
    landStep3: 'Assess', landStep3Hint: 'A 0–100 risk band with evidence references — or UNCERTAIN when evidence is missing.',
    landStep4: 'Report', landStep4Hint: 'Generate a reviewable draft for NCRP, Chakshu or a generic record. You approve, you submit.',
    riskEyebrow: 'RISK BANDS', riskTitle: 'What each level means.',
    bandLowD: 'No meaningful threat signals found in the checks that ran.',
    bandMediumD: 'Some suspicious signals, unverified. Slow down and re-check.',
    bandHighD: 'Multiple strong indicators of deception. Avoid interacting.',
    bandCriticalD: 'A confirmed impersonation or credential-harvesting pattern. Act protectively now.',
    bandUncertainD: 'Evidence is missing or checks were unavailable. Treated as untrusted, not safe.',
    faqEyebrow: 'STRAIGHT ANSWERS', faqTitle: 'No vague promises.',
    faqQ1: 'Does Cypher block links automatically?', faqA1: 'No. Cypher warns and explains. Going back, continuing or saving the case is always your choice.',
    faqQ2: 'Will it file a complaint with the police for me?', faqA2: 'No. Reports are drafts that stay local. Approval records your review; you submit through the official channel yourself.',
    faqQ3: 'Does it read my messages, cookies or passwords?', faqA3: 'No. Consented network checks transmit hostnames only. Optional AI analysis sends sanitized message text — never cookies, credentials or form data.',
    faqQ4: 'Can Cypher recover money I already lost?', faqA4: 'No. It never claims recovery. It preserves verified evidence so an accurate report can be made in time.',
  },
  hi: {
    workspace: 'जाँच कार्यक्षेत्र', personal: 'निजी कार्यक्षेत्र', investigate: 'नई जाँच', history: 'जाँच इतिहास',
    noHistory: 'अभी कोई जाँच नहीं', noHistoryHint: 'आपकी जाँच यहाँ दिखाई देगी।', signInHistory: 'जाँच इतिहास देखने के लिए लॉग इन करें।',
    localWorkspace: 'स्थानीय कार्यक्षेत्र', localOnly: 'कोई स्वचालित प्रेषण नहीं', localHint: 'हर रिपोर्ट पर नियंत्रण आपका है।',
    connected: 'API जुड़ा है', disconnected: 'API उपलब्ध नहीं', checking: 'कार्यक्षेत्र से जुड़ रहे हैं', language: 'भाषा बदलें',
    login: 'लॉग इन', signup: 'खाता बनाएँ', logout: 'लॉग आउट', identity: 'लॉग इन उपयोगकर्ता',
    authEyebrow: 'गोपनीयता को प्राथमिकता', authTitle: 'आपकी जाँच यहाँ से शुरू होती है।',
    authSubtitle: 'संदिग्ध संदेशों की जाँच करें, सबूत समझें और अगला कदम तय करें — अपने निजी कार्यक्षेत्र में।',
    welcome: 'फिर से स्वागत है', createAccount: 'अपना खाता बनाएँ', loginHint: 'अपने निजी जाँच इतिहास के लिए लॉग इन करें।',
    registerHint: 'अपनी सभी जाँच एक स्थानीय कार्यक्षेत्र में रखें।', name: 'पूरा नाम', email: 'ईमेल पता', password: 'पासवर्ड',
    namePlaceholder: 'आपका नाम', emailPlaceholder: 'you@example.com', passwordPlaceholder: 'कम से कम 12 अक्षर',
    passwordHint: 'कम से कम 12 अक्षरों का उपयोग करें।', passwordInvalid: 'पासवर्ड में कम से कम 12 अक्षर होने चाहिए।',
    showPassword: 'पासवर्ड दिखाएँ', hidePassword: 'पासवर्ड छिपाएँ',
    loginSubmit: 'कार्यक्षेत्र में लॉग इन करें', registerSubmit: 'खाता बनाएँ', authenticating: 'कृपया प्रतीक्षा करें…',
    authFoot: 'आपका खाता इस स्थानीय सेवा द्वारा प्रबंधित है। फ्रंटएंड में कोई API कुंजी नहीं रखी जाती।',
    privacyTitle: 'निजी, पर पारदर्शी।', privacySubtitle: 'जानें क्या यहीं रहता है। चुनें क्या बाहर जाता है।',
    encryptionTitle: 'स्थानीय डेटा सुरक्षा', encryption: 'जाँच का डेटा स्थानीय रूप से एन्क्रिप्ट होता है और कुंजी इस सेवा द्वारा स्थानीय रूप से प्रबंधित होती है। यह औपचारिक सुरक्षा या नियामक अनुपालन का दावा नहीं है।',
    networkTitle: 'नेटवर्क जाँच आपकी अनुमति से', networkExplanation: 'DNS, RDAP और TLS जाँच तथा वैकल्पिक प्रतिष्ठा सेवाएँ बाहरी सेवाओं को केवल होस्टनाम भेजती हैं — आपका संदेश कभी नहीं।',
    aiTitle: 'AI आपकी पसंद है', aiExplanation: 'वैकल्पिक AI विश्लेषण साफ़ किया गया संदेश और निष्कर्ष बाहरी LLM को भेजता है। सफ़ाई से सभी संवेदनशील जानकारियाँ हटने की गारंटी नहीं है।',
    reviewTitle: 'हर कार्रवाई से पहले समीक्षा', reviewExplanation: 'रिपोर्ट आपकी समीक्षा के लिए मसौदे हैं। स्वीकृति से किसी प्राधिकरण को कुछ नहीं भेजा जाता।',
    featureEvidence: 'सबूत, न कि धारणाएँ', featureEvidenceHint: 'सत्यापित स्रोत और संदिग्ध संकेत अलग रखे जाते हैं।',
    featureAudit: 'जाँच का पूरा रिकॉर्ड', featureAuditHint: 'समयरेखा, परिणाम और दर्ज हैश देखें।',
    featureReports: 'रिपोर्ट पर आपका नियंत्रण', featureReportsHint: 'पूरा मसौदा पढ़ें, स्थानीय स्वीकृति दें और डाउनलोड करें।',
    dashboardEyebrow: 'संदेश और लिंक की जाँच', dashboardTitle: 'संदिग्ध संदेश को समझें।',
    dashboardSubtitle: 'संदेश से शुरू करें। सबूत देखें। निर्णय अपने हाथ में रखें।',
    totalCases: 'कुल जाँच', activeCases: 'जारी जाँच', highRiskCases: 'उच्च / गंभीर', actualCounts: 'आपके सहेजे गए जाँच इतिहास से',
    consoleEyebrow: 'एजेंट कंसोल', consoleGreeting: 'नमस्ते', consoleIntro: 'मैं Cypher हूँ, आपका AI संदिग्ध लिंक और SMS जाँचकर्ता।',
    consoleAsk: 'नीचे संदिग्ध SMS, लिंक या संदेश पेस्ट करें; मैं उसे सुरक्षित रूप से जाँचूँगा।',
    smsLabel: 'संदिग्ध संदेश', smsPlaceholder: 'संदिग्ध SMS या संदेश यहाँ पेस्ट करें। उसके अंदर के लिंक केवल पाठ रहेंगे; यह इंटरफ़ेस उन्हें नहीं खोलता।',
    linkLabel: 'संदिग्ध लिंक', linkOptional: 'वैकल्पिक', linkPlaceholder: 'लिंक अलग से है तो यहाँ पेस्ट करें। वह पाठ ही रहेगा और केवल रीड-ओनली जाँचा जाएगा।',
    actionLabel: 'आपने क्या किया?', actionDidNotClick: 'क्लिक नहीं किया', actionOpenedLink: 'लिंक खोला',
    Clicked: 'क्लिक किया', Opened: 'खोला', Ignored: 'अनदेखा किया', 'Entered Information': 'जानकारी दर्ज की', Unknown: 'अज्ञात',
    investigateCta: 'Cypher से जाँच करें', consoleInvalid: 'पहले संदिग्ध संदेश या लिंक पेस्ट करें।',
    messages: 'संदेश', message: 'संदेश',
    options: 'जाँच की अनुमतियाँ', networkConsent: 'नेटवर्क जाँच की अनुमति दें', networkDisclosure: 'वैकल्पिक DNS / RDAP / TLS और प्रतिष्ठा जाँच केवल होस्टनाम बाहर भेजती हैं, संदेश का पाठ कभी नहीं।',
    aiConsent: 'बाहरी AI विश्लेषण की अनुमति दें', aiDisclosure: 'साफ़ किया गया पाठ और निष्कर्ष बाहरी LLM को भेजे जाते हैं। निजी जानकारी शामिल न करें।',
    aiUnavailable: 'इस सेवा में AI उपलब्ध नहीं है।', networkUnavailable: 'नेटवर्क जाँच उपलब्ध नहीं है।',
    reportLanguage: 'रिपोर्ट की भाषा', investigationLanguage: 'जाँच की भाषा', english: 'अंग्रेज़ी', hindi: 'हिन्दी',
    starting: 'जाँच बनाई जा रही है…', localAnalysis: 'नेटवर्क अनुमति के बिना स्थानीय विश्लेषण होता है।',
    activityTitle: 'Cypher क्या कर रहा है', activityHint: 'स्थिति सीधे जाँच रिकॉर्ड से आती है। जो जाँच इस सेवा में नहीं चल सकती, वह अनुपलब्ध दिखेगी — सफल कभी नहीं।',
    stepUrls: 'लिंक निकाले जा रहे हैं', stepSms: 'संदेश का विश्लेषण', stepReputation: 'डोमेन प्रतिष्ठा जाँच',
    stepScam: 'सार्वजनिक धोखाधड़ी रिपोर्ट खोज', stepBrowser: 'अलग ब्राउज़र में लिंक खोलना',
    stepScore: 'जोखिम स्कोर की गणना', stepNext: 'सुझाव तैयार करना',
    activityDone: 'पूर्ण', activityRunning: 'जारी', activityBlocked: 'कॉन्फ़िगर नहीं', activityWaiting: 'प्रतीक्षा', activityDeclined: 'अनुमति नहीं',
    stepWaiting: 'सबमिट करने के बाद चलेगा', networkNotApproved: 'इस जाँच के लिए नेटवर्क जाँच की अनुमति नहीं दी गई।',
    resultsTitle: 'जाँच के परिणाम', openCaseFile: 'पूरी जाँच फ़ाइल खोलें',
    protocol: 'Cypher कैसे जाँच करता है', protocolHint: 'मूल संदेश से समीक्षा योग्य रिकॉर्ड तक।',
    safeTitle: 'संदिग्ध लिंक से संपर्क न करें।', safeHint: 'यदि आपने OTP, पासवर्ड या बैंक जानकारी साझा की है, तो तुरंत किसी विश्वसनीय माध्यम से अपने बैंक से संपर्क करें।',
    promisesLabel: 'हर जाँच में', promise1: 'लिंक आपके लिए कभी खोले नहीं जाते।', promise2: 'बाहरी अनुरोध केवल होस्टनाम ले जाते हैं, आपका संदेश-पाठ नहीं।', promise3: 'आपकी स्वीकृति के बिना कुछ भी प्रेषित नहीं होता।',
    emptyNote: 'कोई काल्पनिक स्कोर नहीं। कोई अनुमानित परिणाम नहीं।', emptyHint: 'जोखिम, सबूत और सुझाव जाँच के बाद ही दिखाई देते हैं।',
    cases: 'जाँच', refresh: 'इतिहास ताज़ा करें', searchCases: 'जाँच इतिहास खोजें', allCases: 'सभी जाँच', caseSearchPlaceholder: 'शीर्षक या जाँच ID खोजें', noMatches: 'कोई जाँच नहीं मिली',
    loading: 'लोड हो रहा है…', error: 'कुछ गलत हुआ', dismiss: 'संदेश हटाएँ', retry: 'दोबारा जुड़ें', sessionExpired: 'आपका सत्र समाप्त हो गया है। फिर लॉग इन करें।',
    requestError: 'अनुरोध पूरा नहीं हो सका।', connectionError: 'स्थानीय API से संपर्क नहीं हो रहा। जाँचें कि बैकएंड चल रहा है।',
    case: 'जाँच', caseId: 'जाँच ID', created: 'बनाई गई', updated: 'अपडेट की गई', caseReference: 'प्राधिकरण संदर्भ', Pending: 'लंबित',
    queued: 'कतार में', investigating: 'जाँच जारी', complete: 'पूर्ण', failed: 'विफल',
    LOW: 'कम', MEDIUM: 'मध्यम', HIGH: 'उच्च', CRITICAL: 'गंभीर', UNCERTAIN: 'अनिश्चित',
    overview: 'अवलोकन', evidence: 'सबूत', report: 'रिपोर्ट', audit: 'जाँच समयरेखा',
    back: 'नई जाँच', download: 'डाउनलोड', exportJson: 'JSON डाउनलोड करें', exportPdf: 'PDF डाउनलोड करें', exporting: 'डाउनलोड तैयार हो रहा है…',
    running: 'जाँच जारी है', runningHint: 'यह जाँच और इतिहास हर 1.5 सेकंड में ताज़ा होते हैं। जाँच पूरी होने पर परिणाम बदल सकते हैं।',
    failedHint: 'जाँच विफल हुई। कार्रवाई से पहले उपलब्ध सबूत और अधूरी जाँच की समीक्षा करें।',
    riskAssessment: 'जोखिम आकलन', riskScore: 'जोखिम स्कोर', outOf: '/ 100', noScore: 'स्कोर उपलब्ध नहीं',
    uncertainty: 'अनिश्चितता महत्त्वपूर्ण है', uncertaintyHint: 'स्कोर प्रमाण नहीं है। अधूरे सबूत और अनुपलब्ध जाँच भरोसे को सीमित कर सकते हैं।',
    summary: 'जाँच का सारांश', noSummary: 'अभी कोई सारांश उपलब्ध नहीं है।',
    originalMessages: 'दर्ज संदेश · संवेदनशील डेटा हटाया गया', recordedAction: 'दर्ज कार्रवाई', extractedUrls: 'निकाले गए लिंक · क्लिक नहीं किए जा सकते', noUrls: 'कोई लिंक दर्ज नहीं है।',
    findings: 'निष्कर्ष', observed: 'देखा गया', suspected: 'संदिग्ध', reason: 'कारण', evidenceReferences: 'सबूत संदर्भ',
    noFindings: 'अभी कोई निष्कर्ष दर्ज नहीं है।', nextSteps: 'सुझाए गए अगले कदम', noSteps: 'अभी कोई सुझाव उपलब्ध नहीं है।',
    unresolved: 'अनसुलझे प्रश्न', noneUnresolved: 'कोई अनसुलझा प्रश्न दर्ज नहीं है।',
    aiAnalysis: 'AI विश्लेषण', not_requested: 'अनुरोध नहीं किया', unavailable: 'अनुपलब्ध', noAI: 'AI विश्लेषण का पाठ उपलब्ध नहीं है।',
    pending: 'लंबित', planTitle: 'जाँच-योजना लूप', planPending: 'योजना लूप अभी शुरू नहीं हुआ है।', planNotUsed: 'योजना केवल AI और नेटवर्क अनुमति के साथ चलती है। AI के बिना, पूरी निश्चित जाँच-सूत्र सदैव चलता है।', planFollowUps: 'फ़ॉलो-अप दौर', planAdded: 'सबूत के रूप में जोड़ा', planFailed: 'जोड़ा नहीं गया', planDnsOnly: 'केवल DNS जाँच',
    evidenceHint: 'वास्तविक स्रोत, प्राप्ति का समय और जाँच विवरण देखें। अनुपलब्ध जाँच सत्यापित सबूत नहीं है।',
    verified: 'सत्यापित', source: 'स्रोत', sourceUrl: 'स्रोत URL', retrieved: 'प्राप्त किया गया', details: 'दर्ज विवरण', item: 'संदेश संदर्भ',
    unavailableReason: 'अनुपलब्ध होने का कारण', noEvidence: 'अभी कोई सबूत दर्ज नहीं है।', noDetails: 'कोई विवरण दर्ज नहीं है।',
    prepareReport: 'रिपोर्ट तैयार करें', reportHint: 'इस जाँच से समीक्षा योग्य मसौदा बनाएँ। केवल पुष्टि किए तथ्य; संदिग्ध निष्कर्ष पुष्टि किए तथ्य नहीं हैं।',
    authority: 'रिपोर्टिंग प्राधिकरण', ncrp: 'राष्ट्रीय साइबर अपराध रिपोर्टिंग पोर्टल (NCRP)', chakshu: 'चक्षु · संदिग्ध धोखाधड़ी संचार', generic: 'सामान्य घटना रिकॉर्ड',
    authorityGuidance: 'प्राधिकरण का मार्गदर्शन', authoritySource: 'आधिकारिक स्रोत', generateReport: 'मसौदा बनाएँ', regenerating: 'नया मसौदा बनाएँ', generating: 'मसौदा तैयार हो रहा है…',
    draftPreview: 'पूरा मसौदा पूर्वावलोकन', noReport: 'अभी रिपोर्ट मसौदा नहीं है', noReportHint: 'प्राधिकरण और भाषा चुनें, फिर समीक्षा के लिए मसौदा बनाएँ।',
    'Awaiting Approval': 'स्वीकृति की प्रतीक्षा', Approved: 'स्वीकृत', approve: 'समीक्षित मसौदे को स्वीकृति दें', approving: 'स्वीकृत किया जा रहा है…',
    approvalHint: 'स्वीकृति से पहले पूरा मसौदा पढ़ें। स्वीकृति केवल आपकी समीक्षा दर्ज करती है।',
    approvedHint: 'आपके रिकॉर्ड के लिए स्वीकृत। यह केवल समीक्षा है — बाहर कुछ भी नहीं भेजा गया है।',
    submissionNotice: 'Cypher प्राधिकरणों को रिपोर्ट नहीं भेजता। आपको स्वयं आधिकारिक रिपोर्टिंग माध्यम का उपयोग करना होगा।',
    reportId: 'रिपोर्ट ID', draftLanguage: 'मसौदे की भाषा', draftTarget: 'मसौदे का प्राधिकरण', reportPending: 'जाँच पूरी होने पर रिपोर्ट तैयार की जा सकती है।',
    regenerateHint: 'दोबारा बनाने पर मौजूदा मसौदा बदल जाएगा और फिर से स्वीकृति देनी होगी।',
    auditHint: 'बैकएंड द्वारा दर्ज घटनाएँ समय क्रम में हैं। हैश जैसे दर्ज हुए हैं वैसे दिखते हैं; यह छेड़छाड़-रोधी प्रमाणन का दावा नहीं है।',
    event: 'घटना', result: 'परिणाम', recordedHash: 'दर्ज हैश', noAudit: 'अभी कोई समयरेखा घटना दर्ज नहीं है।',
    notAvailable: 'उपलब्ध नहीं', privacy: 'गोपनीयता और नियंत्रण', privacyFooter: 'स्थानीय प्राथमिकता। सबूत आधारित। मानवीय समीक्षा।',
    landKicker: 'संदिग्ध लिंक और SMS जाँचकर्ता',
    landGiantA: 'सोचो', landGiantB: 'क्लिक करने से पहले', landGiantC: 'जाणो।',
    landLede: 'Cypher संदिग्ध लिंक और संदेशों की जाँच करता है, सत्यापन योग्य सबूत इकट्ठा करता है और जोखिम समझाता है — कार्रवाई से पहले, हर चरण पर आपकी अनुमति से।',
    landStart: 'अपना कार्यक्षेत्र खोलें', landLogin: 'मेरा खाता पहले से है',
    landReturn: 'अपने कार्यक्षेत्र पर लौटें', home: 'होम',
    landOffline: 'स्थानीय API से संपर्क नहीं हो रहा। बैकएंड चलाकर पृष्ठ फिर लोड करें।',
    briefEyebrow: 'Cypher क्या करता है', briefStatement: 'पहले सबूत। फैसला हमेशा आपका।',
    briefCopy1: 'संदिग्ध SMS या लिंक पेस्ट करें, या जो संदेह हुआ उसे दर्ज करें। Cypher लिंक निकालता है, स्थानीय जाँच करता है और आपकी अनुमति केवल होस्टनाम भेजकर DNS, रजिस्ट्री और TLS जाँच करता है।',
    briefCopy2: 'सत्यापित तथ्य, आशंका और अज्ञात बातें अलग रखी जाती हैं। हर जोखिम स्कोर सबूत और जाँच में छूटी बातों के साथ दिखता है।',
    methodEyebrow: 'जाँच कैसे चलती है', methodTitle: 'चार साफ़ चरण।',
    landStep1: 'दर्ज करें', landStep1Hint: 'संदेश रिकॉर्ड हो जाता है, लिंक केवल पाठ के रूप में निकलते हैं। इंटरफ़ेस कोई लिंक नहीं खोलता।',
    landStep2: 'जाँचें', landStep2Hint: 'पहले स्थानीय जाँच; अनुमति वाली नेटवर्क जाँच केवल होस्टनाम भेजती है।',
    landStep3: 'आकलन', landStep3Hint: '0–100 जोखिम बैंड, सबूत संदर्भों के साथ — सबूत न मिले तो अनिश्चित।',
    landStep4: 'रिपोर्ट', landStep4Hint: 'NCRP, चक्षु या सामान्य रिकॉर्ड के लिए समीक्षा योग्य मसौदा। स्वीकृति आपकी, प्रेषण भी आपका।',
    riskEyebrow: 'जोखिम स्तर', riskTitle: 'हर स्तर का अर्थ।',
    bandLowD: 'हुई जाँचों में कोई ठोस खतरे का संकेत नहीं मिला।',
    bandMediumD: 'कुछ संदिग्ध संकेत, पर असत्यापित। सावधानी बरतें और दोबारा जाँचें।',
    bandHighD: 'धोखे के कई मज़बूत संकेत। लिंक से कोई संपर्क न करें।',
    bandCriticalD: 'नकली पहचान या पासवर्ड-शिकारी पैटर्न पुष्ट। तुरंत सुरक्षात्मक कदम उठाएँ।',
    bandUncertainD: 'सबूत अधूरा है या जाँच उपलब्ध नहीं थी। असुरक्षित मानें, सुरक्षित नहीं।',
    faqEyebrow: 'सीधे जवाब', faqTitle: 'कोई धुंधले वादे नहीं।',
    faqQ1: 'क्या Cypher लिंक अपने आप ब्लॉक करता है?', faqA1: 'नहीं। Cypher केवल चेताता है और समझाता है। वापस जाना, आगे बढ़ना या जाँच सहेजना हमेशा आपका चुनाव है।',
    faqQ2: 'क्या यह पुलिस में शिकायत दर्ज करेगा?', faqA2: 'नहीं। रिपोर्ट केवल मसौदा है जो स्थानीय रहता है। स्वीकृति सिर्फ आपकी समीक्षा दर्ज करती है; प्रेषण आपको स्वयं आधिकारिक माध्यम से करना होता है।',
    faqQ3: 'क्या यह मेरे संदेश, कुकीज़ या पासवर्ड पढ़ता है?', faqA3: 'नहीं। अनुमति वाली नेटवर्क जाँच केवल होस्टनाम भेजती है। वैकल्पिक AI विश्लेषण साफ़ किया गया पाठ भेजता है — कुकीज़, क्रेडेंशियल या फ़ॉर्म डेटा कभी नहीं।',
    faqQ4: 'क्या Cypher खोया पैसा वापस दिला सकता है?', faqA4: 'नहीं। यह कभी वापसी का दावा नहीं करता। यह सत्यापित सबूत सुरक्षित रखता है ताकि समय पर सटीक रिपोर्ट दी जा सके।',
  },
};
const CONSOLE_ACTIONS = [['Ignored', 'actionDidNotClick'], ['Opened', 'actionOpenedLink'], ['Entered Information', 'Entered Information'], ['Unknown', 'Unknown']];
const ACTIVE = ['queued', 'investigating'];
const AUTHORITY_IDS = ['ncrp', 'chakshu', 'generic'];
const API_ROOT = '/api';

class ApiError extends Error {
  constructor(message, status = 0) { super(message); this.name = 'ApiError'; this.status = status; }
}
// A cancelled request can reject while its body is still streaming, after fetch() already resolved.
const aborted = (error, signal) => error?.name === 'AbortError' || signal?.aborted === true;
async function request(path, { method = 'GET', body, signal, blob = false } = {}) {
  let response;
  try {
    response = await fetch(`${API_ROOT}${path}`, {
      method, credentials: 'same-origin', signal,
      headers: { 'Content-Type': 'application/json', Accept: blob ? 'application/pdf, application/json, application/octet-stream' : 'application/json' },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  } catch (error) {
    if (aborted(error, signal)) throw error;
    throw new ApiError('connectionError');
  }
  if (!response.ok) {
    let data;
    try { data = await response.json(); } catch (error) { if (aborted(error, signal)) throw error; data = null; }
    const message = typeof data?.error === 'string' ? data.error : data?.error?.message || data?.message || 'requestError';
    throw new ApiError(message, response.status);
  }
  if (blob) return response.blob();
  if (response.status === 204) return {};
  try { return await response.json(); } catch (error) { if (aborted(error, signal)) throw error; throw new ApiError('requestError', response.status); }
}
function textValue(value) {
  if (value == null) return '';
  return typeof value === 'string' ? value : JSON.stringify(value, null, 2);
}
const NO_PASSWORD = { login: '', register: '' };
const CASE_TABS = ['overview', 'evidence', 'report', 'audit'];
// Only `#/…` fragments are routes. Bare anchors (#main-content) stay plain in-page links.
const parseHash = (value) => {
  if (!value?.startsWith('#/')) return null;
  const parts = value.slice(2).split('/').filter(Boolean);
  if (parts[0] === 'home') return { page: 'home' };
  if (parts[0] === 'history') return { page: 'history' };
  if (parts[0] === 'case' && parts[1]) return { page: 'case', caseId: decodeURIComponent(parts[1]), tab: CASE_TABS.includes(parts[2]) ? parts[2] : 'overview' };
  if (!parts.length || parts[0] === 'new') return { page: 'new' };
  return null;
};
const navigate = (to) => { if (location.hash !== to) location.hash = to; };
const caseHash = (id, tab) => `#/case/${encodeURIComponent(id)}${tab && tab !== 'overview' ? `/${tab}` : ''}`;
const HIDDEN = { login: false, register: false };
function initialLanguage() {
  try { return localStorage.getItem('cypher-language') === 'hi' ? 'hi' : 'en'; } catch { return 'en'; }
}
function Badge({ value, t, children, className = '' }) {
  return <span className={`badge badge-${String(value || 'UNCERTAIN').toLowerCase().replaceAll(' ', '-')} ${className}`}><span className="badge-dot" />{children || t(value || 'UNCERTAIN')}</span>;
}
function IconButton({ label, children, ...props }) {
  return <button type="button" className="icon-button" aria-label={label} title={label} {...props}>{children}</button>;
}
function Empty({ icon: Icon = ShieldQuestion, title, hint }) {
  return <div className="empty-state"><span className="empty-icon"><Icon size={24} /></span><strong>{title}</strong>{hint && <p>{hint}</p>}</div>;
}
const PRIVACY_POINTS = [
  [LockKeyhole, 'encryptionTitle', 'encryption'], [Globe2, 'networkTitle', 'networkExplanation'],
  [Sparkles, 'aiTitle', 'aiExplanation'], [ClipboardCheck, 'reviewTitle', 'reviewExplanation'],
];
function PrivacyCard({ t }) {
  return <section className="panel privacy-card">
    <div className="panel-heading"><span className="icon-tile teal"><LockKeyhole size={19} /></span><div><h2>{t('privacyTitle')}</h2><p>{t('privacySubtitle')}</p></div><ShieldCheck className="heading-ghost" size={30} /></div>
    <div className="privacy-list">{PRIVACY_POINTS.map(([Icon, title, description]) => <div className="privacy-item" key={title}><Icon size={17} /><div><h3>{t(title)}</h3><p>{t(description)}</p></div></div>)}</div>
    <div className="privacy-seal"><ShieldCheck size={14} />{t('localOnly')}</div>
  </section>;
}
const PROTOCOL_STEPS = [['landStep1', MessageSquare], ['landStep2', Search], ['landStep3', ClipboardCheck], ['landStep4', FileText]];

// Decorative plate art: abstract, deliberately unlabelled so it never reads as a real finding.
function BriefGraphic() {
  return <svg className="brief-graphic" viewBox="0 0 520 400" aria-hidden="true" focusable="false">
    <defs>
      <pattern id="briefDots" width="26" height="26" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.3" fill="var(--ash)" /></pattern>
    </defs>
    <rect width="520" height="400" fill="url(#briefDots)" opacity=".45" />
    <circle cx="222" cy="199" r="78" fill="var(--ember)" opacity=".07" />
    <rect x="88" y="64" width="268" height="236" rx="20" fill="var(--ink)" stroke="var(--ash)" strokeWidth="1.5" />
    <rect x="116" y="92" width="86" height="9" rx="4.5" fill="var(--ash)" opacity=".6" />
    <rect x="116" y="118" width="200" height="8" rx="4" fill="var(--ash)" opacity=".45" />
    <rect x="116" y="138" width="168" height="8" rx="4" fill="var(--ash)" opacity=".45" />
    <rect x="116" y="158" width="190" height="8" rx="4" fill="var(--ash)" opacity=".45" />
    <rect x="116" y="186" width="212" height="26" rx="13" fill="none" stroke="var(--ember)" strokeWidth="1.6" strokeDasharray="6 7" />
    <rect x="130" y="196" width="120" height="6" rx="3" fill="var(--ember)" opacity=".55" />
    <rect x="116" y="242" width="150" height="8" rx="4" fill="var(--ash)" opacity=".35" />
    <circle cx="372" cy="286" r="66" fill="var(--ember)" fillOpacity=".08" stroke="var(--ember)" strokeWidth="3.4" />
    <path d="M372 258v56M344 286h56" stroke="var(--ember)" strokeWidth="1.8" opacity=".6" />
    <path d="M419 333l43 43" stroke="var(--ember)" strokeWidth="10" strokeLinecap="round" />
    <path d="M28 34h-14v14M492 34h14v14M28 366h-14v-14M492 366h14v-14" stroke="var(--ash)" strokeWidth="1.6" fill="none" opacity=".7" />
  </svg>;
}

function TraceGraphic() {
  return <svg className="brief-graphic" viewBox="0 0 520 340" aria-hidden="true" focusable="false">
    <defs>
      <pattern id="traceLines" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M0 39.5h40" stroke="var(--ash)" strokeWidth="1" opacity=".28" /></pattern>
    </defs>
    <rect width="520" height="340" fill="url(#traceLines)" />
    <path d="M60 252L168 168L292 214L430 96" fill="none" stroke="var(--ash)" strokeWidth="2.8" strokeLinejoin="round" />
    <path d="M292 214L430 96" fill="none" stroke="var(--ember)" strokeWidth="2.8" strokeDasharray="7 8" />
    {[[60, 252], [168, 168], [430, 96]].map(([x, y]) => <g key={x}><circle cx={x} cy={y} r="11" fill="var(--ink)" stroke="var(--haze)" strokeWidth="2.4" /><path d={`M${x} ${y + 11}V304`} stroke="var(--ash)" strokeWidth="1" strokeDasharray="3 5" opacity=".6" /></g>)}
    <circle cx="292" cy="214" r="25" fill="none" stroke="var(--ember)" strokeWidth="1.6" strokeDasharray="4 5" opacity=".85" />
    <circle cx="292" cy="214" r="12" fill="var(--ink)" stroke="var(--ember)" strokeWidth="3" />
    <path d="M439 90L474 66" stroke="var(--ember)" strokeWidth="2.8" strokeDasharray="7 8" opacity=".55" />
    <circle cx="474" cy="66" r="5" fill="var(--ember)" opacity=".7" />
  </svg>;
}

// Decorative pipeline plate for the dashboard protocol panel: four neutral nodes, never checkmarks.
function ProtocolGraphic() {
  return <svg className="protocol-graphic" viewBox="0 0 300 84" aria-hidden="true" focusable="false">
    <defs>
      <pattern id="protocolDots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="1.6" cy="1.6" r="1.1" fill="var(--ash)" /></pattern>
    </defs>
    <rect x="0" y="4" width="300" height="72" rx="12" fill="url(#protocolDots)" opacity=".38" />
    <path d="M38 50h44M112 50h40M182 50h44" stroke="var(--ash)" strokeWidth="1.6" strokeDasharray="5 6" />
    {[[26, 50], [96, 50], [166, 50], [248, 50]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="10" fill="var(--ink)" stroke="var(--haze)" strokeWidth="1.8" />)}
    <circle cx="166" cy="50" r="17" fill="var(--ember)" fillOpacity=".08" stroke="var(--ember)" strokeWidth="1.5" strokeDasharray="4 5" />
    <rect x="52" y="17" width="106" height="10" rx="5" fill="var(--ash)" opacity=".5" />
    <rect x="196" y="19" width="72" height="8" rx="4" fill="var(--ember)" opacity=".34" />
    <rect x="118" y="67" width="88" height="7" rx="3.5" fill="var(--ash)" opacity=".35" />
  </svg>;
}

function Landing({ t, language, onToggleLanguage, onEnter, connected, returning }) {
  const rootRef = useRef(null);
  const [openFaq, setOpenFaq] = useState(null);
  const [ctaTab, setCtaTab] = useState('method');
  useEffect(() => {
    const nodes = rootRef.current.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
      });
    }, { threshold: .12 });
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);
  const bands = [
    ['low', t('LOW'), '0 – 25', t('bandLowD')],
    ['medium', t('MEDIUM'), '26 – 50', t('bandMediumD')],
    ['high', t('HIGH'), '51 – 75', t('bandHighD')],
    ['critical', t('CRITICAL'), '76 – 100', t('bandCriticalD')],
    ['uncertain', t('UNCERTAIN'), '—', t('bandUncertainD')],
  ];
  const faqs = [[t('faqQ1'), t('faqA1')], [t('faqQ2'), t('faqA2')], [t('faqQ3'), t('faqA3')], [t('faqQ4'), t('faqA4')]];
  return <div className="landing" ref={rootRef}>
    <a className="skip-link" href="#landing-main">{t('workspace')}</a>
    <header className="landing-head">
      <span className="landing-brand"><span className="brand-mark"><Shield size={22} strokeWidth={1.8} /><span /></span>Cypher<span className="brand-period">.</span></span>
      <nav className="landing-nav" aria-label={t('workspace')}>
        <button className="language-switch" type="button" onClick={onToggleLanguage} aria-label={t('language')}><Languages size={16} /><span>{language === 'en' ? 'EN' : 'हिन्दी'}</span><span className="language-alt">{language === 'en' ? 'हिन्दी' : 'EN'}</span></button>
        {!returning && <button className="button ghost small" type="button" onClick={onEnter}><LogIn size={15} />{t('login')}</button>}
      </nav>
    </header>
    <main id="landing-main">
      <section className="landing-hero">
        <span className="landing-kicker reveal">{t('landKicker')}</span>
        <h1 className="landing-giant reveal"><span>{t('landGiantA')}</span><span>{t('landGiantB')}</span><span className="accent">{t('landGiantC')}</span></h1>
        <p className="landing-lede reveal reveal-delay-1">{t('landLede')}</p>
        <div className="landing-actions reveal reveal-delay-2">
          <button className="button primary" type="button" onClick={onEnter}>{t(returning ? 'landReturn' : 'landStart')}<ArrowRight size={16} /></button>
          {!returning && <button className="button ghost" type="button" onClick={onEnter}>{t('landLogin')}</button>}
          {connected === false && <span className="landing-ghost-note">{t('landOffline')}</span>}
        </div>
        <div className="landing-slot reveal reveal-delay-3"><img src={IMAGES.hero} alt="" loading="lazy" /></div>
      </section>
      <section className="landing-section">
        <div className="brief-grid">
          <div className="reveal">
            <div className="landing-slot brief-plate"><BriefGraphic /></div>
            <span className="landing-kicker">{t('briefEyebrow')}</span>
            <p className="brief-statement" style={{ margin: '18px 0 0' }}>{t('briefStatement')}</p>
          </div>
          <div className="brief-copy reveal reveal-delay-1">
            <p>{t('briefCopy1')}</p>
            <p>{t('briefCopy2')}</p>
            <div className="landing-slot tall"><TraceGraphic /></div>
          </div>
        </div>
      </section>
      <section className="landing-section">
        <div className="landing-section-head reveal"><h2 className="landing-h2">{t('methodTitle')}</h2><p className="landing-section-note">{t('protocolHint')}</p></div>
        <div className="method-steps">{[1, 2, 3, 4].map((n, index) => <article className="method-step reveal" key={n} style={{ '--i': index }}>
          <span className="method-step-rule" /><span className="method-step-index">0{n}</span><h3>{t(`landStep${n}`)}</h3><p>{t(`landStep${n}Hint`)}</p>
        </article>)}</div>
      </section>
      <section className="landing-section">
        <div className="landing-section-head reveal"><h2 className="landing-h2">{t('riskTitle')}</h2><p className="landing-section-note">{t('emptyNote')}</p></div>
        <div className="risk-bands">{bands.map(([id, name, range, desc], index) => <div className={`risk-band band-${id} reveal reveal-delay-${(index % 3) + 1}`} key={id}>
          <span className="band-name"><span className="band-dot" />{name}</span><span className="band-range">{range} / 100</span><p className="band-desc">{desc}</p>
        </div>)}</div>
      </section>
      <section className="landing-section">
        <div className="landing-privacy-grid">
          <div className="reveal"><PrivacyCard t={t} /></div>
          <div className="reveal reveal-delay-1" style={{ display: 'grid', gap: '20px', alignContent: 'start' }}>
            <span className="landing-kicker">{t('faqEyebrow')}</span>
            <h2 className="landing-h2">{t('faqTitle')}</h2>
            <div className="landing-slot tall"><img src={IMAGES.privacy} alt="" loading="lazy" /></div>
          </div>
        </div>
        <div className="faq reveal" style={{ marginTop: 'clamp(36px, 5vw, 70px)' }}>{faqs.map(([q, a], i) => <div className={`faq-item ${openFaq === i ? 'open' : ''}`} key={q}>
          <button className="faq-trigger" type="button" aria-expanded={openFaq === i} onClick={() => setOpenFaq(openFaq === i ? null : i)}>{q}<Plus size={18} /></button>
          <div className="faq-answer"><div><p>{a}</p></div></div>
        </div>)}</div>
      </section>
      <section className="landing-cta">
        <div className="cta-dossier reveal">
          <div className="cta-tabs" role="group" aria-label={t('briefEyebrow')}>
            <button type="button" aria-pressed={ctaTab === 'method'} className={ctaTab === 'method' ? 'active' : ''} onClick={() => setCtaTab('method')}><Radar size={15} />{t('protocol')}</button>
            <button type="button" aria-pressed={ctaTab === 'privacy'} className={ctaTab === 'privacy' ? 'active' : ''} onClick={() => setCtaTab('privacy')}><LockKeyhole size={15} />{t('privacyTitle')}</button>
          </div>
          <p className="cta-note">{ctaTab === 'method' ? t('protocolHint') : t('privacySubtitle')}</p>
          {ctaTab === 'method' ? <>
            <ProtocolGraphic />
            <ol className="cta-steps">{PROTOCOL_STEPS.map(([key, Icon], index) => <li key={key}><span className="cta-step-icon"><Icon size={16} /></span><div><span className="cta-step-number">0{index + 1}</span><h3>{t(key)}</h3><p>{t(`${key}Hint`)}</p></div></li>)}</ol>
            <div className="cta-seal"><Fingerprint size={13} />{t('featureAudit')}</div>
          </> : <>
            <div className="cta-privacy">{PRIVACY_POINTS.map(([Icon, title, description]) => <div className="cta-privacy-item" key={title}><Icon size={16} /><div><h3>{t(title)}</h3><p>{t(description)}</p></div></div>)}</div>
            <div className="cta-seal"><ShieldCheck size={13} />{t('localOnly')}</div>
          </>}
        </div>
        <div className="eclipse reveal reveal-delay-3" aria-hidden="true">
          <span className="eclipse-halo" /><span className="eclipse-rim" /><span className="eclipse-core" /><span className="eclipse-spark" />
        </div>
      </section>
    </main>
    <footer className="landing-foot">
      <div className="foot-word" aria-hidden="true">Cypher</div>
      <div className="landing-foot-inner">
        <span className="landing-brand" aria-hidden="true" style={{ visibility: 'hidden' }}>Cypher.</span>
        <div className="foot-meta"><span>{t('privacyFooter')}</span><span>Cypher · {t('localOnly')}</span></div>
      </div>
    </footer>
  </div>;
}

const AGENT_STATES = {
  done: { icon: Check, label: 'activityDone', className: 'is-done' },
  running: { icon: LoaderCircle, label: 'activityRunning', className: 'is-running' },
  blocked: { icon: X, label: 'activityBlocked', className: 'is-blocked' },
  declined: { icon: X, label: 'activityDeclined', className: 'is-blocked' },
  waiting: { icon: CircleHelp, label: 'activityWaiting', className: 'is-waiting' },
};

// Every status is read from the stored case record. A check this deployment cannot run is reported as unavailable, never as passed.
function deriveAgentSteps(currentCase, t) {
  const waiting = { state: 'waiting', detail: t('stepWaiting') };
  const running = { state: 'running', detail: '' };
  const items = currentCase?.items || [];
  const hosts = [...new Set(items.flatMap((item) => item.urls || []).map((url) => url.hostname))];
  const ofType = (type) => (currentCase?.evidence || []).filter((entry) => entry.type === type);
  const settled = Boolean(currentCase) && !ACTIVE.includes(currentCase.status);
  const checked = (type) => {
    if (!currentCase) return waiting;
    const records = ofType(type);
    const passed = records.filter((entry) => entry.status === 'verified');
    if (passed.length) return { state: 'done', detail: passed.map((entry) => entry.details?.hostname).filter(Boolean).join(' · ') || t('verified') };
    if (records.length) return { state: 'blocked', detail: records[0].reason || t('notAvailable') };
    if (!settled) return running;
    return { state: 'blocked', detail: hosts.length ? t('noEvidence') : t('noUrls') };
  };
  const findingsCount = currentCase?.findings?.length || 0;
  const stepsCount = currentCase?.nextSteps?.length || 0;
  return [
    { key: 'stepUrls', icon: Link2, step: currentCase ? { state: 'done', detail: hosts.length ? hosts.join(' · ') : t('noUrls') } : waiting },
    { key: 'stepSms', icon: MessageSquare, step: !currentCase ? waiting : findingsCount || settled ? { state: 'done', detail: `${findingsCount} ${t('findings')}` } : running },
    { key: 'stepReputation', icon: Globe2, step: currentCase && !currentCase.consentNetwork ? { state: 'declined', detail: t('networkNotApproved') } : checked('Domain reputation') },
    { key: 'stepScam', icon: Search, step: !currentCase ? waiting : checked('Public scam reports') },
    { key: 'stepBrowser', icon: Eye, step: !currentCase ? waiting : checked('Website inspection') },
    { key: 'stepScore', icon: Activity, step: !currentCase ? waiting : typeof currentCase.score === 'number' ? { state: 'done', detail: `${currentCase.score} / 100 · ${t(currentCase.riskLevel)}` } : settled ? { state: 'blocked', label: t('notAvailable'), detail: t('noScore') } : running },
    { key: 'stepNext', icon: ClipboardCheck, step: !currentCase ? waiting : stepsCount ? { state: 'done', detail: `${stepsCount} ${t('nextSteps')}` } : settled ? { state: 'blocked', label: t('notAvailable'), detail: t('noSteps') } : running },
  ];
}

function App() {
  const [language, setLanguage] = useState(initialLanguage);
  const t = useCallback((key) => COPY[language][key] || key, [language]);
  const [health, setHealth] = useState(null);
  const [connected, setConnected] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showLanding, setShowLanding] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [auth, setAuth] = useState({ name: '', email: '', password: { ...NO_PASSWORD } });
  const [authBusy, setAuthBusy] = useState(false);
  const [showPassword, setShowPassword] = useState({ ...HIDDEN });
  const [error, setError] = useState(null);
  const [cases, setCases] = useState([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [view, setView] = useState('new');
  const [selectedId, setSelectedId] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);
  const [caseLoading, setCaseLoading] = useState(false);
  const [tab, setTab] = useState('overview');
  const [caseSearch, setCaseSearch] = useState('');
  const [messageText, setMessageText] = useState('');
  const [linkText, setLinkText] = useState('');
  const [userAction, setUserAction] = useState('Ignored');
  const [consentNetwork, setConsentNetwork] = useState(false);
  const [consentAI, setConsentAI] = useState(false);
  const [creating, setCreating] = useState(false);
  const [reportTarget, setReportTarget] = useState('ncrp');
  const [reportLanguage, setReportLanguage] = useState(language);
  const [reportBusy, setReportBusy] = useState('');
  const [exportBusy, setExportBusy] = useState('');
  const caseRequest = useRef(0);
  const sessionGeneration = useRef(0);
  const currentId = useRef(null);
  const mainRef = useRef(null);
  const capabilities = health?.capabilities || { network: false, ai: false, reputation: false, browser: false };
  const date = (value) => {
    if (!value) return t('notAvailable');
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? String(value) : parsed.toLocaleString(language === 'hi' ? 'hi-IN' : 'en-IN', { dateStyle: 'medium', timeStyle: 'medium' });
  };
  const shortDate = (value) => {
    const parsed = new Date(value);
    return value && !Number.isNaN(parsed.getTime()) ? parsed.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short' }) : '—';
  };
  const switchAuthMode = (mode) => { setAuthMode(mode); setError(null); };
  const clearSession = useCallback(() => {
    caseRequest.current += 1; sessionGeneration.current += 1;
    currentId.current = null;
    setUser(null); setCases([]); setHistoryLoaded(false); setSelectedCase(null); setSelectedId(null); setView('new');
    setShowAuth(false); setShowLanding(false);
    setMessageText(''); setLinkText(''); setUserAction('Ignored');
    setConsentNetwork(false); setConsentAI(false); setCaseSearch('');
    setAuth({ name: '', email: '', password: { ...NO_PASSWORD } }); setShowPassword({ ...HIDDEN });
    navigate('#/home');
  }, []);
  const handleError = useCallback((err) => {
    if (err.name === 'AbortError') return;
    if (err.status === 401) { clearSession(); setError('sessionExpired'); }
    else setError(err.message || 'requestError');
  }, [clearSession]);
  const refreshHistory = useCallback(async (signal) => {
    const generation = sessionGeneration.current;
    const data = await request('/cases', { signal });
    if (signal?.aborted || generation !== sessionGeneration.current) return;
    setCases(Array.isArray(data.cases) ? data.cases : []);
    setHistoryLoaded(true);
  }, []);
  const initialize = useCallback(async (signal) => {
    setInitializing(true);
    await Promise.all([
      request('/health', { signal }).then((data) => { setHealth(data); setConnected(true); }).catch((err) => {
        if (err.name !== 'AbortError') { setConnected(false); setError(err.message); }
      }),
      request('/auth/me', { signal }).then((data) => { setUser(data.user || null); }).catch((err) => {
        if (err.name !== 'AbortError' && err.status !== 401) setError(err.message);
      }),
    ]);
    if (!signal?.aborted) setInitializing(false);
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    initialize(controller.signal);
    return () => controller.abort();
  }, [initialize]);
  useEffect(() => {
    document.documentElement.lang = language;
    try { localStorage.setItem('cypher-language', language); } catch { /* Storage is optional. */ }
  }, [language]);
  useEffect(() => {
    if (!user) return;
    const controller = new AbortController();
    refreshHistory(controller.signal).catch(handleError);
    return () => controller.abort();
  }, [user, refreshHistory, handleError]);
  useEffect(() => {
    if (!capabilities.ai) setConsentAI(false);
    if (!capabilities.network) setConsentNetwork(false);
  }, [capabilities.ai, capabilities.network]);
  useEffect(() => {
    if (!user || !selectedId || !ACTIVE.includes(selectedCase?.status)) return;
    const controller = new AbortController();
    let busy = false;
    const poll = async () => {
      if (busy) return;
      busy = true;
      try {
        const data = await request(`/cases/${encodeURIComponent(selectedId)}`, { signal: controller.signal });
        if (!controller.signal.aborted && currentId.current === selectedId) setSelectedCase(data.case);
        await refreshHistory(controller.signal);
      } catch (err) { handleError(err); }
      finally { busy = false; }
    };
    const timer = window.setInterval(poll, 1500);
    return () => { window.clearInterval(timer); controller.abort(); };
  }, [user, selectedId, selectedCase?.status, refreshHistory, handleError]);

  const goNew = () => {
    caseRequest.current += 1; currentId.current = null;
    setView('new'); setSelectedId(null); setSelectedCase(null); setCaseLoading(false); setError(null);
    setMessageText(''); setLinkText(''); setUserAction('Ignored'); setConsentNetwork(false); setConsentAI(false);
  };
  const goHistory = () => {
    caseRequest.current += 1; currentId.current = null;
    setView('history'); setSelectedId(null); setSelectedCase(null); setCaseLoading(false); setError(null);
  };
  const openCase = async (id, tab = 'overview') => {
    const sequence = ++caseRequest.current;
    currentId.current = id;
    setSelectedId(id); setSelectedCase(null); setView('case'); setTab(tab); setCaseLoading(true); setError(null);
    try {
      const data = await request(`/cases/${encodeURIComponent(id)}`);
      if (sequence !== caseRequest.current) return;
      setSelectedCase(data.case);
      setReportLanguage(data.case.language === 'hi' ? 'hi' : 'en');
      setReportTarget(AUTHORITY_IDS.includes(data.case.report?.target) ? data.case.report.target : 'ncrp');
    } catch (err) { if (sequence === caseRequest.current) handleError(err); }
    finally { if (sequence === caseRequest.current) setCaseLoading(false); }
  };
  const syncFromHash = () => {
    const route = parseHash(location.hash);
    if (!route) {
      if (location.hash.startsWith('#/')) navigate(user ? '#/new' : '#/home');
      return;
    }
    if (route.page === 'home') { setShowLanding(true); return; }
    setShowLanding(false);
    if (route.page === 'case') {
      if (!user) { navigate('#/home'); return; }
      // The console can hold a selected case while the URL still reads #/new, so reuse the tab only inside the case view.
      if (view === 'case' && selectedId === route.caseId && selectedCase) setTab(route.tab);
      else openCase(route.caseId, route.tab);
      return;
    }
    if (route.page === 'history') { goHistory(); return; }
    goNew();
  };
  const syncRef = useRef(syncFromHash);
  useEffect(() => { syncRef.current = syncFromHash; });
  useEffect(() => {
    const onHash = () => syncRef.current();
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  useEffect(() => {
    if (initializing) return;
    const route = parseHash(location.hash);
    if (!route || (!user && route.page !== 'home')) {
      const fallback = user ? '#/new' : '#/home';
      if (location.hash !== fallback) { location.hash = fallback; return; }
    }
    syncRef.current();
  }, [initializing, user]);
  const authenticate = async (event) => {
    event.preventDefault(); setError(null);
    if (auth.password[authMode].length < 12) { setError('passwordInvalid'); return; }
    setAuthBusy(true);
    try {
      const body = authMode === 'register' ? { name: auth.name.trim(), email: auth.email.trim(), password: auth.password[authMode] } : { email: auth.email.trim(), password: auth.password[authMode] };
      const data = await request(`/auth/${authMode}`, { method: 'POST', body });
      sessionGeneration.current += 1;
      setUser(data.user); setAuth({ name: '', email: '', password: { ...NO_PASSWORD } }); setShowPassword({ ...HIDDEN }); setShowAuth(false); navigate('#/new');
    } catch (err) { setError(err.message); }
    finally { setAuthBusy(false); }
  };
  const logout = async () => {
    setAuthBusy(true); setError(null);
    try { await request('/auth/logout', { method: 'POST', body: {} }); clearSession(); }
    catch (err) { handleError(err); }
    finally { setAuthBusy(false); }
  };
  const createInvestigation = async (event) => {
    event.preventDefault(); setError(null);
    const text = [messageText.trim(), linkText.trim()].filter(Boolean).join('\n');
    if (!text) { setError('consoleInvalid'); return; }
    const generation = sessionGeneration.current;
    setCreating(true);
    try {
      const data = await request('/cases', { method: 'POST', body: {
        items: [{ text, action: userAction }], language,
        consentNetwork: Boolean(consentNetwork && capabilities.network), consentAI: Boolean(consentAI && capabilities.ai),
      } });
      if (generation !== sessionGeneration.current) return;
      const newCase = data.case;
      if (!newCase?.id) throw new ApiError('requestError');
      setReportLanguage(language); setReportTarget('ncrp');
      setMessageText(''); setLinkText(''); setUserAction('Ignored'); setConsentNetwork(false); setConsentAI(false);
      refreshHistory().catch(handleError);
      // The console keeps its own view of the case, so the 1.5s poll can stream activity in place.
      caseRequest.current += 1; currentId.current = newCase.id;
      setSelectedId(newCase.id); setSelectedCase(newCase);
      mainRef.current?.focus();
    } catch (err) { if (generation === sessionGeneration.current) handleError(err); }
    finally { setCreating(false); }
  };
  const generateReport = async () => {
    if (!selectedCase) return;
    const id = selectedCase.id;
    setReportBusy('generate'); setError(null);
    try {
      const data = await request(`/cases/${encodeURIComponent(id)}/report`, { method: 'POST', body: { target: reportTarget, language: reportLanguage } });
      if (currentId.current === id) setSelectedCase(data.case);
      await refreshHistory();
    } catch (err) { handleError(err); }
    finally { setReportBusy(''); }
  };
  const approveReport = async () => {
    if (!selectedCase?.report) return;
    const id = selectedCase.id;
    setReportBusy('approve'); setError(null);
    try {
      const data = await request(`/cases/${encodeURIComponent(id)}/report/approve`, { method: 'POST', body: { reportId: selectedCase.report.id } });
      if (currentId.current === id) setSelectedCase(data.case);
      await refreshHistory();
    } catch (err) { handleError(err); }
    finally { setReportBusy(''); }
  };
  const downloadExport = async (format) => {
    if (!selectedCase) return;
    const id = selectedCase.id;
    setExportBusy(format); setError(null);
    try {
      const blob = await request(`/cases/${encodeURIComponent(id)}/export.${format}`, { blob: true });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url; anchor.download = `${id}.${format}`;
      document.body.appendChild(anchor); anchor.click(); anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) { handleError(err); }
    finally { setExportBusy(''); }
  };
  const stats = [
    [FileText, 'totalCases', cases.length, 'violet'],
    [Activity, 'activeCases', cases.filter((item) => ACTIVE.includes(item.status)).length, 'teal'],
    [ShieldQuestion, 'highRiskCases', cases.filter((item) => ['HIGH', 'CRITICAL'].includes(item.riskLevel)).length, 'amber'],
  ];
  const authority = health?.authorities?.find((entry) => entry.id === reportTarget);
  const busyCase = ACTIVE.includes(selectedCase?.status);
  const report = selectedCase?.report;
  const agentSteps = deriveAgentSteps(view === 'new' ? selectedCase : null, t);
  const agentEvidence = (selectedCase?.evidence || []).filter((entry) => entry.status === 'verified');
  const filteredCases = cases.filter((item) => `${item.title} ${item.id}`.toLowerCase().includes(caseSearch.toLowerCase()));

  const renderOverview = () => <>
    <div className="overview-top">
      <section className={`panel risk-panel risk-${(selectedCase.riskLevel || 'UNCERTAIN').toLowerCase()}`}>
        <div className="eyebrow">{t('riskAssessment')}<Shield size={16} /></div>
        <div className="score-row"><div><span className="score">{typeof selectedCase.score === 'number' ? selectedCase.score : '—'}</span><span className="score-denominator">{typeof selectedCase.score === 'number' ? '/ 100' : t('noScore')}</span></div><Badge value={selectedCase.riskLevel} t={t} /></div>
        <div className="score-track" role="img" aria-label={`${t('riskScore')}: ${selectedCase.score ?? t('noScore')}`}><span style={{ width: `${typeof selectedCase.score === 'number' ? Math.max(0, Math.min(100, selectedCase.score)) : 0}%` }} /></div>
        <h3><CircleHelp size={15} />{t('uncertainty')}</h3><p>{t('uncertaintyHint')}</p>
      </section>
      <section className="panel summary-panel"><div className="section-title"><Radar size={18} /><h2>{t('summary')}</h2></div><p className="summary-text">{textValue(selectedCase.summary) || t('noSummary')}</p><div className="case-metadata"><div><span>{t('caseReference')}</span><strong>{t(selectedCase.caseReference || 'Pending')}</strong></div><div><span>{t('updated')}</span><strong>{date(selectedCase.updatedAt)}</strong></div></div></section>
    </div>
    <div className="detail-columns"><div className="detail-primary">
      <section className="panel"><div className="section-title"><MessageSquare size={18} /><h2>{t('originalMessages')}</h2><span className="count-pill">{selectedCase.items?.length || 0}</span></div>
        <div className="original-list">{(selectedCase.items || []).map((item, index) => {
          const assessment = selectedCase.itemAssessments?.find(entry => entry.itemId === item.id);
          return <article className="original-message" key={item.id || index}>
          <div className="original-heading"><span>{t('message')} {String(index + 1).padStart(2, '0')}</span><span className="action-tag">{t('recordedAction')}: {t(item.action)}</span></div>
          {assessment && <div className="original-heading"><Badge value={assessment.riskLevel} t={t} /><span>{t('riskScore')}: {assessment.score ?? t('noScore')}</span></div>}
          <p className="message-content">{item.text}</p>
          {!!item.urls?.length && <div className="url-list"><span className="tiny-label"><Link2 size={13} />{t('extractedUrls')}</span>{item.urls.map((url, i) => <div key={url.id || i}><code>{url.url}</code><span className="hostname">{url.hostname}</span></div>)}</div>}
        </article>; })}</div>
      </section>
      <section className="panel"><div className="section-title"><ShieldQuestion size={18} /><h2>{t('findings')}</h2><span className="count-pill">{selectedCase.findings?.length || 0}</span></div>
        {!selectedCase.findings?.length ? <p className="muted padded-empty">{t('noFindings')}</p> : <div className="finding-list">{selectedCase.findings.map((finding, index) => <article className="finding" key={finding.id || index}>
          <div className="finding-header"><h3>{finding.title}</h3><Badge value={finding.severity} t={t} /></div><span className={`kind-label ${finding.kind}`}>{t(finding.kind)}</span>
          <p>{finding.reason}</p><div className="finding-refs"><span>{t('item')}: <code>{finding.itemId || '—'}</code></span><span>{t('evidenceReferences')}: <code>{finding.evidenceIds?.join(', ') || '—'}</code></span></div>
        </article>)}</div>}
      </section>
    </div><div className="detail-secondary">
      <section className="panel next-steps"><div className="section-title"><ClipboardCheck size={18} /><h2>{t('nextSteps')}</h2></div>{selectedCase.nextSteps?.length ? <ol className="steps-list">{selectedCase.nextSteps.map((step, i) => <li key={i}><span>{String(i + 1).padStart(2, '0')}</span><p>{textValue(step)}</p></li>)}</ol> : <p className="muted padded-empty">{t('noSteps')}</p>}</section>
      <section className="panel unresolved-panel"><div className="section-title"><CircleHelp size={18} /><h2>{t('unresolved')}</h2></div>{selectedCase.unresolved?.length ? <ul className="unresolved-list">{selectedCase.unresolved.map((item, i) => <li key={i}>{textValue(item)}</li>)}</ul> : <p className="muted padded-empty">{t('noneUnresolved')}</p>}</section>
      <section className="panel ai-panel"><div className="section-title"><Sparkles size={18} /><h2>{t('aiAnalysis')}</h2></div><Badge value={selectedCase.aiAnalysis?.status || 'not_requested'} t={t} />{selectedCase.aiAnalysis?.label && <p className="muted">{selectedCase.aiAnalysis.label}</p>}<p className="preserve-text">{selectedCase.aiAnalysis?.text || t('noAI')}</p></section>
      <section className="panel ai-panel plan-panel"><div className="section-title"><Terminal size={18} /><h2>{t('planTitle')}</h2></div><Badge value={selectedCase.plan?.status || 'pending'} t={t} />
        {(!selectedCase.plan || selectedCase.plan.status === 'pending' || selectedCase.plan.status === 'not_requested' || selectedCase.plan.status === 'unavailable') && <p className="muted">{selectedCase.plan?.text || (selectedCase.plan?.status === 'not_requested' || selectedCase.plan?.status === 'unavailable' ? t('planNotUsed') : t('planPending'))}</p>}
        {selectedCase.plan?.status === 'complete' && <>
          {selectedCase.plan.label && <p className="muted">{selectedCase.plan.label}</p>}
          <ul className="plan-list">{selectedCase.plan.decisions.map(decision => <li key={decision.host}><div className="plan-host-row"><code>{decision.host}</code><span className="plan-checks">{decision.checks.length ? decision.checks.map(check => <span className="plan-chip" key={check}>{check}</span>) : <span className="plan-chip dns">{t('planDnsOnly')}</span>}</span></div><p>{decision.reason}</p></li>)}</ul>
          {!!selectedCase.plan.followUps?.length && <div className="plan-followups"><span className="tiny-label">{t('planFollowUps')}</span>{selectedCase.plan.followUps.map((followUp, i) => <div key={i} className="plan-host-row"><code>{followUp.host}</code><span className="plan-chip">{followUp.check}</span><em className={`plan-outcome ${followUp.outcome}`}>{t(followUp.outcome === 'added' ? 'planAdded' : 'planFailed')}</em></div>)}</div>}
          {selectedCase.plan.review && <p className="preserve-text">{selectedCase.plan.review}</p>}
        </>}
      </section>
      <button className="report-shortcut" onClick={() => navigate(caseHash(selectedCase.id, 'report'))}><span className="icon-tile violet"><FileText size={20} /></span><span><strong>{t('prepareReport')}</strong><small>{t('reviewTitle')}</small></span><ArrowUpRight size={19} /></button>
    </div></div>
  </>;

  const renderEvidence = () => <section className="panel evidence-panel"><div className="section-title"><Search size={19} /><h2>{t('evidence')}</h2><span className="count-pill">{selectedCase.evidence?.length || 0}</span></div><p className="section-description">{t('evidenceHint')}</p>
    {!selectedCase.evidence?.length ? <Empty icon={Search} title={t('noEvidence')} /> : <div className="evidence-list">{selectedCase.evidence.map((entry, index) => <article className="evidence-entry" key={entry.id || index}>
      <div className="evidence-heading"><span className={`icon-tile ${entry.status === 'verified' ? 'teal' : 'amber'}`}>{entry.status === 'verified' ? <ShieldCheck size={18} /> : <CircleHelp size={18} />}</span><div><h3>{entry.type}</h3><code>{entry.id}</code></div><Badge value={entry.status} t={t} /></div>
      <dl className="evidence-meta"><div><dt>{t('source')}</dt><dd>{entry.source || t('notAvailable')}</dd></div><div><dt>{t('retrieved')}</dt><dd><Clock3 size={13} />{date(entry.retrievedAt)}</dd></div><div><dt>{t('item')}</dt><dd><code>{entry.itemId || '—'}</code></dd></div>{entry.sourceUrl && <div className="wide"><dt>{t('sourceUrl')}</dt><dd><code>{entry.sourceUrl}</code></dd></div>}</dl>
      {entry.reason && <div className="unavailable-note"><CircleHelp size={15} /><div><strong>{t('unavailableReason')}</strong><p>{entry.reason}</p></div></div>}
      <div className="evidence-details"><span className="tiny-label"><Terminal size={13} />{t('details')}</span><pre>{entry.details && Object.keys(entry.details).length ? textValue(entry.details) : t('noDetails')}</pre></div>
    </article>)}</div>}
  </section>;

  const renderReport = () => <div className="report-layout"><div className="report-controls">
    <section className="panel"><div className="section-title"><FileText size={19} /><h2>{t('prepareReport')}</h2></div><p className="section-description">{t('reportHint')}</p>
      <div className="field"><label htmlFor="report-authority">{t('authority')}</label><select id="report-authority" value={reportTarget} onChange={(e) => setReportTarget(e.target.value)} disabled={!!reportBusy}>{AUTHORITY_IDS.map((id) => <option value={id} key={id}>{t(id)}</option>)}</select></div>
      <div className="field"><label htmlFor="report-language">{t('reportLanguage')}</label><select id="report-language" value={reportLanguage} onChange={(e) => setReportLanguage(e.target.value)} disabled={!!reportBusy}><option value="en">{t('english')}</option><option value="hi">{t('hindi')}</option></select></div>
      {authority && <div className="authority-guidance"><strong>{t('authorityGuidance')}</strong><p>{authority.guidance}</p>{authority.sourceUrl && <><span className="tiny-label">{t('authoritySource')}</span><code>{authority.sourceUrl}</code></>}</div>}
      <button className="button primary full-width" type="button" onClick={generateReport} disabled={!!reportBusy || busyCase}>{reportBusy === 'generate' ? <LoaderCircle size={17} className="spin" /> : <FileText size={17} />}{t(reportBusy === 'generate' ? 'generating' : report ? 'regenerating' : 'generateReport')}</button>
      {busyCase && <p className="field-hint">{t('reportPending')}</p>}{report && <p className="field-hint">{t('regenerateHint')}</p>}
    </section><div className="notice-card"><ShieldCheck size={20} /><strong>{t('localOnly')}</strong><p>{t('submissionNotice')}</p></div>
  </div><section className="panel draft-panel"><div className="section-title"><ClipboardCheck size={19} /><h2>{t('draftPreview')}</h2>{report && <Badge value={report.status} t={t} />}</div>
    {!report ? <Empty icon={FileText} title={t('noReport')} hint={t('noReportHint')} /> : <>
      <dl className="draft-metadata"><div><dt>{t('draftTarget')}</dt><dd>{t(report.target)}</dd></div><div><dt>{t('draftLanguage')}</dt><dd>{t(report.language === 'hi' ? 'hindi' : 'english')}</dd></div><div><dt>{t('reportId')}</dt><dd><code>{report.id}</code></dd></div><div><dt>{t('created')}</dt><dd>{date(report.createdAt)}</dd></div></dl>
      <pre className="draft-body" aria-label={t('draftPreview')}>{textValue(report.body)}</pre>
      <div className={`approval-footer ${report.status === 'Approved' ? 'is-approved' : ''}`}>
        {report.status === 'Approved' ? <><CheckCheck size={21} /><p>{t('approvedHint')}</p></> : <><p>{t('approvalHint')}</p><button type="button" className="button primary" onClick={approveReport} disabled={!!reportBusy}>{reportBusy === 'approve' ? <LoaderCircle size={17} className="spin" /> : <Check size={17} />}{t(reportBusy === 'approve' ? 'approving' : 'approve')}</button></>}
      </div>
    </>}
  </section></div>;

  const renderAudit = () => <section className="panel audit-panel"><div className="section-title"><Fingerprint size={19} /><h2>{t('audit')}</h2><span className="count-pill">{selectedCase.timeline?.length || 0}</span></div><p className="section-description">{t('auditHint')}</p>
    {!selectedCase.timeline?.length ? <Empty icon={History} title={t('noAudit')} /> : <ol className="audit-list">{[...selectedCase.timeline].sort((a, b) => new Date(a.at) - new Date(b.at)).map((entry, i) => <li key={entry.id || i}>
      <span className="audit-dot"><Check size={12} /></span><article><div className="audit-event-heading"><h3>{entry.action}</h3><time dateTime={entry.at}>{date(entry.at)}</time></div><div className="audit-result"><span>{t('result')}</span><pre>{textValue(entry.result) || t('notAvailable')}</pre></div><div className="audit-hash"><Fingerprint size={14} /><span>{t('recordedHash')}</span><code>{entry.hash || t('notAvailable')}</code></div></article>
    </li>)}</ol>}
  </section>;

  if (showLanding || (!initializing && !user && !showAuth)) {
    const enterWorkspace = () => {
      if (user) { navigate('#/new'); return; }
      setShowLanding(false);
      setShowAuth(true);
      setTimeout(() => document.getElementById('auth-email')?.focus(), 80);
    };
    return <Landing t={t} language={language} connected={connected} returning={Boolean(user)}
      onToggleLanguage={() => setLanguage(language === 'en' ? 'hi' : 'en')}
      onEnter={enterWorkspace} />;
  }
  return <div className="app-shell">
    <a className="skip-link" href="#main-content">{t('workspace')}</a>
    <aside className="sidebar">
      <div className="brand-row"><a className="brand" href="#/new" aria-label="Cypher"><span className="brand-mark"><Shield size={25} strokeWidth={1.8} /><span /></span><span>cypher<span className="brand-period">.</span></span></a></div>
      <span className="nav-label">{t('workspace')}</span>
      <nav className="primary-nav" aria-label={t('workspace')}><button onClick={() => navigate('#/home')}><House size={18} /><span>{t('home')}</span></button><button className={view === 'new' ? 'active' : ''} onClick={() => navigate('#/new')}><Plus size={18} /><span>{t('investigate')}</span><span className="nav-key">+</span></button><button className={view === 'history' ? 'active' : ''} onClick={() => navigate('#/history')}><History size={18} /><span>{t('history')}</span>{user && <span className="nav-count">{cases.length}</span>}</button></nav>
      <div className="history-heading"><span className="nav-label">{t('cases')}</span>{user && <IconButton label={t('refresh')} onClick={() => refreshHistory().catch(handleError)}><Activity size={14} /></IconButton>}</div>
      <div className="sidebar-cases">{!user ? <div className="sidebar-empty"><LockKeyhole size={21} /><p>{t('signInHistory')}</p></div> : !cases.length ? <div className="sidebar-empty"><MessageSquare size={23} /><strong>{t('noHistory')}</strong><p>{t('noHistoryHint')}</p></div> : cases.map((item) => <button key={item.id} className={`sidebar-case ${selectedId === item.id ? 'selected' : ''}`} onClick={() => navigate(caseHash(item.id))}><span className={`case-status-dot status-${item.status}`} /><div><strong>{item.title || item.id}</strong><span>{shortDate(item.createdAt)} <span>·</span> {t(item.status)}</span></div><ChevronRight size={13} /></button>)}</div>
      <div className="sidebar-bottom"><div className="local-status"><span className="local-status-icon"><ShieldCheck size={19} /></span><div><strong>{t('localWorkspace')}</strong><p>{t('localOnly')}</p></div><span className="status-light" /></div><p>{t('localHint')}</p><div className="sidebar-version"><span>Cypher</span><span>01 / LOCAL</span></div></div>
    </aside>
    <div className="workspace-shell"><header className="topbar"><div className="topbar-left"><nav className="topbar-nav" aria-label={t('workspace')}><button type="button" onClick={() => navigate('#/home')}><House size={16} /><span>{t('home')}</span></button><button type="button" className={view === 'new' ? 'active' : ''} onClick={() => navigate('#/new')}><Plus size={16} /><span>{t('investigate')}</span></button><button type="button" className={view === 'history' || view === 'case' ? 'active' : ''} onClick={() => navigate('#/history')}><History size={16} /><span>{t('history')}</span>{user && <span className="nav-count">{cases.length}</span>}</button></nav><span className="breadcrumb"><Shield size={15} />Cypher<ChevronRight size={13} /><span>{t('workspace')}</span></span></div><div className="topbar-right"><span className={`connection-status ${connected === false ? 'offline' : connected === null ? 'pending' : ''}`} title={t(connected === null ? 'checking' : connected ? 'connected' : 'disconnected')}><span />{t(connected === null ? 'checking' : connected ? 'connected' : 'disconnected')}</span><button className="language-switch" type="button" onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')} aria-label={t('language')}><Languages size={16} /><span>{language === 'en' ? 'EN' : 'हिन्दी'}</span><span className="language-alt">{language === 'en' ? 'हिन्दी' : 'EN'}</span></button><span className="topbar-divider" />{user ? <div className="user-identity" role="group" aria-label={`${t('identity')}: ${user.name}, ${user.email}`} title={`${user.name} · ${user.email}`}><span className="avatar">{user.name?.trim()?.charAt(0)?.toUpperCase() || 'C'}</span><div><strong>{user.name}</strong><span>{user.email}</span></div><IconButton label={t('logout')} onClick={logout} disabled={authBusy}><LogOut size={17} /></IconButton></div> : <button className="topbar-login" onClick={() => { switchAuthMode('login'); document.getElementById('auth-email')?.focus(); }}><LogIn size={16} /><span>{t('login')}</span></button>}</div></header>
      <main id="main-content" className="main-content" tabIndex={-1} ref={mainRef}>
        {error && <div className="error-banner" role="alert"><CircleHelp size={18} /><div><strong>{t('error')}</strong><p>{t(error)}</p></div>{connected === false && <button type="button" className="button ghost small" onClick={() => { setError(null); initialize(); }}>{t('retry')}</button>}<IconButton label={t('dismiss')} onClick={() => setError(null)}><X size={17} /></IconButton></div>}
        {initializing ? <div className="initial-loader" role="status"><span className="brand-mark"><Shield size={27} /></span><LoaderCircle className="spin" size={21} /><p>{t('checking')}</p></div> : !user ? <>
          <div className="page-heading auth-page-heading"><span className="eyebrow"><span className="eyebrow-line" />{t('authEyebrow')}</span><h1>{t('authTitle')}</h1><p>{t('authSubtitle')}</p></div>
          <div className="auth-layout"><section className="panel auth-panel"><div className="auth-tabs" role="group" aria-label={t('login')}><button type="button" className={authMode === 'login' ? 'active' : ''} aria-pressed={authMode === 'login'} onClick={() => switchAuthMode('login')} disabled={authBusy}>{t('login')}</button><button type="button" className={authMode === 'register' ? 'active' : ''} aria-pressed={authMode === 'register'} onClick={() => switchAuthMode('register')} disabled={authBusy}>{t('signup')}</button></div>
            <div className="auth-heading"><span className="icon-tile violet"><Fingerprint size={23} /></span><h2>{t(authMode === 'register' ? 'createAccount' : 'welcome')}</h2><p>{t(authMode === 'register' ? 'registerHint' : 'loginHint')}</p></div>
            <form onSubmit={authenticate}>{authMode === 'register' && <div className="field"><label htmlFor="auth-name">{t('name')}</label><input id="auth-name" name="name" autoComplete="name" placeholder={t('namePlaceholder')} value={auth.name} onChange={(e) => setAuth({ ...auth, name: e.target.value })} required disabled={authBusy} /></div>}<div className="field"><label htmlFor="auth-email">{t('email')}</label><input id="auth-email" name="email" type="email" autoComplete="email" placeholder={t('emailPlaceholder')} value={auth.email} onChange={(e) => setAuth({ ...auth, email: e.target.value })} required disabled={authBusy} /></div><div className="field"><label htmlFor="auth-password">{t('password')}<LockKeyhole size={13} /></label><div className="password-control"><input id="auth-password" name="password" type={showPassword[authMode] ? 'text' : 'password'} autoComplete={authMode === 'register' ? 'new-password' : 'current-password'} minLength={12} placeholder={t('passwordPlaceholder')} value={auth.password[authMode]} onChange={(e) => setAuth(state => ({ ...state, password: { ...state.password, [authMode]: e.target.value } }))} aria-describedby="password-hint" required disabled={authBusy} /><IconButton label={t(showPassword[authMode] ? 'hidePassword' : 'showPassword')} aria-pressed={showPassword[authMode]} onClick={() => setShowPassword(state => ({ ...state, [authMode]: !state[authMode] }))} disabled={authBusy}>{showPassword[authMode] ? <EyeOff size={16} /> : <Eye size={16} />}</IconButton></div><p id="password-hint" className="field-hint">{t('passwordHint')}</p></div><button className="button primary full-width auth-submit" type="submit" disabled={authBusy}>{authBusy ? <LoaderCircle size={18} className="spin" /> : <LogIn size={18} />}{t(authBusy ? 'authenticating' : authMode === 'register' ? 'registerSubmit' : 'loginSubmit')}{!authBusy && <ArrowRight size={17} />}</button></form><div className="auth-foot"><LockKeyhole size={15} /><p>{t('authFoot')}</p></div>
          </section><PrivacyCard t={t} /></div>
          <div className="feature-strip">{[[ShieldCheck, 'featureEvidence', 'featureEvidenceHint'], [Fingerprint, 'featureAudit', 'featureAuditHint'], [FileText, 'featureReports', 'featureReportsHint']].map(([Icon, title, hint], i) => <div key={title}><span className="feature-number">0{i + 1}</span><Icon size={19} /><div><h3>{t(title)}</h3><p>{t(hint)}</p></div></div>)}</div>
        </> : view === 'case' ? <>
          <div className="page-heading case-page-heading"><div><span className="eyebrow">{t('case')} <span className="mono">{selectedId}</span></span><h1>{selectedCase?.title || t('loading')}</h1>{selectedCase && <p className="case-subtitle"><Badge value={selectedCase.status} t={t} /><span>{t('created')} {date(selectedCase.createdAt)}</span><span>{selectedCase.items?.length ?? selectedCase.itemCount ?? 0} {t('messages')}</span></p>}</div><div className="export-buttons"><button type="button" className="button secondary small" onClick={() => downloadExport('json')} disabled={!selectedCase || !!exportBusy}>{exportBusy === 'json' ? <LoaderCircle size={15} className="spin" /> : <FileJson size={15} />}{t('exportJson')}</button><button type="button" className="button secondary small" onClick={() => downloadExport('pdf')} disabled={!selectedCase || !!exportBusy}>{exportBusy === 'pdf' ? <LoaderCircle size={15} className="spin" /> : <ArrowDownToLine size={15} />}{t('exportPdf')}</button></div></div>
          {caseLoading ? <div className="panel case-loader" role="status"><LoaderCircle className="spin" size={25} /><p>{t('loading')}</p></div> : selectedCase ? <>
            {busyCase && <div className="progress-banner" role="status"><Radar size={22} className="radar-pulse" /><div><strong>{t('running')}</strong><p>{t('runningHint')}</p></div><span className="live-indicator"><span /><span /><span /></span></div>}{selectedCase.status === 'failed' && <div className="failure-notice"><CircleHelp size={18} />{t('failedHint')}</div>}
            <div className="detail-tabs" role="tablist" aria-label={t('case')}>{[[Radar, 'overview'], [Search, 'evidence'], [FileText, 'report'], [Fingerprint, 'audit']].map(([Icon, key]) => <button type="button" key={key} id={`tab-${key}`} role="tab" aria-selected={tab === key} aria-controls={`panel-${key}`} tabIndex={tab === key ? 0 : -1} className={tab === key ? 'active' : ''} onClick={() => navigate(caseHash(selectedCase.id, key))} onKeyDown={(event) => { const index = CASE_TABS.indexOf(key); let next; if (event.key === 'ArrowRight') next = CASE_TABS[(index + 1) % 4]; if (event.key === 'ArrowLeft') next = CASE_TABS[(index + 3) % 4]; if (event.key === 'Home') next = CASE_TABS[0]; if (event.key === 'End') next = CASE_TABS[3]; if (next) { event.preventDefault(); navigate(caseHash(selectedCase.id, next)); document.getElementById(`tab-${next}`)?.focus(); } }}><Icon size={17} />{t(key)}{key === 'evidence' && <span>{selectedCase.evidence?.length || 0}</span>}{key === 'report' && report && <span className="report-tab-dot" />}</button>)}</div>
            <div id={`panel-${tab}`} className="tab-content" role="tabpanel" aria-labelledby={`tab-${tab}`}>{tab === 'overview' ? renderOverview() : tab === 'evidence' ? renderEvidence() : tab === 'report' ? renderReport() : renderAudit()}</div>
          </> : <div className="panel"><Empty title={t('notAvailable')} /><button type="button" className="button secondary retry-case" onClick={() => openCase(selectedId, tab)}>{t('retry')}</button></div>}
        </> : view === 'history' ? <>
          <div className="page-heading history-page-heading"><div><span className="eyebrow">{t('personal')}</span><h1>{t('history')}</h1><p>{t('actualCounts')}</p></div><button className="button primary" onClick={() => navigate('#/new')}><Plus size={17} />{t('investigate')}</button></div>
          <section className="panel history-panel"><div className="history-toolbar"><div className="section-title"><History size={18} /><h2>{t('allCases')}</h2><span className="count-pill">{cases.length}</span></div><div className="search-field"><Search size={16} /><label className="sr-only" htmlFor="case-search">{t('searchCases')}</label><input id="case-search" placeholder={t('caseSearchPlaceholder')} value={caseSearch} onChange={(e) => setCaseSearch(e.target.value)} /></div><IconButton label={t('refresh')} onClick={() => refreshHistory().catch(handleError)}><Activity size={17} /></IconButton></div>
            {!filteredCases.length ? <Empty icon={History} title={t(cases.length ? 'noMatches' : 'noHistory')} hint={!cases.length ? t('noHistoryHint') : null} /> : <div className="case-table">{filteredCases.map((item) => <button className="case-table-row" key={item.id} onClick={() => navigate(caseHash(item.id))}><span className="icon-tile violet"><FileText size={18} /></span><div className="case-table-name"><strong>{item.title || item.id}</strong><code>{item.id}</code><small className="history-report-status">{t('report')}: {item.reportStatus ? t(item.reportStatus) : t('noReport')}</small></div><div className="case-table-date"><span>{shortDate(item.createdAt)}</span><small>{item.itemCount} {t('messages')}</small></div><Badge value={item.status} t={t} /><div className="case-table-risk"><Badge value={item.riskLevel} t={t} /><span>{item.score ?? '—'} <small>/ 100</small></span></div><ChevronRight size={17} /></button>)}</div>}
          </section>
        </> : <>
          <div className="page-heading dashboard-heading"><div><span className="eyebrow"><span className="eyebrow-line" />{t('dashboardEyebrow')}</span><h1>{t('dashboardTitle')}</h1><p>{t('dashboardSubtitle')}</p></div><div className="workspace-date"><Clock3 size={14} />{new Date().toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div></div>
          <div className="stats-grid">{stats.map(([Icon, label, count, color]) => <div className="stat-card" key={label}><span className={`icon-tile ${color}`}><Icon size={20} /></span><div><span>{t(label)}</span><strong>{historyLoaded ? String(count).padStart(2, '0') : '—'}</strong></div><span className="stat-corner"><ArrowUpRight size={16} /></span></div>)}</div>
          <div className="agent-layout"><div className="agent-main"><section className="panel intake-panel">
            <div className="agent-welcome"><span className="eyebrow"><span className="eyebrow-line" />{t('consoleEyebrow')}</span><h2>{t('consoleGreeting')}, {user.name} 👋</h2><p>{t('consoleIntro')}</p><p className="agent-ask">{t('consoleAsk')}</p></div>
            <form onSubmit={createInvestigation}><div className="field"><label htmlFor="agent-message">{t('smsLabel')}<LockKeyhole size={13} /></label><textarea id="agent-message" name="agent-message" placeholder={t('smsPlaceholder')} value={messageText} onChange={(e) => setMessageText(e.target.value)} disabled={creating} rows={5} maxLength={5000} /></div>
              <div className="agent-two-up"><div className="field"><label htmlFor="agent-link">{t('linkLabel')}<span className="field-optional">{t('linkOptional')}</span></label><input id="agent-link" name="agent-link" type="text" inputMode="url" placeholder={t('linkPlaceholder')} value={linkText} onChange={(e) => setLinkText(e.target.value)} disabled={creating} maxLength={5000} /></div><div className="field"><label htmlFor="agent-action">{t('actionLabel')}</label><select id="agent-action" name="agent-action" value={userAction} onChange={(e) => setUserAction(e.target.value)} disabled={creating}>{CONSOLE_ACTIONS.map(([value, labelKey]) => <option key={value} value={value}>{t(labelKey)}</option>)}</select></div></div>
              <div className="consent-section"><span className="eyebrow">{t('options')}</span><label className={`consent-row ${!capabilities.network ? 'is-disabled' : ''}`} htmlFor="consent-network"><input id="consent-network" name="consentNetwork" type="checkbox" checked={consentNetwork} onChange={(e) => setConsentNetwork(e.target.checked)} disabled={!capabilities.network || creating} /><Globe2 size={19} /><span><strong>{t('networkConsent')}</strong><small>{t('networkDisclosure')}</small>{!capabilities.network && <em>{t('networkUnavailable')}</em>}</span></label><label className={`consent-row ${!capabilities.ai ? 'is-disabled' : ''}`} htmlFor="consent-ai"><input id="consent-ai" name="consentAI" type="checkbox" checked={consentAI} onChange={(e) => setConsentAI(e.target.checked)} disabled={!capabilities.ai || creating} /><Sparkles size={19} /><span><strong>{t('aiConsent')}</strong><small>{t('aiDisclosure')}</small>{!capabilities.ai && <em>{t('aiUnavailable')}</em>}</span></label></div>
              <div className="intake-submit"><div><LockKeyhole size={14} /><p>{t('localAnalysis')}<span>{t('investigationLanguage')}: {t(language === 'hi' ? 'hindi' : 'english')}</span></p></div><button type="submit" className="button primary" disabled={creating}>{creating ? <LoaderCircle size={17} className="spin" /> : <Radar size={18} />}{t(creating ? 'starting' : 'investigateCta')}{!creating && <ArrowRight size={17} />}</button></div>
            </form>
          </section>
            {selectedCase && <>
              {busyCase && <div className="progress-banner" role="status"><Radar size={22} className="radar-pulse" /><div><strong>{t('running')}</strong><p>{t('runningHint')}</p></div><span className="live-indicator"><span /><span /><span /></span></div>}
              {selectedCase.status === 'failed' && <div className="failure-notice"><CircleHelp size={18} />{t('failedHint')}</div>}
              <section className={`panel agent-results risk-${(selectedCase.riskLevel || 'UNCERTAIN').toLowerCase()}`}>
                <div className="section-title"><Shield size={18} /><h2>{t('resultsTitle')}</h2><code className="agent-case-id">{selectedCase.id}</code><Badge value={selectedCase.status} t={t} /></div>
                <div className="score-row"><div><span className="score">{typeof selectedCase.score === 'number' ? selectedCase.score : '—'}</span><span className="score-denominator">{typeof selectedCase.score === 'number' ? t('outOf') : t('noScore')}</span></div><Badge value={selectedCase.riskLevel} t={t} /></div>
                <div className="score-track" role="img" aria-label={`${t('riskScore')}: ${selectedCase.score ?? t('noScore')}`}><span style={{ width: `${typeof selectedCase.score === 'number' ? Math.max(0, Math.min(100, selectedCase.score)) : 0}%` }} /></div>
                <p className="summary-text">{textValue(selectedCase.summary) || t('noSummary')}</p>
                <div className="agent-result-grid">
                  <div className="agent-result-block"><span className="tiny-label"><ShieldQuestion size={13} />{t('findings')}</span><span className="count-pill">{selectedCase.findings?.length || 0}</span>
                    {selectedCase.findings?.length ? <ul className="agent-findings">{selectedCase.findings.slice(0, 4).map((finding, index) => <li key={finding.id || index}><div><strong>{finding.title}</strong><p>{textValue(finding.reason)}</p></div><Badge value={finding.severity} t={t} /></li>)}</ul> : <p className="agent-empty">{t('noFindings')}</p>}</div>
                  <div className="agent-result-block"><span className="tiny-label"><Search size={13} />{t('evidence')}</span><span className="count-pill">{agentEvidence.length}</span>
                    {agentEvidence.length ? <ul className="agent-chips">{agentEvidence.slice(0, 8).map((entry, index) => <li key={entry.id || index}><ShieldCheck size={12} />{entry.type}</li>)}</ul> : <p className="agent-empty">{t('noEvidence')}</p>}</div>
                  <div className="agent-result-block"><span className="tiny-label"><ClipboardCheck size={13} />{t('nextSteps')}</span>
                    {selectedCase.nextSteps?.length ? <ol className="agent-actions">{selectedCase.nextSteps.map((step, index) => <li key={index}><span>{String(index + 1).padStart(2, '0')}</span><p>{textValue(step)}</p></li>)}</ol> : <p className="agent-empty">{t('noSteps')}</p>}</div>
                  <div className="agent-result-block"><span className="tiny-label"><CircleHelp size={13} />{t('unresolved')}</span>
                    {selectedCase.unresolved?.length ? <ul className="agent-open">{selectedCase.unresolved.map((entry, index) => <li key={index}>{textValue(entry)}</li>)}</ul> : <p className="agent-empty">{t('noneUnresolved')}</p>}</div>
                </div>
                <button type="button" className="button secondary agent-open-case" onClick={() => navigate(caseHash(selectedCase.id))}>{t('openCaseFile')}<ArrowUpRight size={16} /></button>
              </section>
              <section className="panel agent-report">
                <div className="section-title"><FileText size={18} /><h2>{t('prepareReport')}</h2>{report && <Badge value={report.status} t={t} />}</div>
                <p className="section-description">{t('reportHint')}</p>
                <div className="agent-two-up"><div className="field"><label htmlFor="agent-authority">{t('authority')}</label><select id="agent-authority" value={reportTarget} onChange={(e) => setReportTarget(e.target.value)} disabled={!!reportBusy}>{AUTHORITY_IDS.map((id) => <option value={id} key={id}>{t(id)}</option>)}</select></div><div className="field"><label htmlFor="agent-report-language">{t('reportLanguage')}</label><select id="agent-report-language" value={reportLanguage} onChange={(e) => setReportLanguage(e.target.value)} disabled={!!reportBusy}><option value="en">{t('english')}</option><option value="hi">{t('hindi')}</option></select></div></div>
                <button className="button primary full-width" type="button" onClick={generateReport} disabled={!!reportBusy || busyCase}>{reportBusy === 'generate' ? <LoaderCircle size={17} className="spin" /> : <FileText size={17} />}{t(reportBusy === 'generate' ? 'generating' : report ? 'regenerating' : 'generateReport')}</button>
                {busyCase && <p className="field-hint">{t('reportPending')}</p>}
                {report && <div className={`approval-footer ${report.status === 'Approved' ? 'is-approved' : ''}`}>{report.status === 'Approved' ? <><CheckCheck size={21} /><p>{t('approvedHint')}</p></> : <><p>{t('approvalHint')}</p><button type="button" className="button primary" onClick={approveReport} disabled={!!reportBusy}>{reportBusy === 'approve' ? <LoaderCircle size={17} className="spin" /> : <Check size={17} />}{t(reportBusy === 'approve' ? 'approving' : 'approve')}</button></>}</div>}
                <p className="agent-submission"><ShieldCheck size={15} />{t('submissionNotice')}</p>
              </section>
            </>}
          </div><aside className="agent-rail">
            <section className="panel agent-activity">
              <div className="section-title"><Terminal size={18} /><h2>{t('activityTitle')}</h2>{busyCase && <span className="live-indicator"><span /><span /><span /></span>}</div>
              <p className="section-description">{t('activityHint')}</p>
              <ol className="agent-trace">{agentSteps.map(({ key, icon: Icon, step }) => { const state = AGENT_STATES[step.state]; const StateIcon = state.icon; return <li key={key} className={`agent-step ${state.className}`}><span className="agent-step-icon"><Icon size={15} /></span><div className="agent-step-body"><div className="agent-step-head"><h3>{t(key)}</h3><span className="agent-step-state"><StateIcon size={13} className={step.state === 'running' ? 'spin' : undefined} />{step.label || t(state.label)}</span></div>{step.detail && <p>{step.detail}</p>}</div></li>; })}</ol>
            </section>
            <div className="safety-card"><ShieldQuestion size={21} /><div><h3>{t('safeTitle')}</h3><p>{t('safeHint')}</p><ul className="safety-promises"><li className="promises-label">{t('promisesLabel')}</li>{['promise1', 'promise2', 'promise3'].map(key => <li key={key}><Check size={13} /><span>{t(key)}</span></li>)}</ul></div></div>
          </aside></div>
          {!cases.length && <div className="honesty-note"><ShieldCheck size={17} /><strong>{t('emptyNote')}</strong><span>{t('emptyHint')}</span></div>}
        </>}
        <footer className="workspace-footer"><span><Shield size={13} />{t('privacyFooter')}</span><span>Cypher <span className="footer-dot">·</span> {t('localOnly')}</span></footer>
      </main>
    </div>
  </div>;
}

createRoot(document.getElementById('root')).render(<App />);
