Titanium.include('mytunesrss.js');

var win = Titanium.UI.currentWindow;

var actIndicatorView = Titanium.UI.createView({top:0,left:0,bottom:0,right:0,backgroundColor:'#000',opacity:0.8,visible:false});
actIndicatorView.add(Titanium.UI.createActivityIndicator({top:0,bottom:0,left:0,right:0,visible:true}));
win.addEventListener('focus', function() {
    actIndicatorView.hide();
});

var tableView = Titanium.UI.createTableView({search:Titanium.UI.createSearchBar(), filterAttribute:'title',top:45});
var buttonBack = Titanium.UI.createButton({title:'Back',style:buttonStyle});

buttonBack.addEventListener('click', function() {
    win.close();
});

addTopToolbar(win, 'Artists', buttonBack, undefined);

setTableDataAndIndex(win.ajaxResult.results, tableView, function(item, index) {
    var row = Titanium.UI.createTableViewRow({hasChild:true,className:'artist_row',title:getDisplayName(item.name)});
    row.jsonItem = item;
    return row;
}, function(item) {
    return item.name;
});

tableView.addEventListener('click', function(e) {
    actIndicatorView.show();
    ajaxCall('AlbumService.getAlbums', [null, e.rowData.jsonItem.name.replace('\'', '\\\''), null, -1, -1, -1, false, -1, -1], function(result, error) {
        if (result) {
            var winAlbums = Titanium.UI.createWindow({url:'win_albums.js',backgroundColor:'#FFF'});
            winAlbums.ajaxResult = result;
            winAlbums.open();
        } else {
            actIndicatorView.hide();
            showUnexpectedServerError();
        }
    });
});

win.add(tableView);

win.add(actIndicatorView);
