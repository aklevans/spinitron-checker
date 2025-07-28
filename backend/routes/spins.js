var express = require('express');
var jsdom = require("jsdom");

var router = express.Router();

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/* GET users listing. */

router.get('/:url', async function(req, res, next) {
    const getGenres = req.query.getGenres;
    const regexp = new RegExp("https:\/\/spinitron.com\/.*\/dj\/.*\/.*");

    if(!req.params.url.match(regexp)) {
      return res.status(400).send({
        message: 'Invalid URL'
      });
    }

    let spins = await getSpins(req.params.url, getGenres);

    res.send(spins);

});

async function getTags(artist, song, release) {

  const recordingResponse = await fetch(`https://musicbrainz.org/ws/2/recording/?query=recording:%22${song}%22%20AND%20artist:%22${artist}%22&fmt=json`, {
    headers: {
      'User-Agent': 'spinitron-checker/0.0.1 (alexklevans@gmail.com)'
    }
  });

  if (recordingResponse.status == "503") {
    console.log("rate limited");
    await sleep(5000);

    return getTags(artist, song, release)
  }
  let recordingData = {};
  
  try{
      recordingData = await recordingResponse.json();
  } catch(error) {
    console.log(recordingData);
  }

  if(recordingData.recordings == undefined) {
    console.log(recordingResponse);
  }
  if(recordingData.recordings.length == 0 || recordingData.recordings[0].releases.length == 0) {
    return [];
  }

  let releaseMBID = recordingData.recordings[0].releases[0].id;

  if (release != null) {
    for (let i = 0; i < recordingData.recordings[0].releases.length; i++) {
      let r2 = recordingData.recordings[0].releases[i];
      if(r2.title == undefined) {
        console.log(recordingData.recordings[0].releases[0]);
      }
      if(release.toLowerCase() == r2.title.toLowerCase()) {
        releaseMBID = r2.id;
        break;
      }
    }
  }

  
  const releaseResponse = await fetch(`https://musicbrainz.org/ws/2/release/${releaseMBID}?inc=genres&fmt=json`, {
    headers: {
      'User-Agent': 'spinitron-checker/0.0.1 (alexklevans@gmail.com)'
    }
  });
  const releaseData = await releaseResponse.json();

  let genres = [];

  for(let genre in releaseData.genres) {
    genres.push(genre.name);
  }
  await sleep(3000);
  return genres;
}

async function getSpins(url, getGenres) {
  console.log('starting');
  //get playlists
  let page = 1;
  let playlists = new Set();
  let growing = true;
  while (growing) {
    const response = await fetch(url + "?page=" + page);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const html = await response.text();
    const dom = new jsdom.JSDOM(html);
    // two a's per playlist
    let playlistLinks = dom.window.document.getElementById("playlist-list-0").getElementsByTagName('a');
    let pageLength = 0;
    let startSize = playlists.size;
    for(let item of playlistLinks) {
      const link = item.href;
      if(link != "about:blank#") {
        playlists.add(link);
        //console.log(link);
        pageLength++;
      }
    }
    if(playlists.size == startSize) {
      growing = false;
    }
    page++;
  }
  // console.log(playlists);

  //check through each playlist
  let allSongs = [];

  for(let playlist of playlists) {
    const response = await fetch("https://spinitron.com" + playlist);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const html = await response.text();
    const dom = new jsdom.JSDOM(html);
    let timeslot = dom.window.document.getElementsByClassName("timeslot")[0].textContent.trim();
    let spins = dom.window.document.getElementById("public-spins-0").getElementsByClassName("spin-text");
    for (let i = spins.length - 1; i >= 0; i--) {
      //get tags
      let spin = spins[i];
      

      const trackInfo = {
        artist: spin.getElementsByClassName("artist")[0].textContent,
        song: spin.getElementsByClassName("song")[0].textContent,
        playlist: playlist,
        timeslot: timeslot,
        release: null
      };

      const releaseDiv = spin.getElementsByClassName("release")[0];

      if(releaseDiv != undefined) {
        trackInfo.release = releaseDiv.textContent; 
      }

      // if(getGenres) {
      //   trackInfo.genres = getTags(trackInfo.artist, trackInfo.song, trackInfo.release);
      // }
      

      // trackInfo.tags = getTags(trackInfo.artist, trackInfo.song)
      // console.log(trackInfo);
      allSongs.push(trackInfo);
      // console.log(spin);
    }
  }
  
  // console.log(allSongs);
  return allSongs;
}


module.exports = router;
