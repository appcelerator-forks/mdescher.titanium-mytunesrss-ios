Titanium.include('mytunesrss.js');

var win = Titanium.UI.currentWindow;

var items = win.data;

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
    tableData.push(row);
}
if (tableData.length == 0) {
    tableView.touchEnabled = false;
    tableData.push(Titanium.UI.createTableViewRow({height:48,className:'track_row',title:'No supported tracks'}));
} else {
    tableView.addEventListener('click', function(e) {
        if (items[e.index].mediaType === 'Video') {
            Titanium.App.fireEvent('mytunesrss_stop');
            var url = items[e.index].httpLiveStreamUri !== undefined ? items[e.index].httpLiveStreamUri : items[e.index].playbackUri;
            var tcParam = getTcParam();
            if (tcParam !== undefined) {
                url += '/' + tcParam;
            }
            Titanium.UI.createWindow({url:'win_videoplayer.js',data:url,backgroundColor:'#000'}).open();
        } else {
            Titanium.App.fireEvent('mytunesrss_playlist', {playlist:items,index:e.index});
        }
    });
}
tableView.setData(tableData);

win.add(tableView);
