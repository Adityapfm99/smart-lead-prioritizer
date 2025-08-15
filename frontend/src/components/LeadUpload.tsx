import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import StarIcon from '@mui/icons-material/Star';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import OutlinedInput from '@mui/material/OutlinedInput';
import { validateLeads } from '../utils/csvUtils';
import '../style/LeadUpload.css';

interface Lead {
  [key: string]: string;
}

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/enrich-leads';

const columns = [
  { key: 'Name', label: 'Name' },
  { key: 'Email', label: 'Email' },
  { key: 'Title', label: 'Title' },
  { key: 'Company', label: 'Company' },
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'industry', label: 'Industry' },
  { key: 'score', label: 'Score' },
];

const industryOptions = ['SaaS', 'Finance', 'Healthcare', 'Retail', 'Education'];

const LeadUpload: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editKey, setEditKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [scoreMin] = useState<string>('');
  const [scoreMax] = useState<string>('');
  const [titleFilter] = useState<string>('');
  const [companyFilter] = useState<string>('');
  const [invalidRows, setInvalidRows] = useState<number[]>([]);
  const [bulkSelect, setBulkSelect] = useState<number[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteIdx, setDeleteIdx] = useState<number | null>(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFile = async (file: File) => {
    // Send file to FastAPI backend
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to enrich leads.');
      const data = await response.json();
      setLeads(data.leads);
      setError(null);
      setInvalidRows(validateLeads(data.leads));
    } catch (err: any) {
      setError(err.message || 'Error uploading file.');
      setLeads([]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setError('Only CSV files are allowed.');
      return;
    }
    // Always send file to backend for enrichment
    handleFile(file);
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragleave') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  // Filtering and sorting
  const multiIndustry = filter === 'all' ? [] : filter.split(',').map(f => f.trim().toLowerCase()).filter(Boolean);

  const filteredLeads = leads.filter(lead => {
    // Multi-industry filter
    if (multiIndustry.length > 0 && !multiIndustry.includes((lead.industry || '').toLowerCase())) return false;
    // Search box: match any field
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      const match = (
        (lead.Name || '').toLowerCase().includes(searchLower) ||
        (lead.Title || '').toLowerCase().includes(searchLower) ||
        (lead.Company || '').toLowerCase().includes(searchLower) ||
        (lead.Email || '').toLowerCase().includes(searchLower) ||
        (lead.industry || '').toLowerCase().includes(searchLower) ||
        (lead.score || '').toLowerCase().includes(searchLower)
      );
      if (!match) return false;
    }
    // ...other filters (score, etc.) if needed...
    return true;
  })
    .filter(lead => {
      if (scoreMin && Number(lead.score) < Number(scoreMin)) return false;
      if (scoreMax && Number(lead.score) > Number(scoreMax)) return false;
      return true;
    })
    .filter(lead => {
      if (!titleFilter.trim()) return true;
      return (lead.Title || '').toLowerCase().includes(titleFilter.toLowerCase());
    })
    .filter(lead => {
      if (!companyFilter.trim()) return true;
      return (lead.Company || '').toLowerCase().includes(companyFilter.toLowerCase());
    });

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('desc');
    }
  };

  const sortedLeads = [...filteredLeads].sort((a, b) => {
    let aVal = a[sortBy] || '';
    let bVal = b[sortBy] || '';
    if (sortBy === 'score') {
      const aNum = Number(aVal);
      const bNum = Number(bVal);
      return sortOrder === 'asc' ? aNum - bNum : bNum - aNum;
    }
    return sortOrder === 'asc'
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal));
  });

  const handleEdit = (idx: number, key: string, value: string) => {
    setEditIdx(idx);
    setEditKey(key);
    setEditValue(value);
  };

  const handleEditSave = (idx: number) => {
    if (editIdx !== null && editKey) {
      // Find the index in the original leads array, not sortedLeads
      const updated = leads.map((lead, i) => {
        if (i === editIdx) {
          const newLead = { ...lead, [editKey]: editValue };
          return enrichLeadLocal(newLead);
        }
        return lead;
      });
      setLeads(updated);
      setEditIdx(null);
      setEditKey(null);
      setEditValue('');
      alert('Update successfully!');
    }
  };

  // Local enrichment function (mock, similar to backend)
  function enrichLeadLocal(lead: Lead): Lead {
    const newLead = { ...lead };
    newLead['linkedin'] = `linkedin.com/in/${(newLead['Name'] || '').replace(/\s+/g, '').toLowerCase()}`;
    newLead['companySize'] = ['1-10', '11-50', '51-200', '201-500', '500+'][Math.abs((newLead['Name'] || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % 5];
    newLead['industry'] = ['SaaS', 'Finance', 'Healthcare', 'Retail', 'Education'][Math.abs((newLead['Email'] || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % 5];
    newLead['emailValid'] = /[^@]+@[^@]+\.[^@]+/.test(newLead['Email'] || '') ? 'true' : 'false';
    let score = 0;
    if (newLead['emailValid'] === 'true') score += 10;
    if (newLead['industry'] === 'SaaS') score += 10;
    if (newLead['companySize'] === '500+') score += 5;
    if (newLead['Title'] && ['director', 'vp', 'chief', 'head'].some(t => newLead['Title'].toLowerCase().includes(t))) score += 10;
    newLead['score'] = String(score);
    return newLead;
  }

  const handleEditCancel = () => {
    setEditIdx(null);
    setEditKey(null);
    setEditValue('');
  };

  const handleDelete = (idx: number) => {
    setDeleteIdx(idx);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deleteIdx !== null) {
      const updated = [...leads];
      updated.splice(deleteIdx, 1);
      setLeads(updated);
      setDeleteDialogOpen(false);
      setDeleteIdx(null);
    }
  };

  const handleBulkDelete = () => {
    setBulkDeleteDialogOpen(true);
  };

  const confirmBulkDelete = () => {
    setLeads(leads.filter((_, idx) => !bulkSelect.includes(idx)));
    setBulkSelect([]);
    setBulkDeleteDialogOpen(false);
  };

  // Chart data for analytics (should follow filteredLeads)
  const industryCounts = ['SaaS', 'Finance', 'Healthcare', 'Retail', 'Education'].map(ind => ({
    industry: ind,
    count: filteredLeads.filter(l => l.industry === ind).length
  }));

  // Summary calculation
  const totalLeads = filteredLeads.length;
  const avgScore = totalLeads > 0 ? (filteredLeads.reduce((sum, l) => sum + Number(l.score ?? 0), 0) / totalLeads).toFixed(1) : '0';

  // Export to CSV
  const handleExport = () => {
    let exportLeads;
    if (bulkSelect.length > 0) {
      exportLeads = bulkSelect.map(idx => leads[idx]).filter(Boolean);
    } else {
      exportLeads = sortedLeads;
    }
    if (exportLeads.length === 0) {
      setError('No leads match the current filter.');
      return;
    }
    const csv = Papa.unparse(exportLeads);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const dateStr = new Date().toISOString().slice(0,10).replace(/-/g, '');
    const a = document.createElement('a');
    a.href = url;
    a.download = `export_leads_${dateStr}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Add handler for clear option
  const handleIndustryChange = (e: any) => {
    const selected = typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value;
    if (selected.includes('clear')) {
      setFilter('all');
    } else {
      setFilter(selected.length ? selected.join(',') : 'all');
    }
  };

  return (
    <div className="lead-upload-container">
      <div
        className={`dropzone${dragActive ? ' active' : ''}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          style={{ display: 'none' }}
          onChange={handleFileUpload}
        />
        <div className="dropzone-content">
          <svg width="48" height="48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="48" rx="12" fill="#e3f0ff" />
            <path d="M24 14v14m0 0l-5-5m5 5l5-5" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="dropzone-title">Drag & drop your CSV file here</p>
          <p className="dropzone-sub">or <span className="browse-link">browse</span> to upload</p>
        </div>
      </div>
      {leads.length > 0 && (
        <div className="lead-summary">
          <div className="summary-box">
            <div>
              <span className="summary-label">Total Leads:</span>
              <span className="summary-value">{totalLeads}</span>
            </div>
            <div>
              <span className="summary-label">Average Score:</span>
              <span className="summary-value">{avgScore}</span>
            </div>
            <div>
              <span className="summary-label">Industry Breakdown:</span>
              <span className="summary-value">
                {['SaaS', 'Finance', 'Healthcare', 'Retail', 'Education'].map(ind => {
                  const count = filteredLeads.filter(l => l.industry === ind).length;
                  return count > 0 ? (
                    <span key={ind} className="badge badge-industry" style={{ marginRight: 6 }}>{ind}: {count}</span>
                  ) : null;
                })}
              </span>
            </div>
          </div>
        </div>
      )}
      {leads.length > 0 && (
        <div className="lead-chart" style={{ marginBottom: '2.5rem' }}>
          <strong style={{ display: 'block', marginBottom: '1rem' }}>Industry Analytics:</strong>
          <div className="bar-chart">
            {industryCounts.filter(({count}) => count > 0).map(({ industry, count }) => (
              <div key={industry} className="bar-item" style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <div className="bar-label" style={{ minWidth: '90px', fontWeight: 600 }}>{industry}</div>
                <div className="bar-outer" style={{ flex: 1, background: '#e3f0ff', borderRadius: '8px', height: '22px', margin: '0 12px', position: 'relative' }}>
                  <div className="bar-inner" style={{ width: `${count * 30}px`, height: '100%', background: '#3b82f6', borderRadius: '8px', transition: 'width 0.3s' }}></div>
                  <span className="bar-count" style={{ position: 'absolute', right: '8px', top: '2px', color: '#222e3c', fontWeight: 700 }}>{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {leads.length > 0 && (
        <div className="lead-controls" style={{
          display: leads.length ? 'flex' : 'none',
          marginTop: '2.5rem', // Add space above controls
          marginBottom: '2.5rem',
          alignItems: 'center',
          gap: '1.5rem',
          flexWrap: 'wrap',
          justifyContent: 'center',
          padding: '1.5rem 0 0 0', // Extra top padding for separation
          background: 'transparent',
          borderRadius: '12px',
          boxShadow: 'none',
        }}>
          <FormControl sx={{ minWidth: 320, background: '#f7fafc', borderRadius: 2 }}>
            <InputLabel id="industry-multi-label">Industry</InputLabel>
            <Select
              labelId="industry-multi-label"
              multiple
              value={multiIndustry}
              onChange={handleIndustryChange}
              input={<OutlinedInput label="Industry" sx={{ height: 48, background: '#f7fafc', borderRadius: 2 }} />}
              renderValue={selected => (
                <span style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                  {(selected as string[]).map(s => (
                    <span key={s} style={{display: 'inline-flex', alignItems: 'center', background: '#e0e7ff', color: '#3730a3', borderRadius: '8px', padding: '2px 8px', fontWeight: 600}}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                      <span
                        style={{marginLeft: '6px', cursor: 'pointer', color: '#e53e3e', fontWeight: 700}}
                        onClick={e => {
                          e.stopPropagation();
                          const filtered = (selected as string[]).filter(val => val !== s);
                          setFilter(filtered.length ? filtered.join(',') : 'all');
                        }}
                        title={`Remove ${s.charAt(0).toUpperCase() + s.slice(1)}`}
                      >✕</span>
                    </span>
                  ))}
                </span>
              )}
              label="Industry"
              sx={{ minWidth: 320 }}
              MenuProps={{ PaperProps: { style: { minWidth: 320 } } }}
            >
              <MenuItem disableRipple style={{ display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #e2e8f0', paddingBottom: 8 }}>
                <span
                  style={{ color: '#2563eb', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                  onClick={e => {
                    e.stopPropagation();
                    setFilter(industryOptions.map(opt => opt.toLowerCase()).join(','));
                  }}
                >
                  <span style={{fontSize: '1.2em'}}>＋</span> Select All
                </span>
                <span
                  style={{ color: '#e53e3e', fontWeight: 600, cursor: 'pointer', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}
                  onClick={e => {
                    e.stopPropagation();
                    setFilter('all');
                  }}
                >
                  <DeleteIcon style={{fontSize: '1.2em'}} /> Clear All
                </span>
              </MenuItem>
              {industryOptions.map(opt => (
                <MenuItem key={opt} value={opt.toLowerCase()} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="checkbox"
                    checked={multiIndustry.includes(opt.toLowerCase())}
                    readOnly
                    style={{ marginRight: 8 }}
                  />
                  {opt}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 320, background: '#f7fafc', borderRadius: 2 }}>
            <InputLabel htmlFor="lead-search-input">Search Leads</InputLabel>
            <OutlinedInput
              id="lead-search-input"
              type="text"
              className="search-input"
              placeholder="Search leads (name, title, company, score, etc.)..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              sx={{ height: 48, background: '#f7fafc', borderRadius: 2, fontSize: '1rem', minWidth: 320 }}
            />
          </FormControl>
          <div className="bulk-actions" style={{display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.5rem'}}>
            <button
              className="export-btn"
              onClick={handleExport}
              style={{ padding: '0.5rem 1.2rem', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '1rem', background: '#e3f0ff', color: '#222e3c', fontWeight: 600, cursor: 'pointer' }}
              title="Export filtered leads to CSV"
              onMouseOver={e => e.currentTarget.style.background = '#bcdcff'}
              onMouseOut={e => e.currentTarget.style.background = '#e3f0ff'}
            >
              Export CSV
            </button>
            {bulkSelect.length > 0 && (
              <button
                className="export-btn"
                onClick={handleBulkDelete}
                style={{ padding: '0.5rem 1.2rem', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '1rem', background: '#fff', color: '#e53e3e', fontWeight: 600, cursor: 'pointer' }}
                title="Delete selected leads"
                onMouseOver={e => e.currentTarget.style.background = '#fee2e2'}
                onMouseOut={e => e.currentTarget.style.background = '#fff'}
              >
                Delete Selected
                <DeleteIcon style={{marginLeft: 6}} />
              </button>
            )}
            <button
              className="export-btn"
              onClick={async () => {
                const selectedLeads = bulkSelect.length > 0
                  ? bulkSelect.map(idx => sortedLeads[idx]).filter(Boolean)
                  : sortedLeads;
                if (selectedLeads.length === 0) return;
                try {
                  const res = await fetch('http://127.0.0.1:8000/export-crm', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ leads: selectedLeads })
                  });
                  if (res.ok) {
                    alert('Leads exported to CRM! (Note: This is a demo, actual implementation should call the real CRM API)');
                  } else {
                    alert('Failed to export to CRM.');
                  }
                } catch {
                  alert('Failed to export to CRM.');
                }
              }}
              disabled={sortedLeads.length === 0}
              style={{ padding: '0.5rem 1.2rem', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '1rem', background: '#e3f0ff', color: '#222e3c', fontWeight: 600, cursor: sortedLeads.length === 0 ? 'not-allowed' : 'pointer' }}
              title="Export filtered or selected leads to CRM"
              onMouseOver={e => { if (sortedLeads.length > 0) e.currentTarget.style.background = '#bcdcff'; }}
              onMouseOut={e => { if (sortedLeads.length > 0) e.currentTarget.style.background = '#e3f0ff'; }}
            >
              Export to CRM
            </button>
          </div>
        </div>
      )}
      {error && <div className="error">{error}</div>}
      {sortedLeads.length > 0 && (
        <div className="table-container responsive-table">
          <table className="lead-table">
            <thead>
              <tr>
                <th style={{ position: 'sticky', top: 0, background: '#e3f0ff', zIndex: 10 }}>
                  <input type="checkbox" onChange={e => {
                    if (e.target.checked) setBulkSelect(sortedLeads.map((_, idx) => idx));
                    else setBulkSelect([]);
                  }} />
                </th>
                {columns.map(col => (
                  <th key={col.key} style={{ position: 'sticky', top: 0, background: '#e3f0ff', zIndex: 10, boxShadow: '0 2px 6px rgba(164,200,240,0.08)' }} onClick={() => handleSort(col.key)}>
                    {col.label}
                    {sortBy === col.key && (
                      sortOrder === 'asc' ? <ArrowUpwardIcon className="sort-icon" /> : <ArrowDownwardIcon className="sort-icon" />
                    )}
                  </th>
                ))}
                <th style={{ position: 'sticky', top: 0, background: '#e3f0ff', zIndex: 10 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedLeads.map((lead, idx) => {
                const originalIdx = leads.findIndex(l => l === lead);
                return (
                  <tr key={idx} className={Number(lead.score) >= 20 ? 'top-lead' : invalidRows.includes(originalIdx) ? 'invalid-row' : ''}>
                    <td>
                      <input type="checkbox" checked={bulkSelect.includes(originalIdx)} onChange={e => {
                        if (e.target.checked) setBulkSelect([...bulkSelect, originalIdx]);
                        else setBulkSelect(bulkSelect.filter(i => i !== originalIdx));
                      }} />
                    </td>
                    {columns.map(col => (
                      <td key={col.key} onDoubleClick={() => handleEdit(originalIdx, col.key, lead[col.key] || '')}>
                        {editIdx === originalIdx && editKey === col.key ? (
                          <>
                            <input
                              type="text"
                              value={editValue}
                              onChange={e => setEditValue(e.target.value)}
                              onBlur={() => handleEditSave(originalIdx)}
                              autoFocus
                              className="edit-input"
                            />
                            <button className="edit-btn" onClick={() => handleEditSave(originalIdx)}>Save</button>
                            <button className="edit-btn" onClick={handleEditCancel}>Cancel</button>
                          </>
                        ) : col.key === 'Email' ? (
                          <>
                            {lead.Email}
                            <span className={`badge ${lead.emailValid === 'true' ? 'badge-valid' : 'badge-invalid'}`}>{lead.emailValid === 'true' ? 'Valid' : 'Invalid'}</span>
                          </>
                        ) : col.key === 'industry' ? (
                          <span className="badge badge-industry">{lead.industry}</span>
                        ) : col.key === 'score' ? (
                          <>
                            {Number(lead.score) >= 20 ? <StarIcon className="star-icon" titleAccess="Top scoring lead" /> : null}
                            {lead.score}
                          </>
                        ) : (
                          lead[col.key]
                        )}
                      </td>
                    ))}
                    <td>
                      <button className="row-action-btn" title="Delete lead" onClick={() => handleDelete(originalIdx)}><DeleteIcon /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Lead</DialogTitle>
        <DialogContent>Are you sure you want to delete this lead?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">Cancel</Button>
          <Button onClick={confirmDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={bulkDeleteDialogOpen} onClose={() => setBulkDeleteDialogOpen(false)}>
        <DialogTitle>Delete Selected Leads</DialogTitle>
        <DialogContent>Are you sure you want to delete all selected leads?</DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkDeleteDialogOpen(false)} color="primary">Cancel</Button>
          <Button onClick={confirmBulkDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default LeadUpload;