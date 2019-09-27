const requestPromise = require('request-promise');
const cheerio = require('cheerio');


(async () => {
    const USERNAME = 'instagram';
    const BASE_URL = `https://instagram.com/${USERNAME}`

    let response = await requestPromise(BASE_URL)
    // console.log(response)

    let $ = cheerio.load(response)

    //Instagram uses graphql meaning, json is available to use in the front end.
    //targeting the 4th script tag to grab the variable containing json object.
    let script = $('script[type="text/javascript"]').eq(3).html();

    //practicing regex to clean up the data then running it on the script variable.
    let script_regex = /window._sharedData = (.+);/g.exec(script);

    //parasing the data and practicing ES6 destructuring and get to the user.
    let { entry_data: { ProfilePage: { [0]: { graphql: { user } } } } } = JSON.parse(script_regex[1]);

    //setting the data to an object with the information I want.
    let instagram_data = {
        fullName: user.full_name,
        profilePic: user.profile_pic_url_hd,
        followers: user.edge_followed_by.count,
        following: user.edge_follow.count,
        posts: user.edge_owner_to_timeline_media.count
    }


    console.log(instagram_data)
})()