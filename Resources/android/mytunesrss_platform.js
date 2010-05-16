Titanium.include('json2.js');

var buttonStyle = undefined;
var tableViewGroupStyle = undefined;

function ajaxCall(func, parameterArray, resultCallback) {
    var httpClient = Titanium.Network.createHTTPClient();
    httpClient.onload = function() {
        var response = JSON2.parse(this.responseText);
        if (response.error) {
            Titanium.API.error('JSON RPC error: ' + JSON2.stringify(response.error));
        } else {
            Titanium.API.debug('JSON RPC result: ' + JSON2.stringify(response.result));
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
    Titanium.API.debug('JSON RPC data: ' + JSON2.stringify(data));
    httpClient.send(JSON2.stringify(data));
}

function addTopToolbar(window, titleText, leftButton, rightButton) {
    var view = Titanium.UI.createView({backgroundColor:'#CCC',top:0,height:45,left:0,right:0});
    if (titleText) {
        var title = Titanium.UI.createLabel({text:titleText,top:10,height:45,textAlign:'center',color:'#FFF',font:{fontSize:20,fontWeight:'bold'}});
        view.add(title);
    }
    if (leftButton) {
        leftButton.top = 5;
        leftButton.bottom = 5;
        leftButton.left = 10;
        view.add(leftButton);
    }
    if (rightButton) {
        rightButton.top = 5;
        rightButton.bottom = 5;
        rightButton.right = 10;
        view.add(rightButton);
    }
    window.add(view);
}
