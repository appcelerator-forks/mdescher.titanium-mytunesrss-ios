Titanium.include('mytunesrss.js');

var win = Titanium.UI.currentWindow;

var actIndicatorView = Titanium.UI.createView({top:0,left:0,bottom:0,right:0,backgroundColor:'#000',opacity:0.8,visible:false});
actIndicatorView.add(Titanium.UI.createActivityIndicator({top:0,bottom:0,left:0,right:0,visible:true}));
win.addEventListener('focus', function() {
    actIndicatorView.hide();
});

var tableView = Titanium.UI.createTableView({search:Titanium.UI.createSearchBar({autocapitalization:false,autocorrect:false}), filterAttribute:'title',top:45});
var buttonBack = Titanium.UI.createButton({title:'Back',style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED});

buttonBack.addEventListener('click', function() {
    win.close();
});

addTopToolbar(win, 'Playlists', buttonBack, undefined);

setTableDataAndIndex(win.ajaxResult.results, tableView, function(item) {
    var displayName = getDisplayName(item.name);
    var row = Titanium.UI.createTableViewRow({title:displayName,color:'transparent',hasChild:true,height:48,className:'playlist_row'});
    row.add(Titanium.UI.createLabel({text:displayName,left:10,height:24,right:10,font:{fontSize:20,fontWeight:'bold'},minimumFontSize:12}));
    row.jsonItem = item;
    return row;
}, function(item) {
    return item.name;
});

tableView.addEventListener('click', function(e) {
    actIndicatorView.show();
    ajaxCall('PlaylistService.getTracks', [e.rowData.jsonItem.id, null], function(result, error) {
        if (result) {
            var winTracks = Titanium.UI.createWindow({url:'win_tracklist.js',backgroundColor:'#FFF'});
            winTracks.ajaxResult = result;
            winTracks.open();
        } else {
            actIndicatorView.hide();
            handleServerError(error);
        }
    });
});

win.add(tableView);

win.add(actIndicatorView);
