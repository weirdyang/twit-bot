const axios = require("axios");
const cheerio = require('cheerio');
const { randomIndex, randomNumber } = require("./utils");

const baseUrl = 'https://asterixonline.info/comics/';

const selector = 'div#omv table td.mid img';

const randomUrl = () => `${baseUrl}${randomNumber(1,32)}.html`;


exports.getAsterixImage = async () => {
    const { data } = await axios.get(randomUrl());
    $ = cheerio.load(data);
    const images = [...$(selector)];
    const urls = images.filter(x => x.attribs.src.includes('jpg')).map(x => x.attribs.src);
    return urls[randomIndex(urls)];
}