require('dotenv').config();
const schedule = require('node-schedule');
const Twit = require('twit');
const fetch = require('node-fetch')
const config = require('./keys');
const { TwitterApi } = require('twitter-api-v2');
const { getImageCheerio } = require('./image');
const axios = require('axios');

const rule = new schedule.RecurrenceRule();
rule.hour = 0;
rule.tz = 'Etc/UTC';
const twitConfig = {
    consumer_key: config.API_KEY,
    consumer_secret: config.API_SECRET,
    access_token: config.USER_TOKEN,
    access_token_secret: config.USER_SECRET,
};
const T = new Twit({
    consumer_key: config.API_KEY,
    consumer_secret: config.API_SECRET,
    app_only_auth: true,
})
const userT = new Twit(twitConfig);
const getQuote = async () => {
    const response = await fetch('https://motivational-quote-api.herokuapp.com/quotes/random');
    const { quote } = await response.json();
    userT.post('statuses/update', { status: quote ?? 'hello world' }, function (err, data, response) {

    });
};

const getFollowers = () => {
    T.get('followers/list', { screen_name: config.SCREEN_NAME }, function (err, data, response) {
        const { users } = data;
        console.log(users);
        T.get("statuses/user_timeline", { screen_name: users[0].screen_name, count: 1 }, function (err, data, response) {
            console.log(data, 'in timeline'); // Whatever you want to do here
        });
    });
}

const startStream = () => {
    T.post('followers/ids', { screen_name: config.SCREEN_NAME }, function (err, data, response) {
        const { ids } = data;
        var stream = T.stream('statuses/sample');

        stream.on('tweet', (tweet) => {
            console.log(tweet)
        });
    });
}

const initTwitter = () => {
    const mainClient = new TwitterApi(config.BEARER);
    const userClient = new TwitterApi({
        appKey: config.API_KEY,
        appSecret: config.API_SECRET,
        accessToken: config.USER_TOKEN,
        accessSecret: config.USER_SECRET,
    })
    return {
        main: mainClient,
        user: userClient
    }
}
const uploadImage = async (buffer) => {
    // First, post all your images to Twitter
    const mediaIds = await Promise.all([
        // file path
        client.v1.uploadMedia('./my-image.jpg'),
        // from a buffer, for example obtained with an image modifier package
        client.v1.uploadMedia(buffer, { type: 'png' }),
    ]);

    // mediaIds is a string[], can be given to .tweet
    await client.v1.tweet('My tweet text with two images!', { media_ids: mediaIds });
}
const requestRandomBook = async () => {
    const randomNumPages = Math.floor(Math.random() * 1500 + 1);
    const randomYear = 1440 + Math.floor(Math.random() * 580);

    const call = await axios.get(
        `https://archive.org/advancedsearch.php?q=mediatype%3Atexts+and+imagecount%3A${randomNumPages}+and+year%3A${randomYear}&fl%5B%5D=avg_rating&fl%5B%5D=backup_location&fl%5B%5D=btih&fl%5B%5D=call_number&fl%5B%5D=collection&fl%5B%5D=contributor&fl%5B%5D=coverage&fl%5B%5D=creator&fl%5B%5D=date&fl%5B%5D=description&fl%5B%5D=downloads&fl%5B%5D=external-identifier&fl%5B%5D=foldoutcount&fl%5B%5D=format&fl%5B%5D=genre&fl%5B%5D=headerImage&fl%5B%5D=identifier&fl%5B%5D=imagecount&fl%5B%5D=indexflag&fl%5B%5D=item_size&fl%5B%5D=language&fl%5B%5D=licenseurl&fl%5B%5D=mediatype&fl%5B%5D=members&fl%5B%5D=month&fl%5B%5D=name&fl%5B%5D=noindex&fl%5B%5D=num_reviews&fl%5B%5D=oai_updatedate&fl%5B%5D=publicdate&fl%5B%5D=publisher&fl%5B%5D=related-external-id&fl%5B%5D=reviewdate&fl%5B%5D=rights&fl%5B%5D=scanningcentre&fl%5B%5D=source&fl%5B%5D=stripped_tags&fl%5B%5D=subject&fl%5B%5D=title&fl%5B%5D=type&fl%5B%5D=volume&fl%5B%5D=week&fl%5B%5D=year&sort%5B%5D=&sort%5B%5D=&sort%5B%5D=&rows=500&page=1&output=json`
    );

    const books = call.data.response.docs;

    if (books.length === 0) {
        return requestRandomBook();
    }

    const randomBook = books[Math.floor(Math.random() * books.length)];

    if (randomBook.collection.includes('inlibrary')) {
        return requestRandomBook();
    }

    return randomBook;
};
const setUpBookTweet = async () => {
    const client = initTwitter();

    const randomBook = await requestRandomBook();
    console.log(randomBook);
    const bookLink = `https://archive.org/details/${randomBook.identifier}`;
    const bookTitle = randomBook.title.length <= 183 ? randomBook.title : `${randomBook.title.substring(0, 179)}...`;
    const tweet = `${bookTitle} (Published: ${randomBook.year})\nFull text: ${bookLink}`;

    const imageLink = `https://archive.org/download/${randomBook.identifier}/page/n${Math.floor(Math.random() * randomBook.imagecount)}.jpg`;
    const image = await axios.get(imageLink, { responseType: 'arraybuffer' });

    const imageBuffer = Buffer.from(image.data);

    const mediaId = await client.user.v1.uploadMedia(imageBuffer, { mimeType: 'image/png' });
    return await client.user.v1.tweet(randomBook.title, { media_ids: [mediaId] });
}
const setUpHowTo = async (howTo) => {
    const client = initTwitter();

    for (let item of howTo) {

        const image = await axios.get(item.url, { responseType: 'arraybuffer' });
        const imageBuffer = Buffer.from(image.data);
        const mediaId = await client.user.v1.uploadMedia(imageBuffer, { mimeType: 'image/jpeg' });
        await client.user.v1.tweet(item.title, { media_ids: [mediaId] });
    }

}
getImageCheerio().then(item => setUpHowTo(item)).then(x => console.log('done')).catch(err => console.log(err, 'oops'));