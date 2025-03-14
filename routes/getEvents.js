const puppeteer = require('puppeteer');
const express = require('express');
const router = express.Router();

router.get('/getEvents', async (req, res) => {
    try {
        const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();

        await page.goto('https://uafs.presence.io/events', { waitUntil: 'networkidle2' });
        await page.waitForSelector('#main-content > events > ng-outlet > events-tile > div');

        const events = await page.evaluate(() => {
            const eventElements = document.querySelectorAll('#main-content > events > ng-outlet > events-tile > div > div');
            return Array.from(eventElements).map(event => {
                const titleElement = event.querySelector('tile-component div div.card-header.ch-alt h2 a');
                const imageElement = event.querySelector('img');

                return {
                    title: titleElement ? titleElement.innerText.trim() : 'No title',
                    image: imageElement ? imageElement.src : 'No image',
                };
            });
        });

        await browser.close();
        res.json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).send('Error fetching events: ' + error);
    }
});

module.exports = router;
