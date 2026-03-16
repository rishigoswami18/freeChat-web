import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.RAPIDAPI_KEY;
const HOST = 'cricket-live-data.p.rapidapi.com';

async function checkStructure() {
    try {
        const response = await axios.get(`https://${HOST}/series`, {
            headers: {
                'x-rapidapi-key': API_KEY,
                'x-rapidapi-host': HOST
            }
        });
        
        if (response.data.results && response.data.results.length > 0) {
            console.log('Structure of first item:', JSON.stringify(response.data.results[0], null, 2));
        } else {
            console.log('No results found or different structure:', response.data);
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkStructure();
