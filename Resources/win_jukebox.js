Titanium.include('mytunesrss.js');

var win = Titanium.UI.currentWindow;

var tableView = Titanium.UI.createTableView({top:45,style:Titanium.UI.iPhone.TableViewStyle.GROUPED});
var buttonBack = Titanium.UI.createButton({title:'Back',style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED});
var imageRow = Titanium.UI.createTableViewRow({className:'jukebox_image'});
var albumImage = Titanium.UI.createImageView({top:10});
imageRow.add(albumImage);
var infoRow = Titanium.UI.createTableViewRow({height:48,className:'jukebox_info'});
var trackName = Titanium.UI.createLabel({top:4,left:4,height:24,font:{fontSize:16,fontWeight:'bold'}});
var artistName = Titanium.UI.createLabel({bottom:4,left:4,height:18,font:{fontSize:12}});
infoRow.add(trackName);
infoRow.add(artistName);
var controlRewind = Titanium.UI.createButton({title:'|<'});
var controlPlay = Titanium.UI.createButton({title:'>'});
var controlStop = Titanium.UI.createButton({title:'O'});
var controlFastForward = Titanium.UI.createButton({title:'>|'});
buttonBack.addEventListener('click', function() {
    win.close();
});

tableView.setData([imageRow, infoRow]);
addTopToolbar(win, 'Jukebox', buttonBack, undefined);
addBottomToolbar(win, [controlRewind, controlPlay, controlStop, controlFastForward]);

setTrackInformation(win.data);

win.add(tableView);

Titanium.App.addEventListener('mytunesrss_playtrack', function(track) {
    setTrackInformation(track);
});

function setTrackInformation(track) {
    if (track.imageUrl) {
        albumImage.url = track.imageUrl + '/size=256';
        albumImage.width = 200;
        albumImage.height = 200;
        imageRow.height = 220;
    } else {
        albumImage.url = 'appicon.png';
        albumImage.width = 57;
        albumImage.height = 57;
        imageRow.height = 77;
    }
    trackName.text = getDisplayName(track.name);
    artistName.text = getDisplayName(track.artist);
}

function wrapInSection(rows) {
    var section = Titanium.UI.createTableViewSection();
    for (var i = 0; i < rows.length; i++) {
        section.add(rows[i]);
    }
    return section;
}