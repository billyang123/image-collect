var minWidth = 100;
var global = "__mynotes_img_";
var siteDomain = "ybbnotes.com";
var bookmarkletUrl = "http://" + siteDomain + "/index.php/bookmarklet";//采集跳转
var look_collectUrl = "http://" + siteDomain + "/index.php/media/album/";//查看采集
var ajax_host = "http://"+siteDomain+"/index.php/upload/sign";//采集地址
var ajax_ckeckLogin = "http://"+siteDomain+"/index.php/account/logincheck";//是否登录
var loginUrl = "http://"+siteDomain+"/index.php/login";
var collectionBtmStr = '<div id="REPSTREEcollection_button" style="display:none;"><a href="javascript:void(0);" id="REPSTREEFast_Acquisition" class="_Fast_Acquisition">快速采集</a><a href="javascript:void(0);" id="REPSTREEAcquisition" class="_Acquisition">Add</a></div>'.replace(new RegExp("REPSTREE","g"),global);

var previewTemp = '<div class="REPSTREEimg_preview"><div class="REPSTREEimg_size">{{{w}}}x{{{h}}}</div><div class="REPSTREEimg"><a href="javascript:void(0)"><img style="margin-top:{{{top}}}px" src="{{{src}}}" alt="{{{description}}}" class="REPSTREEimage_to"><em><span class="REPSTREEfast_collection REPSTREEcol_btm">快速采集</span><span class="REPSTREEcollection REPSTREEcol_btm">Add</span></em></a></div></div>'.replace(new RegExp("REPSTREE","g"),global);

var styleStr = '#REPSTREEcollection_button{position:absolute;z-index:9999;text-align:center;cursor:pointer;background-color:#FFF}#REPSTREEcollection_button a{display:inline-block;line-height:25px;height:25px;padding:0 5px;color:#363636;border:1px solid #DDD;border-radius:2px}#REPSTREEcollection_button ._Fast_Acquisition,.REPSTREEimg_preview .REPSTREEfast_collection{background:#F5F5F5 url(http://gtms01.alicdn.com/tps/i1/T1I2I.FnFeXXb63gvb-24-96.png) no-repeat 1px -72px;border-top-right-radius:0px;border-bottom-right-radius:0px;border-right:none;width:16px;text-indent:-9999px;opacity:0.9}#REPSTREEcollection_button ._Acquisition{border-top-left-radius:0px;border-bottom-left-radius:0px}#REPSTREEimg_container{font-family:"helvetica neue",arial,sans-serif;position:absolute;z-index:100000002;top:0;left:0;background-color:transparent;opacity:1;hasLayout:-1}.REPSTREEimg_preview{margin:0;padding:0;position:relative;float:left;background-color:#fff;border:solid #e7e7e7;border-width:0 1px 1px 0;height:200px;width:200px;opacity:1;z-index:10002;text-align:center;overflow:hidden}.REPSTREEimg_preview em{position:absolute;top:82px;left:35px;display:none}.REPSTREEimg_preview a:hover em{display:inline-block}.REPSTREEimg_preview span{display:inline-block;background-color:#fff;line-height:25px;height:25px;padding:0 5px;color:#363636;border:1px solid #DDD}.REPSTREEimg_preview .REPSTREEimg{border:none;height:200px;width:200px;opacity:1;padding:0;position:absolute;top:0}.REPSTREEimg_preview .REPSTREEimg a{margin:0;padding:0;position:absolute;top:0;bottom:0;right:0;left:0;display:block;text-align:center;z-index:1}.REPSTREEimg_size{color:#000;position:relative;margin-top:180px;text-align:center;font-size:10px;z-index:10003;display:inline-block;background:white;border-radius:4px;padding:0 2px}.REPSTREEimage_to{max-height:200px;max-width:200px}#REPSTREEimg_control{position:relative;z-index:100000;float:left;background-color:#fcf9f9;border:solid #ccc;border-width:0 1px 1px 0;height:200px;width:200px;opacity:1}.REPSTREEremove{float:left;width:100%;background:#fff url(http://gtms01.alicdn.com/tps/i1/T1fiJiFzJXXXXGMj78-122-36.png) 0 0 repeat-x}.REPSTREEremove a{display:block;height:24px;padding:12px 0 0;text-align:center;font-size:14px;line-height:1em;text-shadow:0 1px #fff;color:#211922;font-weight:bold;text-decoration:none;border-bottom:1px solid #ccc;-mox-box-shadow:0 0 2px #d7d7d7;-webkit-box-shadow:0 0 2px #d7d7d7}.REPSTREEremove a:hover{background:#FE7E02;color:#FFF}#REPSTREEoverlay{position:fixed;z-index:100000001;top:0;right:0;bottom:0;left:0;background-color:#f2f2f2;opacity:.95}.REPSTREEfast_tip{position:absolute;z-index:100000002;background-color:#FFF;border:1px solid #eee}.REPSTREEfast_tip span{background-image:url(http://gtms01.alicdn.com/tps/i1/T1I2I.FnFeXXb63gvb-24-96.png);background-repeat:no-repeat;display:inline-block;height:26px;line-height:26px;padding:0 10px 0 28px;color:#FF6D34}.REPSTREEfast_tip p{padding-left:28px}.REPSTREEfast_tip p a{text-align:center;height:25px;line-height:25px;color:#36c;text-decoration:none}.REPSTREEfast_tip p a:hover{color:#f60;text-decoration:underline}.REPSTREEfast_tip_success span{background-position:0 -24px}.REPSTREEfast_tip_failed span{background-position:0 -48px}.REPSTREEfast_tip_ing span{background-position:0 0}'.replace(new RegExp("REPSTREE","g"),global);

var collectionContaierStr = '<div id="REPSTREEshowImages_container"><div id="REPSTREEoverlay"></div><div id="REPSTREEimg_container"><div class="REPSTREEremove"><a id="REPSTREEremoveLink" href="javascript:void(0);">关闭</a></div><div id="REPSTREEimg_control"><div style="width: 150px; height: 59px; margin: 70px auto;font-size: 40px;color: #FE7E02;text-align: center;">u2</div></div>{{{previewStr}}}</div></div>'.replace(new RegExp("REPSTREE","g"),global);
