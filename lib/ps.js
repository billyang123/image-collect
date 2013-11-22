var canvas = new Canvas();
var photoshop = {
  canvas: document.createElement("canvas"),
  tabTitle: "",
  startX: 0,
  startY: 0,
  endX: 0,
  endY: 0,
  dragFlag: false,
  flag: "rectangle",
  layerId: "layer0",
  canvasId: "",
  color: "#ff0000",
  highlightColor: "",
  lastValidAction: 0,
  markedArea: [],
  isDraw: true,
  offsetX: 0,
  offsetY: 36,
  nowHeight: 0,
  nowWidth: 0,
  highlightType: "border",
  highlightMode: "rectangle",
  text: "",
  "text-shadow": "1px 1px 8px #000",
  i18nReplace: Utils.i18nReplace,
  initCanvas: function() {
    $("canvas").width = $("mask-canvas").width = $("photo").style.width = photoshop.canvas.width = bg.screenshot.canvas.width;
    $("photo").style.width = bg.screenshot.canvas.width + "px";
    $("canvas").height = $("mask-canvas").height = $("photo").style.height = photoshop.canvas.height = bg.screenshot.canvas.height;
    $("photo").style.height = bg.screenshot.canvas.height + "px";
    var a = photoshop.canvas.getContext("2d");
    a.drawImage(bg.screenshot.canvas, 0, 0);
    a = $("canvas").getContext("2d");
    a.drawImage(photoshop.canvas, 0, 0);
    $("canvas").style.display = "block"
  },
  init: function() {
    photoshop.initTools();
    photoshop.initCanvas();
    photoshop.tabTitle = bg.screenshot.tab.title;
    var a = function() {
      $("showBox").style.height = window.innerHeight - photoshop.offsetY - 1 + "px"
    };
    setTimeout(a, 50)
  },
  markCurrentElement: function(c) {
    if (c && c.parentNode) {
      var b = c.parentNode.children;
      for (var a = 0; a < b.length; a++) {
        var d = b[a];
        if (d == c) {
          c.className = "mark"
        } else {
          d.className = ""
        }
      }
    }
  },
  setHighLightMode: function() {
    photoshop.highlightType = localStorage.highlightType || "border";
    photoshop.color = localStorage.highlightColor || "#FF0000";
    $(photoshop.layerId).style.border = "2px solid " + photoshop.color;
    if (photoshop.highlightType == "rect") {
      $(photoshop.layerId).style.backgroundColor = photoshop.color;
      $(photoshop.layerId).style.opacity = 0.5
    }
    if (photoshop.flag == "rectangle") {
      $(photoshop.layerId).style.borderRadius = "0 0"
    } else {
      if (photoshop.flag == "radiusRectangle") {
        $(photoshop.layerId).style.borderRadius = "6px 6px"
      } else {
        if (photoshop.flag == "ellipse") {
          $(photoshop.layerId).style.border = "0";
          $(photoshop.layerId).style.backgroundColor = "";
          $(photoshop.layerId).style.opacity = 1
        }
      }
    }
  },
  setBlackoutMode: function() {
    photoshop.color = "#000000";
    $(photoshop.layerId).style.opacity = 1;
    $(photoshop.layerId).style.backgroundColor = "#000000";
    $(photoshop.layerId).style.border = "2px solid #000000"
  },
  setTextMode: function() {
    localStorage.fontSize = localStorage.fontSize || "16";
    photoshop.color = localStorage.fontColor = localStorage.fontColor || "#FF0000";
    $(photoshop.layerId).setAttribute("contentEditable", true);
    $(photoshop.layerId).style.border = "1px dotted #333333";
    $(photoshop.layerId).style.cursor = "text";
    $(photoshop.layerId).style.lineHeight = localStorage.fontSize + "px";
    $(photoshop.layerId).style.fontSize = localStorage.fontSize + "px";
    $(photoshop.layerId).style.color = photoshop.color;
    $(photoshop.layerId).style["text-shadow"] = photoshop["text-shadow"];
    $(photoshop.layerId).innerHTML = "<br/>";
    var a = $(photoshop.layerId);
    a.addEventListener("blur", function() {
      photoshop.setTextToArray("layer" + (photoshop.lastValidAction - 1))
    });
    a.addEventListener("click", function() {
      this.style.border = "1px dotted #333333"
    }, true);
    a.addEventListener("mouseout", function() {
      if (!photoshop.dragFlag) {
        this.style.borderWidth = 0
      }
    }, false);
    a.addEventListener("mousemove", function() {
      this.style.border = "1px dotted #333333"
    }, false)
  },
  setTextToArray: function(c) {
    var b = $(c).innerText.split("\n");
    if (photoshop.markedArea.length > 0) {
      for (var a = photoshop.markedArea.length - 1; a >= 0; a--) {
        if (photoshop.markedArea[a].id == c) {
          photoshop.markedArea[a].context = b;
          break
        }
      }
      $(c).style.borderWidth = 0
    }
  },
  openOptionPage: function() {
    chrome.tabs.create({
      url: chrome.extension.getURL("preferences.html")
    })
  },
  closeCurrentTab: function() {
    chrome.tabs.getSelected(null, function(a) {
      chrome.tabs.remove(a.id)
    })
  },
  finish: function() {
    var a = $("canvas").getContext("2d");
    a.drawImage(photoshop.canvas, 0, 0)
  },
  colorRgba: function(b, c) {
    var e = b.toLowerCase();
    var a = [];
    for (var d = 1; d < e.length; d += 2) {
      a.push(parseInt("0x" + e.slice(d, d + 2)))
    }
    return "rgba(" + a.join(",") + "," + c + ")"
  },
  toDo: function(a, b) {
    photoshop.flag = b;
    photoshop.isDraw = true;
    photoshop.markCurrentElement(a)
  },
  setDivStyle: function(a, b) {
    $(photoshop.layerId).setAttribute("style", "");
    $(photoshop.layerId).setAttribute("contentEditable", false);
    switch (photoshop.flag) {
      case "rectangle":
      case "radiusRectangle":
      case "ellipse":
        photoshop.setHighLightMode();
        break;
      case "redact":
        photoshop.setBlackoutMode();
        break;
      case "text":
        photoshop.setTextMode();
        break;
      case "line":
      case "arrow":
        photoshop.drawLineOnMaskCanvas(a, b, a, b, "lineStart", photoshop.layerId);
        break;
      case "blur":
        photoshop.createCanvas(photoshop.layerId);
        break
    }
  },
  createDiv: function() {
    photoshop.lastValidAction++;
    photoshop.layerId = "layer" + photoshop.lastValidAction;
    if ($(photoshop.layerId)) {
      photoshop.removeElement(photoshop.layerId)
    }
    var a = document.createElement("div");
    a.id = photoshop.layerId;
    a.className = "layer";
    $("photo").appendChild(a);
    if (photoshop.flag == "blur") {
      photoshop.createCanvas(photoshop.layerId)
    }
    return a
  },
  createCanvas: function(b) {
    photoshop.canvasId = "cav-" + b;
    if (!$(photoshop.canvasId)) {
      var a = document.createElement("canvas");
      a.id = photoshop.canvasId;
      a.width = 10;
      a.height = 10;
      $(photoshop.layerId).appendChild(a);
      return a
    }
    return $(photoshop.canvasId)
  },
  createCloseButton: function(b, f, e, d, a) {
    var c = document.createElement("img");
    c.id = f;
    c.src = "/images/editor/cross.png";
    c.className = "closeButton";
    c.style.left = e - 15 + "px";
    if (photoshop.flag == "line" || photoshop.flag == "arrow") {
      c.style.left = e / 2 - 5 + "px";
      c.style.top = d / 2 - 5 + "px"
    }
    c.onclick = function() {
      $(b).style.display = "none";
      photoshop.removeLayer(b)
    };
    $(b).onmousemove = function() {
      if (!photoshop.dragFlag) {
        photoshop.showCloseButton(f);
        $(b).style.zIndex = 110;
        photoshop.isDraw = (a == "text" ? false : photoshop.isDraw)
      }
    };
    $(b).onmouseout = function() {
      photoshop.hideCloseButton(f);
      $(b).style.zIndex = 100;
      photoshop.isDraw = true
    };
    $(b).appendChild(c);
    return c
  },
  showCloseButton: function(a) {
    $(a).style.display = "block"
  },
  hideCloseButton: function(a) {
    $(a).style.display = "none";
    photoshop.isDraw = true
  },
  removeLayer: function(b) {
    for (var a = 0; a < photoshop.markedArea.length; a++) {
      if (photoshop.markedArea[a].id == b) {
        photoshop.markedArea.splice(a, 1);
        break
      }
    }
    photoshop.removeElement(b)
  },
  onMouseDown: function(a) {
    if (photoshop.isDraw && a.button != 2) {
      photoshop.startX = a.pageX + $("showBox").scrollLeft - photoshop.offsetX;
      photoshop.startY = a.pageY + $("showBox").scrollTop - photoshop.offsetY;
      photoshop.setDivStyle(photoshop.startX, photoshop.startY);
      photoshop.dragFlag = true;
      $(photoshop.layerId).style.left = photoshop.startX + "px";
      $(photoshop.layerId).style.top = photoshop.startY + "px";
      $(photoshop.layerId).style.height = 0;
      $(photoshop.layerId).style.width = 0;
      $(photoshop.layerId).style.display = "block"
    }
  },
  onMouseUp: function(a) {
    $("mask-canvas").style.zIndex = 10;
    photoshop.endX = a.pageX + $("showBox").scrollLeft - photoshop.offsetX;
    if (photoshop.endX > photoshop.canvas.width) {
      photoshop.endX = photoshop.canvas.width
    }
    if (photoshop.endX < 0) {
      photoshop.endX = 0
    }
    photoshop.endY = a.pageY + $("showBox").scrollTop - photoshop.offsetY;
    if (photoshop.endY > photoshop.canvas.height) {
      photoshop.endY = photoshop.canvas.height
    }
    if (photoshop.endY < 0) {
      photoshop.endY = 0
    }
    if (photoshop.isDraw && photoshop.dragFlag && (photoshop.endX != photoshop.startX || photoshop.endY != photoshop.startY)) {
      if (photoshop.flag == "line" || photoshop.flag == "arrow") {
        photoshop.drawLineOnMaskCanvas(photoshop.startX, photoshop.startY, photoshop.endX, photoshop.endY, "drawEnd", photoshop.layerId)
      } else {
        if (photoshop.flag == "blur") {
          canvas.blurImage(photoshop.canvas, $(photoshop.canvasId), photoshop.layerId, photoshop.startX, photoshop.startY, photoshop.endX, photoshop.endY)
        } else {
          if (photoshop.flag == "ellipse") {
            photoshop.drawEllipseOnMaskCanvas(photoshop.endX, photoshop.endY, "end", photoshop.layerId)
          }
        }
      }
      photoshop.markedArea.push({
        id: photoshop.layerId,
        startX: photoshop.startX,
        startY: photoshop.startY,
        endX: photoshop.endX,
        endY: photoshop.endY,
        width: photoshop.nowWidth,
        height: photoshop.nowHeight,
        flag: photoshop.flag,
        highlightType: photoshop.highlightType,
        fontSize: localStorage.fontSize,
        color: photoshop.color,
        context: "",
        "text-shadow": photoshop["text-shadow"]
      });
      $(photoshop.layerId).focus();
      var b = "close_" + photoshop.layerId;
      photoshop.createCloseButton(photoshop.layerId, b, photoshop.nowWidth, photoshop.nowHeight, photoshop.flag);
      photoshop.createDiv()
    } else {
      if (photoshop.endX == photoshop.startX && photoshop.endY == photoshop.startY) {
        photoshop.removeElement(photoshop.layerId);
        photoshop.createDiv()
      }
    }
    photoshop.dragFlag = false
  },
  onMouseMove: function(a) {
    if (photoshop.dragFlag) {
      $("mask-canvas").style.zIndex = 200;
      photoshop.endX = a.pageX + $("showBox").scrollLeft - photoshop.offsetX;
      if (photoshop.endX > photoshop.canvas.width) {
        photoshop.endX = photoshop.canvas.width
      }
      if (photoshop.endX < 0) {
        photoshop.endX = 0
      }
      photoshop.endY = a.pageY + $("showBox").scrollTop - photoshop.offsetY;
      if (photoshop.endY > photoshop.canvas.height) {
        photoshop.endY = photoshop.canvas.height
      }
      if (photoshop.endY < 0) {
        photoshop.endY = 0
      }
      photoshop.nowHeight = photoshop.endY - photoshop.startY - 1;
      photoshop.nowWidth = photoshop.endX - photoshop.startX - 1;
      if (photoshop.nowHeight < 0) {
        $(photoshop.layerId).style.top = photoshop.endY + "px";
        photoshop.nowHeight = -1 * photoshop.nowHeight
      }
      if (photoshop.nowWidth < 0) {
        $(photoshop.layerId).style.left = photoshop.endX + "px";
        photoshop.nowWidth = -1 * photoshop.nowWidth
      }
      $(photoshop.layerId).style.height = photoshop.nowHeight - 3 + "px";
      $(photoshop.layerId).style.width = photoshop.nowWidth - 3 + "px";
      if (photoshop.flag == "line" || photoshop.flag == "arrow") {
        photoshop.drawLineOnMaskCanvas(photoshop.startX, photoshop.startY, photoshop.endX, photoshop.endY, "lineDrawing", photoshop.layerId)
      } else {
        if (photoshop.flag == "blur") {
          $(photoshop.layerId).style.height = photoshop.nowHeight + "px";
          $(photoshop.layerId).style.width = photoshop.nowWidth + "px";
          canvas.blurImage(photoshop.canvas, $(photoshop.canvasId), photoshop.layerId, photoshop.startX, photoshop.startY, photoshop.endX, photoshop.endY)
        } else {
          if (photoshop.flag == "ellipse") {
            photoshop.drawEllipseOnMaskCanvas(photoshop.endX, photoshop.endY, "drawing", photoshop.layerId)
          }
        }
      }
    }
  },
  removeElement: function(a) {
    if ($(a)) {
      $(a).parentNode.removeChild($(a))
    }
  },
  draw: function() {
    var d = $("canvas").getContext("2d");
    for (var h = 0; h < photoshop.markedArea.length; h++) {
      var f = photoshop.markedArea[h];
      var m = (f.startX < f.endX) ? f.startX : f.endX;
      var l = (f.startY < f.endY) ? f.startY : f.endY;
      var c = f.width;
      var n = f.height;
      var g = f.color;
      switch (f.flag) {
        case "rectangle":
          if (f.highlightType == "border") {
            canvas.drawStrokeRect(d, g, m, l, c, n, 2)
          } else {
            var g = changeColorToRgba(g, 0.5);
            canvas.drawFillRect(d, g, m, l, c, n)
          }
          break;
        case "radiusRectangle":
          canvas.drawRoundedRect(d, g, m, l, c, n, 6, f.highlightType);
          break;
        case "ellipse":
          m = (f.startX + f.endX) / 2;
          l = (f.startY + f.endY) / 2;
          var e = Math.abs(f.endX - f.startX) / 2;
          var b = Math.abs(f.endY - f.startY) / 2;
          canvas.drawEllipse(d, g, m, l, e, b, 3, f.highlightType);
          break;
        case "redact":
          canvas.drawFillRect(d, g, m, l, c, n);
          break;
        case "text":
          for (var k = 0; k < f.context.length; k++) {
            canvas.setText(d, f.context[k], g, f.fontSize + "px", "arial", f.fontSize, m, l + f.fontSize * k, c, f["text-shadow"])
          }
          break;
        case "blur":
          var a = d.getImageData(m, l, photoshop.markedArea[h].width, photoshop.markedArea[h].height);
          a = canvas.boxBlur(a, photoshop.markedArea[h].width, photoshop.markedArea[h].height, 10);
          d.putImageData(a, m, l, 0, 0, photoshop.markedArea[h].width, photoshop.markedArea[h].height);
          break;
        case "line":
          canvas.drawLine(d, g, "round", 2, f.startX, f.startY, f.endX, f.endY);
          break;
        case "arrow":
          canvas.drawArrow(d, g, 2, 4, 10, "round", f.startX, f.startY, f.endX, f.endY);
          break
      }
    }
  },
  
  getDataUrl: function() {
    photoshop.draw();
    var a = localStorage.screenshootQuality || "png";
    var b;
    if (a == "jpeg" && isHighVersion()) {
      b = $("canvas").toDataURL("image/jpeg", 0.5)
    } else {
      b = $("canvas").toDataURL("image/png")
    }
    photoshop.finish();
    return b
  },
  drawLineOnMaskCanvas: function(g, f, l, k, i, e) {
    var m = $("mask-canvas").getContext("2d");
    m.clearRect(0, 0, $("mask-canvas").width, $("mask-canvas").height);
    if (i == "drawEnd") {
      var d = 20;
      var a = Math.abs(l - photoshop.startX) > 0 ? Math.abs(l - photoshop.startX) : 0;
      var j = Math.abs(k - photoshop.startY) > 0 ? Math.abs(k - photoshop.startY) : 0;
      var c = parseInt($(e).style.left);
      var b = parseInt($(e).style.top);
      g = g - c + d / 2;
      f = f - b + d / 2;
      l = l - c + d / 2;
      k = k - b + d / 2;
      $(e).style.left = c - d / 2 + "px";
      $(e).style.top = b - d / 2 + "px";
      var h = photoshop.createCanvas(e);
      h.width = a + d;
      h.height = j + d;
      m = h.getContext("2d")
    }
    if (localStorage.lineType == "line") {
      canvas.drawLine(m, localStorage.lineColor, "round", 2, g, f, l, k)
    } else {
      canvas.drawArrow(m, localStorage.lineColor, 2, 4, 10, "round", g, f, l, k)
    }
  },
  createColorPadEl: function(e) {
    var d = ["#000000", "#0036ff", "#008000", "#dacb23", "#d56400", "#c70000", "#be00b3", "#1e2188", "#0090ff", "#22cc01", "#ffff00", "#ff9600", "#ff0000", "#ff008e", "#7072c3", "#49d2ff", "#9dff3d", "#ffffff", "#ffbb59", "#ff6b6b", "#ff6bbd"];
    var f = document.createElement("div");
    f.id = "colorpad";
    for (var c = 0; c < d.length; c++) {
      var b = d[c];
      var a = "";
      if (b == "#ffffff") {
        a = "border: 1px solid #444; width: 12px; height: 12px;"
      }
      d[c] = document.createElement("a");
      d[c].setAttribute("title", b);
      d[c].style.cssText = "background:" + b + ";" + a;
      d[c].addEventListener("click", function(i) {
        var h = i.target;
        var g = h.title;
        photoshop.colorPadPick(g, e)
      });
      f.appendChild(d[c])
    }
    return f
  },
  colorPadPick: function(a, b) {
    photoshop.color = a;
    if (b == "highlight") {
      localStorage.highlightColor = a;
      photoshop.setHighlightColorBoxStyle(a)
    } else {
      if (b == "text") {
        localStorage.fontColor = a;
        $("fontColorBox").style.color = a
      } else {
        if (b == "line") {
          localStorage.lineColor = a;
          photoshop.setLineColorBoxStyle()
        } else {
          if (b == "ellipse") {
            $("ellipseBox").style.borderColor = a
          }
        }
      }
    }
  },
  setHighlightColorBoxStyle: function(a) {
    var b = $("highlightColorBox");
    b.style.borderColor = a;
    localStorage.highlightType = localStorage.highlightType || "border";
    if (localStorage.highlightType == "border") {
      b.style.background = "#ffffff";
      b.style.opacity = 1;
      $("borderMode").className = "mark";
      $("rectMode").className = ""
    } else {
      if (localStorage.highlightType == "rect") {
        b.style.background = a;
        b.style.opacity = 0.5;
        $("borderMode").className = "";
        $("rectMode").className = "mark"
      }
    } if (photoshop.flag == "rectangle") {
      b.style.borderRadius = "0 0"
    } else {
      if (photoshop.flag == "radiusRectangle") {
        b.style.borderRadius = "3px 3px"
      } else {
        if (photoshop.flag == "ellipse") {
          b.style.borderRadius = "12px 12px"
        }
      }
    }
    photoshop.markCurrentElement($(photoshop.flag))
  },
  setBlackoutColorBoxStyle: function() {
    localStorage.blackoutType = localStorage.blackoutType || "redact";
    if (localStorage.blackoutType == "redact") {
      $("blackoutBox").className = "rectBox";
      $("redact").className = "mark";
      $("blur").className = ""
    } else {
      if (localStorage.blackoutType == "blur") {
        $("blackoutBox").className = "blurBox";
        $("redact").className = "";
        $("blur").className = "mark"
      }
    }
  },
  setFontSize: function(a) {
    var b = "size_" + a;
    localStorage.fontSize = a;
    $("size_10").className = "";
    $("size_16").className = "";
    $("size_18").className = "";
    $("size_32").className = "";
    $(b).className = "mark"
  },
  setLineColorBoxStyle: function() {
    localStorage.lineType = localStorage.lineType || "line";
    photoshop.color = localStorage.lineColor = localStorage.lineColor || "#FF0000";
    var a = $("lineIconCav").getContext("2d");
    a.clearRect(0, 0, 14, 14);
    if (localStorage.lineType == "line") {
      $("straightLine").className = "mark";
      $("arrow").className = "";
      canvas.drawLine(a, photoshop.color, "round", 2, 1, 13, 13, 1)
    } else {
      if (localStorage.lineType == "arrow") {
        $("straightLine").className = "";
        $("arrow").className = "mark";
        canvas.drawArrow(a, photoshop.color, 2, 4, 7, "round", 1, 13, 13, 1)
      }
    }
  },
  initTools: function() {
    photoshop.i18nReplace("tHighlight", "highlight");
    photoshop.i18nReplace("tRedact", "redact");
    photoshop.i18nReplace("redactText", "solid_black");
    photoshop.i18nReplace("tText", "text");
    photoshop.i18nReplace("tSave", "save");
    photoshop.i18nReplace("tUpload", "upload");
    photoshop.i18nReplace("tClose", "close");
    photoshop.i18nReplace("border", "border");
    photoshop.i18nReplace("rect", "rect");
    photoshop.i18nReplace("blurText", "blur");
    photoshop.i18nReplace("lineText", "line");
    photoshop.i18nReplace("size_10", "size_small");
    photoshop.i18nReplace("size_16", "size_normal");
    photoshop.i18nReplace("size_18", "size_large");
    photoshop.i18nReplace("size_32", "size_huge");
    var a = localStorage.fontSize = localStorage.fontSize || 16;
    if (a != 10 && a != 16 && a != 18 && a != 32) {
      localStorage.fontSize = 16
    }
    localStorage.highlightMode = photoshop.flag = localStorage.highlightMode || "rectangle";
    localStorage.highlightColor = localStorage.highlightColor || "#FF0000";
    localStorage.fontColor = localStorage.fontColor || "#FF0000";
    localStorage.highlightType = photoshop.highlightType = localStorage.highlightType || "border";
    localStorage.blackoutType = localStorage.blackoutType || "redact";
    localStorage.lineType = localStorage.lineType || "line";
    localStorage.lineColor = localStorage.lineColor || "#FF0000";
    photoshop.setHighlightColorBoxStyle(localStorage.highlightColor);
    $("fontColorBox").style.color = localStorage.fontColor || "#FF0000";
    $("btnHighlight").addEventListener("click", function() {
      photoshop.toDo(this, localStorage.highlightMode);
      photoshop.setHighlightColorBoxStyle(localStorage.highlightColor)
    }, false);
    $("btnBlackout").addEventListener("click", function() {
      photoshop.toDo(this, localStorage.blackoutType);
      photoshop.setBlackoutColorBoxStyle()
    }, false);
    $("btnText").addEventListener("click", function() {
      photoshop.toDo(this, "text")
    }, false);
    $("btnLine").addEventListener("click", function() {
      photoshop.toDo(this, localStorage.lineType);
      photoshop.setLineColorBoxStyle()
    }, false);
    photoshop.setHighlightColorBoxStyle(localStorage.highlightColor);
    $("borderMode").addEventListener("click", function() {
      localStorage.highlightType = "border"
    }, false);
    $("rectMode").addEventListener("click", function() {
      localStorage.highlightType = "rect"
    }, false);
    $("rectangle").addEventListener("click", function() {
      localStorage.highlightMode = photoshop.flag = "rectangle";
      photoshop.markCurrentElement(this)
    }, false);
    $("radiusRectangle").addEventListener("click", function() {
      localStorage.highlightMode = photoshop.flag = "radiusRectangle";
      photoshop.markCurrentElement(this)
    }, false);
    $("ellipse").addEventListener("click", function() {
      localStorage.highlightMode = photoshop.flag = "ellipse";
      photoshop.markCurrentElement(this)
    }, false);
    photoshop.setBlackoutColorBoxStyle();
    $("redact").addEventListener("click", function() {
      localStorage.blackoutType = "redact"
    }, false);
    $("blur").addEventListener("click", function() {
      localStorage.blackoutType = "blur"
    }, false);
    photoshop.setLineColorBoxStyle();
    $("highlightColorPad").innerHTML = "";
    $("fontColorPad").innerHTML = "";
    $("lineColorPad").innerHTML = "";
    $("highlightColorPad").appendChild(photoshop.createColorPadEl("highlight"));
    $("fontColorPad").appendChild(photoshop.createColorPadEl("text"));
    $("lineColorPad").appendChild(photoshop.createColorPadEl("line"));
    $("straightLine").addEventListener("click", function() {
      localStorage.lineType = "line";
      photoshop.setLineColorBoxStyle()
    }, false);
    $("arrow").addEventListener("click", function() {
      localStorage.lineType = "arrow";
      photoshop.setLineColorBoxStyle()
    }, false);
    photoshop.setFontSize(localStorage.fontSize);
    $("size_10").addEventListener("click", function() {
      photoshop.setFontSize(10)
    }, false);
    $("size_16").addEventListener("click", function() {
      photoshop.setFontSize(16)
    }, false);
    $("size_18").addEventListener("click", function() {
      photoshop.setFontSize(18)
    }, false);
    $("size_32").addEventListener("click", function() {
      photoshop.setFontSize(32)
    }, false)
  },
  drawEllipseOnMaskCanvas: function(p, o, l, f) {
    var q = $("mask-canvas").getContext("2d");
    q.clearRect(0, 0, $("mask-canvas").width, $("mask-canvas").height);
    var n = (photoshop.startX + p) / 2;
    var m = (photoshop.startY + o) / 2;
    var c = Math.abs(p - photoshop.startX) / 2;
    var a = Math.abs(o - photoshop.startY) / 2;
    canvas.drawEllipse(q, photoshop.color, n, m, c, a, 3, photoshop.highlightType);
    if (l == "end") {
      var d = parseInt($(f).style.left);
      var b = parseInt($(f).style.top);
      var i = photoshop.startX - d;
      var g = photoshop.startY - b;
      var j = photoshop.endX - d;
      var h = photoshop.endY - b;
      n = (i + j) / 2;
      m = (g + h) / 2;
      c = Math.abs(j - i) / 2;
      a = Math.abs(h - g) / 2;
      var k = photoshop.createCanvas(f);
      k.width = Math.abs(p - photoshop.startX);
      k.height = Math.abs(o - photoshop.startY);
      var e = k.getContext("2d");
      canvas.drawEllipse(e, photoshop.color, n, m, c, a, 3, photoshop.highlightType);
      q.clearRect(0, 0, $("mask-canvas").width, $("mask-canvas").height)
    }
  },
  showTip: function(b, c, a) {
    a = a || 2000;
    var d = document.createElement("div");
    d.className = b;
    d.innerHTML = c;
    document.body.appendChild(d);
    d.style.left = (document.body.clientWidth - d.clientWidth) / 2 + "px";
    window.setTimeout(function() {
      document.body.removeChild(d)
    }, a)
  }
};
photoshop.init();
$("photo").addEventListener("mousemove", photoshop.onMouseMove, true);
$("photo").addEventListener("mousedown", photoshop.onMouseDown, true);
$("photo").addEventListener("mouseup", photoshop.onMouseUp, true);
document.addEventListener("mouseup", photoshop.onMouseUp, true);
document.addEventListener("mousemove", photoshop.onMouseMove, true);