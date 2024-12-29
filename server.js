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

// Helper function to generate the URL based on the four main parameters
function generateUrl({ selectedSubject, selectedTerm, selectedStatus, selectedSection }) {
    return `https://slbanformsp1-oc.uafs.edu:8888/banprod/hxskschd.P_ListSchClassSimple?sel_subj=${selectedSubject}&sel_day=%25%25&sel_status=%25${selectedStatus}&term=${selectedTerm}&sel_status=%25${selectedStatus}&sel_subj=${selectedSubject}&sel_sec=%25${selectedSection}&sel_crse=%25&begin_hh=00&begin_mi=00&end_hh=00&end_mi=00`;
}

// Route to scrape classes based on dynamic query parameters
app.get('/scrapeClasses', async (req, res) => {
    try {
        const { selectedSubject, selectedTerm, selectedStatus, selectedSection } = req.query;

        // Ensure all required parameters are provided
        if (!selectedSubject || !selectedTerm || !selectedStatus || !selectedSection) {
            return res.status(400).send('Missing required query parameters');
        }

        // Generate the URL with the provided parameters
        const url = generateUrl({
            selectedSubject,
            selectedTerm,
            selectedStatus,
            selectedSection
        });

        // Fetch the page and scrape it
        const { data } = await axios.get(url, { httpsAgent });
        const $ = cheerio.load(data);

        // Initialize an array to hold the course objects
        let courses = [];

        // Loop through each table row and scrape the course data
        $('table tbody tr').each((index, element) => {
            if ($(element).find('td').length === 24) {  // Ensure it has the expected number of columns
                const columns = $(element).find('td');
                
                const status = $(columns[0]).text().trim();
                const crn = $(columns[1]).text().trim();
                const title = $(columns[2]).text().trim();
                const crsNum = $(columns[4]).text().trim();
                const secNum = $(columns[5]).text().trim();
                let meetingTime = $(columns[7]).text().trim() + $(columns[8]).text().trim() + $(columns[9]).text().trim() +
                                  $(columns[10]).text().trim() + $(columns[11]).text().trim() + " " + $(columns[14]).text().trim();

                // If there is a next row with more meeting time data, append it
                const nextColumn = $(element).next('tr');
                if ($(nextColumn.find('td')[1]).text().length < 2) {
                    meetingTime += " & " + $(nextColumn.find('td')[1]).text().trim() +
                                    $(nextColumn.find('td')[2]).text().trim() +
                                    $(nextColumn.find('td')[3]).text().trim() +
                                    $(nextColumn.find('td')[4]).text().trim() +
                                    $(nextColumn.find('td')[5]).text().trim() + " " + $(nextColumn.find('td')[8]).text().trim();
                }

                const date = $(columns[15]).text().trim();
                const location = $(columns[16]).text().trim();
                const cap = $(columns[17]).text().trim();
                const act = $(columns[18]).text().trim();
                const rem = $(columns[19]).text().trim();
                const instructor = $(columns[21]).text().trim();
                const weeks = $(columns[22]).text().trim();

                // Push the course data into the courses array
                courses.push({
                    status,
                    crn,
                    title,
                    crsNum,
                    secNum,
                    meetingTime,
                    date,
                    location,
                    cap,
                    act,
                    rem,
                    instructor,
                    weeks 
                });
            }
        });

        // Send the scraped data as JSON response
        res.json(courses);
    } catch (error) {
        console.error('Error scraping classes:', error);
        res.status(500).send('Error scraping classes');
    }
});

app.listen(port, () => console.log(`Server running on port ${port}`));
