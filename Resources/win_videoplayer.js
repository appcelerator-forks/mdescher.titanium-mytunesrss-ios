Titanium.include('mytunesrss.js');

var win = Titanium.UI.currentWindow;
win.orientationModes = [
    Titanium.UI.LANDSCAPE_RIGHT,
    Titanium.UI.LANDSCAPE_LEFT
];

var videoPlayer = Titanium.Media.createVideoPlayer({url:win.data,mediaControlMode:Titanium.Media.VIDEO_CONTROL_FULLSCREEN,scalingMode:Titanium.Media.VIDEO_SCALING_ASPECT_FIT,fullscreen:true});

videoPlayer.addEventListener('complete', function (e) {
	if (e.reason == 0) {
	    videoPlayer.stop();
	    videoPlayer.release();
	    win.close();
	}
});

videoPlayer.addEventListener('fullscreen', function (e) {
    if (e.entering == 0) {
        videoPlayer.stop();
        videoPlayer.release();
        win.close();
    }
});

win.add(videoPlayer);

videoPlayer.play();


