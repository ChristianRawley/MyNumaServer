const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const https = require('https');

const router = express.Router();
const API_URL = 'https://uafs.edu/news/stories.php?categories=News&archives=';
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

router.get('/getNews', async (req, res) => {
    try {
        const { data } = await axios.get(API_URL, { httpsAgent });
        const $ = cheerio.load(data);

        const news = [];
        $('div.section > div.container > div.row > div.col-lg-9.category-news-list > div.row.card.plain').each((_, el) => {
            const image = $(el).find('div.col-lg-4 > div.image > img').attr('src');
            const title = $(el).find('div.col-lg-8 > div.card-body > h3 > a').text().trim();
            const link = $(el).find('div.col-lg-8 > div.card-body > h3 > a').attr('href');
            const description = $(el).find('div.col-lg-8 > div.card-body > p.description').text().trim();

            if (image && title && link && description) {
                news.push({
                    image: image.startsWith('http') ? image : `https://uafs.edu${image}`,
                    title,
                    link: link.startsWith('http') ? link : `https://uafs.edu${link}`,
                    description,
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
