Titanium.include('mytunesrss.js');

Titanium.Media.audioSessionMode = Titanium.Media.AUDIO_SESSION_MODE_PLAYBACK;

var view = Titanium.UI.createView();

Titanium.UI.setBackgroundColor('#000');

var win = Titanium.UI.createWindow({url : 'win_login.js'});
win.backgroundGradient = WINDOW_BG;
win.open();
