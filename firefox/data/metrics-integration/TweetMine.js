"use strict";

/*
 @arg tweets : as received by the homeline API
 username : currently viewed user (screen_name)
*/
function TweetMine(tweets, username){
    return {
        // from and to are UNIX timestamps (number of ms since Jan 1st 1970)
        byDateRange: function(from, to){
            if(!from || !to)
                throw new TypeError('need 2 args');

            return tweets.filter( t => {
                const createdTimestamp = (new Date(t.created_at)).getTime();
                return createdTimestamp >= from && createdTimestamp < to;
            });
        },
        getRetweets: function(){
            //console.log('getRetweets', tweets);

            return tweets.filter(function(tweet){
                return 'retweeted_status' in tweet;
            });
        },
        /*
            includes RTs and conversations
        */
        getTweetsWithLinks: function(){
            return tweets.filter(tweet => {
                try{
                    return tweet.entities.urls.length >= 1;
                }
                catch(e){
                    // most likely a nested property doesn't exist
                    return false;
                }
            });
        },
        getConversations: function(){
            return tweets.filter(tweet => {
                return tweet.user.screen_name === username &&
                    !tweet.retweeted_status &&
                    tweet.text.startsWith('@') &&
                    // if a user recently changed of screen_name, a tweet may start with @, but not
                    // refer to an actual user. Testing if there is an entity to make sure.
                    tweet.entities.user_mentions && tweet.entities.user_mentions.length >= 1; // a bit weak, but close enough. Would need to check if the user actually exists
            });
        },
        getNonRetweetNonConversationTweets: function(){
            var rts = new Set(this.getRetweets());
            var convs = new Set(this.getConversations());
            var ret = new Set(tweets);
            
            for(let t of rts) ret.delete(t)
            for(let t of convs) ret.delete(t)
            
            return [...ret];
        },
        getOldestTweet: function(){
            return tweets[tweets.length - 1]; // last
        },

        getOwnTweets: function(){
            return tweets.filter(tweet => !('retweeted_status' in tweet));
        },

        getGeneratedRetweetsCount: function(){
            return this.getOwnTweets()
                .map(tweet => tweet.retweet_count)
                .reduce(function(acc, rtCount){
                    return acc + rtCount;
                });
        },
        getGeneratedFavoritesCount: function(){
            return this.getOwnTweets()
                .map(tweet => tweet.favorite_count)
                .reduce(function(acc, favCount){
                    return acc + favCount;
                });
        },
        get length(){
            return tweets.length;
        }
    }
}

