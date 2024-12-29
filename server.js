const axios = require('axios');
const express = require('express');
const cheerio = require('cheerio');
const https = require('https');
const cors = require('cors');

const app = express();
const port = 3000;
const API_URL = 'https://slbanformsp1-oc.uafs.edu:8888/banprod/hxskschd.FS_P_Schedule';
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

app.use(cors());

app.get('/getTerms', async (req, res) => {
    try {
        const { data } = await axios.get(API_URL, { httpsAgent });
        const $ = cheerio.load(data);
        const terms = $('select[name="term"] option').map((_, el) => ({
            id: $(el).val(),
            name: $(el).text(),
        })).get();
        res.json(terms.filter(term => term.id && term.name));
    } catch (error) {
        console.error('Error fetching terms:', error);
        res.status(500).send('Error fetching terms');
    }
});

app.get('/getSubjects', async (req, res) => {
    try {
        const { data } = await axios.get(API_URL, { httpsAgent });
        const $ = cheerio.load(data);
        const terms = $('select[name="sel_subj"] option').map((_, el) => ({
            id: $(el).val(),
            name: $(el).text(),
        })).get();
        res.json(terms.filter(term => term.id && term.name));
    } catch (error) {
        console.error('Error fetching subjects:', error);
        res.status(500).send('Error fetching subjects');
    }
});

app.listen(port, () => console.log(`Server running on port ${port}`));
