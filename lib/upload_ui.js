const HIDE_ERROR_INFO_DELAY_TIME = 5000;
  function getHref(href) {
    href = href || "";
    if (href.indexOf("//") == 0) {
      href = location.protocol + href
    } else {
      if (href.indexOf("http") < 0) {
        href = location.protocol + "//" + location.hostname + href
      }
    }
    return href
  }

  function getAttribute(el, name) {
    return el && el.getAttribute && el.getAttribute(name) || ""
  }

  function getClass(el) {
    return getAttribute(el, "class")
  }

  function hasClass(el, cls) {
    var clses = getClass(el);
    clses = clses.trim().split(/\s+/);
    var tmp_cls = null;
    while (clses && clses.shift && (tmp_cls = clses.shift()), tmp_cls) {
      if (tmp_cls == cls) {
        return true
      }
    }
    return false
  }
var UploadUI = {
  currentSite: "",
  uploading: false,
  sites: {},
  registerSite: function(b, a) {
    this.sites[b] = a
  },
  getSiteObject: function(a) {
    return this.sites[a]
  },
  init: function(a) {
    //UploadUI.registerSite(Huaban.siteId, Huaban);
//    if (a) {
//      Huaban.currentUserId = a.id
//    }
    document.querySelector("#bookmarklet .header .close").addEventListener("click", function() {
      UploadUI.closeDialog()
    });
    UploadUI.initSave()
  },
  dataURItoBlobLink: function(e) {
    var f = atob(e.split(",")[1]);
    var b = e.split(",")[0].split(":")[1].split(";")[0];
    var d = ajax.constructBlobData(f, b);
    var c = document.createElement("a");
    c.download = "uedCollect.png";
    c.href = window.webkitURL.createObjectURL(d);
    c.dataset.downloadurl = [b, c.download, c.href].join(":");
    c.draggable = true;
    return c
  },
  initSave: function() {
    var a = $("btnSave");
    if (!a) {
      return
    }
    a.addEventListener("click", function() {
      var c = photoshop.getDataUrl();
      var b = UploadUI.dataURItoBlobLink(c);
      b.click()
    })
  },
  showErrorInfo: function(a) {
    $("msg").innerHTML = a;
    $("msgBar").style.display = "block";
    $("msgBar").style.top = 0;
    setTimeout(function() {
      UploadUI.hideErrorInfo()
    }, HIDE_ERROR_INFO_DELAY_TIME)
  },
  hideErrorInfo: function() {
    var a = $("msgBar").clientHeight + 2;
    $("msgBar").style.top = "-" + a + "px"
  },
  getAccessToken: function(b) {
    var a = UploadUI.getSiteObject(b);
    var c = function(d, e) {
      if (d == "success") {
        UploadUI.getUserInfo(b, e)
      } else {
        var f = null;
        if (e == "access_denied" || e == "invalid_grant") {
          f = e
        }
        if (f) {
          f = chrome.i18n.getMessage(f)
        } else {
          f = e
        }
        UploadUI.showErrorInfo(f);
        UploadUI.showAuth()
      }
    };
    a.getAccessToken(c)
  },
  getUserInfo: function(c, a) {
    var b = UploadUI.getSiteObject(c);
    b.getUserInfo(a, function(d, e, g) {
      if (d == "success") {
        var f = a.id;
        if (!Account.getUser(c, f)) {
          b.currentUserId = f;
          Account.addUser(c, a);
          UploadUI.showUser(c, a);
          UploadUI.fillBoards(g)
        }
      } else {
        UploadUI.showErrorInfo(e)
      }
    })
  },
  getBoards: function(a) {
    Huaban.getBoards(a, function(b, c) {
      if (b == "success") {
        UploadUI.fillBoards(c)
      } else {
        UploadUI.signOut(a)
      }
    })
  },
  fillBoards: function(b) {
    var a = document.querySelector("div.BoardPicker");
    boardPicker = BoardPicker.init(a, b)
  },
  initBoards: function(a) {
    var b = document.querySelector("div.BoardPicker");
    var g = b.querySelector("div.CreateBoard"),
      m = $("board_name_input"),
      e = g.querySelector("a.btn"),
      i = g.querySelector(".CreateBoardStatus"),
      c = document.querySelector("#bookmarklet .rbtn");
    var h = 8;
    var j = document.querySelector("textarea.DescriptionTextarea");
    var f = BoardPicker;
    var k = $$(".tag-tip")[0];
    var n = $$(".tag-prompt")[0];
    var l = n.querySelector(".tags");
    UploadUI.fillBoards(a);
    j.addEventListener("keyup", function() {
      var p = j.value;
      var o = l.querySelectorAll("a");
      o.forEach(function(r) {
        var q = r.dataset.tag;
        q = "#" + q + "#";
        if (!~p.indexOf(q) && r.classList.contains("selected")) {
          r.classList.remove("selected")
        }
      })
    });
    n.addEventListener("click", function(q) {
      if (q.srcElement.tagName != "A" || !q.srcElement.dataset.tag) {
        return
      }
      var p = q.srcElement;
      p.classList.add("selected");
      var o = p.dataset.tag;
      o = "#" + o + "#";
      var r = j.value;
      if (~r.indexOf(o)) {
        j.selectionStart = r.indexOf(o);
        j.selectionEnd = o.length + r.indexOf(o);
        return
      }
      j.value = r.trim() + " " + o
    });
    f.addEventListener("select", function(r) {
      var q = r.detail;
      var s = q.recommend_tags || [];
      while (l.lastChild) {
        l.lastChild.remove()
      }
      if (s.length) {
        var p;
        for (var o = 0; o < s.length; o += 1) {
          p = document.createElement("a");
          p.textContent = s[o];
          p.setAttribute("title", s[o]);
          p.dataset.tag = s[o];
          l.appendChild(p)
        }
        n.style.display = "block";
        k.style.display = "none"
      } else {
        k.style.display = "block";
        n.style.display = "none"
      }
    });
    e.addEventListener("click", function() {
      var o = m.value || "";
      o = o.replace(/^\s+|\s+$/g, "");
      if (o == "") {
        UploadUI.showErrorInfo("请输入名称");
        return false
      }
      e.classList.add("disabled");
      Huaban.createBoard(o, function(p, r) {
        if (p == "success" && r && r.board) {
          f.add(r.board).hide()
        } else {
          if (r.err && r.fieldErrors) {
            for (var q in r.fieldErrors) {
              UploadUI.showErrorInfo(r.fieldErrors[q][0]);
              break
            }
          } else {
            if (r.err && r.msg) {
              UploadUI.showErrorInfo(r.msg)
            } else {
              UploadUI.showErrorInfo("网络错误，请稍候再试")
            }
          }
        }
        m.value = ""
      })
    });
    c.addEventListener("click", function() {
      c.classList.add("disabled");
      var p = f.getSelected();
      if (!p) {
        return alert("请选择画板")
      }
      var r = $("description").value;
      var q = document.querySelector("input.publish_to_weibo").checked;
      var o = $("url").value;
      var s = UploadUI.getImageData();
      c.querySelector("strong").innerText = "采集中…";
      Huaban.upload(p, r, o, q, s, function(t, v, y) {
        if (t == "success") {
          document.querySelector("#bookmarklet .pbt").style.display = "none";
          var x = v;
          var w = $("pin-done");
          var z = $("view_pin");
          z.href = "http://" + DOMAIN + "/pins/" + x.pin_id;
          z.onclick = function() {
            chrome.tabs.create({
              url: z.href
            });
            return false
          };
          $("close_window").addEventListener("click", function() {
            window.close()
          });
          w.style.display = "block";
          ShareButton.setPin(x);
          return
        } else {
          if (y && y == 413) {
            UploadUI.showErrorInfo(chrome.i18n.getMessage("http_413"))
          } else {
            UploadUI.showErrorInfo(v)
          }
        }
        c.classList.remove("disabled");
        c.querySelector("strong").innerText = "采下来"
      })
    });
    var d = function() {
      if (m.value != "") {
        e.classList.remove("disabled")
      } else {
        e.classList.add("disabled")
      }
    };
    m.addEventListener("keydown", d);
    m.addEventListener("focus", d);
    m.addEventListener("blur", d)
  },
  showUser: function(e, c) {
    $("loading").style.display = "none";
    $("authorization").style.display = "none";
    document.querySelector(".pin-form").style.display = "block";
    if (c && c.bindings && c.bindings.weibo) {
      document.querySelector(".pin-form .Buttons label.weibo").style.display = "block"
    } else {
      document.querySelector(".pin-form .Buttons label.weibo").style.display = "none"
    }
    var g = $("userIcon");
    var d = document.createElement("a");
    d.href = Utils.getUserUrl(c);
    d.target = "_blank";
    var b = new Image();
    if (c.avatar) {
      b.src = Utils.getImgUrl(c.avatar, "sq75")
    } else {
      b.src = "/images/default_buddy_icon.jpg"
    }
    var a = document.createElement("span");
    a.title = chrome.i18n.getMessage("remove_auth");
    a.addEventListener("click", function() {
      UploadUI.signOut(c)
    });
    var f = document.createTextNode(c.name);
    d.appendChild(b);
    d.appendChild(f);
    g.appendChild(d);
    g.appendChild(a);
    g.style.display = "block"
  },
  signOut: function(a) {
    var b = $("userIcon");
    b.innerHTML = "";
    b.style.display = "none";
    Account.removeUser(Huaban.siteId, a.id);
    UploadUI.showAuth();
    return false
  },
  showAuth: function() {
    $("loading").style.display = "none";
    $("authorization").style.display = "block";
    document.querySelector(".pin-form").style.display = "none"
  },
  showLoading: function() {
    $("loading").style.display = "block";
    $("authorization").style.display = "none";
    document.querySelector(".pin-form").style.display = "none"
  },
  getImageData: function() {
    photoshop.draw();
    var b = $("canvas").toDataURL("image/png");
    photoshop.finish();
    var a = b.indexOf("data:image/png;base64,");
    if (a != 0) {
      return
    }
    return atob(b.substr(a + 22))
  },
  showDialog: function() {
    var a = $("overlay");
    UI.setStyle(a, {
      width: document.body.scrollWidth + "px",
      height: document.body.scrollHeight + "px"
    });
    UI.show(a);
    UI.show($("pinWrapper"))
  },
  closeDialog: function() {
    var a = $("overlay");
    UI.setStyle(a, {
      width: document.body.scrollWidth + "px",
      height: document.body.scrollHeight + "px"
    });
    UI.hide(a);
    UI.hide($("pinWrapper"))
  },
  selectBoards:function(){
    var boards = document.querySelector("#bookmarklet .boards"),border_id = 10001;
    document.querySelector("#bookmarklet .current").addEventListener("click",function(e){
      hasClass(boards,"hide")?boards.className = "boards":boards.className = "boards hide";
    })
    var lis = document.querySelectorAll("#bookmarklet .boards li");
    for (var i = lis.length - 1; i >= 0; i--) {
      lis[i].addEventListener("click",function(e){
        border_id = getAttribute(e.target,"data-id");
        document.querySelector("#bookmarklet .name").setAttribute("data-id", border_id);
        document.querySelector("#bookmarklet .name").innerHTML = e.target.innerHTML;
        boards.className = "boards hide"; 
      })
    };
  }
};