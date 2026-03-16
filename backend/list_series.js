import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.RAPIDAPI_KEY;
const HOST = 'cricket-live-data.p.rapidapi.com';

async function listSeries() {
    try {
        const response = await axios.get(`https://${HOST}/series`, {
            headers: {
                'x-rapidapi-key': API_KEY,
                'x-rapidapi-host': HOST
            }
        });
        
        const series = response.data.results || [];
        console.log('Total series:', series.length);
        console.log('Sample series (Top 20):');
        series.slice(0, 20).forEach(s => {
            console.log(`- ${s.series_name} (ID: ${s.series_id}, Season: ${s.season})`);
        });
    } catch (error) {
        console.error('Error:', error.message);
    }
}

listSeries();
