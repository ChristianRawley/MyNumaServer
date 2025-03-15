const express = require('express');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const puppeteer = require('puppeteer-extra');

puppeteer.use(StealthPlugin());
const router = express.Router();

const reloadWithRetry = async (page, retries = 3) => {
    let attempt = 0;
    while (attempt < retries) {
        try {
            await page.reload({ waitUntil: 'domcontentloaded' });
            return;
        } catch (error) {
            attempt++;
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
    }
    throw new Error('Page reload failed after multiple attempts');
};

router.get('/getEvents', async (req, res) => {
    try {
        const browser = await puppeteer.launch({headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled']});
        const page = await browser.newPage();

        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        await page.setViewport({ width: 1280, height: 800 });
        await page.goto('https://uafs.presence.io/events', { waitUntil: 'domcontentloaded', timeout: 15000 });
        await new Promise(resolve => setTimeout(resolve, 2000));
        await reloadWithRetry(page);
        await page.waitForSelector('#main-content > events > ng-outlet > events-tile > div > dir-pagination-controls > ul > li:nth-child(1) > div > button', { visible: true });
        await page.click('#main-content > events > ng-outlet > events-tile > div > dir-pagination-controls > ul > li:nth-child(1) > div > button');
        await new Promise(resolve => setTimeout(resolve, 1000));
        await page.waitForSelector('#main-content > events > ng-outlet > events-tile > div > dir-pagination-controls > ul > li:nth-child(1) > div > ul > li:nth-child(3) > a', { visible: true });
        await page.click('#main-content > events > ng-outlet > events-tile > div > dir-pagination-controls > ul > li:nth-child(1) > div > ul > li:nth-child(3) > a');
        await new Promise(resolve => setTimeout(resolve, 1000));

        await page.waitForFunction(() => {
            return document.querySelectorAll('tile-component .card-header h2 a').length > 0;
        }, { timeout: 15000 });

        const events = await page.evaluate(() => {
            const eventNodes = document.querySelectorAll('tile-component');
            return Array.from(eventNodes).map(event => ({
                title: event.querySelector('.card-header h2 a')?.innerText.trim() || 'No title',
                image: event.querySelector('.featured-org-img-window > div')?.style.backgroundImage.match(/url\(['"]?(.*?)['"]?\)/)?.[1] || 'No image',
                time: event.querySelector('.card-header.ch-alt small:nth-child(4)')?.innerText.trim() || 'No time',
                organization: event.querySelector('.card-header.ch-alt .org-name a')?.innerText.trim() || 'No organization',
                location: event.querySelector('.card-header.ch-alt small.info.ng-binding.ng-scope')?.innerText.trim() || 'No location'
            }));
        });

        await browser.close();
        res.json(events);

    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ error: 'Error fetching events' });
    }
});

module.exports = router;