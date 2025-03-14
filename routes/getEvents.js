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
            console.log(`Retrying page reload (${attempt}/${retries})...`);
            await delay(3000);
        }
    }
    throw new Error('Page reload failed after multiple attempts');
};

router.get('/getEvents', async (req, res) => {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled']
        });

        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        await page.setViewport({ width: 1280, height: 800 });
        await page.goto('https://uafs.presence.io/events', { waitUntil: 'domcontentloaded', timeout: 15000 });
        
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        await delay(3000);

        await reloadWithRetry(page);

        await page.evaluate(async () => {
            let totalHeight = 0;
            const distance = 100;
            while (totalHeight < document.body.scrollHeight) {
                window.scrollBy(0, distance);
                totalHeight += distance;
                await new Promise(resolve => setTimeout(resolve, 200)); // Pause between scrolls
            }
        });

        await page.waitForFunction(() => {
            return document.querySelectorAll('tile-component .card-header h2 a').length > 0;
        }, { timeout: 15000 });

        const events = await page.evaluate(() => {
            const eventNodes = document.querySelectorAll('tile-component .card-header h2 a');
            return Array.from(eventNodes).map(event => ({
                title: event.innerText.trim(),
            }));
        });

        await browser.close();
        res.json(events);

    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ error: 'Error fetching events' });
        
        if (browser) {
            await browser.close();
        }
    }
});

module.exports = router;