Titanium.include('mytunesrss.js');

var win = Titanium.UI.currentWindow;
win.orientationModes = [
    Titanium.UI.LANDSCAPE_RIGHT,
    Titanium.UI.LANDSCAPE_LEFT
];

var videoPlayer = Titanium.Media.createVideoPlayer({url:win.data,movieControlMode:Titanium.Media.VIDEO_CONTROL_EMBEDDED,mediaControlStyle:Titanium.Media.VIDEO_CONTROL_EMBEDDED,scalingMode:Titanium.Media.VIDEO_SCALING_ASPECT_FIT});

win.add(videoPlayer);

var actIndicatorView = Titanium.UI.createView({top:0,left:0,bottom:0,right:0,backgroundColor:'#000',opacity:0.8,visible:true});
actIndicatorView.add(Titanium.UI.createActivityIndicator({top:0,bottom:0,left:0,right:0,visible:true}));
win.add(actIndicatorView);

videoPlayer.addEventListener('playbackState', function (e) {
    if (e.playbackState === Titanium.Media.VIDEO_PLAYBACK_STATE_PLAYING) {
        actIndicatorView.hide();
    } else {
        actIndicatorView.show();
    }
});

videoPlayer.addEventListener('complete', function (e) {
    win.close();
});
videoPlayer.addEventListener('dblclick', function (e) {
    win.close();
});

videoPlayer.play();
