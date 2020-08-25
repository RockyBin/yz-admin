const path = require(`path`);
const webpack_modulename = require("./plugins/webpack-modulename");
const resolve = dir => path.join(__dirname, dir);
const serverAddr = require("./apiserver.config.js");

module.exports = {
  css: {
    loaderOptions: { // 向 CSS 相关的 loader 传递选项
      less: {
        javascriptEnabled: true
      }
    }
  },
  chainWebpack: config => {
    config.resolve.alias.set(`COMPONENTS`, resolve(`src/views/shop/components`))
      .set(`images`, resolve(`public/images`))
      .set(`design`, resolve(`src/views/shop/store/design`))
  },
  devServer: {
    disableHostCheck: true,
    // 设置代理
    proxy: {
      "/vueapi": {
        target: serverAddr.serverAddr, // 域名
        ws: true, // 是否启用websockets
        changOrigin: true, //开启代理：在本地会创建一个虚拟服务端，然后发送请求的数据，并同时接收请求的数据，这样服务端和服务端进行数据的交互就不会有跨域问题
        pathRewrite: {
          "^/vueapi/": "/"
        }
      },
      "/core/": {
        target: serverAddr.serverAddr, // 域名
        ws: false, // 是否启用websockets
        changOrigin: true //开启代理：在本地会创建一个虚拟服务端，然后发送请求的数据，并同时接收请求的数据，这样服务端和服务端进行数据的交互就不会有跨域问题
      },
      "/tmpdata/": {
        target: serverAddr.serverAddr, // 域名
        ws: false, // 是否启用websockets
        changOrigin: true //开启代理：在本地会创建一个虚拟服务端，然后发送请求的数据，并同时接收请求的数据，这样服务端和服务端进行数据的交互就不会有跨域问题
      },
      "/comdata": {
        target: serverAddr.serverAddr, // 域名
        ws: false, // 是否启用websockets
        changOrigin: true //开启代理：在本地会创建一个虚拟服务端，然后发送请求的数据，并同时接收请求的数据，这样服务端和服务端进行数据的交互就不会有跨域问题
      },
      "/sysdata": {
        target: serverAddr.serverAddr, // 域名
        ws: false, // 是否启用websockets
        changOrigin: true //开启代理：在本地会创建一个虚拟服务端，然后发送请求的数据，并同时接收请求的数据，这样服务端和服务端进行数据的交互就不会有跨域问题
      }
    }
  },
  configureWebpack: config => {
    if (process.env.NODE_ENV === "production") {
      // 为生产环境修改配置...
      // config.devtool = 'source-map';
      config.devtool = ''; //禁用SourceMap
      // config.plugins.push(new webpack_modulename());
      // config.output.filename = "js/[name].js";
      // config.output.chunkFilename = "js/[id].js";
    } else {
      // 为开发环境修改配置...
      config.devtool = 'source-map';
    }
  },
  publicPath: process.env.NODE_ENV === 'production' ? '/shop/admin/' : '/'
};