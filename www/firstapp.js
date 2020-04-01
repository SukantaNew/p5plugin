var exec = require('cordova/exec');
var p5MobileTrackService="";var p5AppKey="";var p5accountid="";p5DeviceId="";var p5AppVersion="";

module.exports.p5CallTrack = function (arg0, success, error) {
   // alert("plumb5 : ");
    exec(success, error, 'firstapp', 'p5CallTrack', [arg0]);
};

module.exports.p5Init = function (p5ServiceUrl,p5AppKey,p5AccountId,p5AppVersion) {

    var AccountInfo = { ServiceUrl: p5ServiceUrl, AppKey: p5AppKey, AccountId: p5AccountId,AppVersion: p5AppVersion}
    p5ApiInit(JSON.stringify(AccountInfo))

    //sucess('{"uuid":"112233","manufacturer":"google","model":"sam-123","os":"android","carrier":"","resolution":"123*30","appversion":"1.3.4"}');
    if(window.location.href.toLowerCase().indexOf("http")>-1){
        console.log("Please run in mobile device.");
    }else{
        P5Engine.p5CallTrack([000],sucess,failed);
    }
};

module.exports.p5SetUserInfo = function (Name, EmailId, Mobile, ExtraParam) {
    //alert("user info");
    var acInfo=p5CheckAccountInfo();   
    if(acInfo==false){return;}

    var data = JSON.stringify({
        "AppKey": p5AppKey,
        "DeviceId": p5DeviceId,
        "Name": Name,
        "EmailId": EmailId,
        "PhoneNumber": Mobile,
        "ExtraParam": ExtraParam
    });

    var xhr = new XMLHttpRequest();
    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === 4) {
            console.log(this.responseText);

        }
    });

    xhr.open("POST", p5MobileTrackService + "RegisterUser");
    xhr.setRequestHeader("content-type", "application/json");
    xhr.send(data);
}



function sucess(param)
{
    //alert("sucess--"+param);
    var acInfo=p5CheckAccountInfo();   
    if(acInfo==false){return;}    
    var getPlumb5Data=JSON.parse(param);
    p5DeviceId=getPlumb5Data.uuid;
    var P5AppDeviceInfo = { DeviceId: p5DeviceId, Locality: "", City: "bangalore", State: "karnataka", Country: "india", CountryCode: "ind", Latitude: "", Longitude: "", CarrierName:getPlumb5Data.carrier, IsObjectReady: false };

    var p5SessionResponse = { Code: "", SessionToken: "", Message: "", isEventloaded: false };
    var p5objectCheckCounter = 1;
    // var p5MobileTrackService = "https://mtracker.plumb5.com/mTracker.svc/";
    // var p5accountid = 186;
    // var p5AppKey = "p5m1a2i3sdk186";
    var p5session = p5GetCookie("p5SessionId" + p5accountid);
    var p5prevtime = p5GetCookie("p5PrevTime" + p5accountid);
    var plumbCurrentTime = plumbfivegetdate("CurrentTime");
    var plumbSession;
    var p5fcmtoken="";
    
    
    var oldimage = "";
    var imageArray = [];
    var upldImg = 0;
    var finalField = [];
    var innerField = "";
    var position="";

     //Set or Get the sessions
     p5SetCookie("p5PrevTime" + p5accountid, plumbCurrentTime, 36500);
     p5prevtime = (p5prevtime == undefined || p5prevtime == null) ? p5GetCookie("p5PrevTime" + p5accountid) : p5prevtime;
     if (p5session == undefined) {
         plumbSession = plumbfivegetdate("Session");
         p5SetCookie("p5SessionId" + p5accountid, plumbSession, 36500);
         p5session = plumbSession;
     }
     else {
         p5session = p5session.replace(/T/g, '').replace(/-/g, '').replace(/ /g, '').replace(/:/g, '')
     }

     onPlumb5DeviceReady();

     function onPlumb5DeviceReady() {
        //alert("ready");
             
        if (p5DeviceId && p5DeviceId != null && p5DeviceId != "" && p5DeviceId.length > 0) {
            if (typeof FCMPlugin != 'undefined')
            {
                //alert("Fcm Exist");
                FCMPlugin.onTokenRefresh(function(token){
                    //alert("token refresh: "+ token );
                    FCMPlugin.onNotification(function(data){
                        //alert( JSON.stringify(data));
                      });

                    p5fcmtoken=token;
                    getP5InitDeviceDetails();
                });
                FCMPlugin.getToken(function (token) {
                    //alert("get token: "+token);

                    FCMPlugin.onNotification(function(data){
                        //alert( JSON.stringify(data));

                        if(data.wasTapped){
                            //Notification was received on device tray and tapped by the user.
                            cordova.plugins.notification.local.schedule({
                                title: 'My first notification',
                                text: 'Thats pretty easy...',
                                foreground: true
                            });
                            
                            //alert( JSON.stringify(data) );
                          }else{
                            //Notification was received in foreground. Maybe the user needs to be notified.

                            cordova.plugins.notification.local.schedule({
                                title: 'My first notification',
                                text: 'Thats pretty easy...',
                                foreground: true
                            });

                            //alert( JSON.stringify(data) );
                          }
                      });

                    p5fcmtoken=token;
                    getP5InitDeviceDetails();
                });
            }else{
                getP5InitDeviceDetails();
            }
            
            DeviceReadySavePlumb5SessionTracker();
        }
    }

    function onPlumb5UrlChange() {
        if (typeof P5AppDeviceInfo != "undefined" && P5AppDeviceInfo != null && P5AppDeviceInfo.IsObjectReady == true) {
            SavePlumb5SessionTracker();
        }
    }


    function getP5InitDeviceDetails()
    {      
        var AppVersion=p5AppVersion==undefined?getPlumb5Data.AppVersion:p5AppVersion;
        //alert("token new..: "+p5fcmtoken);
        var data = JSON.stringify({"AppKey":p5AppKey,
        "GcmRegId":p5fcmtoken,
         //"DeviceInfo":{"Manufacturer":"samsung","Name":"sam-123","Os":"android","Id":"33333333","OsVersion":"and-123","CarrierName":"","Resolution":"","AppVersion":"1.9.8"
         "DeviceInfo":{"Manufacturer":getPlumb5Data.manufacturer,"Name":getPlumb5Data.model,"Os":getPlumb5Data.os,"Id":getPlumb5Data.uuid,"OsVersion":getPlumb5Data.osversion,"CarrierName":getPlumb5Data.carrier,"Resolution":getPlumb5Data.resolution,"AppVersion":AppVersion
         }} );

        //alert(data);

        //document.getElementById("txtdata").value=data;

        var xhr = new XMLHttpRequest();
        xhr.addEventListener("readystatechange", function () {
            if (this.readyState === 4) {
                console.log(this.responseText);
                var responseResult = JSON.parse(this.responseText);
            }
        });

        xhr.open("POST", p5MobileTrackService + "RegisterDevice");
        xhr.setRequestHeader("content-type", "application/json");
        xhr.send(data);
    }

    

    function DeviceReadySavePlumb5SessionTracker() {
        //alert("load");
        checkAndAssignP5Session();

        var data = JSON.stringify({
            "AppKey": p5AppKey,
            "CarrierName": P5AppDeviceInfo.CarrierName,
            "TrackData": [
              {
                  "SessionId": p5session,
                  "GcmRegId": "0",
                  "ScreenName": window.location.href,
                  "CampaignId": 0,
                  "NewSession": 0,
                  "DeviceId": P5AppDeviceInfo.DeviceId,
                  "Offline": 0,
                  "TrackDate": new Date(),
                  "GeofenceId": "0",
                  "Locality": P5AppDeviceInfo.Locality,
                  "City": P5AppDeviceInfo.City,
                  "State": P5AppDeviceInfo.State,
                  "Country": P5AppDeviceInfo.Country,
                  "CountryCode": P5AppDeviceInfo.CountryCode,
                  "Latitude": P5AppDeviceInfo.Latitude,
                  "Longitude": P5AppDeviceInfo.Longitude,
                  "PageParameter": window.location.href.split('?')[1] != undefined ? window.location.href.split('?')[1] : ""
              }
            ]
        });

        

        var xhr = new XMLHttpRequest();
        xhr.addEventListener("readystatechange", function () {
            if (this.readyState === 4) {
                //alert(this.responseText);
                var responseResult = JSON.parse(this.responseText);

                var eventdata='[{"Code":"0", "SessionToken":"1111111111", "Message":"sucess", "MobileEventSettingDetails":[{"EventIdentifier":"btnLogin", "EventName":"Login", "EventSpecifier":"Id", "Id":4},{"EventIdentifier":"btnNew", "EventName":"New", "EventSpecifier":"Class", "Id":8}] }]';
                responseResult = JSON.parse(eventdata);
                if (responseResult != undefined && responseResult[0] != undefined && responseResult[0] != null && responseResult[0].Code != undefined && responseResult[0].Code == "0") {
                    p5SessionResponse.Code = responseResult[0].Code;
                    p5SessionResponse.isEventloaded = true;
                    p5SessionResponse.MobileEventSettingDetails = responseResult[0].MobileEventSettingDetails;
                    setTimeout(function(){ BindPlumb5Events();},5000);
                }
            }
        });

        xhr.open("POST", p5MobileTrackService + "initSession");
        xhr.setRequestHeader("content-type", "application/json");
        xhr.send(data);
    }

    function SavePlumb5SessionTracker() {

        //alert("page change");
        checkAndAssignP5Session();

        var data = JSON.stringify({
            "AppKey": p5AppKey,
            "CarrierName": P5AppDeviceInfo.CarrierName,
            "TrackData": [
              {
                  "SessionId": p5session,
                  "GcmRegId": "0",
                  "ScreenName": window.location.href,
                  "CampaignId": 0,
                  "NewSession": 0,
                  "DeviceId": P5AppDeviceInfo.DeviceId,
                  "Offline": 0,
                  "TrackDate": new Date(),
                  "GeofenceId": "0",
                  "Locality": P5AppDeviceInfo.Locality,
                  "City": P5AppDeviceInfo.City,
                  "State": P5AppDeviceInfo.State,
                  "Country": P5AppDeviceInfo.Country,
                  "CountryCode": P5AppDeviceInfo.CountryCode,
                  "Latitude": P5AppDeviceInfo.Latitude,
                  "Longitude": P5AppDeviceInfo.Longitude,
                  "PageParameter": window.location.href.split('?')[1] != undefined ? window.location.href.split('?')[1] : ""
              }
            ]
        });

        var xhr = new XMLHttpRequest();
        xhr.addEventListener("readystatechange", function () {
            if (this.readyState === 4) {
                console.log(this.responseText);

            }
        });

        xhr.open("POST", p5MobileTrackService + "initSession");
        xhr.setRequestHeader("content-type", "application/json");
        xhr.send(data);
    }

    function BindPlumb5Events() {
        //alert("sss"+p5SessionResponse.MobileEventSettingDetails.length);
        if (p5SessionResponse != undefined && p5SessionResponse != null && p5SessionResponse.isEventloaded == true && p5SessionResponse.MobileEventSettingDetails != null && p5SessionResponse.MobileEventSettingDetails.length > 0) {
            for (var i = 0; i < p5SessionResponse.MobileEventSettingDetails.length; i++) {
                if (p5SessionResponse.MobileEventSettingDetails[i].EventSpecifier == "Id") {
                    window.document.getElementById(p5SessionResponse.MobileEventSettingDetails[i].EventIdentifier).addEventListener("click", SaveEventInPlumb5.bind(this, "BUTTON_CLICK", p5SessionResponse.MobileEventSettingDetails[i].EventName, p5SessionResponse.MobileEventSettingDetails[i].EventIdentifier));
                } else {
					window.document.getElementsByClassName(p5SessionResponse.MobileEventSettingDetails[i].EventIdentifier)[0].addEventListener("click", SaveEventInPlumb5.bind(this, "BUTTON_CLICK", p5SessionResponse.MobileEventSettingDetails[i].EventName, p5SessionResponse.MobileEventSettingDetails[i].EventIdentifier));	
                }
            }
        }
    }
		
    var SaveEventInPlumb5 = function (eventType, eventName, eventValue) {

        //alert("event save"+p5DeviceId);
        checkAndAssignP5Session();
		
        if (p5DeviceId && p5DeviceId != null && p5DeviceId != "" && p5DeviceId.length > 0) {
            var eventData = JSON.stringify({
                "AppKey": p5AppKey,
                "EventData": [
                  {
                      "SessionId": p5session,
                      "DeviceId": p5DeviceId,
                      "Type": eventType,
                      "Name": eventName,
                      "Value": eventValue,
                      "Offline": "0",
                      "TrackDate": new Date()
                  }
                ]
            });

            
            var xhr = new XMLHttpRequest();
            xhr.addEventListener("readystatechange", function () {
                if (this.readyState === 4) {
                    console.log(this.responseText);
                }
            });

            xhr.open("POST", p5MobileTrackService + "logData");
            xhr.setRequestHeader("content-type", "application/json");
            xhr.send(eventData);
        }
    };

    function checkAndAssignP5Session() {
        p5prevtime = p5prevtime != undefined ? ((p5prevtime.indexOf("T") > -1 || p5prevtime.indexOf("-") > -1) ? p5prevtime.replace(/-/g, "/").replace("T", " ") : p5prevtime) : p5prevtime;
        var p5sessiondiff = Math.floor((new Date(plumbCurrentTime) - new Date(p5prevtime)) / 1000);
        if (p5sessiondiff > 300) {
            plumbSession = plumbfivegetdate("Session");
            p5SetCookie("p5SessionId" + p5accountid, plumbSession, 36500);
            p5session = plumbSession;

            plumbCurrentTime = plumbfivegetdate("CurrentTime");
            p5SetCookie("p5PrevTime" + p5accountid, plumbCurrentTime, 36500);
            p5prevtime = p5GetCookie("p5PrevTime" + p5accountid);
        }
    }

    

 //Cookie value from time...............
    function plumbfivegetdate(P5key) {
        var today = new Date();
        var strYear = today.getFullYear();
        var iMonth = today.getMonth() + 1;
        var iQuarter = Math.ceil((iMonth / 12) * 4);
        var iDay = today.getDate();
        var strDateOut = "";
        iMonth = (iMonth < 10) ? "0" + iMonth : iMonth;
        iDay = (iDay < 10) ? "0" + iDay : iDay;
        switch (P5key) {
            case "Session":
                strDateOut = strYear.toString() + '' + (iMonth.length == 1 ? '0' + iMonth : iMonth.toString()) + '' + (iDay.length == 1 ? '0' + iDay : iDay.toString()) + '' + (today.getHours().toString().length == 1 ? '0' + today.getHours().toString() : today.getHours().toString()) + '' + (today.getSeconds().toString().length == 1 ? '0' + today.getSeconds().toString() : today.getSeconds().toString()) + '' + (today.getMilliseconds().toString().length == 1 ? '00' + today.getMilliseconds().toString() : today.getMilliseconds().toString()) + '' + (today.getMinutes().toString().length == 1 ? '0' + today.getMinutes().toString() : today.getMinutes().toString()) + (Math.floor(Math.random() * 12345678910)).toString();
                break;
            case "Machine":
                strDateOut = (iMonth.length == 1 ? '0' + iMonth : iMonth.toString()) + '' + (iDay.length == 1 ? '0' + iDay : iDay.toString()) + '' + strYear.toString() + '' + (today.getHours().toString().length == 1 ? '0' + today.getHours().toString() : today.getHours().toString()) + '' + (today.getMinutes().toString().length == 1 ? '0' + today.getMinutes().toString() : today.getMinutes().toString()) + '' + (today.getSeconds().toString().length == 1 ? '0' + today.getSeconds().toString() : today.getSeconds().toString()) + (today.getMilliseconds().toString().length == 1 ? '00' + today.getMilliseconds().toString() : today.getMilliseconds().toString()) + (Math.floor(Math.random() * 12345678910)).toString();
                break;
            case "CurrentTime":
                strDateOut = strYear.toString() + '/' + (iMonth.length == 1 ? '0' + iMonth : iMonth.toString()) + '/' + (iDay.length == 1 ? '0' + iDay : iDay.toString()) + ' ' + (today.getHours().toString().length == 1 ? '0' + today.getHours().toString() : today.getHours().toString()) + ':' + (today.getMinutes().toString().length == 1 ? '0' + today.getMinutes().toString() : today.getMinutes().toString()) + ':' + (today.getSeconds().toString().length == 1 ? '0' + today.getSeconds().toString() : today.getSeconds().toString());
                break;
        }
        return strDateOut;
    }


}

//set account info...............
function p5ApiInit(accountinfo)
{
    var p5AccountInfo = p5GetCookie("p5AccountInfo");
    if (p5AccountInfo == undefined) {
        p5SetCookie("p5AccountInfo", accountinfo, 36500);
    }  
}

//check account info....
function p5CheckAccountInfo()
{
    if (p5GetCookie("p5AccountInfo") == undefined) {
        console.log("Please intialize plumb5 api.");
        return false;
    }
    else{
        var p5AccountInfo = JSON.parse(p5GetCookie("p5AccountInfo"));
        p5MobileTrackService = p5AccountInfo.ServiceUrl;//"https://mtracker.plumb5.com/mTracker.svc/"
        p5accountid = p5AccountInfo.AccountId;//186
        p5AppKey = p5AccountInfo.AppKey;//"p5m1a2i3sdk186"
        p5AppVersion = p5AccountInfo.AppVersion;
        return true;
    }
}
//default get set cookie function...............
function p5GetCookie(c_name) {
    var i, x, y, ARRcookies = document.cookie.split(";");
    for (i = 0; i < ARRcookies.length; i++) {
        x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
        y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
        x = x.replace(/^\s+|\s+$/g, "");
        if (x == c_name) {
            return unescape(y);
        }
    }
}
function p5SetCookie(c_name, value, exdays) {
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + exdays);
    var c_value = escape(value) + ((exdays == null) ? "" : ";path=/;expires=" + exdate.toUTCString());
    document.cookie = c_name + "=" + c_value;
}

function getBrowserInfo (getModel) {
    var userAgent = navigator.userAgent;
    //alert(userAgent);
    var returnVal = '';
    var offset;

    if ((offset = userAgent.indexOf('Edge')) !== -1) {
        returnVal = (getModel) ? 'Edge' : userAgent.substring(offset + 5);
    } else if ((offset = userAgent.indexOf('Chrome')) !== -1) {
        returnVal = (getModel) ? 'Chrome' : userAgent.substring(offset + 7);
    } else if ((offset = userAgent.indexOf('Safari')) !== -1) {
        if (getModel) {
            returnVal = 'Safari';
        } else {
            returnVal = userAgent.substring(offset + 7);

            if ((offset = userAgent.indexOf('Version')) !== -1) {
                returnVal = userAgent.substring(offset + 8);
            }
        }
    } else if ((offset = userAgent.indexOf('Firefox')) !== -1) {
        returnVal = (getModel) ? 'Firefox' : userAgent.substring(offset + 8);
    } else if ((offset = userAgent.indexOf('MSIE')) !== -1) {
        returnVal = (getModel) ? 'MSIE' : userAgent.substring(offset + 5);
    } else if ((offset = userAgent.indexOf('Trident')) !== -1) {
        returnVal = (getModel) ? 'MSIE' : '11';
    }

    if ((offset = returnVal.indexOf(';')) !== -1 || (offset = returnVal.indexOf(' ')) !== -1) {
        returnVal = returnVal.substring(0, offset);
    }

    return returnVal;
}


function failed(param)
{
    alert("failed--"+param);
}