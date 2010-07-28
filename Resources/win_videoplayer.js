Titanium.include('mytunesrss.js');

var win = Titanium.UI.currentWindow;
win.orientationModes = [
    Titanium.UI.LANDSCAPE_RIGHT,
    Titanium.UI.LANDSCAPE_LEFT
];

var buttonBack = Titanium.UI.createButton({title:'Back',style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED});
var videoPlayer = Titanium.Media.createVideoPlayer({url:win.data,mediaControlStyle:Titanium.Media.VIDEO_CONTROL_FULLSCREEN,scalingMode:Titanium.Media.VIDEO_SCALING_ASPECT_FIT,top:32});

buttonBack.addEventListener('click', function() {
    videoPlayer.release();
    win.close();
});
videoPlayer.addEventListener('complete', function (e) {
    videoPlayer.release();
    win.close();
});

addTopToolbar(win, undefined, buttonBack, undefined);
win.add(videoPlayer);

videoPlayer.play();


