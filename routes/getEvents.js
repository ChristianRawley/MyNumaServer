const express = require('express');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const puppeteer = require('puppeteer-extra');

puppeteer.use(StealthPlugin());
const router = express.Router();

router.get('/getEvents', async (req, res) => {
    try {
        const browser = await puppeteer.launch({headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled']});
        const page = await browser.newPage();

        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        await page.setViewport({ width: 1280, height: 800 });
        await page.goto('https://uafs.presence.io/events', { waitUntil: 'domcontentloaded', timeout: 10000 });

        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        await delay(1000);

        await page.reload({ waitUntil: 'domcontentloaded' });
        
        await page.evaluate(async () => {
            await new Promise(resolve => {
                let totalHeight = 0;
                const distance = 100;
                const timer = setInterval(() => {
                    window.scrollBy(0, distance);
                    totalHeight += distance;

                    if (totalHeight >= document.body.scrollHeight) {
                        clearInterval(timer);
                        resolve();
                    }
                }, 200);
            });
        });

        await page.waitForFunction(() => {
            return document.querySelectorAll('tile-component .card-header h2 a').length > 0;
        }, { timeout: 10000 });

        const events = await page.evaluate(() => {
            const eventNodes = document.querySelectorAll('tile-component .card-header h2 a');
            return Array.from(eventNodes).map(event => ({
                title: event.innerText.trim(),
                link: event.href
            }));
        });

        await browser.close();
        res.json({ events });

    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).send('Error fetching events: ', error);
    }
});

module.exports = router;