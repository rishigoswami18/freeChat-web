import fs from 'fs';
try {
    const data = fs.readFileSync('raw_series.json', 'utf16le');
    console.log(data.substring(0, 1000));
} catch (e) {
    console.log('UTF-16 failed, trying default...');
    const data = fs.readFileSync('raw_series.json', 'utf8');
    console.log(data.substring(0, 1000));
}
