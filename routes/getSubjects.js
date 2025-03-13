const express = require('express');
const puppeteer = require('puppeteer');

const router = express.Router();
const URL = 'https://app.powerbi.com/view?r=eyJrIjoiYTMzNmY3ZTgtZDdkNy00M2E2LWFiNGEtNmRlMjhlZjU1ZDliIiwidCI6IjhjMWE4N2NiLTgwYjctNDEzZi05YWU4LTU1YzZhNTM3MDYwNCJ9';

router.get('/getSubjects', async (req, res) => {
    let browser;
    try {
        console.log('Launching Puppeteer...');
        browser = await puppeteer.launch({ headless: false, slowMo: 50 });
        const page = await browser.newPage();
        console.log(`Navigating to ${URL}...`);
        await page.goto(URL, { waitUntil: 'networkidle2', timeout: 60000 });
        console.log('Waiting for report to load...');
        await page.waitForTimeout(5000);
        const firstXPath = "/html/body/div[1]/report-embed//span";
        try {
            await page.waitForXPath(firstXPath, { timeout: 10000 });
            console.log('Target elements detected!');
        } catch (e) {
            console.log('Timeout waiting for elements. Exiting.');
            return res.status(500).send('Elements did not load in time.');
        }
        const xpaths = [
            "/html/body/div[1]/report-embed/div/div/div[1]/div/div/div/exploration-container/div/div/docking-container/div/div/div/div/exploration-host/div/div/exploration/div/explore-canvas/div/div[2]/div/div[2]/div[2]/visual-container-repeat/visual-container[5]/transform/div/div[3]/div/div/visual-modern/div/div/div[2]/div/div[2]/div/div[1]/div/div/div[1]/div/span",
            "/html/body/div[1]/report-embed/div/div/div[1]/div/div/div/exploration-container/div/div/docking-container/div/div/div/div/exploration-host/div/div/exploration/div/explore-canvas/div/div[2]/div/div[2]/div[2]/visual-container-repeat/visual-container[5]/transform/div/div[3]/div/div/visual-modern/div/div/div[2]/div/div[2]/div/div[1]/div/div/div[2]/div/span",
            "/html/body/div[1]/report-embed/div/div/div[1]/div/div/div/exploration-container/div/div/docking-container/div/div/div/div/exploration-host/div/div/exploration/div/explore-canvas/div/div[2]/div/div[2]/div[2]/visual-container-repeat/visual-container[5]/transform/div/div[3]/div/div/visual-modern/div/div/div[2]/div/div[2]/div/div[1]/div/div/div[4]/div/span"
        ];

        const subjects = [];

        for (let xpath of xpaths) {
            console.log(`Checking XPath: ${xpath}`);
            const [element] = await page.$x(xpath);
            if (element) {
                const text = await page.evaluate(el => el.innerText.trim(), element);
                console.log(`Found subject: ${text}`);
                subjects.push(text);
            } else {
                console.log(`Element not found for XPath: ${xpath}`);
            }
        }

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
