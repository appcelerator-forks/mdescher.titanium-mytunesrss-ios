Titanium.include('mytunesrss.js');

function wrap(components) {
    var row = Titanium.UI.createTableViewRow();
    for (var i = 0; i < components.length; i++) {
        row.add(components[i]);
    }
    return row;
}

var win = Titanium.UI.currentWindow;
var transcoderSwitches = [];

var actIndicatorView = Titanium.UI.createView({top:0,left:0,bottom:0,right:0,backgroundColor:'#000',opacity:0.8,visible:false});
actIndicatorView.add(Titanium.UI.createActivityIndicator({top:0,bottom:0,left:0,right:0,visible:true}));
win.addEventListener('focus', function() {
    actIndicatorView.hide();
});

var buttonCancel = Titanium.UI.createButton({title:'Cancel',style:buttonStyle});
buttonCancel.addEventListener('click', function() {
    win.close();
});

var buttonSave = Titanium.UI.createButton({title:'Save',style:buttonStyle});
buttonSave.addEventListener('click', function() {
    var names = [];
    for (var i = 0; i < win.ajaxResult.transcoderNames.length; i++) {
        if (transcoderSwitches[i].value === true) {
            names.push(win.ajaxResult.transcoderNames[i]);
        }
    }
    actIndicatorView.show();
    var params = Titanium.App.Properties.getString('serverMajor') < 4 ? [names, true] : [names]; // TODO require server 4.0.0 to remove this
    ajaxCall('TranscodingService.getTranscodingParameter', params, function(result, error) {
        if (result) {
            if (names.length > 0) {
                Titanium.App.Properties.setString('tcParam', result);
            } else {
                Titanium.App.Properties.removeProperty('tcParam');
            }
            for (var i = 0; i < win.ajaxResult.transcoderNames.length; i++) {
                var transcoderName = win.ajaxResult.transcoderNames[i];
                Titanium.App.Properties.setBool('transcoder_' + transcoderName, transcoderSwitches[i].value);
            }
            win.close();
        } else if (error) {
            actIndicatorView.hide();
            handleUnexpectedServerError(error.msg);
        } else {
            actIndicatorView.hide();
            Titanium.UI.createAlertDialog({message:'No response from server, please make sure the server is running.',buttonNames:['Ok']}).show();
        }
    });
});

var tableViewData = [];
if (win.ajaxResult.transcoderNames.length > 0) {
    tableViewData.push(Titanium.UI.createTableViewSection({headerTitle:'Transcoder'}));
    for (var i = 0; i < win.ajaxResult.transcoderNames.length; i++) {
        var transcoderName = win.ajaxResult.transcoderNames[i];
        var transcoderSwitch = Titanium.UI.createSwitch({right:10,value:Titanium.App.Properties.getBool('transcoder_' + transcoderName, false)});
        transcoderSwitches.push(transcoderSwitch);
        tableViewData[0].add(wrap([Titanium.UI.createLabel({text:transcoderName,left:10}), transcoderSwitch]));
    }
}

var tableView = Titanium.UI.createTableView({data:tableViewData,style:tableViewGroupStyle,top:45});

addTopToolbar(win, 'Settings', buttonCancel, buttonSave);
win.add(tableView);
win.add(actIndicatorView);
