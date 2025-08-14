export function validateLeads(leads: any[]): number[] {
  const invalid: number[] = [];
  leads.forEach((lead, idx) => {
    if (!lead.Email || !lead.Name || !lead.Company) invalid.push(idx);
  });
  return invalid;
}

export function parseCSV(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    import('papaparse').then(Papa => {
      Papa.parse(file, {
        header: true,
        complete: (results: any) => resolve(results.data),
        error: (err: any) => reject(err)
      });
    });
  });
}