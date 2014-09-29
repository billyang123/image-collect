console.log("capturePhoto.js is loaded")
document["__UED_2_"] = {};
document[global] = {};
(function(){
  var collectionBtm = $(collectionBtmStr);//采集按钮
  var validImages = [];//有效图片组
  var currentImage = null;//当前采集动作的图片
  var hasDomChanged = false;//页面节点是否有更新
  var timer = null;
  var isLogin = false;//是否登入
  var ued_xdm = null;
  var _offset = null;
  var isToggleOn = true;//插件图标开关
  function setToggleOn(toggle) {
    isToggleOn = !! toggle
  }
  function getToggleOn(callback) {
    chrome.extension.sendRequest({
      msg: "isToggleOn"
    }, function(response) {
      callback( !! response.isToggleOn);
    })
  }
  function encapsulateImage(img) {
    var obj = {
      w: img.naturalWidth || img.width,
      h: img.naturalHeight || img.height,
      src: img.src,
      img: img,
      alt: img.alt || "",
    };
    return obj
  }
  //图片识别
  function isValidImage(img) {
    if (img.src && img.src.indexOf("data:") == 0) {
      return false
    }
    if (img.src && img.src!="" && img.style.display != "none" && img.className != "ImageToU2") {
      if (img.width >= minWidth && img.height >= minWidth) {
        return true
      }
    }
    return false
  }
  function getAndRegisterImages(){
    $("img[data-registered!='registered']").each(function(index,image){
      var curImg = $(image);
      if( isValidImage(image) && !curImg.hasClass(global+"image_to") ){
        var isbg=checkBackgrund(image);//判断是否是背景图片
        var validImg = isbg?isbg:encapsulateImage(image);
        curImg.attr("data-registered","registered");
        curImg.bind("mousemove mouseover",function(e){
          getToggleOn(function(isToggleOn){
            if(isToggleOn){
              _offset = $(e.target).offset();
              collectionBtm.css({top:_offset.top-25+"px",left:_offset.left+"px"});
              currentImage = validImg;
              isCollect() && collectionBtm.show();
            }
          })
        });
        $(image).bind("mouseout",function(){
           collectionBtm.hide();
        })
        validImages.push(validImg);
      }
    })
    return validImages;
  }
  //识别img是否是背景图片
  function checkBackgrund(el){
    var node = el;
    if (!node) return false;
    var bgimg = $(node).css("background-image") || $(node).css("background");
    if (!bgimg) return false;
    var result = bgimg.match(/url\((.+)\)/);
    if (result == null || result.length != 2) return false;
    var bg_url = result[1];
    if (bg_url.indexOf("http://") == 0 || bg_url.indexOf("https://") == 0 || bg_url.indexOf("/") == 0) {
      var img = document.createElement("img");
      img.src = bg_url;
      return encapsulateImage(img);
    }
    return false;
  }
  function getImageType(href){
    var arr_list = href.split(".");
    return arr_list[arr_list.length-1];
  }
  //判断浏览器是否是谷歌插件的开发模式tab
  function isCollect(){
    var currentHost = location.host;
    if (/^(?:about|chrome)/.test(location.protocol)) {
      location.href = "http://" + siteDomain;
      return false
    }
    if (siteDomain == currentHost){
      return false;
    }
    return true;
  }
  //请求登录
  function requireLogin() {
    chrome.extension.sendRequest({
      msg: "requireLogin"
    }, function(response) {
      if(response.requireLogin){
        var features = "status=no,resizable=no,scrollbars=yes,personalbar=no,directories=no,location=no,toolbar=no,menubar=no,width=800,height=350,left=0,top=0";
        window.open(loginUrl, "pin" + (new Date).getTime(), features)
      }
    })
  }
  function checkLogin(callback) {
    chrome.extension.sendRequest({
      url: ajax_ckeckLogin,
      msg: "isLogin"
    }, function(response) {
      if (response && response.user) {
        //console.log(response.user)
        isLogin = true
      } else {
        isLogin = false
      } 
      if (typeof callback === "function") {
        callback()
      }
    })
  }
  function getBase64FromImageUrl(URL) {
    var img = new Image();
    img.src = URL;
    img.onload = function () {
      var canvas = document.createElement("canvas");
      canvas.width =this.width;
      canvas.height =this.height;

      var ctx = canvas.getContext("2d");
      ctx.drawImage(this, 0, 0);
      var dataURL = canvas.toDataURL("image/png");
      dataURL.replace(/^data:image\/(png|jpg);base64,/, "")
      console.log( dataURL.replace(/^data:image\/(png|jpg);base64,/, ""));
    }
  }
  function collectionImages(eImage, Fast){
    var collectUrl = eImage.src == location.href ? document.referrer || location.href : location.href;//图片来源
    var originImg = eImage.img;
    var image = {
      media: eImage.src,
      url: collectUrl,
      w: originImg.naturalWidth || originImg.width,
      h: originImg.naturalHeight || originImg.height,
      alt: originImg.alt,
      title: document.title,
      media_type : getImageType(eImage.src)|| ""
    };
    if (Fast && typeof Fast === "function") {
      return Fast(image)
    }
    var u2UrlComponents = [];
    u2UrlComponents.push(bookmarkletUrl);
    u2UrlComponents.push("?");
    for (var p in image) {
      u2UrlComponents.push(encodeURIComponent(p));
      u2UrlComponents.push("=");
      u2UrlComponents.push(encodeURIComponent(image[p]));
      u2UrlComponents.push("&")
    }
    u2UrlComponents.push("via=7&");
    var pUrl = u2UrlComponents.join("");
    var features = "status=no,resizable=no,scrollbars=yes,personalbar=no,directories=no,location=no,toolbar=no,menubar=no,width=800,height=350,left=0,top=0";
    window.open(pUrl, "pin" + (new Date).getTime(), features)
  }
  //采集状态
  function fastCollect_state(eImage,divImagePreview,position,state, msg){
    var originImg = eImage.container || eImage.img;
    var collect_id = $(originImg).attr("data-fastCollect");
    if (state == "ing" && collect_id) {
      return true
    }
    var timer, str, tip;
    if (!collect_id) {
      collect_id = Math.floor(new Date() / 1000);
      $(originImg).attr("data-fastCollect",collect_id);
      var state_id = global+(divImagePreview ? "p_" : "")+collect_id;
      str = '<div id="'+state_id+'" class="'+global+'fast_tip '+global+'fast_tip_'+state+'"></div>'
      tip = $(str);
      divImagePreview?$(divImagePreview).append(tip):$("body").append(tip);
    } else {
      return setTimeout(function() {
        tip = $("#"+global+(divImagePreview ? "p_" : "")+collect_id);
        $(originImg).attr("data-fastCollect", "");
        tip && tip.remove();
        fastCollect_state(eImage, divImagePreview, position, state, msg)
      }, 500)
    }
    msg = msg || "";
    var summary = state == "success" ? "采集成功！" : state == "ing" ? "采集中…" : "采集失败！";
    tip.append("<span>" + summary + "</span><p>" + msg + "</p>");
    tip.css({top:position.top,left:position.left})
    if (state == "success" || state == "failed") {
      tip.css({top:parseInt(position.top) + "px"});
    }
    tip.mouseover(function() {
      clearTimeout(timer)
    });
    tip.mouseout(function() {
      hideTip()
    });
    function hideTip() {
      if (state == "success" || state == "failed") {
        timer = setTimeout(function() {
          $(originImg).attr("data-fastCollect", "");
          tip && tip.parent() && tip.remove()
        }, 3000)
      }
    }
    hideTip();
    return false
  }
  //快速采集
  function fastAcquisition(eImage,divImagePreview,position,callback){
    callback = typeof callback === "function" ? callback : function() {};
    checkLogin(function(){
      if (!isLogin) {
        requireLogin();
        return callback()
      }else{
        collectionImages(eImage,function(image){
          if (fastCollect_state(eImage, divImagePreview, position, "ing")) {
            return callback()
          }
          var data = {
            description: image.description || image.title || image.alt || "",
            link: image.url || "",
            imgUrl: image.media,
            media_type : image.media_type|| ""
          };
          ued_xdm && ued_xdm.request && ued_xdm.request({
            url: ajax_host,
            data: data,
            noCache: true,
            method: "POST"
          }, function(res) {
            if (res.err) {
              fastCollect_state(eImage, divImagePreview, position, "failed", res.msg);
              return callback()
            }
            var msg = '<a href="' + look_collectUrl + res.content.albumId + '" target="_blank">查看采集</a>';
            fastCollect_state(eImage, divImagePreview, position, "success", msg);
            return callback()
          }, function() {
            fastCollect_state(eImage, divImagePreview, position, "failed");
            return callback()
          })
        })
      }
    })
  }
  //初始化request，用于backgrund ajax 请求；初始check是否登入
  function initXDM() {
    ued_xdm = {
      request: function(data, success, failed) {
        chrome.extension.sendRequest({
          msg: "request",
          data: data
        }, function(response) {
          if (response.msg == "success") {
            //console.log(response)
            success(response.data)
          } else {
            failed(response.data)
          }
        })
      }
    };
    checkLogin()
  }
  //显示图片容器
  function showImagesContainer(images){
    if(!isCollect()){
      return;
    }
    var previewStr="";
    for (var i = 0; i < images.length ; i++) {
      var _Mtop = images[i].w<200?(200-images[i].h)/2:(images[i].h<images[i].w?100*(images[i].w-images[i].h)/images[i].w:0);
      previewStr += previewTemp.replace("{{{w}}}",images[i].w).replace("{{{h}}}",images[i].h).replace("{{{src}}}",images[i].src).replace("{{{description}}}",images[i].description).replace("{{{top}}}",_Mtop);
    };
    collectionContaier = $(collectionContaierStr.replace("{{{previewStr}}}",previewStr));
    $("body").append(collectionContaier);
    $("#"+global+"removeLink").click(function(){$("#"+global+"showImages_container").remove();})
    var fastBtm = $("#"+global+"showImages_container ."+global+"fast_collection");
    var colBtm = $("#"+global+"showImages_container ."+global+"collection");
    var preview = $("."+global+"img_preview");
    fastBtm.click(function(e){
      var target = $(e.target);
      var curentIndex = fastBtm.index(target);
      var p_offset = target.offset()
      var position = {
        top:p_offset.top+"px",
        left:p_offset.left+"px"
      }
      fastAcquisition(images[curentIndex],"#"+global+"showImages_container",position);
    })
    colBtm.click(function(e){
      var curentIndex = colBtm.index(target);
      collectionImages(images[curentIndex]);
    })
  }
  //按钮初始化
  function initBtmAndBind(){
    $("body").append(collectionBtm);
    collectionBtm.bind("mousemove mouseover",function(e){
      if(isCollect()){
        collectionBtm.show();
      }
    })
    $("#"+global+"Fast_Acquisition").click(function(e){
      var position = {
        top: _offset.top-25+"px",
        left: _offset.left+"px"
      };
      //console.log(position)
      fastAcquisition(currentImage,null,position);
    })
    $("#"+global+"Acquisition").click(function(e){
      collectionImages(currentImage);
    })
  }
  function newStyleElement(){
    var styleId = global + "_Style";
    if (document.getElementById(styleId)) {
      return
    }
    var style = document.createElement("style");
    style.id = styleId;
    if (style.styleSheet) {
      style.styleSheet.cssText = styleStr
    } else {
      style.appendChild(document.createTextNode(styleStr))
    }(document.getElementsByTagName("head")[0] || document.body).appendChild(style)
  }
  function showImagesAndBind() {
    if($("#"+global+"showImages_container").length>0){
      return;
      //$("#u2_showImages_container").remove();
    }
    var currentPageEImages = getAndRegisterImages();
    if (currentPageEImages.length == 0) {
      window.alert("抱歉，页面上没有足够大的图片。")
    } else {
      showImagesContainer(validImages);    
      window.scroll(0, 0)
    }
  } 
  var check = function(){
    if(!hasDomChanged){
      return;
    }
    getAndRegisterImages();
    newStyleElement();
    hasDomChanged = false;
  }
  function _init(){
    initBtmAndBind()
    $("body").bind("DOMNodeInserted",function(){
      hasDomChanged = true;
      clearTimeout(timer);
      timer = setTimeout(check, 500);
    })
    $(window).bind("scroll",function(){
      hasDomChanged = true;
      clearTimeout(timer);
      timer = setTimeout(check, 500)
    })
  }
  _init();
  initXDM();
  document[global]["showValidImages"] = showImagesAndBind;
  document[global]["menuImage"] = collectionImages;
  document[global]["setToggleOn"] = setToggleOn;
})()
var target = null;
//绑定鼠标右键菜单
$("body").bind("contextmenu",function(a){
  target = a.target
})
chrome.extension.onRequest.addListener(function(request) {
    if (request.msg) {
      switch (request.msg) {
        case "showValidImages":
          if (window.top == window.self) {
            document[global]["showValidImages"]();
          }
          break;
        case "menuImage":
          request.data.img = target;
          if (target.width >= 16 && target.height >= 16) {
            document[global]["menuImage"](request.data)
          } else {
            if (window.top == window.self) {
              document[global]["showValidImages"]();
            }
          }
          break;
        default:
          break
      }
    }
});