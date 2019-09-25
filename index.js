const request = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs')
const axios = require('axios')
const puppeteer = require('puppeteer')

const URLS = [
    'https://www.imdb.com/title/tt0102926/',
    'https://www.imdb.com/title/tt0137523/',
    'https://www.imdb.com/title/tt0109830/',
    'https://www.imdb.com/title/tt0468569/',
    'https://www.imdb.com/title/tt1375666/'

];

(async () => {
    let moviesData = []

    for (let movie of URLS) {
        const response = await request(
            {
                uri: movie,
                headers: {
                    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
                    'accept-encoding': 'gzip, deflate, br',
                    'accept-language': 'en-US,en;q=0.9',
                    'cache-control': 'no-cache',
                    'pragma': 'no-cache',
                    'referer': 'https://www.google.com/',
                    'sec-fetch-mode': 'navigate',
                    'sec-fetch-site': 'none',
                    'sec-fetch-user': '?1',
                    'upgrade-insecure-requests': '1',
                    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.132 Safari/537.36'
                },
                gzip: true
            }
        );


        let $ = cheerio.load(response);

        let title = $('div[class="title_wrapper"] > h1').text().trim();
        let rating = $('span[itemprop="ratingValue"]').text();
        let poster = $('div[class="poster"] > a > img').attr('src');
        let totalRatings = $('div[class="imdbRating"] > a > span').text()
        let releaseDate = $('a[title="See more release dates"]').text().trim()
        let genres = []

        $('div[class="title_wrapper"] a[href^="/search/"]').each((i, elem) => {
            let genre = $(elem).text();
            genres.push(genre)
        })

        moviesData.push({
            title,
            rating,
            poster,
            totalRatings,
            releaseDate,
            genres
        })

        //downloading movies array after being scrapped.
        fs.writeFileSync('./data.json', JSON.stringify(moviesData), 'utf-8')

        console.log(moviesData)
    }
})()
