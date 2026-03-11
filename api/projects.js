export default async function handler(req, res) {
  const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQp9_pxYLw_QzCPomJMZkeaxhPNOe2r37wBi9aaWEJ2tbkjwb0hKoOa2rHMqYqVURJVotvziKB6BaTg/pub?gid=0&single=true&output=csv";
  try {
    const response = await fetch(SHEET_URL);
    const csv = await response.text();
    const lines = csv.trim().split('\n');
    const headers = parseCSVLine(lines[0]);
    const projects = lines.slice(1)
      .map(line => {
        const values = parseCSVLine(line);
        const obj = {};
        headers.forEach((h, i) => { obj[h] = values[i] || ''; });
        return obj;
      })
      .filter(p => p.id && p.id.trim() !== '');
    res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate');
    res.status(200).json({ projects });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load projects' });
  }
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    if (line[i] === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (line[i] === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += line[i];
    }
  }
  result.push(current.trim());
  return result;
}
