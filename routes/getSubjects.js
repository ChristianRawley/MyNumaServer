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
        const xpaths = [
            "/html/body/div[1]/report-embed/div/div/div[1]/div/div/div/exploration-container/div/div/docking-container/div/div/div/div/exploration-host/div/div/exploration/div/explore-canvas/div/div[2]/div/div[2]/div[2]/visual-container-repeat/visual-container[5]/transform/div/div[3]/div/div/visual-modern/div/div/div[2]/div/div[2]/div/div[1]/div/div/div[1]/div/span",
            "/html/body/div[1]/report-embed/div/div/div[1]/div/div/div/exploration-container/div/div/docking-container/div/div/div/div/exploration-host/div/div/exploration/div/explore-canvas/div/div[2]/div/div[2]/div[2]/visual-container-repeat/visual-container[5]/transform/div/div[3]/div/div/visual-modern/div/div/div[2]/div/div[2]/div/div[1]/div/div/div[2]/div/span",
            "/html/body/div[1]/report-embed/div/div/div[1]/div/div/div/exploration-container/div/div/docking-container/div/div/div/div/exploration-host/div/div/exploration/div/explore-canvas/div/div[2]/div/div[2]/div[2]/visual-container-repeat/visual-container[5]/transform/div/div[3]/div/div/visual-modern/div/div/div[2]/div/div[2]/div/div[1]/div/div/div[4]/div/span"
        ];

        const subjects = [];

        for (let xpath of xpaths) {
            const [element] = await page.$x(xpath);
            if (element) {
                const text = await page.evaluate(el => el.innerText.trim(), element);
                subjects.push(text);
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
