import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Match from './src/models/Match.js';
import { getIplSchedule } from './src/controllers/ipl.controller.js';

dotenv.config();

const app = express();

async function test() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const req = {};
        const res = {
            status: function(s) { 
                console.log("Status:", s); 
                return this; 
            },
            json: function(j) { 
                console.log("JSON:", JSON.stringify(j, null, 2)); 
                return this; 
            }
        };

        await getIplSchedule(req, res);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

test();
