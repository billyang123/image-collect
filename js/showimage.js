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
  UploadUI.init()
});