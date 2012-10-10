function MoviesWindow(data) {

	var self = this;
	var myParent;

	var win = GUI.createWindow({});

	var actIndicatorView = Titanium.UI.createView({top:0,left:0,bottom:0,right:0,backgroundColor:'#000',opacity:0.8,visible:false});
	actIndicatorView.add(Titanium.UI.createActivityIndicator({top:0,bottom:0,left:0,right:0,visible:true}));
	
	var tableView = GUI.createTableView({search:Titanium.UI.createSearchBar({autocapitalization:false,autocorrect:false,barColor:"#000000"}), filterAttribute:'title',top:45});
	var buttonBack = GUI.createButton({title:L("movies.back"),style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED});
	
	buttonBack.addEventListener('click', function() {
		myParent.open();
	    win.close();
	});
	
	win.add(GUI.createTopToolbar(L("movies.title"), buttonBack, undefined));
	
	win.add(tableView);
	
	win.add(actIndicatorView);
	
	tableView.addEventListener('click', function(e) {
        jukebox.destroy();
        jukebox = new Jukebox();
        var url = e.rowData.playbackUri;
        var tcParam = getTcParam();
        if (tcParam !== undefined) {
            url += '/' + tcParam;
        }
        new VideoPlayerWindow(url).open(self);
	});
	
	setTableDataAndIndex(
	        tableView,
	        data,
	        function(item, index) {
	            var displayName = getDisplayName(item.name);
				var size = 40;
				var nameHeight = 24;
				var infoHeight = 18;
				var spacer = 4;
				var hires = false;
				if (Titanium.Platform.osname === "ipad") {
					size = 60;
					nameHeight = 36;
					infoHeight = 26;
					spacer = 6;
				} else if (Titanium.Platform.osname === "iphone") {
					hires = Titanium.Platform.displayCaps.density == "high";
				}
	            var row = GUI.createTableViewRow({hasChild:true,height:size + (2 * spacer),className:item.imageUri ? 'show_row_img' : 'show_row',selectionStyle:Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE});
	            if (item.imageUri !== undefined) {
	                var showImage;
	                if (hires) {
	                	showImage = createCachedImageView({cacheObjectId:item.imageHash + "_128",hires:true,image:item.imageUri + "/size=128",top:spacer,left:spacer,width:size,height:size,defaultImage:'appicon.png'});
	                } else {
	                	showImage = createCachedImageView({cacheObjectId:item.imageHash + "_64",image:item.imageUri + "/size=64",top:spacer,left:spacer,width:size,height:size,defaultImage:'appicon.png'});
	                }
	                row.add(showImage);
	            }
	            var movieName = GUI.createLabel({text:displayName,top:spacer,left:size + (2 * spacer),height:nameHeight,right:2 * spacer,font:{fontSize:16,fontWeight:'bold'},minimumFontSize:12});
	            row.add(movieName);
	            row.playbackUri = item.httpLiveStreamUri !== undefined ? item.httpLiveStreamUri : item.playbackUri;
	            return row;
	        },
	        function(item) {
	            return item.name;
	        });

	/**
	 * Open the tv shows window. 
	 */
	this.open = function(parent) {
		if (parent !== undefined) {
			myParent = parent;
		}
		win.open();
	}

}
