Titanium.include('mytunesrss.js');

var win = Titanium.UI.currentWindow;
var tableView;
var progressBar;

function setTrackInformation(track) {
    if (tableView) {
        win.remove(tableView);
    }
    if (progressBar) {
        win.remove(progressBar);
    }
    tableView = Titanium.UI.createTableView({top:45,bottom:44,style:tableViewGroupStyle,touchEnabled:false});
    var imageRow;
    if (track.imageUrl) {
        imageRow = Titanium.UI.createTableViewRow({className:'jukebox_image',height:240});
        imageRow.add(Titanium.UI.createImageView({top:10,url:track.imageUrl + '/size=256',width:220,height:220}));
    } else {
        imageRow = Titanium.UI.createTableViewRow({className:'jukebox_image',height:77});
        imageRow.add(Titanium.UI.createImageView({top:10,url:'appicon.png',width:57,height:57}));
    }
    var infoRow = Titanium.UI.createTableViewRow({height:60,className:'jukebox_info'});
    infoRow.add(Titanium.UI.createLabel({top:7,left:10,height:30,font:{fontSize:16,fontWeight:'bold'},text:getDisplayName(track.name)}));
    infoRow.add(Titanium.UI.createLabel({bottom:7,left:10,height:24,font:{fontSize:12},text:getDisplayName(track.artist)}));
    tableView.setData([imageRow, infoRow]);
    win.add(tableView);
    progressBar = Titanium.UI.createProgressBar({min:0,max:track.time,value:0,bottom:60,left:10,right:10,height:10});
    progressBar.addEventListener('click', function(e) {
        var val = ((e.x - progressBar.left) * track.time) / (Titanium.Platform.displayCaps.platformWidth - progressBar.left - progressBar.right);
        Titanium.App.fireEvent('mytunesrss_moveplayhead', {value:val});
    });
    win.add(progressBar);
    progressBar.show();
}

function wrapInSection(rows) {
    var section = Titanium.UI.createTableViewSection();
    for (var i = 0; i < rows.length; i++) {
        section.add(rows[i]);
    }
    return section;
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

var buttonBack = Titanium.UI.createButton({title:'Back',style:buttonStyle});

var controlRewind = Titanium.UI.createImageView({url:'back.png'});
controlRewind.addEventListener('click', function() {
    ajaxCall('LoginService.ping', null, function(result, error) {
        if (!result && !error) {
            Titanium.UI.createAlertDialog({message:'No response from server, please make sure the server is running.',buttonNames:['Ok']}).show();
        } else {
            Titanium.App.fireEvent('mytunesrss_rewind');
        }
    });
});
var controlPlay = Titanium.UI.createImageView({url:'play.png'});
controlPlay.addEventListener('click', function() {
    ajaxCall('LoginService.ping', null, function(result, error) {
        if (!result && !error) {
            Titanium.UI.createAlertDialog({message:'No response from server, please make sure the server is running.',buttonNames:['Ok']}).show();
        } else {
            Titanium.App.fireEvent('mytunesrss_play');
        }
    });
});
var controlPause = Titanium.UI.createImageView({url:'pause.png'});
controlPause.addEventListener('click', function() {
    Titanium.App.fireEvent('mytunesrss_pause');
    Titanium.App.fireEvent('mytunesrss_hideJukeboxActivityView');
});
var controlStop = Titanium.UI.createImageView({url:'stop.png'});
controlStop.addEventListener('click', function() {
    Titanium.App.fireEvent('mytunesrss_stop');
    Titanium.App.fireEvent('mytunesrss_hideJukeboxActivityView');
});
var controlFastForward = Titanium.UI.createImageView({url:'forward.png'});
controlFastForward.addEventListener('click', function() {
    ajaxCall('LoginService.ping', null, function(result, error) {
        if (!result && !error) {
            Titanium.UI.createAlertDialog({message:'No response from server, please make sure the server is running.',buttonNames:['Ok']}).show();
        } else {
            Titanium.App.fireEvent('mytunesrss_fastforward');
        }
    });
});
buttonBack.addEventListener('click', function() {
    win.close();
});

addTopToolbar(win, 'Jukebox', buttonBack, undefined);
setTrackInformation(win.data);

var flexSpace = Titanium.UI.createButton({systemButton:Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE});
win.add(Titanium.UI.createToolbar({bottom:0,height:45,items:[flexSpace, controlRewind, flexSpace, controlPlay, flexSpace, controlPause, flexSpace, controlStop, flexSpace, controlFastForward, flexSpace]}));

Titanium.App.addEventListener('mytunesrss_playtrack', function(track) {
    setTrackInformation(track);
});

Titanium.App.addEventListener('mytunesrss_progress', function(e) {
    if (progressBar) {
        progressBar.value = e.value;
    }
});
