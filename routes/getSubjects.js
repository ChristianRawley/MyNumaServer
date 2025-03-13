const express = require('express');
const puppeteer = require('puppeteer');

const router = express.Router();
const URL = 'https://app.powerbi.com/view?r=eyJrIjoiYTMzNmY3ZTgtZDdkNy00M2E2LWFiNGEtNmRlMjhlZjU1ZDliIiwidCI6IjhjMWE4N2NiLTgwYjctNDEzZi05YWU4LTU1YzZhNTM3MDYwNCJ9';

router.get('/getSubjects', async (req, res) => {
    let browser;
    try {
        browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto(URL, { waitUntil: 'networkidle2' });
        await page.waitForXPath('/html/body/div[1]/report-embed//span');
        const subjects = await page.evaluate(() => {
            const spans = Array.from(document.querySelectorAll('span'));
            return spans.map(span => span.innerText.trim()).filter(text => text.length > 0);
        });

        console.log('Subjects:', subjects);
        res.json({ subjects });

    } catch (error) {
        console.error('Error fetching subjects:', error);
        res.status(500).send('Error fetching subjects');
    } finally {
        if (browser) await browser.close();
    }
});

module.exports = router;
