Titanium.include('mytunesrss.js');

var win = Titanium.UI.currentWindow;

var tableView = Titanium.UI.createTableView({search:Titanium.UI.createSearchBar(), filterAttribute:'title',top:45});
var buttonBack = Titanium.UI.createButton({title:'Back',style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED});

buttonBack.addEventListener('click', function() {
    win.close();
});

addTopToolbar(win, 'Albums', buttonBack, undefined);

setTableDataAndIndex(win.ajaxResult.results, tableView, function(item, index) {
    var row = Titanium.UI.createTableViewRow({hasChild:true,height:48,className:'album_row_' + index});
    //var albumImage;
    if (item.imageUrl) {
        var albumImage = Titanium.UI.createImageView({url:(item.imageUrl + '/size=64'),top:4,left:4,width:40,height:40});
        row.add(albumImage);
    //} else {
    //    albumImage = Titanium.UI.createImageView({top:4,left:4,width:40,height:40});
    }
    var albumName = Titanium.UI.createLabel({text:getDisplayName(item.name),top:4,left:48,height:24,font:{fontSize:16,fontWeight:'bold'}});
    var artistName = Titanium.UI.createLabel({text:getDisplayName(item.artist),bottom:4,left:48,height:18,font:{fontSize:12}});
    row.add(albumName);
    row.add(artistName);
    row.jsonItem = item;
    return row;
    /*
    var row = Titanium.UI.createTableViewRow({hasChild:true,className:'album_row',title:getDisplayName(item.name)});
    row.jsonItem = item;
    return row;
    */
}, function(item) {
    return item.name;
});

tableView.addEventListener('click', function(e) {
    ajaxCall('AlbumService.getTracks', [[e.rowData.jsonItem.name.replace('\'', '\\\'')]], function(result, error) {
        if (result) {
            var winTracks = Titanium.UI.createWindow({url:'win_tracklist.js'});
            winTracks.ajaxResult = result;
            winTracks.open();
        } else {
            alert('server error');
        }
    });
});

win.add(tableView);
