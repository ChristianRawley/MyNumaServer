const puppeteer = require('puppeteer');
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const screenshotDir = path.join(__dirname, 'public', 'screenshots');

if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
}

router.get('/getScreenshot', async (req, res) => {
    try {
        const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();

        await page.goto('https://uafs.presence.io/events', { waitUntil: 'networkidle2' });

        await page.waitForSelector('#main-content > events', { visible: true, timeout: 30000 });

        const timestamp = Date.now();
        const screenshotFilename = `screenshot_${timestamp}.png`;
        const screenshotPath = path.join(screenshotDir, screenshotFilename);

        await page.screenshot({ path: screenshotPath });

        await browser.close();

        const screenshotUrl = `/screenshots/${screenshotFilename}`;

        res.json({ screenshotUrl });

    } catch (error) {
        console.error('Error taking screenshot:', error);
        res.status(500).send('Error taking screenshot: ' + error);
    }
});

module.exports = router;
