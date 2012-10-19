function VideoPlayerWindow(videoUrl) {

	var self = this;
	var myParent;

	var win = Titanium.UI.createWindow({id:"window"});

	win.orientationModes = [
	    Titanium.UI.LANDSCAPE_RIGHT,
	    Titanium.UI.LANDSCAPE_LEFT
	];
	
	var videoPlayer = Titanium.Media.createVideoPlayer({url:videoUrl,mediaControlMode:Titanium.Media.VIDEO_CONTROL_FULLSCREEN,scalingMode:Titanium.Media.VIDEO_SCALING_ASPECT_FIT,fullscreen:true});
	
	videoPlayer.addEventListener('complete', function (e) {
		if (e.reason == 0) {
		    videoPlayer.stop();
		    videoPlayer.release();
	        myParent.open();
		    win.close();
		}
	});
	
	videoPlayer.addEventListener('fullscreen', function (e) {
	    if (e.entering == 0) {
	        videoPlayer.stop();
	        videoPlayer.release();
	        myParent.open();
	        win.close();
	    }
	});
	
	win.add(videoPlayer);
	
	videoPlayer.play();

	this.open = function(parent) {
		if (parent !== undefined) {
			myParent = parent;
		}
		win.open();
	}

}
