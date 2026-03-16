import fs from 'fs';
try {
    let raw = fs.readFileSync('raw_series.json', 'utf16le');
    if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1); // Remove BOM
    const data = JSON.parse(raw);
    const results = data.results || [];
    console.log(`Total results: ${results.length}`);
    const ipl = results.filter(r => JSON.stringify(r).toLowerCase().includes('ipl') || JSON.stringify(r).toLowerCase().includes('premier league'));
    console.log('Filtered Results:', JSON.stringify(ipl, null, 2));
} catch (e) {
    console.log('Error parsing:', e.message);
}
