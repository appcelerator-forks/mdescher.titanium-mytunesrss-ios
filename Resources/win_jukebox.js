Titanium.include('mytunesrss.js');
Titanium.include('mytunesrss_platform.js');

var win = Titanium.UI.currentWindow;

var tableView;

var buttonBack = Titanium.UI.createButton({title:'Back',style:buttonStyle});

var controlRewind = Titanium.UI.createImageView({url:'back.png'});
controlRewind.addEventListener('click', function() {
    Titanium.App.fireEvent('mytunesrss_rewind');
});
var controlPlay = Titanium.UI.createImageView({url:'play.png'});
controlPlay.addEventListener('click', function() {
    Titanium.App.fireEvent('mytunesrss_play');
});
var controlPause = Titanium.UI.createImageView({url:'pause.png'});
controlPause.addEventListener('click', function() {
    Titanium.App.fireEvent('mytunesrss_pause');
});
var controlStop = Titanium.UI.createImageView({url:'stop.png'});
controlStop.addEventListener('click', function() {
    Titanium.App.fireEvent('mytunesrss_stop');
});
var controlFastForward = Titanium.UI.createImageView({url:'forward.png'});
controlFastForward.addEventListener('click', function() {
    Titanium.App.fireEvent('mytunesrss_fastforward');
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
    Titanium.API.info('progress = ' + e.progress);
});

function setTrackInformation(track) {
    if (tableView) {
        win.remove(tableView);
    }
    tableView = Titanium.UI.createTableView({top:45,bottom:44,style:tableViewGroupStyle});
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
}

function wrapInSection(rows) {
    var section = Titanium.UI.createTableViewSection();
    for (var i = 0; i < rows.length; i++) {
        section.add(rows[i]);
    }
    return section;
}