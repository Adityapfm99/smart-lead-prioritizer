# Smart Lead Prioritizer: Project Report

## Approach & Rationale
This tool is designed to help sales teams efficiently upload, enrich, prioritize, and export B2B leads. Inspired by SaaSquatchLeads, the focus is on actionable prioritization and seamless workflow integration. The UI is clean, intuitive, and supports filtering, selection, and exporting to CSV or CRM.

## Model Selection
A rule-based scoring model is used for lead prioritization. Each lead is scored based on:
- Email validity
- Industry match (e.g., SaaS prioritized)
- Company size
- Seniority of job title (e.g., VP, Director, Chief, Head)

This approach is transparent, fast, and easy to adapt for business needs. Enrichment is mocked for demo purposes but designed to be replaced with real APIs (LinkedIn, Hunter, Clearbit, etc).

## Data Preprocessing
- CSV parsing and validation (required fields: Name, Email, Company)
- Deduplication by email
- Email format validation
- Mock enrichment: LinkedIn URL, company size, industry

## Performance Evaluation
- Manual validation of top scored leads
- Exported CSV and CRM integration tested for usability
- UI tested for responsiveness and clarity
- No major errors or warnings in codebase

## Value & Business Alignment
- Prioritizes high-impact leads for sales outreach
- Enriched, actionable data for better conversion
- Export features for workflow integration
- UX/UI designed for minimal learning curve

## Model Used
Rule-based scoring (custom logic in backend/main.py)

---

*Note: CRM export is a demo; real implementation should call actual CRM APIs.*
