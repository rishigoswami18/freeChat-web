import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
console.log("JSON String length:", json?.length);

try {
    const parsed = JSON.parse(json);
    console.log("JSON Parse: SUCCESS");
    console.log("Project ID:", parsed.project_id);
    console.log("Private Key length:", parsed.private_key?.length);
    
    let key = parsed.private_key
        .replace(/\\n/g, '\n')
        .replace(/\r\n/g, '\n')
        .trim();
    
    console.log("Cleaned Key starts with:", key.substring(0, 30));
    console.log("Cleaned Key ends with:", key.substring(key.length - 30));
} catch (e) {
    console.error("JSON Parse: FAILED");
    console.error(e.message);
}
