const puppeteer = require('puppeteer');
const express = require('express');
const router = express.Router();

const URL = 'https://app.powerbi.com/view?r=eyJrIjoiYTMzNmY3ZTgtZDdkNy00M2E2LWFiNGEtNmRlMjhlZjU1ZDliIiwidCI6IjhjMWE4N2NiLTgwYjctNDEzZi05YWU4LTU1YzZhNTM3MDYwNCJ9';
const SUBJECT_SELECTOR = '#pvExplorationHost > div > div > exploration > div > explore-canvas > div > div.canvasFlexBox > div > div.displayArea.disableAnimations.fitToPage > div.visualContainerHost.visualContainerOutOfFocus > visual-container-repeat > visual-container:nth-child(5) > transform > div > div.visualContent > div > div > visual-modern > div > div > div.slicer-content-wrapper > div > div.slicerBody > div > div.scrollbar-inner.scroll-content.scroll-scrolly_visible > div > div > span';

const filterSubjects = (subjects) => {
    return subjects.filter(subject => subject.trim() !== "" && subject.includes("UAFS"));
};

router.get('/getSubjects', async (req, res) => {
    try {
        const browser = await puppeteer.launch({headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox']});
        const page = await browser.newPage();
        
        await page.goto(URL, { waitUntil: 'networkidle2' });
        await page.waitForSelector(SUBJECT_SELECTOR);
        
        const subjects = await page.$$eval(SUBJECT_SELECTOR, spans => 
            spans.map(span => span.innerText.trim())
        );

        const filteredSubjects = filterSubjects(subjects);

        await browser.close();
        res.json(filteredSubjects);
    } catch (error) {
        console.error('Error fetching subjects:', error);
        res.status(500).send(`Error fetching subjects: ${error.message}`);
    }
});

module.exports = router;