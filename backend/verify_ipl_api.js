import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.RAPIDAPI_KEY;
const HOST = 'cricket-live-data.p.rapidapi.com';

async function findIPL() {
    try {
        const response = await axios.get(`https://${HOST}/series`, {
            headers: {
                'x-rapidapi-key': API_KEY,
                'x-rapidapi-host': HOST
            }
        });
        
        const series = response.data.results || [];
        const ipl = series.filter(s => s.series_name && s.series_name.toLowerCase().includes('ipl'));
        
        console.log('IPL Series found:', ipl);
        
        if (ipl.length > 0) {
            const seriesId = ipl[0].series_id;
            console.log(`Checking matches for series ID: ${seriesId}`);
            const matchesResponse = await axios.get(`https://${HOST}/fixtures-by-series/${seriesId}`, {
                headers: {
                    'x-rapidapi-key': API_KEY,
                    'x-rapidapi-host': HOST
                }
            });
            console.log('Matches found for IPL:', matchesResponse.data.results?.length || 0);
        }
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

findIPL();
