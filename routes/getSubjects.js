const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const https = require('https');

const router = express.Router();
const URL = 'https://app.powerbi.com/view?r=eyJrIjoiYTMzNmY3ZTgtZDdkNy00M2E2LWFiNGEtNmRlMjhlZjU1ZDliIiwidCI6IjhjMWE4N2NiLTgwYjctNDEzZi05YWU4LTU1YzZhNTM3MDYwNCJ9';
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

router.get('/getSubjects', async (req, res) => {
    try {
        const { data } = await axios.get(URL, { httpsAgent });
        const $ = cheerio.load(data);
        
        const subjects = [];
        $(document.querySelector("#pvExplorationHost > div > div > exploration > div > explore-canvas > div > div.canvasFlexBox > div > div.displayArea.disableAnimations.actualSizeAlignLeft.actualSizeAlignMiddle.actualSizeOrigin > div.visualContainerHost.visualContainerOutOfFocus > visual-container-repeat > visual-container:nth-child(5) > transform > div > div.visualContent > div > div > visual-modern > div > div > div.slicer-content-wrapper > div > div.slicerBody > div > div.scrollbar-inner.scroll-content.scroll-scrolly_visible > div > div"))
            .each((index, element) => {
                const subject = $(element).find("div > div:nth-child(1) > div > span").text().trim();
                if (subject) {
                    subjects.push(subject);
                }
            });

        res.json(subjects);
    } catch (error) {
        console.error('Error fetching subjects:', error);
        res.status(500).send('Error fetching subjects');
    }
});

module.exports = router;