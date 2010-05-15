Titanium.include('mytunesrss.js');

var win = Titanium.UI.currentWindow;

var tableView = Titanium.UI.createTableView({search:Titanium.UI.createSearchBar(), filterAttribute:'title',top:45});
var buttonBack = Titanium.UI.createButton({title:'Back',style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED});

buttonBack.addEventListener('click', function() {
    win.close();
});

addTopToolbar(win, 'Artists', buttonBack, undefined);

setTableDataAndIndex(win.ajaxResult.results, tableView, function(item, index) {
    var row = Titanium.UI.createTableViewRow({hasChild:true,className:'artist_row_' + index,title:getDisplayName(item.name)});
    row.jsonItem = item;
    return row;
}, function(item) {
    return item.name;
});

tableView.addEventListener('click', function(e) {
    ajaxCall('AlbumService.getAlbums', [null, e.rowData.jsonItem.name.replace('\'', '\\\''), null, -1, -1, -1, false, -1, -1], function(result, error) {
        if (result) {
            var winAlbums = Titanium.UI.createWindow({url:'win_albums.js',backgroundColor:'#FFF'});
            winAlbums.ajaxResult = result;
            winAlbums.open();
        } else {
            alert('server error');
        }
    });
});

win.add(tableView);
