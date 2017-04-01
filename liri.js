var twitter = require('twitter');
var spotify = require('spotify');
var request = require('request');
var fs = require('fs');


var keys = require('./keys.js');
var twitterKeys = keys.twitterKeys;

var args = process.argv;

var liriCommand = args[2];

var liriArg = '';
for (var i = 3; i < args.length; i++) {
	liriArg += args[i] + ' ';
}

function gettweets() {
	fs.appendFile('./log.txt', 'User Command: node liri.js my-tweets\n\n', (err) => {
		if (err) throw err;
	});

	var user = new Twitter(twitterKeys);
	var params = {screen_name: 'baroneGreg', count: 20};

	user.get('statuses/user_timeline', params, function(error, tweets, response) {
		if (error) {
			var errorStr = 'Could not find tweets' + error;

			fs.appendFile('./log.txt', errorStr, (err) => {
				if (err) throw err;
				console.log(errorStr);
			});
			return;
		} else {
			var outputInfo = 'User Tweets:\n';

			for (var i = 0; i < tweets.length; i++) {
				outputInfo += 'Created on: ' + tweets[i].created_at + '\n' + 
							 'Tweet content: ' + tweets[i].text + '\n';
			}

			fs.appendFile('./log.txt', 'LIRI Response:\n\n' + outputInfo + '\n', (err) => {
				if (err) throw err;
				console.log(outputInfo);
			});
		}
	});
}

//  Spotify NPM
function findsong(song) {
	fs.appendFile('./log.txt', 'User Command: node liri.js spotify-this-song ' + song + '\n\n', (err) => {
		if (err) throw err;
	});

	
	var search;
	if (song === '') {
		search = 'The Sign Ace of Base';
	} else {
		search = song;
	}

	spotify.search({ type: 'track', query: search}, function(error, data) {
	    if (error) {
			var errorStr1 = 'Could not find song ' + error;

			fs.appendFile('./log.txt', errorStr1, (err) => {
				if (err) throw err;
				console.log(errorStr1);
			});
			return;
	    } else {
			var songInfo = data.tracks.items[0];
			if (!songInfo) {
				var errorStr2 = 'No song info retrieved, please check the spelling!';

				fs.appendFile('./log.txt', errorStr2, (err) => {
					if (err) throw err;
					console.log(errorStr2);
				});
				return;
			} else {
				var outputInfo ='Song Information:\n' +  
								'Song Name: ' + songInfo.name + '\n'+ 
								'Artist: ' + songInfo.artists[0].name + '\n' + 
								'Album: ' + songInfo.album.name + '\n' + 
								'Preview Here: ' + songInfo.preview_url + '\n';

				fs.appendFile('./log.txt', 'LIRI Response:\n\n' + outputInfo + '\n', (err) => {
					if (err) throw err;
					console.log(outputInfo);
				});
			}
	    }
	});
}

// OMDB NPM
function findmovie(movie) {
	fs.appendFile('./log.txt', 'User Command: node liri.js movie-this ' + movie + '\n\n', (err) => {
		if (err) throw err;
	});

	var search;
	if (movie === '') {
		search = 'Mr.Nobody';
	} else {
		search = movie;
	}

	search = search.split(' ').join('+');

	var queryStr = 'http://www.omdbapi.com/?t=' + search + '&plot=full&tomatoes=true';

	request(queryStr, function (error, response, body) {
		if ( error || (response.statusCode !== 200) ) {
			var errorStr1 = 'Retrieving OMDB entry -- ' + error;

			// Append the error string to the log file
			fs.appendFile('./log.txt', errorStr1, (err) => {
				if (err) throw err;
				console.log(errorStr1);
			});
			return;
		} else {
			var data = JSON.parse(body);
			if (!data.Title && !data.Released && !data.imdbRating) {
				var errorStr2 = 'No movie info retrieved, please check the spelling!';

				fs.appendFile('./log.txt', errorStr2, (err) => {
					if (err) throw err;
					console.log(errorStr2);
				});
				return;
			} else {
		    	var outputInfo ='Movie Information:\n' + 
								'Movie Title: ' + data.Title + '\n' + 
								'Year Released: ' + data.Released + '\n' +
								'IMBD Rating: ' + data.imdbRating + '\n' +
								'Country Produced: ' + data.Country + '\n' +
								'Language: ' + data.Language + '\n' +
								'Plot: ' + data.Plot + '\n' +
								'Actors: ' + data.Actors + '\n' + ;

				fs.appendFile('./log.txt', 'LIRI Response:\n\n' + outputInfo + '\n', (err) => {
					if (err) throw err;
					console.log(outputInfo);
				});
			}
		}
	});
}

function go() {
	
	fs.appendFile('./log.txt', 'User Command: node liri.js do-what-it-says\n\n', (err) => {
		if (err) throw err;
	});

	
	fs.readFile('./random.txt', 'utf8', function (error, data) {
		if (error) {
			console.log('ERROR: Reading random.txt -- ' + error);
			return;
		} else {
			var strInginfo = data.split(',');
			var command = strInginfo[0].trim();
			var param = strInginfo[1].trim();

			switch(command) {
				case 'my-tweets':
					gettweets(); 
					break;

				case 'spotify-this-song':
					findsong(param);
					break;

				case 'movie-this':
					findmovie(param);
					break;
			}
		}
	});
}

if (liriCommand === 'my-tweets') {
	gettweets(); 

} else if (liriCommand === `spotify-this-song`) {
	findsong(liriArg);

} else if (liriCommand === `movie-this`) {
	findmovie(liriArg);

} else if (liriCommand ===  `do-what-it-says`) {
	go();

} else {
	
	fs.appendFile('./log.txt', 'User Command: ' + args + '\n\n', (err) => {
		if (err) throw err;

		
		outputInfo = 'Usage:\n' + 
				   '    node liri.js my-tweets\n' + 
				   '    node liri.js spotify-this-song "<song_name>"\n' + 
				   '    node liri.js movie-this "<movie_name>"\n' + 
				   '    node liri.js do-what-it-says\n';

		fs.appendFile('./log.txt', 'LIRI Response:\n\n' + outputInfo + '\n', (err) => {
			if (err) throw err;
			console.log(outputInfo);
		});
	});
}

