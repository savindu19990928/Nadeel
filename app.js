const express = require('express');
const SpotifyWebApi = require('spotify-web-api-node');

const app = express();
const port = 3000; // or any other port you prefer

// Spotify API setup
const spotifyApi = new SpotifyWebApi({
  clientId: '04758949c3d141b6b5882b1172bd5551',
  clientSecret: '48fe9beda2c64439ad896aa57f0e788c',
  redirectUri: 'http://localhost:3000/callback' // Redirect URI configured in Spotify Dashboard
});

// Authorization URL
const authorizeURL = spotifyApi.createAuthorizeURL(['user-read-private', 'user-read-email'], 'state');

app.get('/getmusic', async (req, res) => {
  const albumId = '2hstKFT7GOo34ZyFbMTXWN';
  try {
    // Retrieve metadata of the album
    const albumData = await spotifyApi.getAlbum(albumId);

    // Retrieve tracks of the album
    const albumTracks = await spotifyApi.getAlbumTracks(albumId, { limit: 30 });

    const tracksData = albumTracks.body.items.map(track => ({
      id: track.id,
      name: track.name,
      duration_ms: track.duration_ms,
      track_number: track.track_number,
      preview_url: track.preview_url
    }));

    const albumInfo = {
      id: albumData.body.id,
      name: albumData.body.name,
      artists: albumData.body.artists.map(artist => artist.name),
      release_date: albumData.body.release_date,
      total_tracks: albumData.body.total_tracks,
      image: albumData.body.images[0].url,
      tracks: tracksData
    };

    res.json(albumInfo);
  } catch (err) {
    console.error('Error occurred:', err);
    res.status(500).json({ error: 'An error occurred while fetching data.' });
  }
});

// Redirect user to Spotify for authorization
app.get('/login', async (req, res) => {
  try {
    const data = await spotifyApi.clientCredentialsGrant();
    const accessToken = data.body['access_token'];
    spotifyApi.setAccessToken(accessToken);
    res.redirect('/getmusic');
  } catch (err) {
    console.error('Error occurred:', err);
    res.status(500).json({ error: 'An error occurred while fetching access token.' });
  }
});

// Start the server
app.listen(port);
