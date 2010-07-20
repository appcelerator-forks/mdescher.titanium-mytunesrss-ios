Titanium.include('mytunesrss.js');

var win = Titanium.UI.currentWindow;

var actIndicatorView = Titanium.UI.createView({top:0,left:0,bottom:0,right:0,backgroundColor:'#000',opacity:0.8,visible:false});
actIndicatorView.add(Titanium.UI.createActivityIndicator({top:0,bottom:0,left:0,right:0,visible:true}));
win.addEventListener('focus', function() {
    actIndicatorView.hide();
});

var tableView = Titanium.UI.createTableView({search:Titanium.UI.createSearchBar({autocapitalization:false,autocorrect:false}), filterAttribute:'title',top:45});
var buttonBack = Titanium.UI.createButton({title:'Back',style:buttonStyle});

buttonBack.addEventListener('click', function() {
    win.close();
});

addTopToolbar(win, 'Albums', buttonBack, undefined);

win.add(tableView);

setTableDataAndIndex(win.ajaxResult.results, tableView, function(item, index) {
    var displayName = getDisplayName(item.name);
    var row = Titanium.UI.createTableViewRow({title:displayName,color:'transparent',hasChild:true,height:48,className:item.imageUrl ? 'album_row_img' : 'album_row'});
    if (item.imageUrl) {
        var albumImage = Titanium.UI.createImageView({url:(item.imageUrl + '/size=64'),top:4,left:4,width:40,height:40,defaultImage:'appicon.png'});
        row.add(albumImage);
    }
    var albumName = Titanium.UI.createLabel({text:displayName,top:4,left:48,height:24,right:10,font:{fontSize:16,fontWeight:'bold'},minimumFontSize:12});
    var artistName = Titanium.UI.createLabel({text:getDisplayName(item.artist),bottom:4,left:48,height:18,font:{fontSize:12}});
    row.add(albumName);
    row.add(artistName);
    row.jsonItem = item;
    return row;
}, function(item) {
    return item.name;
});

tableView.addEventListener('click', function(e) {
    actIndicatorView.show();
    ajaxCall('AlbumService.getTracks', [[e.rowData.jsonItem.name]], function(result, error) {
        if (result) {
            var winTracks = Titanium.UI.createWindow({url:'win_tracklist.js',backgroundColor:'#FFF'});
            winTracks.ajaxResult = result;
            winTracks.open();
        } else if (error) {
            actIndicatorView.hide();
            handleUnexpectedServerError(error.msg);
        } else {
            actIndicatorView.hide();
            Titanium.UI.createAlertDialog({message:'No response from server, please make sure the server is running.',buttonNames:['Ok']}).show();
        }
    });
});

//win.add(tableView);

win.add(actIndicatorView);
