
function init_i18n() {
  document.title = chrome.i18n.getMessage("showimageTitle")
}
var bg = chrome.extension.getBackgroundPage();
window.addEventListener("load", function() {
  init_i18n();
  $("canvas").addEventListener("selectstart", function() {
    return false
  });
  $("mask-canvas").addEventListener("selectstart", function() {
    return false
  });
  var a = document.createElement("canvas");
  a.width = $("canvas").width = bg.screenshot.canvas.width;
  a.height = $("canvas").height = bg.screenshot.canvas.height;
  var d = a.getContext("2d");
  d.drawImage(bg.screenshot.canvas, 0, 0);
  $("canvas").getContext("2d").drawImage(a, 0, 0);
  $("canvas").style.display = "block";
  $("btnClose").addEventListener("click",photoshop.closeCurrentTab);
  UploadUI.init();
  setTimeout(function() {
    UploadUI.showDialog();
  }, 100);
  var e = document.querySelector("#bookmarklet .Image");
  var c = new Image();
  c.src = $("canvas").toDataURL("image/png");
  e.appendChild(c);
  $("description").value = bg.screenshot.page_info.text;
  $("url").value = bg.screenshot.page_info.href;

  var upImageUrl = c.src;
  $("tUpload").addEventListener("click",function(){
      UploadUI.showDialog();
      upImageUrl = photoshop.getDataUrl();
      document.querySelector("#bookmarklet .Image").innerHTML = '<img src="'+upImageUrl+'"/>';
  })
  setTimeout(function(){
    UploadUI.selectBoards();
  },500)
  $("J-collection").addEventListener("click",function(){
    var data = {
        text: $("description").value,
        link: $("url").value,
        img_url: upImageUrl,
        media_type : "png",
        border:document.querySelector("#bookmarklet .name").getAttribute("data-id")
    };
    var postUrl = "http://ued2.taobao.com:8080/taobao/u2/collect/index.php";
    var _commUrlStr = "";
      for (key in data) {
        _commUrlStr += key + "=" + encodeURIComponent(data[key]) + "&"
      }
      _commUrlStr += "via=7";
      console.log(_commUrlStr)
      ajax({
        method: "POST",
        url: postUrl,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        data: _commUrlStr,
        success: function(p) {
          UploadUI.closeDialog();
        },
        status: {
          others: function(p, q) {
            console.log(p)
          }
        }
      })
  })
});