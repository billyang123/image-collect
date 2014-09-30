var siteDomain = 'ybbnotes.com';
var albumUrl = 'http://'+siteDomain+'/index.php/media/albumInfo';
var postUrl = "http://"+siteDomain+"/index.php/upload/sign";
var createAlbumUrl = 'http://'+siteDomain+'/index.php/media/createAlbum';
var checkLoginUrl = "http://"+siteDomain+'/index.php/account/logincheck';
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
  var e = document.querySelector("#bookmarklet .Images");
  var c = new Image();
  c.src = $("canvas").toDataURL("image/png");
  e.appendChild(c);
  $("description").value = bg.screenshot.page_info.text;
  $("url").value = bg.screenshot.page_info.href;

  var upImageUrl = c.src;
  $("tUpload").addEventListener("click",function(){
      UploadUI.showDialog();
      upImageUrl = photoshop.getDataUrl();
      document.querySelector("#bookmarklet .Images").innerHTML = '<img src="'+upImageUrl+'"/>';
  })
  setTimeout(function(){
    UploadUI.selectBoards();
  },500)
  //验证是否登入
  ajax({
    method: "GET",
    url: checkLoginUrl,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    success: function(p) {
      if(!p.success){
        // $("loading").className = "hide";
        $("authorization").className = "show";
        $("pinForm").className = "hide";
      }else{
        // $("loading").className = "hide";
        $("authorization").className = "hide";
        $("pinForm").className = "pin-form show";
      }
      var userInfo = p.content;
      var userData = [
        'userId='+userInfo.userId,
        'userName='+userInfo.username,
        'albumDescription=',
        'albumLimits=public',
        'albumCover='
      ]
      $('userInfo').value = userData.join("&");

    },
    status: {
      others: function(p, q) {
        console.log(p)
      }
    }
  })
  ajax({
    method: "GET",
    url: albumUrl,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    success: function(p) {
      if(!p.success) return;
      var amdata = p.content,strs='';
      for (var i = amdata.length - 1; i >= 0; i--) {
        strs+='<li data-id="'+amdata[i].id+'" title="'+amdata[i].description+'">'+amdata[i].name+'</li>';
      };
      document.querySelector("#bookmarklet .BoardListBody ul").innerHTML = strs;
    },
    status: {
      others: function(p, q) {
        console.log(p)
      }
    }
  })
  $("board_name_input").addEventListener("keyup",function(){
    if(this.value.trim()!=''){
      $("NewCreateBorder").className = 'nf btn btn18 wbtn';
    }else{
      $("NewCreateBorder").className = 'nf btn btn18 wbtn disabled';
    }
  })
  $("NewCreateBorder").addEventListener('click',function(){
    ajax({
      method: "POST",
      url: createAlbumUrl,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data:$("userInfo").value + "&albumName=" + $("board_name_input").value,
      success: function(p) {
        var strss = document.querySelector("#bookmarklet .BoardListBody ul").innerHTML;
        document.querySelector("#bookmarklet .BoardListBody ul").innerHTML = strss + '<li data-id="'+p.content.albumId+'">'+$("board_name_input").value+'</li>';
        $("NewCreateBorder").className = 'nf btn btn18 wbtn disabled';
        $("board_name_input").value = '';
      },
      status: {
        others: function(p, q) {
          console.log(p)
        }
      }
    })
  })
  $("auth_btn").addEventListener("click",function(){
      window.location.reload();

  })
  $("J-collection").addEventListener("click",function(){
    var data = {
        description: $("description").value,
        link: $("url").value,
        imgUrl: upImageUrl,
        media_type : "png",
        albumId:document.querySelector("#bookmarklet .name").getAttribute("data-id")
    };
    var _commUrlStr = "";
      for (key in data) {
        _commUrlStr += key + "=" + encodeURIComponent(data[key]) + "&"
      }
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