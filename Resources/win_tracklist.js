Titanium.include('mytunesrss.js');

var win = Titanium.UI.currentWindow;

var tableView = Titanium.UI.createTableView({top:45});
var buttonBack = Titanium.UI.createButton({title:'Back',style:buttonStyle});

buttonBack.addEventListener('click', function() {
    win.close();
});

addTopToolbar(win, 'Tracks', buttonBack, undefined);

var tableData = [];
var items = win.ajaxResult.results;
if (!items) {
    items = win.ajaxResult.tracks;
}
for (var i = 0; i < items.length; i++) {
    //var row = Titanium.UI.createTableViewRow({title:getDisplayName(items[i].name),className:'tracklist_row_' + i});

    var row = Titanium.UI.createTableViewRow({hasChild:true,height:48,className:'album_row_' + i});
    var trackName = Titanium.UI.createLabel({text:getDisplayName(items[i].name),top:4,left:4,height:24,font:{fontSize:16,fontWeight:'bold'}});
    var artistName = Titanium.UI.createLabel({text:getDisplayName(items[i].artist),bottom:4,left:4,height:18,font:{fontSize:12}});
    row.add(trackName);
    row.add(artistName);

    row.jsonItem = items[i];
    tableData.push(row);
}
tableView.setData(tableData);

tableView.addEventListener('click', function(e) {
    var items = win.ajaxResult.results;
    if (!items) {
        items = win.ajaxResult.tracks;
    }
    Titanium.App.fireEvent('mytunesrss_playlist', {playlist:items,index:e.index});
});

win.add(tableView);
