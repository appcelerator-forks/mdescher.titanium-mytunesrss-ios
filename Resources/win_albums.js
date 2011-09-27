Titanium.include('mytunesrss.js');

var win = Titanium.UI.currentWindow;

var actIndicatorView = Titanium.UI.createView({top:0,left:0,bottom:0,right:0,backgroundColor:'#000',opacity:0.8,visible:false});
actIndicatorView.add(Titanium.UI.createActivityIndicator({top:0,bottom:0,left:0,right:0,visible:true}));

var tableView = Titanium.UI.createTableView({search:Titanium.UI.createSearchBar({autocapitalization:false,autocorrect:false}), filterAttribute:'title',top:45});
var buttonBack = Titanium.UI.createButton({title:'Back',style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED});

buttonBack.addEventListener('click', function() {
    win.close();
});

addTopToolbar(win, 'Albums', buttonBack, undefined);

win.add(tableView);

win.add(actIndicatorView);
actIndicatorView.show();

tableView.addEventListener('click', function(e) {
    actIndicatorView.show();
    ajaxCall('AlbumService.getTracks', [[e.rowData.jsonItem.name]], function(result, error) {
        actIndicatorView.hide();
        if (result) {
            var winTracks = Titanium.UI.createWindow({url:'win_tracklist.js',backgroundGradient : WINDOW_BG});
            winTracks.ajaxResult = result;
            winTracks.open();
        } else {
            handleServerError(error);
        }
    });
});

setTableDataAndIndex(
        tableView,
        win.fetchItemsCallback,
        function() {
            actIndicatorView.hide();
        },
        function(item, index) {
            var displayName = getDisplayName(item.name);
			var size;
			var albumHeight;
			var artistHeight;
			if (Titanium.Platform.osname === "ipad") {
				size = 60;
				albumHeight = 36;
				artistHeight = 26;
				spacer = 6;
			} else if (Titanium.Platform.osname === "iphone") {
				size = 40;
				albumHeight = 24;
				artistHeight = 18;
				spacer = 4;
			}
            var row = Titanium.UI.createTableViewRow({title:displayName,color:'transparent',hasChild:true,height:size + (2 * spacer),className:item.imageUrl ? 'album_row_img' : 'album_row'});
            if (item.imageUrl) {
                var albumImage = Titanium.UI.createImageView({image:(item.imageUrl + '/size=64'),top:spacer,left:spacer,width:size,height:size,defaultImage:'appicon.png'});
                row.add(albumImage);
            }
            var albumName = Titanium.UI.createLabel({text:displayName,top:spacer,left:size + (2 * spacer),height:albumHeight,right:2 * spacer,font:{fontSize:16,fontWeight:'bold'},minimumFontSize:12});
            var artistName = Titanium.UI.createLabel({text:getDisplayName(item.artist),bottom:spacer,left:size + (2 * spacer),height:artistHeight,font:{fontSize:12}});
            row.add(albumName);
            row.add(artistName);
            row.jsonItem = item;
            return row;
        },
        function(item) {
            return item.name;
        });
