# Smart Lead Prioritizer Backend

This is the backend API for the Smart Lead Prioritizer tool. It provides endpoints for lead enrichment, scoring, and CRM export.

## Features
- Accepts CSV uploads and enriches lead data
- Rule-based scoring for prioritization
- Mock enrichment (LinkedIn, company size, industry)
- Demo endpoint for CRM export
- CORS enabled for local frontend

## Requirements
- Python 3.10+
- Install dependencies:
  ```bash
  pip install -r requirements.txt
  ```

## Running the Server
Start the FastAPI server with Uvicorn:
```bash
uvicorn main:app --reload
```
The API will be available at `http://127.0.0.1:8000/`

## Endpoints
- `POST /enrich-leads` : Upload CSV, returns enriched and scored leads
- `POST /export-crm` : Export selected leads to CRM (demo only)

## Notes
- Enrichment and CRM export are mocked for demo purposes. Replace with real APIs for production use.
- Example CSV available in `example/test.csv`

---

For more details, see the main project Report.md.
