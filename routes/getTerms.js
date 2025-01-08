const axios = require('axios');
const cheerio = require('cheerio');
const https = require('https');

const API_URL = 'https://slbanformsp1-oc.uafs.edu:8888/banprod/hxskschd.FS_P_Schedule';
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

const getTerms = async (req, res) => {
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
};

module.exports = getTerms;
