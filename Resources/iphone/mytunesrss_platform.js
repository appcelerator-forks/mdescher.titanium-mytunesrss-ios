var buttonStyle = Titanium.UI.iPhone.SystemButtonStyle.BORDERED;
var tableViewGroupStyle = Titanium.UI.iPhone.TableViewStyle.GROUPED;

function ajaxCall(func, parameterArray, resultCallback) {
    var httpClient = Titanium.Network.createHTTPClient();
    httpClient.onload = function() {
        var response = JSON.parse(this.responseText);
        if (response.error) {
            Titanium.API.error('JSON RPC error: ' + JSON.stringify(response.error));
        } else {
            Titanium.API.debug('JSON RPC result: ' + JSON.stringify(response.result));
        }
        resultCallback(response.result, response.error);
    };
    httpClient.onerror = function() {
        resultCallback();
    };
    httpClient.open('POST', Titanium.App.Properties.getString('serverUrl') + '/jsonrpc');
    httpClient.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    if (Titanium.App.Properties.getString('jsonRpcSessionId') != undefined) {
        Titanium.API.debug('JSON RPC header "X-MyTunesRSS-ID": ' + Titanium.App.Properties.getString('jsonRpcSessionId'));
        httpClient.setRequestHeader('X-MyTunesRSS-ID', Titanium.App.Properties.getString('jsonRpcSessionId'));
    }
    var data = {
        'version' : '1.1',
        'method' : func,
        'id' : '0',
        'params' : parameterArray
    };
    Titanium.API.debug('JSON RPC data: ' + JSON.stringify(data));
    httpClient.send(JSON.stringify(data));
}

function addTopToolbar(window, titleText, leftButton, rightButton) {
    var flexSpace = Titanium.UI.createButton({systemButton:Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE});
    var toolbarItems = [];
    if (leftButton) {
        toolbarItems.push(leftButton);
    }
    toolbarItems.push(flexSpace);
    if (rightButton) {
        toolbarItems.push(rightButton);
    }
    window.add(Titanium.UI.createToolbar({top:0,height:45,items:toolbarItems}));
    if (titleText) {
        var title = Titanium.UI.createLabel({text:titleText,left:0,right:0,top:0,height:45,textAlign:'center',color:'#FFF',font:{fontSize:20,fontWeight:'bold'}});
        window.add(title);
    }
}
