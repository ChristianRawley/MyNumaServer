const puppeteer = require('puppeteer');
const express = require('express');
const router = express.Router();

const URL = 'https://app.powerbi.com/view?r=eyJrIjoiYTMzNmY3ZTgtZDdkNy00M2E2LWFiNGEtNmRlMjhlZjU1ZDliIiwidCI6IjhjMWE4N2NiLTgwYjctNDEzZi05YWU4LTU1YzZhNTM3MDYwNCJ9';
const SUBJECT_SELECTOR = '#pvExplorationHost div.slicer-content-wrapper div.slicerBody div div.scrollbar-inner div div div div span';
const SCROLL_REGION_SELECTOR = '#pvExplorationHost > div > div > exploration > div > explore-canvas > div > div.canvasFlexBox > div > div.displayArea.disableAnimations.fitToPage > div.visualContainerHost.visualContainerOutOfFocus > visual-container-repeat > visual-container:nth-child(5) > transform > div > div.visualContent > div > div > visual-modern > div > div > div.slicer-content-wrapper > div > div.slicerBody > div > div.scrollbar-inner.scroll-content.scroll-scrolly_visible';


async function scrollToBottom(page) {
    await page.evaluate(async (scrollRegionSelector) => {
        const scrollRegion = document.querySelector(scrollRegionSelector);
        if (scrollRegion) {
            let lastScrollTop = scrollRegion.scrollTop;
            while (true) {
                scrollRegion.scrollTop = scrollRegion.scrollHeight;
                await new Promise(resolve => setTimeout(resolve, 1000));
                if (scrollRegion.scrollTop === lastScrollTop) {
                    break;
                }
                lastScrollTop = scrollRegion.scrollTop;
            }
        }
    }, SCROLL_REGION_SELECTOR);
}

router.get('/getSubjects', async (req, res) => {
    try {
        const browser = await puppeteer.launch({headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox']});
        const page = await browser.newPage();

        await page.goto(URL, { waitUntil: 'networkidle2'});
        await page.waitForSelector(SUBJECT_SELECTOR);
        await scrollToBottom(page);

        const subjects = await page.$$eval(SUBJECT_SELECTOR, spans => 
            spans.map(span => span.innerText.trim())
        );
        
        await browser.close();
        res.json({ subjects });
    } catch (error) {
        console.error('Error fetching subjects:', error);
        res.status(500).send(`Error fetching subjects: ${error.message}`);
    }
});

module.exports = router;