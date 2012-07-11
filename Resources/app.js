Titanium.include('mytunesrss.js');
Titanium.include('win_login.js');
Titanium.include('win_menu.js');
Titanium.include('win_albums.js');
Titanium.include("win_artists.js");
Titanium.include("win_genres.js");
Titanium.include("win_playlists.js");
Titanium.include("win_tracklist.js");

Titanium.Media.audioSessionMode = Titanium.Media.AUDIO_SESSION_MODE_PLAYBACK;

var view = Titanium.UI.createView();

Titanium.UI.setBackgroundColor('#000');

var loginWindow = new LoginWindow();
var menuWindow = new MenuWindow();
var albumsWindow = new AlbumsWindow();
var artistsWindow = new ArtistsWindow();
var genresWindow = new GenresWindow();
var playlistsWindow = new PlaylistsWindow();
var tracksWindow = new TracksWindow();
loginWindow.open();
