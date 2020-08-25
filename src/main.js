import Vue from "vue";
import App from "./App.vue";
import router from "@/router";
import store from "@/store";
import axios from "axios";
import iView from "iview";
import VueJsonp from "vue-jsonp";
import "@/views/shop/css/my-theme/index.less";
// import "@/views/shop/css/iconfont/iconfont.css";
import permission from "@/components/permission";
import globalfunctions from "@/components/globalFunctions.js";
import constants from "@/views/shop/components/constants";
import ColorPicker from "@/views/shop/components/color-picker/ColorPicker.js";
import cityData from "@/views/shop/components/cityDataThree";

// 拦截iview的Message 处理同一个信息可以弹出很多次的问题
let Message = iView.Message.message;
iView.Message.message = function(type, options) {
  iView.Message.destroy();
  return Message.apply(iView.Message, [type, options]);
};
// 改回原来的onSize，不触发changePage
iView.Page.methods.onSize = function(pageSize) {
  this.currentPageSize = pageSize;
  this.$emit("on-page-size-change", pageSize);
};
//解决没有必填字段时，调用此方法一直等待的问题
iView.Form.methods.validate = function(callback) {
  return new Promise((resolve) => {
    let valid = true;
    let count = 0;
    if (this.fields.length) {
      this.fields.forEach((field) => {
        field.validate("", (errors) => {
          if (errors) {
            valid = false;
          }
          if (++count === this.fields.length) {
            // all finish
            resolve(valid);
            if (typeof callback === "function") {
              callback(valid);
            }
          }
        });
      });
    } else {
      resolve(valid);
      if (typeof callback === "function") {
        callback(valid);
      }
    }
  });
};

//解决旧版本浏览器不兼容promise.prototype.finally的问题
require("promise.prototype.finally").shim();

// 解决iVew中的InputNumber组件自动补0的不友好操作
iView.InputNumber.computed.precisionValue = function() {
  let arr = (this.currentValue + "").split(".");
  if (this.precision && arr[1] && this.precision < arr[1].length)
    return this.currentValue.toFixed(this.precision);
  return this.currentValue;
};

axios.defaults.withCredentials = true; //没有这个不会发送cookie
axios.defaults.baseURL =
  document.location.protocol +
  "//" +
  location.hostname +
  (location.port ? ":" + location.port : ""); //设置默认的请求基本地址
//开发模式下，自动添加一个特殊的子目录 /vueapi，并且在 vue.config.js 中进行url重写处理，解决开发环境下的跨域问题
if (process.env.NODE_ENV === "development") {
  axios.defaults.baseURL += "/vueapi";
}

Vue.use(iView);
Vue.use(VueJsonp);
Vue.use(permission);
Vue.use(globalfunctions);
Vue.options.components.ColorPicker = ColorPicker;
// 拦截返回数据
axios.interceptors.response.use(
  function(response) {
    //接口返回的错误信息处理
    if (typeof response.data.code !== "undefined") {
      if (response.data.code != 200) {
        if (response.data.code == 403 && router.currentRoute.name !== "login") {
          router.push({
            name: "login",
            query: { msg: "登录失效，请重新登录！" },
          });
          return response.data;
        }
        response["error"] = true;
        response["msg"] = response.data.msg;
      }
    } else if (typeof response.data === "string") {
      response["error"] = true;
      response["msg"] = response.data;
    }
    // 二进制文件直接返回（可以用于获取文件名等）
    if (response.request.responseType === "blob") {
      return response;
    }
    return response.data;
  },
  function(error) {
    // 对返回的错误进行一些处理
    error = {
      error: true,
      msg: error.message,
      info: error,
    };
    return error;
  }
);

/**
 * @param url 请求地址
 * @param callback 回调函数
 * @param data 传递的参数，对象形式
 */
Vue.prototype.$httpPost = function(url, data, callback) {
  data = data || {};
  //let param = new URLSearchParams(data);
  axios
    .post(url, data, { "Content-Type": "application/x-www-form-urlencoded" })
    .then(function(response) {
      callback && callback(response);
    })
    .catch(function(error) {
      callback && callback(error);
    });
};

/**
 * @param url 请求地址
 * @param callback 回调函数
 * @param data 传递的参数，对象形式，它应该是用 H5 的 new FormData() 构造出来的
 */
Vue.prototype.$httpUpload = function(url, data, callback, config = {}) {
  data = data || {};
  axios
    .post(url, data, config)
    .then(function(response) {
      callback && callback(response);
    })
    .catch(function(error) {
      callback &&
        callback({
          code: 404,
          msg: error.message,
        });
    });
};

/**
 * @param url 请求地址
 * @param callback 回调函数
 * @param data 传递的参数，对象形式
 */
Vue.prototype.$httpGet = function(url, data, callback) {
  data = data || {};
  axios.get(url, { params: data }).then(
    (response) => {
      callback && callback(response);
    },
    (error) => {
      callback && callback(error);
    }
  );
};

Vue.config.productionTip = false;
Vue.prototype.http = axios;
Vue.prototype.$constants = constants;
Vue.prototype.$cityData = cityData;

const root = new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
// 监听所有click事件
document.body.addEventListener(
  "click",
  function handle(event) {
    event = event || window.event;
    var target = event.target || event.srcElement;
    checkElementPerm(target);
  },
  true
);
// 递归向上检查是否有权限
function checkElementPerm(targetCheck) {
  var result = checkElementPermHandle(targetCheck);
  if (result && targetCheck) {
    var parentTargetCheck = targetCheck.parentNode || targetCheck.parentElement; // 向父节点查找
    if (
      parentTargetCheck &&
      parentTargetCheck.tagName &&
      parentTargetCheck.tagName.toLowerCase() != "body"
    ) {
      result = checkElementPerm(parentTargetCheck);
    }
  }
  return result;
}
// 检查是否有权限
function checkElementPermHandle(targetCheck) {
  if (!targetCheck || !targetCheck.getAttributeNode("perm")) return true;
  var perm = targetCheck.getAttributeNode("perm").value;
  if (perm && !window.hasPerm(perm)) {
    // iView.Modal.confirm({
    //   title: "提示",
    //   content: "您暂时没有此操作权限，请联系超级管理员！",
    //   okText: "知道了",
    //   cancelText: " "
    // });
    root.$children[0].showPermModal = true;
    event.stopPropagation();
    event.preventDefault();
    return false;
  }
  return true;
}
