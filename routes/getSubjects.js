const express = require('express');
const puppeteer = require('puppeteer');

const router = express.Router();
const URL = 'https://app.powerbi.com/view?r=eyJrIjoiYTMzNmY3ZTgtZDdkNy00M2E2LWFiNGEtNmRlMjhlZjU1ZDliIiwidCI6IjhjMWE4N2NiLTgwYjctNDEzZi05YWU4LTU1YzZhNTM3MDYwNCJ9';

router.get('/getSubjects', async (req, res) => {
    try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto(URL, { waitUntil: 'networkidle2' });
        await page.waitForSelector('#pvExplorationHost');
        const subjects = await page.evaluate(() => {
            let subjectElements = document.querySelectorAll(
                '#pvExplorationHost div.slicer-content-wrapper div.slicerBody div div.scrollbar-inner div div div div span'
            );
            return Array.from(subjectElements).map(el => el.innerText.trim());
        });

        await browser.close();
        res.json({ subjects });
    } catch (error) {
        console.error('Error fetching subjects:', error);
        res.status(500).send('Error fetching subjects');
    }
});

module.exports = router;
