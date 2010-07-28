Titanium.include('mytunesrss.js');

var win = Titanium.UI.currentWindow;

var items = win.ajaxResult.results;
if (!items) {
    items = win.ajaxResult.tracks;
}
items = removeUnsupportedTracks(items);

var tableView = Titanium.UI.createTableView({top:45});
var buttonBack = Titanium.UI.createButton({title:'Back',style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED});

buttonBack.addEventListener('click', function() {
    win.close();
});

addTopToolbar(win, 'Tracks', buttonBack, undefined);

var tableData = [];
for (var i = 0; i < items.length; i++) {
    var row = Titanium.UI.createTableViewRow({hasChild:true,height:48,className:'track_row'});
    var trackName = Titanium.UI.createLabel({text:getDisplayName(items[i].name),top:4,left:10,right:10,height:24,font:{fontSize:16,fontWeight:'bold'},minimumFontSize:12});
    var artistName = Titanium.UI.createLabel({text:getDisplayName(items[i].artist),bottom:4,left:10,right:10,height:18,font:{fontSize:12}});
    row.add(trackName);
    row.add(artistName);
    row.jsonItem = items[i];
    tableData.push(row);
}
if (tableData.length == 0) {
    tableView.touchEnabled = false;
    tableData.push(Titanium.UI.createTableViewRow({height:48,className:'track_row',title:'No supported tracks'}));
} else {
    tableView.addEventListener('click', function(e) {
        ajaxCall('LoginService.ping', [], function(result, error) {
            if (!result) {
                handleServerError(error);
            } else {
                if (items[e.index].mediaType === 'Video') {
                    Titanium.App.fireEvent('mytunesrss_stop');
                    Titanium.UI.createWindow({url:'win_videoplayer.js',data:items[e.index].playbackUrl,backgroundColor:'#000'}).open();
                } else {
                    Titanium.App.fireEvent('mytunesrss_playlist', {playlist:items,index:e.index});
                }
            }
        });
    });
}
tableView.setData(tableData);

win.add(tableView);
