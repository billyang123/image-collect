var Utils = {
  getUserUrl: function(a) {
    return "http://" + DOMAIN + "/" + a.urlname
  },
  getImgUrl: function(a, b) {
    return "http://" + imgHosts[a.bucket] + "/" + a.key + (b ? "_" + b : "")
  },
  i18nReplace: function(b, a) {
    return $(b).innerHTML = chrome.i18n.getMessage(a)
  },
  isThisPlatform: function(a) {
    return navigator.userAgent.toLowerCase().indexOf(a) > -1
  }
};
function $(a) {
  return document.getElementById(a)
}

function $$(a) {
  return document.querySelectorAll(a)
}