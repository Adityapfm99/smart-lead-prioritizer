# Smart Lead Prioritizer

A modern lead management tool for sales teams. Upload, enrich, prioritize, and export B2B leads with a clean, intuitive interface.

## Features
- Upload CSV leads and enrich with mock data
- Rule-based scoring for prioritization
- Filter, search, and select leads
- Export to CSV or CRM (demo)
- Responsive, user-friendly UI

## Project Structure
- `backend/` — FastAPI backend for enrichment, scoring, and CRM export
- `frontend/` — React frontend for UI and lead management
- `Report.md` — Project rationale, approach, and evaluation

## Getting Started

### Backend
1. Install Python 3.10+
2. Install dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```
3. Run server:
   ```bash
   uvicorn backend.main:app --reload
   ```

### Frontend
1. Install Node.js (v18+ recommended)
2. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
3. Run frontend:
   ```bash
   npm start
   ```

## Usage
- Upload a CSV file of leads in the frontend
- Leads are enriched and scored by the backend
- Filter, search, select, and export leads as needed

## Notes
- CRM export is a demo; replace with real API for production
- Data enrichment uses mock logic for demonstration

## Documentation
- See `Report.md` for approach, model, and evaluation
- See `backend/README.md` and `frontend/README.md` for details

---


