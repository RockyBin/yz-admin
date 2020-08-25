import store from "@/store";
export default {
  install(Vue) {
    window.addedScript = {};

    window.addScript = function (path, callback) {
      if (window.addedScript[path]) {
        if (window.addedScript[path] == -1 && typeof callback == "function") {
          setTimeout(function () {
            window.addScript(path, callback)
          }, 50);
          return;
        }
        if (window.addedScript[path] == 1) {
          if (typeof callback == "function") callback();
          return;
        }
      }
      window.addedScript[path] = -1;
      var addfun = function () {
        var fileref = document.createElement("script")
        fileref.type = "text/javascript";
        fileref.src = path;
        if (typeof fileref.onload != "undefined") {
          fileref.onload = function () {
            window.addedScript[path] = 1;
            if (typeof callback == "function") callback();
          };
        } else {
          fileref.onreadystatechange = function () {
            if (this.readyState == "loaded" || this.readyState == "complete") {
              window.addedScript[path] = 1;
              if (typeof callback == "function") callback();
            }
          };
        }
        var headobj = document.getElementsByTagName("head")[0];
        headobj.appendChild(fileref);
      };
      addfun();
    }
    //动态加载一大波 jscript，保证按顺序加载
    window.addScripts = function (paths, callback) {
      paths = paths || [];
      var lastCb = callback;
      for (var i = 0; i < paths.length; i++) {
        lastCb = (function () {
          var path = paths[paths.length - 1 - i];
          var cb = lastCb;
          return function () {
            window.addScript(path, cb);
          }
        })(i);
      }
      lastCb();
    }
    Vue.prototype.addScript = window.addScript;
    Vue.prototype.addScripts = window.addScripts;
    // 读取cookie
    Vue.prototype.getCookie = (cname) => {
      let cookie = {};
      let all = document.cookie;
      if (all === '') {
        return cookie;
      }
      let list = all.split('; ');
      for (let i = 0; i < list.length; i++) {
        let temp = list[i];
        let pos = temp.indexOf('=');
        let name = temp.substring(0, pos);
        let value = temp.substring(pos + 1);
        try {
          value = decodeURIComponent(value);
        } catch (ex) {}
        cookie[name] = value;
      }
      return cookie[cname];
    }
    // 设置cookie
    Vue.prototype.setCookie = (name, value) => {
      let argv = arguments;
      let argc = arguments.length;
      let expires = (argc > 2) ? argv[2] : null;
      let path = (argc > 3) ? argv[3] : null;
      let domain = (argc > 4) ? argv[4] : null;
      let secure = (argc > 5) ? argv[5] : false;
      document.cookie = name + '=' + encodeURIComponent(value) +
        ((expires == null) ? '' : (typeof expires === 'number' ? '; max-age=' + expires : '; expires=' + expires.toGMTString())) +
        ((path == null) ? '' : ('; path=' + path)) +
        ((domain == null) ? '' : ('; domain=' + domain)) +
        ((secure === true) ? '; secure' : '');
    }
    // 删除cookie
    Vue.prototype.delCookie = (name) => {
      var exp = new Date();
      exp.setTime(exp.getTime() - 1);
      var cval = this.getCookie(name);
      if (cval !== null) {
        document.cookie = name + '=' + cval + ';expires=' + exp.toGMTString();
      }
    }
    
	// 规格数组转字符串
    Vue.prototype.yzArrayToString = (data, symbol = ";") => {
      data = data || [];
      return data.join(symbol);
    };

    // 获取抖音、快手、映客分享链接的视频地址
    Vue.prototype.getVideoSrc = (sharelink, callback, loading) => {
      if (/((v\.douyin\.com)|(\.kuaishou\.com)|(m\.gifshow\.com)|(\.huajiao\.com)|(\.douyu\.com)|(\.chenzhongtech\.com)|(mlive\d*\.inke\.cn)|(\.huya.com)|(\.yy\.com)|(\.yizhibo\.com)|(now\.qq\.com)|(\.vzan\.com))/.test(sharelink)) {
        let regex = new RegExp("https?://[0-9a-z\?=\.\\-_/%&;]+", "gi");
        let m = sharelink.match(regex);
        let url = "/core/common/videoutil/src?url=" + escape(m[0]);
        if (loading) loading();
        Vue.prototype.$httpGet(url, null, function (res) {
          let src = res.data.src;
          if (src && m[0].indexOf("m.huya.com") > -1 && /^(\/\/)/.test(src)) src = "https:" + src;
          if (src) src = src.replace(/(&amp;)/gi, "&");
          callback(src);
        });
      } else {
        callback(sharelink);
      }
    };

	// 获取抖音、快手...等的直播拉流地址
	Vue.prototype.getHlsSrc = (platformType, sharelink, callback, loading) => {
		Vue.prototype.getVideoSrc(sharelink, callback, loading);
	};

    //判断一个变量是否是对象
    Vue.prototype.isObject = (obj) => {
      if (obj && typeof obj == "object" && (obj instanceof Array) == false) {
        return true;
      }
      return false;
    };

    //判断一个变量是否是数组
    Vue.prototype.isArray = (obj) => {
      if (obj && typeof obj == "object" && (obj instanceof Array) == true) {
        return true;
      }
      return false;
    };
  }
};