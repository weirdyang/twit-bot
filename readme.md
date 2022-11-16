## HOW TO:

1. Visit the URL “https://twitter.com/oauth/request_token?oauth_consumer_key=<YOUR CONSUMER KEY>&oauth_callback=oob” on the account associated with your Twitter Developer App. That is, the account used to request Twitter Developer access.

2. Copy the the `oauth_token` parameter on the page.

3. Next, login to your bot account and visit this URL “https://twitter.com/oauth/authenticate?oauth_token=<NEWLY GENERATED OAUTH TOKEN>”. Replace the oauth_token in the link with the newly generated one you copied in step 2.

4. Click on `Authorize app`

5. Copy down the pin

6. Visit the URL “https://twitter.com/oauth/access_token?oauth_token=<NEWLY GENERATED OAUTH TOKEN>&oauth_verifier=<7 DIGIT PIN>”

REF: [How to Create Multiple Bots With a Single Twitter Developer Account](https://medium.com/geekculture/how-to-create-multiple-bots-with-a-single-twitter-developer-account-529eaba6a576)