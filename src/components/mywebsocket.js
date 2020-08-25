/* eslint-disable */
let MyWebSocket = function () {
	//接收到的消息列表，主要用于WebSocket是全局连接，并且需要跨页面接收处理消息时暂存一下消息数据
	this.msgList = [];

	//当连接成功时的回调事件
	this.onConnect = null;

	//当链接断开并自动重连后执行的动作
	this.onReConnect = null;

	//当连接认证失败时的回调事件
	this.onAuthFail = null;

	//当断开连接时的回调事件
	this.onDisConnect = null;

	//当收到新消息时
	this.onMessage = null;

	//当前连接的标识
	this.clientId = "";

	//连接对象
	this._sock = null;

	//websocket 地址
	this._url = "";

	//打开websocket时的参数
	this._params = {};

	//打开一个socket链接
	this.open = function (url, params) {
		var that = this;
		that._url = url;
		that._params = params;
		var auth = "{" + params["user"] + ":" + params["passwd"] + "}";
		url += url.substr(-1, 1) == "/" ? auth : "/" + auth;

		that._sock = new WebSocket(url);
		that._sock.onopen = function (res) {
			//console.log('WebSocket连接已打开！', res)
			if(params.onReconnect) {
				params.onReconnect();
			}
		};
		that._sock.onclose = function (res) {
			//console.log('WebSocket连接已关闭！', res)
			if (that.onDisConnect) that.onDisConnect(res);
		};
		that._sock.onmessage = function (res) {
			var data = null;
			try {
				data = JSON.parse(res.data);
			} catch (e) {
				data = res.data;
			}
			if (data['event'] == 'auth-fail') {
				//console.log('认证失败，服务器拒绝连接', data);
				if (that.onAuthFail) that.onAuthFail(data);
			} else if (data['event'] == 'websocket-connected') {
				//console.log('连接成功,clientid = ' + data.data['clientid'], data);
				that.clientId = data.data['clientid'];
				if (that.onConnect) that.onConnect(data);
				if (that.onReConnect) {
					that.onReConnect();
				}
			} else {
				//console.log('收到服务器内容：', data);
				that.msgList.push(data);
				if (that.onMessage) that.onMessage(data);
			}
		};
	};

	this.close = function () {
		this._sock.close();
	};

	this.send = function (msg) {
		var that = this;
		if (that._sock.readyState == 2 || that._sock.readyState == 3) {
			that.onReConnect = function() {
				that.send(msg);
			};
			that.open(that._url, that._params);
		} else {
			that._sock.send(JSON.stringify(msg));
		}
	};

	//判断一个变量是否是对象
	this.isObject = function (obj) {
		if (obj && typeof obj == "object" && (obj instanceof Array) == false) {
			return true;
		}
		return false;
	};

	//接收一条消息，如果需要接收N条消息，要多次调用此方法
	//此方法通常用于socket是全局连接，需要在不同的页面接收消息时使用，
	//如果连接只在某个页面内，建议使用 onMessage 回调事件
	//传递 keyword 可以只接收包含指定内容的消息，起到过滤无用消息的作用，比如在业务系统中，你可以将订单ID推送到消息网关
	//在这里也可以以订单ID作为 keyword ，起到只接收此订单消息的作用
	//keyword 可以是 null，字符串，或 Object 类型
	this.receiveMsg = function (keyword) {
		var that = this;
		if (!keyword) {
			if (that.msgList.length > 0) {
				var msg = that.msgList[0];
				that.msgList.splice(0, 1);
				return msg;
			} else {
				return null;
			}
		}
		for (var i = 0; i < that.msgList.length; i++) {
			//当keyword是对象时，要求消息的data属性也是一个对象，并且data的每一个属性都与keyword对应的键值匹配，起到精确匹配的作用
			//通常这种方式用在消息的标识是相同，但会其它属性不同的情况，比如可能有N条消息都与某个订单ID有关，但消息类型不一样，例如：
			//{"OrderID":123456,"Status":"CreateOK"}, {"OrderID":123456,"Status":"PayOK"}
			if (that.isObject(keyword)) {
				var match = 0;
				var keynum = 0;
				for (var key in keyword) {
					keynum++;
					if (that.msgList[i].data[key] == keyword[key]) {
						match++;
					}
				}
				if (match == keynum) {
					var msg = that.msgList[i];
					that.msgList.splice(i, 1);
					return msg;
				}
			} else if (typeof keyword == 'string' && JSON.stringify(that.msgList[i].data).indexOf(keyword) > -1) {
				var msg = that.msgList[i];
				that.msgList.splice(i, 1);
				return msg;
			}
		}
		return null;
	};
}

export default MyWebSocket;