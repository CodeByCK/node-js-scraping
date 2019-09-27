const requestPromise = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs')
const request = require('request')

const URLS = [
    { url: 'https://www.imdb.com/title/tt0102926/', id: 1 },
    { url: 'https://www.imdb.com/title/tt0137523/', id: 2 },
    { url: 'https://www.imdb.com/title/tt0468569/', id: 3 },
    { url: 'https://www.imdb.com/title/tt0109830/', id: 4 },
    { url: 'https://www.imdb.com/title/tt1375666/', id: 5 }
];



(async () => {
    const requestHeader = {
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
    }
    let moviesData = []

    for (let movie of URLS) {
        const response = await requestPromise(
            {
                uri: movie.url,
                headers: requestHeader,
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


        //downloading images
        let file = fs.createWriteStream(`${movie.id}.jpg`);

        await new Promise((resolve, reject) => {
            let stream = request({
                uri: poster,
                headers: requestHeader,
                gzip: true
            })
                .pipe(file)
                .on('finish', () => {
                    console.log(`${title} has been downloaded.`)
                    resolve()
                })
                .on('error', (error) => {
                    reject(error)
                })
        }).catch(error => {
            console.log(`${title} has an error downloading. ${error}`)
        })
    }
})()
