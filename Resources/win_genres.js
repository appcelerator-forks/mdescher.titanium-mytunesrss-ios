Titanium.include('mytunesrss.js');

var win = Titanium.UI.currentWindow;

var tableView = Titanium.UI.createTableView({search:Titanium.UI.createSearchBar(), filterAttribute:'title',top:45});
var buttonBack = Titanium.UI.createButton({title:'Back',style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED});

buttonBack.addEventListener('click', function() {
    win.close();
});

addTopToolbar(win, 'Genres', buttonBack, undefined);

setTableDataAndIndex(win.ajaxResult.results, tableView, function(item) {
    var row = Titanium.UI.createTableViewRow({hasChild:true,className:'genre_row',title:getDisplayName(item.name)});
    row.jsonItem = item;
    return row;        
}, function(item) {
    return item.name;
});

tableView.addEventListener('click', function(e) {
    ajaxCall('AlbumService.getAlbums', [null, null, e.rowData.jsonItem.name.replace('\'', '\\\''), -1, -1, -1, false, -1, -1], function(result, error) {
        if (result) {
            var winTracks = Titanium.UI.createWindow({url:'win_tracklist.js',backgroundColor:'#FFF'});
            winTracks.ajaxResult = result;
            winTracks.open();
        } else {
            alert('server error');
        }
    });
});

win.add(tableView);
