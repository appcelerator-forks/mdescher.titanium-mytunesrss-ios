Titanium.include('mytunesrss.js');

var win = Titanium.UI.currentWindow;

var actIndicator = Titanium.UI.createActivityIndicator({top:45,bottom:0,left:0,right:0});

var tableView = Titanium.UI.createTableView({search:Titanium.UI.createSearchBar(), filterAttribute:'title',top:45});
var buttonBack = Titanium.UI.createButton({title:'Back',style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED});

buttonBack.addEventListener('click', function() {
    win.close();
});

addTopToolbar(win, 'Playlists', buttonBack, undefined);

setTableDataAndIndex(win.ajaxResult.results, tableView, function(item) {
    var row = Titanium.UI.createTableViewRow({hasChild:true,className:'playlist_row',title:getDisplayName(item.name)});
    row.jsonItem = item;
    return row;
}, function(item) {
    return item.name;
});

tableView.addEventListener('click', function(e) {
    actIndicator.show();
    ajaxCall('PlaylistService.getTracks', [e.rowData.jsonItem.id, null], function(result, error) {
        if (result) {
            var winTracks = Titanium.UI.createWindow({url:'win_tracklist.js',backgroundColor:'#FFF'});
            winTracks.ajaxResult = result;
            winTracks.open();
            actIndicator.hide();
        } else {
            actIndicator.hide();
            alert('server error');
        }
    });
});

win.add(tableView);

win.add(actIndicator);
