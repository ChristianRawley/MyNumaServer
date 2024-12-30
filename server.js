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

app.get('/getCourses', async (req, res) => {
    try {
        const { subject, term, status, section } = req.query;

        if (!subject || !term || !status || !section) return res.status(400).send('Missing required query parameters');

        const url = `https://slbanformsp1-oc.uafs.edu:8888/banprod/hxskschd.P_ListSchClassSimple?sel_subj=abcde&sel_day=abcde&sel_status=abcde&term=${term}&sel_status=${status}&sel_subj=${subject}&sel_sec=%25${section}&sel_crse=&begin_hh=00&begin_mi=00&end_hh=00&end_mi=00`
        const { data } = await axios.get(url, { httpsAgent });
        const $ = cheerio.load(data);

        let courses = [];

        $('table tbody tr').each((index, element) => {
            if ($(element).find('td').length === 24) {
                const columns = $(element).find('td');
                const status = $(columns[0]).text().trim();
                const crn = $(columns[1]).text().trim();
                const title = $(columns[2]).text().trim();
                const crsNum = $(columns[4]).text().trim();
                const secNum = $(columns[5]).text().trim();
                let meetingTime = $(columns[7]).text().trim() + $(columns[8]).text().trim() + $(columns[9]).text().trim() + $(columns[10]).text().trim() + $(columns[11]).text().trim() + " " + $(columns[14]).text().trim();

                const nextColumn = $(element).next('tr');
                if ($(nextColumn.find('td')[1]).text().length < 2) meetingTime += " & " + $(nextColumn.find('td')[1]).text().trim() + $(nextColumn.find('td')[2]).text().trim() + $(nextColumn.find('td')[3]).text().trim() + $(nextColumn.find('td')[4]).text().trim() + $(nextColumn.find('td')[5]).text().trim() + " " + $(nextColumn.find('td')[8]).text().trim();

                const date = $(columns[15]).text().trim();
                const location = $(columns[16]).text().trim();
                const cap = $(columns[17]).text().trim();
                const act = $(columns[18]).text().trim();
                const rem = $(columns[19]).text().trim();
                const instructor = $(columns[21]).text().trim();
                const weeks = $(columns[22]).text().trim();
                const subject = $(columns[3]).text().trim();

                courses.push({status, crn, title, crsNum, secNum, meetingTime, date, location, cap, act, rem, instructor, weeks, subject });
            }
        });

        res.json(courses);
    } catch (error) {
        console.error('Error scraping classes:', error);
        res.status(500).send('Error scraping classes');
    }
});

app.listen(port, () => console.log(`Server running on port ${port}`));
