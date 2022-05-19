getServerTime();
function getServerTime() {
    var xmlHttp;
    try {
        xmlHttp = new XMLHttpRequest();//FF, Opera, Safari, Chrome
    }
    catch (err1) {
        try {
            xmlHttp = new ActiveXObject('Msxml2.XMLHTTP');//IE
        }
        catch (err2) {
            try {
                xmlHttp = new ActiveXObject('Microsoft.XMLHTTP');
            }
            catch (eerr3) {
                alert("AJAX not supported");//AJAX not supported, use CPU time.
            }
        }
    }
    xmlHttp.open('HEAD', window.location.href.toString(), true);
    xmlHttp.setRequestHeader("Content-Type", "text/html");
    xmlHttp.send('');
    xmlHttp.onreadystatechange = function (status) {
        if (xmlHttp.readyState !== 4) return;
        console.info('loaded', status, xmlHttp);
        daysee(new Date(xmlHttp.getResponseHeader("Date")));
    };
}
