//inquirer, fs, twitter, spotify, request, and keys
var inquirer = require('inquirer');
var fs = require("fs");
var Twitter = require('twitter');
var spotify = require('spotify');
var request = require('request');
var keys = require('./keys.js');
var client = new Twitter({
    consumer_key: keys.twitterKeys.consumer_key,
    consumer_secret: keys.twitterKeys.consumer_secret,
    access_token_key: keys.twitterKeys.access_token_key,
    access_token_secret: keys.twitterKeys.access_token_secret
});

//pulls my 20 most recent tweets (if I had 20 tweets lol)
function fetchTweets() {
	var screenName = {screen_name: 'adam_sidor', count: 20};

	//twitter api call
	client.get('statuses/user_timeline', params, function(err, tweets, response) {
	//if not an error 
	  if (!err) {

	  	//display tweets for each (count set to 20)
	  	tweets.forEach(function(tweet) {
	  		console.log('Tweet: ' + tweet.text + ' Created on: ' + tweet.created_at);
	  	});
	    
	  }
	});
}

//pulls song from spotify api
function searchSpotify(song) {
	//spotify API call
	spotify.search({type: 'track', query: song.search}, function(err, data) {
		//error message from spotify
	    if (err) {
	        console.log('Error occurred: ' + err);
	        return;
	    }

	    //variables for the songs
	    var track = data.tracks.items[0];

	    //displays relevant information
	    console.log('Artist: ' + track.artists[0].name);
		  console.log('Song name: ' + track.name);
		  console.log('Link to the preview: ' + track.preview_url);
		  console.log('From the album: ' + track.album.name);

	});
}

//pulls movie info from OMDB
function searchOMDB(movie) {
	//searchReady replaces spaces with + sign, so it can successfully call the api
	var searchReady = movie.search.replace(/ /g,'+');
	// calls the OMDB api
	request('http://www.omdbapi.com/?t=' + searchReady + '&y=&plot=full&tomatoes=true&r=json', function(err, response, body) {

		//if not and error or if the error is a 200 level error
	  if (!err && response.statusCode === 200) {

	    //displays the relevant information
	    console.log('Title of the movie: ' + JSON.parse(body).Title);
	    console.log('Year the movie came out: ' + JSON.parse(body).Year);
	    console.log('IMDB Rating of the movie: ' + JSON.parse(body).imdbRating);
	    console.log('Country where the movie was produced: ' + JSON.parse(body).Country);
	    console.log('Language of the movie: ' + JSON.parse(body).Language);
	    console.log('Plot of the movie: ' + JSON.parse(body).Plot);
	    console.log('Actors in the movie: ' + JSON.parse(body).Actors);
	    console.log('Rotten Tomatoes Rating: ' + JSON.parse(body).tomatoRating);
	    console.log('Rotten Tomatoes URL: ' + JSON.parse(body).tomatoURL);
	  }
	});
}

// allows users to select a function
function liriAlgorithm(user) {
	if (user.technology === 'spotify-this-song') {
		searchSpotify(user);

	} else if (user.technology === 'movie-this') {
		searchOMDB(user);

	} else if (user.technology === 'my-tweets') {
		fetchTweets();

	} else {
		//this is what pulls up the track in our random.txt folder
		fs.readFile('./random.txt', 'utf8', function(err, data) {
			if (err) {
				console.log(err);
			}
			
		  // So split is used to break up the string wherever there's a comma. Then data is stored in array
		  var output = data.split(',');

		  user.technology = output[0];
		  user.search = output[1];

		  liriAlgorithm(user);
		});
	}
}

//inquirer is used to creat the actual prompts and manage the answers returned
inquirer.prompt([
	{
		type: 'list',
		message: 'Pick something please?',
		choices: ['spotify-this-song', 'my-tweets', 'movie-this', 'do-what-it-says'],
		name: 'technology'
	},
	{
		type: 'input',
		message: 'Input song please',
		name: 'search',
		//we want a song to appear on default, and this allows for a easy to create default. 
		default: 'The Sign Ace of Base',
		when: function(answers){
	    return answers.technology === 'spotify-this-song';
	  }
	},
	{
		type: 'input',
		message: 'Input movie please',
		name: 'search',
		//same default as in the spotify
		default: 'Mr. Nobody',
		when: function(answers){
	    return answers.technology === 'movie-this';
	  }
	},
	{
		type: 'confirm',
		message: 'Are you sure:',
		name: 'confirm',
		default: true

	}

//once the user confirms this is what they want, then the function liriAlgorithm is run
]).then(function (user) {
	
	if (user.confirm){
		liriAlgorithm(user);

		console.log('');
		console.log('Here you go:');
		console.log('');

	
	}


	else {

		console.log('');
		console.log('Oops, you have to confirm');
		console.log('');
	}

});