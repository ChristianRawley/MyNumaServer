const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const https = require('https');

const router = express.Router();
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

router.get('/getNews/:page?', async (req, res) => {
    try {
        const URL = `https://uafs.edu/news/stories.php?categories=News&archives=${req.params.page ? `&page=${req.params.page}` : ''}`;
        const { data } = await axios.get(URL, { httpsAgent });
        const $ = cheerio.load(data);

        const news = [];
        $('div.section > div.container > div.row > div.col-lg-9.category-news-list > div.row.card.plain').each((_, el) => {
            const title = $(el).find('div.col-lg-8 > div.card-body > h3 > a').text().trim();
            const description = $(el).find('div.col-lg-8 > div.card-body > p.description').text().trim();
            const image = $(el).find('div.col-lg-4 > div.image > img').attr('src');
            const link = $(el).find('div.col-lg-8 > div.card-body > h3 > a').attr('href');

            if (image && title && link && description) {
                news.push({
                    title,
                    description,
                    image: image.startsWith('http') ? image : `https://uafs.edu${image}`,
                    link: link.startsWith('http') ? link : `https://uafs.edu${link}`,
                });
            }
        });

        res.json(news);
    } catch (error) {
        console.error('Error fetching news:', error);
        res.status(500).send('Error fetching news');
    }
});

module.exports = router;