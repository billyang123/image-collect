(function(){
  var postUrl = "http://ued2.taobao.com:8080/taobao/u2/collect/index.php";
  var _UED_2_ = window._UED_2_= {
    postToCollect:function(data, cb){
      var _commUrlStr = "",_db = data.data;
      for (key in _db) {
        _commUrlStr += key + "=" + encodeURIComponent(_db[key]) + "&"
      }
      _commUrlStr += "via=7";
      ajax({
        method: data.method,
        url: data.url,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        data: _commUrlStr,
        success: function(p) {
          cb("success", p)
        },
        status: {
          others: function(p, q) {
            cb("failure", q)
          }
        }
      })
    }
  }
})()