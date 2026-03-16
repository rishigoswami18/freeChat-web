import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.RAPIDAPI_KEY;
const HOST = 'cricket-live-data.p.rapidapi.com';

async function checkIplSeries() {
    try {
        const response = await axios.get(`https://${HOST}/series`, {
            headers: {
                'x-rapidapi-key': API_KEY,
                'x-rapidapi-host': HOST
            }
        });
        
        const series = response.data.results || [];
        const iplSeries = series.filter(s => s.series_name.includes('IPL'));
        
        console.log(`Total series found: ${series.length}`);
        console.log('IPL Series found:', JSON.stringify(iplSeries, null, 2));
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkIplSeries();
