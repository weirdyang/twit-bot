const fetch = require("node-fetch");
const axios = require("axios");
const cheerio = require("cheerio");
const { ElementType } = require("htmlparser2");

const wikihowUrl = (limit = 10) => `https://www.wikihow.com/api.php?format=json&action=query&list=random&rnnamespace=0&rnlimit=${limit}`;

const imageUrl = (id) => `https://www.wikihow.com/api.php?format=json&action=parse&prop=images&pageid=${id}`;

const randomIndex = (array) => Math.floor(Math.random() * array.length);

const fileUrl = (image) => `https://www.wikihow.com/api.php?format=json&action=query&titles=File:${image}&prop=imageinfo&iiprop=url`;
exports.getImage = async () => {

    const response = await axios.get(wikihowUrl());
    const { random } = response.data.query;
    const images = [];

    for (let item of random) {
        const imageRes = await axios.get(imageUrl(item.id));
        console.log(imageRes.data.parse.images);
        const files = imageRes.data.parse.images;
        files.shift();
        const randomImage = files[randomIndex(files)];
        if (
            randomImage == null ||
            randomImage.includes("TITLE") ||
            randomImage.endsWith(".gif")
        ) {
            continue;
        };
        const response = await axios.get(fileUrl(randomImage), { maxRedirects: 50 });
        const imageId = Object.keys(response.data["query"]["pages"])[0]
        const imageLink = response.data["query"]["pages"][imageId]["imageinfo"][0]["url"];
        images.push({
            title: item.title,
            link: randomImage,
            url: imageLink,
        });
    }
    console.log(fileUrl(images[0]));

    return images;
}
exports.getImageCheerio = async () => {
    const url = wikihowUrl(1);
    const response = await axios.get(wikihowUrl(10));
    console.log(response.data.query.random);
    const { random } = response.data.query;
    const images = [];

    for (let item of random) {

        try {
            const { data } = await axios.get(`https://wikihow.com/${item.title}`);
            const $ = cheerio.load(data);
            const elements = $('ol li img');
            if (!elements.length) {
                continue;
            }
            const randomImageUrl = elements[randomIndex(elements)];
            if (randomImageUrl.attribs['data-src']) {
                images.push({
                    title: item.title,
                    url: randomImageUrl.attribs['data-src'],
                })
                break;
            }
        } catch (error) {
            console.log(`Unable to resolve ${item.title}`, item)
        }

    };
    console.log(images, 'images')
    return images.filter(Boolean);
}