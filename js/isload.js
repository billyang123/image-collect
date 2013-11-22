  (function() {
  console.log("isload.js is loaded");
  var UED = "__UED_2_";
  var a = parseInt(window.navigator.appVersion.match(/Chrome\/(\d+)\./)[1], 10);
  if (a > 26) {
    chrome.runtime.onConnect.addListener(function(ext) {
      ext.onMessage.addListener(function(request) {
        if (request.msg == "is_page_capturable") {
          try {
            if (isPageCapturable()) {
              ext.postMessage({
                msg: "capturable"
              })
            } else {
              ext.postMessage({
                msg: "uncapturable"
              })
            }
          } catch (g) {
            ext.postMessage({
              msg: "loading"
            })
          }
        } else {
          if (request.msg == "is_page_colloct") {
            var col = document[UED] && document[UED]["showValidImages"] ? "colloct" : "uncolloct";
            ext.postMessage({
              msg: col
            })
          }
        }
      })
    })
  } else {
    chrome.extension.onRequest.addListener(function(request, sender, response) {
      if (request.msg == "is_page_capturable") {
        try {
          if (isPageCapturable()) {
            response({
              msg: "capturable"
            })
          } else {
            response({
              msg: "uncapturable"
            })
          }
        } catch (err) {
          response({
            msg: "loading"
          })
        }
      } else {
        if (request.msg == "is_page_colloct") {
          var g = document[UED] && document[UED]["showValidImages"] ? "colloct" : "uncolloct";
          response({
            msg: g
          })
        }
      }
    })
  }
})();