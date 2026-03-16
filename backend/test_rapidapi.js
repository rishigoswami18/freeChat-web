import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.RAPIDAPI_KEY;
const HOST = 'cricket-live-data.p.rapidapi.com';

async function testRapidAPI() {
    console.log('Testing RapidAPI connection...');
    console.log('Key:', API_KEY ? 'Present' : 'Missing');
    
    try {
        const response = await axios.get(`https://${HOST}/matches-upcoming`, {
            headers: {
                'x-rapidapi-key': API_KEY,
                'x-rapidapi-host': HOST
            }
        });
        
        console.log('Status:', response.status);
        console.log('Response Results Count:', response.data?.results?.length || 0);
        
        if (response.data?.results?.length > 0) {
            console.log('First Match Preview:', JSON.stringify(response.data.results[0], null, 2));
        } else {
            console.log('Full Response:', JSON.stringify(response.data, null, 2));
        }
    } catch (error) {
        console.error('RapidAPI Error:', error.response ? error.response.data : error.message);
    }
}

testRapidAPI();
