var DOMAIN = "ued";
var collectAll = $("#collectAll"),
    captureAreaItem = $("#captureAreaItem"),
    captureWindowItem = $("#captureWindowItem"),
    captureWebpageItem = $("#captureWebpageItem");
    toggleBtn = $("#toggleBtn");

$("span",collectAll).text(chrome.i18n.getMessage("pinText"));
$("span",captureAreaItem).text(chrome.i18n.getMessage("captureArea"));
$("span",captureWindowItem).text(chrome.i18n.getMessage("captureWindow"));
$("span",captureWebpageItem).text(chrome.i18n.getMessage("captureWebpage"));

var capture = $("#menu .capture");
capture.each(function(index,cap){
  if (!$(cap).hasClass("disabled")) {
    $(cap).addClass("disabled")
  }
})
collectAll.click(function(e){
  if ($(e.target).hasClass("disabled")) {
    return false
  }
  chrome.tabs.getSelected(null, function(tab) {
    var o = tab.url;
    o = o.replace(/^https?:\/\/(www)?/, "");
    if (o.indexOf(DOMAIN) == 0) {
      return
    }
    chrome.tabs.sendRequest(tab.id, {
      msg: "showValidImages"
    }, function(p) {})
  });
  setTimeout(function() {
    window.close()
  }, 100)
})
captureAreaItem.click(function(e){
  if ($(e.target).hasClass("disabled")) {
    return false
  }
  var backFn = chrome.extension.getBackgroundPage();
  backFn.screenshot.showSelectionArea();
  window.close()
})
captureWindowItem.click(function(e){
  if ($(e.target).hasClass("disabled")) {
    return false
  }
  var backFn = chrome.extension.getBackgroundPage();
  backFn.screenshot.captureWindow();
  window.close()
})
captureWebpageItem.click(function(e){
  if ($(e.target).hasClass("disabled")) {
    return false
  }
  var backFn = chrome.extension.getBackgroundPage();
  backFn.screenshot.captureWebpage();
  window.close()
})
toggleBtn.click(function(){
  chrome.extension.sendRequest({
    msg: "toggle"
  }, function(i) {
    $("span",toggleBtn).attr("class",i.isToggleOn?"checked" : "unchecked");
  });
})
chrome.tabs.getSelected(null, function(tab) {
    var i = parseInt(window.navigator.appVersion.match(/Chrome\/(\d+)\./)[1], 10);
    if (i > 26) {
      var obj = chrome.tabs.connect(tab.id);
      obj.onMessage.addListener(function(request) {
        switch (request.msg){
          case "capturable":
            captureWindowItem.removeClass("disabled");
            captureAreaItem.removeClass("disabled");
            captureWebpageItem.removeClass("disabled");
            break;
          case "uncapturable":
            captureWindowItem.addClass("disabled");
            captureAreaItem.addClass("disabled");
            captureWebpageItem.addClass("disabled");
            break;
          case "collect":
            collectAll.removeClass("disabled")
            break;
          case "uncollect":
            collectAll.addClass("disabled")
            break;
          default:    
          break
        }
      });
      obj.postMessage({
        msg: "is_page_capturable"
      });
      obj.postMessage({
        msg: "is_page_collect"
      })
    } else {
      chrome.tabs.sendRequest(p.id, {
        msg: "is_page_capturable"
      }, function(request) {
        if (request.msg == "capturable") {
          captureWindowItem.removeClass("disabled");
          captureAreaItem.removeClass("disabled");
          captureWebpageItem.removeClass("disabled");
        } else {
          captureWindowItem.addClass("disabled");
          captureAreaItem.addClass("disabled");
          captureWebpageItem.addClass("disabled");
        }
      });
      chrome.tabs.sendRequest(p.id, {
        msg: "is_page_collect"
      }, function(q) {
        if (q.msg == "collect") {
          collectAll.removeClass("disabled")
        } else {
          collectAll.addClass("disabled")
        }
      })
    }
});



