(function(){
  //var postUrl = "http://"+DOMAIN+"/index.php/upload/sign";
  var _UED_2_ = window._UED_2_= {
    postToCollect:function(data, cb){
      var _commUrlStr = "",_db = data.data;
      for (key in _db) {
        _commUrlStr += key + "=" + encodeURIComponent(_db[key]) + "&";
      };
      ajax({
        method: data.method,
        url: data.url,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
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
    },
    isCkeckLogin:function(url,cb){
      ajax({
        method: 'get',
        url: url,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
        },
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