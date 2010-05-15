Titanium.include('mytunesrss.js');

var win = Titanium.UI.currentWindow;

var actIndicator = Titanium.UI.createActivityIndicator({top:45,bottom:0,left:0,right:0});

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
    actIndicator.show();
    ajaxCall('AlbumService.getAlbums', [null, e.rowData.jsonItem.name.replace('\'', '\\\''), null, -1, -1, -1, false, -1, -1], function(result, error) {
        if (result) {
            var winAlbums = Titanium.UI.createWindow({url:'win_albums.js',backgroundColor:'#FFF'});
            winAlbums.ajaxResult = result;
            winAlbums.open();
            actIndicator.hide();
        } else {
            actIndicator.hide();
            alert('server error');
        }
    });
});

win.add(tableView);

win.add(actIndicator);
