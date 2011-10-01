Titanium.include('mytunesrss.js');

var win = Titanium.UI.currentWindow;
var tableView;
var progressBar;
var timePlayed;
var timeRemaining;
var size = 220;
var hires = false;
if (Titanium.Platform.osname === "ipad") {
	size = 440;
} else if (Titanium.Platform.osname === "iphone") {
	hires = Titanium.Platform.displayCaps.density == "high";
}

function getDisplayTime(time) {
    var mins = Math.floor(time / 60);
    var secs = Math.floor(time % 60);
    if (secs < 10) {
        return mins + ':0' + secs;
    }
    return mins + ':' + secs;
}

function setTrackInformation(track) {
    if (tableView) {
        win.remove(tableView);
    }
    if (progressBar) {
        win.remove(progressBar);
    }
    tableView = Titanium.UI.createTableView({top:45,bottom:44,style:Titanium.UI.iPhone.TableViewStyle.GROUPED,touchEnabled:false});
    var imageRow;
    if (track.imageUrl) {
        imageRow = Titanium.UI.createTableViewRow({className:'jukebox_image',height:size});
        if (hires) {
    	    imageRow.add(Titanium.UI.createImageView({top:10,hires:true,image:track.imageUrl,width:size - 20,height:size - 20}));
        } else {
	        imageRow.add(Titanium.UI.createImageView({top:10,image:track.imageUrl,width:size - 20,height:size - 20}));
        }
    } else {
        imageRow = Titanium.UI.createTableViewRow({className:'jukebox_image',height:77});
        if (hires) {
    	    imageRow.add(Titanium.UI.createImageView({top:10,hires:true,image:'appicon.png',width:57,height:57}));
        } else {
	        imageRow.add(Titanium.UI.createImageView({top:10,image:'appicon.png',width:57,height:57}));
        }
    }
    var infoRow = Titanium.UI.createTableViewRow({height:60,className:'jukebox_info'});
    infoRow.add(Titanium.UI.createLabel({top:7,left:10,height:30,font:{fontSize:16,fontWeight:'bold'},text:getDisplayName(track.name)}));
    infoRow.add(Titanium.UI.createLabel({bottom:7,left:10,height:24,font:{fontSize:12},text:getDisplayName(track.artist)}));
    tableView.setData([imageRow, infoRow]);
    win.add(tableView);
    progressBar = Titanium.UI.createProgressBar({min:0,max:track.time,value:0,bottom:60,left:60,right:60,height:10});
    win.add(progressBar);
    progressBar.show();
/*    var progressLabel = Titanium.UI.createLabel({bottom:60,left:60,right:60,height:10});
    progressLabel.addEventListener('click', function(e) {
        var val = ((e.x - progressBar.left) * track.time) / (Titanium.Platform.displayCaps.platformWidth - progressBar.left - progressBar.right);
        Titanium.App.fireEvent('mytunesrss_moveplayhead', {value:val});
    });
    win.add(progressLabel); */
    timePlayed = Titanium.UI.createLabel({bottom:60,left:10,height:10,width:40,font:{fontSize:12},text:'',textAlign:'right',color:'#FFFFFF'});
    win.add(timePlayed);
    timeRemaining = Titanium.UI.createLabel({bottom:60,right:10,width:40,height:10,font:{fontSize:12},text:'',color:'#FFFFFF'});
    win.add(timeRemaining);
}

function wrapInSection(rows) {
    var section = Titanium.UI.createTableViewSection();
    for (var i = 0; i < rows.length; i++) {
        section.add(rows[i]);
    }
    return section;
}

function addTouchListener(control, name) {
    control.addEventListener('touchstart', function() {
        control.image = name + '_touched.png';
    });
    control.addEventListener('touchend', function() {
        control.image = name + '.png';
    });
}

var actIndicatorView = Titanium.UI.createView({top:45,left:0,bottom:44,right:0,backgroundColor:'#000',opacity:0.8,visible:false});
actIndicatorView.add(Titanium.UI.createActivityIndicator({top:0,bottom:0,left:0,right:0,visible:true}));
Titanium.App.addEventListener('mytunesrss_showJukeboxActivityView', function() {
    if (!actIndicatorView.visible) {
        win.add(actIndicatorView);
        actIndicatorView.show();
    }
});
Titanium.App.addEventListener('mytunesrss_hideJukeboxActivityView', function() {
    if (actIndicatorView.visible) {
        actIndicatorView.hide();
        win.remove(actIndicatorView);
    }
});

var buttonBack = Titanium.UI.createButton({title:'Back',style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED});

var controlRewind = Titanium.UI.createImageView({image:'back.png',width:45,height:45});
controlRewind.addEventListener('click', function() {
    ajaxCall('LoginService.ping', [], function(result, error) {
        if (!result) {
            handleServerError(error);
        } else {
            Titanium.App.fireEvent('mytunesrss_rewind');
        }
    });
});
var controlPlay = Titanium.UI.createImageView({image:'play.png',width:45,height:45});
controlPlay.addEventListener('click', function() {
    ajaxCall('LoginService.ping', [], function(result, error) {
        if (!result) {
            handleServerError(error);
        } else {
            Titanium.App.fireEvent('mytunesrss_play');
        }
    });
});
var controlPause = Titanium.UI.createImageView({image:'pause.png',width:45,height:45});
controlPause.addEventListener('click', function() {
    ajaxCall('LoginService.ping', [], function(result, error) {
        if (!result) {
            handleServerError(error);
        } else {
            Titanium.App.fireEvent('mytunesrss_pause');
            Titanium.App.fireEvent('mytunesrss_hideJukeboxActivityView');
        }
    });
});
var controlStop = Titanium.UI.createImageView({image:'stop.png',width:45,height:45});
controlStop.addEventListener('click', function() {
    ajaxCall('LoginService.ping', [], function(result, error) {
        if (!result) {
            handleServerError(error);
        } else {
            if (progressBar) {
                progressBar.value = 0;
            }
            timePlayed.text = '';
            timeRemaining.text = '';
            Titanium.App.fireEvent('mytunesrss_stop');
            Titanium.App.fireEvent('mytunesrss_hideJukeboxActivityView');
        }
    });
});
var controlFastForward = Titanium.UI.createImageView({image:'forward.png',width:45,height:45});
controlFastForward.addEventListener('click', function() {
    ajaxCall('LoginService.ping', [], function(result, error) {
        if (!result) {
            handleServerError(error);
        } else {
            Titanium.App.fireEvent('mytunesrss_fastforward');
        }
    });
});
var controlShuffle = Titanium.UI.createImageView({image:'shuffle.png',width:45,height:45});
controlShuffle.addEventListener('click', function() {
    ajaxCall('LoginService.ping', [], function(result, error) {
        if (!result) {
            handleServerError(error);
        } else {
            Titanium.App.fireEvent('mytunesrss_shuffle');
        }
    });
});
buttonBack.addEventListener('click', function() {
    win.close();
});

addTouchListener(controlRewind, 'back');
addTouchListener(controlFastForward, 'forward');
addTouchListener(controlPause, 'pause');
addTouchListener(controlPlay, 'play');
addTouchListener(controlStop, 'stop');
addTouchListener(controlShuffle, 'shuffle');

addTopToolbar(win, 'Jukebox', buttonBack, undefined);
setTrackInformation(win.data);

var flexSpace = Titanium.UI.createButton({systemButton:Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE});
win.add(Titanium.UI.createToolbar({bottom:0,height:45,items:[flexSpace, controlRewind, flexSpace, controlPlay, flexSpace, controlPause, flexSpace, controlStop, flexSpace, controlFastForward, flexSpace, controlShuffle, flexSpace]}));

Titanium.App.addEventListener('mytunesrss_setTrackInfo', function(track) {
    win.data = track;
    setTrackInformation(win.data);
});

Titanium.App.addEventListener('mytunesrss_progress', function(e) {
    if (progressBar) {
        progressBar.value = Math.floor(e.value);
    }
    timePlayed.text = getDisplayTime(e.value);
    timeRemaining.text = getDisplayTime(win.data.time - Math.floor(e.value));
});
