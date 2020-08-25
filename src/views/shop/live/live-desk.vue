<template>
  <div class="live-desk">
    <div>
      <titlebar :title="`直播间名称：${liveInfo.title}`"></titlebar>
      <span class="tip-text">
        （真实在线人数：
        <span>{{liveInfo.real_online_num || 0}}</span>人）
      </span>
    </div>
    <div class="flex-wrapper">
      <div class="videoframe">
        <!-- 视频预览窗口，嵌入前台iframe，并蒙一个透明层，以禁用进行操作 -->
        <div class="phone-head">
          <img src="images/mobile-top.jpg" />
          <div class="page-name">{{ liveInfo.title }}</div>
        </div>
        <div class="phone-body">
          <iframe
            v-if="pageUrl"
            :src="pageUrl"
            frameborder="0"
            scrolling="no"
            width="100%"
            height="100%"
          ></iframe>
          <div class="mask"></div>
        </div>
      </div>
      <div class="oppanel">
        <div class="btn-wrapper">
          <Button
            class="button"
            ghost
            v-if="liveInfo.status == 0 || liveInfo.status == 2"
            @click="showOpenDialog"
            type="primary"
          >
            <i class="iconfont icon-bofang"></i>
            <span>开始直播</span>
          </Button>
          <Button
            class="button"
            ghost
            v-if="liveInfo.status == 1"
            @click="closeLive"
            type="primary"
          >
            <i class="iconfont icon-icontingzhibofangyuyin01"></i>
            <span>结束直播</span>
          </Button>
          <Button
            v-if="liveInfo.status == 1"
            class="button"
            ghost
            @click="toggleMuted"
            type="primary"
          >
            <i
              :class="
                'iconfont ' + (liveInfo.muted ? 'icon-jinyankai' : 'icon-voice')
              "
            ></i>
            <span>{{ liveInfo.muted ? "解除全员禁言" : "开启全员禁言" }}</span>
          </Button>
          <Button
            v-if="liveInfo.status == 1 && liveInfo.notice"
            class="button"
            ghost
            @click="sendNotice"
            type="primary"
          >
            <i class="iconfont icon-tuisong"></i>
            <span>推送公告</span>
          </Button>
          <Button
            v-if="liveInfo.status == 1"
            class="button"
            ghost
            @click="sendImageClick"
            type="primary"
          >
            <i class="iconfont icon-tupian"></i>
            <span>推送图片</span>
          </Button>
        </div>
        <div class="tabs">
          <Tabs v-model="currentTab" :animated="false" type="card" name="tabdesk">
            <TabPane label="直播互动" name="1">
              <!--消息窗口-->
              <div class="chat-msg-list" ref="msg-list">
                <div class="msg-item" v-for="(item, index) in msgList" :key="index">
                  <span class="time">【{{ item.created_at.split(" ")[1] }}】</span>
                  <span class="circle" v-if="item.isadmin">管</span>
                  <span class="name">{{ item.name }}：</span>
                  <span v-if="item.link" class="text">
                    <a
                      target="_blank"
                      :href="
                        item.link.substr(0, 1) == '#'
                          ? '/shop/front/' + item.link
                          : item.link
                      "
                    >{{ item.msg }}</a>
                  </span>
                  <span v-else class="text">{{ item.msg }}</span>
                </div>
              </div>
              <!--底部输入框-->
              <div class="chat-input">
                <div class="title">回复评论：</div>
                <div class="right">
                  <Input
                    :class="{'input-msg':true,'with-link':newMessageLinkObj.url}"
                    type="textarea"
                    v-model="newMessage"
                    @on-enter="sendMessage($event)"
                  />

                  <div class="btncontainer">
                    <Button class="button" type="primary" @click="sendMessageAct">发送</Button>
                    <div class="name">评论链接：</div>
                    <LinkButton
                      class="link-btn"
                      :context="newMessageLinkObj"
                      :text="newMessageLinkObj.desc"
                      @onSelectLink="onLinkSelected"
                    ></LinkButton>
                    <!-- <div>
                      <span class="label">管理员昵称：</span>
                      <Input v-model="memberName" :maxlength="10" class="name">
                        <span slot="suffix"
                          >{{ memberName ? memberName.length : 0 }}/10</span
                        >
                      </Input>
                    </div>-->
                  </div>
                </div>
              </div>
            </TabPane>
            <TabPane class="product-list" label="推送商品" name="2">
              <div class="search-wrapper">
                <Input v-model="productKeyword" placeholder="商品名称" prefix="ios-search" />
                <Button type="primary" @click="searchProduct">搜索</Button>
              </div>
              <common-table
                v-if="currentTab==2"
                hasBorder
                :columnsData="productColumns"
                :listData="productListToShow"
              ></common-table>
            </TabPane>
            <TabPane class="coupon-list" label="推送优惠券" name="3">
              <div class="search-wrapper">
                <Input v-model="couponKeyword" placeholder="优惠券名称" prefix="ios-search" />
                <Button type="primary" @click="searchCoupon">搜索</Button>
              </div>
              <common-table
                v-if="currentTab==3"
                hasBorder
                :columnsData="couponColumns"
                :listData="couponListToShow"
              ></common-table>
            </TabPane>
          </Tabs>
          <div class="mask" v-if="liveInfo.status != 1">
            <div v-if="liveInfo.status == 0" class="tips">还没开播暂不能操作~</div>
            <div v-if="liveInfo.status == 2" class="tips">直播已结束~</div>
          </div>
        </div>
      </div>
    </div>
    <Modal v-model="openDialog" :mask-closable="false" footer-hide width="472">
      <div class="title">
        <i class="ivu-icon ivu-icon-ios-help-circle"></i>
        <span>请确定以下直播间信息</span>
      </div>
      <Form ref="form" :model="liveInfo" :rules="rules" :labelWidth="116">
        <FormItem label="第三方直播平台：" prop="live_platform">
          <Select
            transfer
            v-model="liveInfo.live_platform"
            style="display: inline-block;width: 290px"
          >
            <Option :value="1">NOW直播</Option>
            <Option :value="2">快手</Option>
            <Option :value="3">抖音</Option>
            <!-- <Option :value="4">映客</Option> -->
            <Option :value="5">一直播</Option>
            <Option :value="6">斗鱼</Option>
            <Option :value="7">花椒</Option>
            <!-- <Option :value="8">虎牙</Option> -->
            <Option :value="9">YY</Option>
            <Option :value="99">其他</Option>
          </Select>
        </FormItem>
        <FormItem label="第三方直播地址：" prop="live_src">
          <span class="spvideo">
            <Input
              v-model="liveInfo.live_src"
              type="textarea"
              style="width:290px;height:62px"
            />
          </span>
          <div>
            <a href="http://help.wfenxian.com/NewsDetail/1798496.html" target="_blank">如何获取直播地址</a>
          </div>
        </FormItem>
      </Form>
      <div class="footer">
        <Button type="text" @click="openDialog = false">取消</Button>
        <Button
          type="primary"
          :loading="loadingVideo || btnLoading"
          @click="openLive"
        >开始直播</Button>
      </div>
    </Modal>
    <Modal
      width="341"
      class="loading-dialog"
      :closable="false"
      :footer-hide="true"
      v-model="loadingVideo"
    >
      <Icon type="ios-loading" size="32" class="demo-spin-icon-load"></Icon>
      <div style="margin-top:20px;">系统正在帮您自动提取视频地址，大约需要10秒，</div>
      <div>请稍后...</div>
    </Modal>
    <FilesSelector v-model="showFilesSelector" @onSelected="sendImage"></FilesSelector>
  </div>
</template>
<script>
import MyWebSocket from "@/components/mywebsocket";
import commonTable from "@/views/shop/components/table/common-table.vue";
import titlebar from "@/views/shop/components/titlebar/vertical-line-titlebar";
import FilesSelector from "@/components/files/files";
import LinkButton from "./components/link-select-button";
export default {
  components: { commonTable, titlebar, FilesSelector, LinkButton },
  data() {
    return {
      btnLoading: false,
      currentTab: "1",
      ws: null, //websocket连接对象
      msgList: [], //聊天消息列表
      liveId: 0,
      memberId: -1, //会员ID，工作台设置为-1
      memberName: "", //会员昵称，工作台设定为“管理员助手”
      memberHead: "", //会员头像，工作台设定为空字符串
      productList: [], //商品列表，从后台接口返回
      couponList: [], //优惠券列表，从后台接口返回
      productListToShow: [], //商品列表，基于 productList 过滤得出的结果(用于前端搜索)
      couponListToShow: [], //优惠券列表，基于 couponList 过滤得出的结果(用于前端搜索)
      productKeyword: "",
      couponKeyword: "",
      liveInfo: {}, //直播信息，从后台接口返回
      groupId: "", //聊天组ID，格式为 "shop_live_" + liveId;
      newMessage: "", //底部输入框的内容
      newMessageLinkObj: {}, //评论链接
      openDialog: false, //是否显示开始直播的对话框
      loadingVideo: false, //是否正在获取视频地址
      pageUrl: "", //前台直播页面预览地址
      showFilesSelector: false, //文件选择器
      productColumns: [
        {
          title: "商品信息",
          minWidth: 363,
          render: (h, params) => {
            return h(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "flex-start",
                  marginTop: "12px"
                }
              },
              [
                h(
                  "div",
                  {
                    style: {
                      position: "relative"
                    }
                  },
                  [
                    h("img", {
                      attrs: {
                        src: this.padImgUrl(
                          params.row.product.small_images.split(",")[0]
                        )
                      },
                      style: {
                        height: "40px",
                        width: "40px",
                        objectFit: "contain",
                        flexShrink: 0
                      }
                    }),
                    params.row.type == 1
                      ? h("div", {
                          class: "live-setting-products-icon"
                        })
                      : ""
                  ]
                ),
                h(
                  "div",
                  {
                    class: "two-hide",
                    style: {
                      flexGrow: 1,
                      margin: "0 14px"
                    }
                  },
                  params.row.product.name
                ),
                params.row.product.status != 1
                  ? h(
                      "div",
                      {
                        class: "table-error"
                      },
                      params.row.product.status == 0 ? "已下架" : "已删除"
                    )
                  : null
              ]
            );
          }
        },
        {
          title: "售卖价",
          minWidth: 200,
          key: "price",
          align: "center",
          render: (h, params) => {
            return h("div", {}, "￥" + (params.row.product.price || ""));
          }
        },
        {
          title: "操作",
          minWidth: 200,
          key: "operation",
          align: "center",
          render: (h, params) => {
            var downScreen = h(
              "a",
              {
                class: "table-operation",
                on: {
                  click: () => {
                    this.pushProduct(null, params.row);
                  }
                }
                // style: {
                //   display: params.row.is_onscreen ? "block" : "none"
                // }
              },
              "下屏"
            );
            var upScreen = h(
              "a",
              {
                class: "table-operation",
                on: {
                  click: () => {
                    this.pushProduct(params.row.product, params.row);
                  }
                }
                // style: {
                //   display:
                //     params.row.is_onscreen ||
                //     params.row.product.status != 1 ||
                //     this.liveInfo.status != 1
                //       ? "none"
                //       : "block"
                // }
              },
              "推送上屏"
            );
            var noop = h(
              "span",
              {
                // style: {
                //   display:
                //     params.row.product.status != 1 || this.liveInfo.status != 1
                //       ? "block"
                //       : "none"
                // }
              },
              "--"
            );
            return params.row.product.status != 1 || this.liveInfo.status != 1
              ? noop
              : params.row.is_onscreen
              ? downScreen
              : upScreen;
          }
        }
      ],
      couponColumns: [
        {
          title: "优惠券标题",
          minWidth: 210,
          render: (h, params) => {
            return h(
              "div",
              {
                style: {
                  display: "flex",
                  justifyContent: "space-between"
                }
              },
              [
                h(
                  "span",
                  {
                    style: {
                      marginRight: "10px",
                      alignSelf: "center",
                      flexGrow: 1
                    }
                  },
                  params.row.coupon.title
                ),
                h(
                  "span",
                  {
                    class: params.row.coupon.status == 0 ? "table-error" : ""
                  },
                  params.row.coupon.status == 0 ? "已禁用" : ""
                )
              ]
            );
          }
        },
        {
          title: "门槛/面值/类型",
          minWidth: 150,
          align: "center",
          render: (h, params) => {
            var arr = [];
            if (params.row.coupon.doorsill_type == 1) {
              arr.push(`满${params.row.coupon.doorsill_full_money}元可用`);
            } else {
              arr.push("无门槛使用");
            }
            if (params.row.coupon.coupon_type == 1) {
              arr.push(`${parseFloat(params.row.coupon.coupon_money)}折`);
            } else {
              arr.push(`${params.row.coupon.coupon_money}元`);
            }
            if (params.row.coupon.coupon_type == 1) {
              arr.push("折扣券");
            } else {
              arr.push("现金券");
            }
            return h("span", [arr[0], h("br"), arr[1], h("br"), arr[2]]);
          }
        },
        {
          title: "可用商品",
          minWidth: 140,
          align: "center",
          render: (h, params) => {
            if (params.row.coupon.product_info === "全场商品") {
              return h("div", params.row.coupon.product_info);
            } else {
              return h(
                "div",
                ((render, params) => {
                  const rows = [];
                  rows.push(
                    h(
                      "Tooltip",
                      {
                        props: {
                          content: params.row.coupon.product_info,
                          placement: "top-start",
                          "max-width": 400,
                          disabled:
                            params.row.coupon.product_info === "全场商品"
                        }
                      },
                      [
                        h(
                          "div",
                          {
                            class: "table-area-shape",
                            style: {
                              display: "-webkit-box",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              "-webkit-line-clamp": 2,
                              "-webkit-box-orient": "vertical"
                            }
                          },
                          params.row.coupon.product_info || "--"
                        )
                      ]
                    )
                  );
                  return rows;
                })(h, params)
              );
            }
          }
        },
        {
          title: "可领取",
          minWidth: 124,
          align: "center",
          render: (h, params) => {
            return h(
              "span",
              params.row.coupon.can_received === -1
                ? "无限"
                : params.row.coupon.can_received
            );
          }
        },
        {
          title: "操作",
          minWidth: 140,
          key: "operation",
          align: "center",
          render: (h, params) => {
            var downScreen = h(
              "a",
              {
                class: "table-operation",
                on: {
                  click: () => {
                    this.pushCoupon(null, params.row);
                  }
                }
                // style: {
                //   display: params.row.is_onscreen ? "block" : "none"
                // }
              },
              "下屏"
            );
            var upScreen = h(
              "a",
              {
                class: "table-operation",
                on: {
                  click: () => {
                    this.pushCoupon(params.row.coupon, params.row);
                  }
                }
                // style: {
                //   display:
                //     params.row.is_onscreen ||
                //     params.row.coupon.status != 1 ||
                //     this.liveInfo.status != 1
                //       ? "none"
                //       : "block"
                // }
              },
              "推送上屏"
            );
            var noop = h("span", "--");
            return params.row.coupon.status != 1 ||
              this.liveInfo.status != 1 ||
              !params.row.coupon.can_received
              ? noop
              : params.row.is_onscreen
              ? downScreen
              : upScreen;
          }
        }
      ],
      // totalProduct: 0,
      // currentPageProduct: 1,
      // pageSizeProduct: 10,
      // totalCoupon: 0,
      // currentPageCoupon: 1,
      // pageSizeCoupon: 10,
      rules: {
        live_platform: [{ required: true, message: "请选择第三方直播平台" }],
        live_src: [
          { required: true, message: "请输入第三方直播地址", trigger: "change" }
        ]
      },
      old_live_src: null
    };
  },
  created() {
    let that = this;
    that.liveId = this.$route.query.live_id;
    that.groupId = "shop_live_" + that.liveId;
    this.getInfo();
  },
  mounted() {
    var domain = location.host;
    if (domain.indexOf("localhost") > -1 || !domain) {
      domain = "shop.test.72dns.net";
    }
    this.pageUrl =
      "http://" +
      domain +
      "/shop/front/#/live/live-detail?id=" +
      this.liveId +
      "&adminframe=1";
  },
  destroyed() {
    this.ws.close();
  },
  methods: {
    formatDate(date) {
      var year = date.getFullYear();
      var month = date.getMonth() + 1;
      var day = date.getDate();
      var hour = date.getHours();
      var minute = date.getMinutes();
      var second = date.getSeconds();
      function padZero(num) {
        if (num == 0) {
          return "00";
        } else if (num < 10) {
          return "0" + num;
        } else {
          return "" + num;
        }
      }
      return `${year}-${padZero(month)}-${padZero(day)} ${padZero(
        hour
      )}:${padZero(minute)}:${padZero(second)}`;
    },
    padImgUrl(url) {
      if (!url) {
        return;
      }
      if (/^http/i.test(url)) {
        return url;
      } else {
        return this.$store.state.siteComdataPath + url;
      }
    },
    //商品列表分页
    // onPageChangeProduct(page) {
    //   this.currentPageProduct = page;
    //   this.getProductList();
    // },
    // onPageSizeChangeProduct(size) {
    //   this.pageSizeProduct = size;
    //   this.currentPageProduct = 1;
    //   this.getProductList();
    // },
    //优惠券列表分页
    // onPageChangeCoupon(page) {
    //   this.currentPageCoupon = page;
    //   this.getCouponList();
    // },
    // onPageSizeChangeCoupon(size) {
    //   this.pageSizeCoupon = size;
    //   this.currentPageCoupon = 1;
    //   this.getCouponList();
    // },
    // getProductList() {},
    // getCouponList() {},
    /**
     * 初始化
     */
    init() {
      let that = this;
      that.ws = new MyWebSocket();
      that.ws.onConnect = function(data) {
        console.log("连接成功", data);
        console.log("连接标识", that.ws.clientId);
        let message = {
          act: "bindGroupId",
          groupid: that.groupId,
          clientid: that.ws.clientId
        };
        that.ws.send(message);
      };
      that.ws.onMessage = function(msg) {
        console.log("收到消息", msg);
        if (msg.type == "ACTION") {
          console.log("服务器返回的系统消息，一般用来判断操作结果，不需要显示");
          return;
        }
        if (msg.type == "NORMAL" && msg.data["type"]) {
          //本商城的系统消息，在工作台不需要显示
          return;
        }
        that.addMsgToList(msg.data);
      };
      that.ws.onDisConnect = function(data) {
        console.log("连接已关闭", data);
      };
      that.ws.open(that.$store.state.wsConfig.ws_url, {
        user: that.$store.state.wsConfig.ws_user,
        passwd: that.$store.state.wsConfig.ws_pwd
      });
    },
    /**
     * 将消息加到消息列表里
     */
    addMsgToList(msg) {
      this.msgList.push({
        name: msg.name,
        msg: msg.data,
        isadmin: msg.member_id == -1, //member_id = -1，认为是管理员,
        link: msg.link,
        created_at: msg.created_at
      });
      setTimeout(() => {
        this.$refs["msg-list"].scrollTop = this.$refs["msg-list"].scrollHeight;
      }, 300);
    },
    /**
     * 获取直播信息
     */
    getInfo() {
      this.$store.state.COMMON_loading = true;
      this.$httpGet("/shop/front/live/info", { id: this.liveId }, res => {
        this.$store.state.COMMON_loading = false;
        if (res.code == 200) {
          if (res.data.liveInfo) {
            //liveInfo应该要包含当前上屏的商品或优惠券信息
            this.liveInfo = res.data.liveInfo;
            this.initOnlineNum = this.liveInfo.base_online_num || 0;
            this.realOnlineNum += this.liveInfo.online_num || 0;
            this.memberName = this.liveInfo.live_helper_name || "管理员助手";
            this.old_live_src = this.liveInfo.live_src;
          }
          if (res.data.productList) {
            this.productList = res.data.productList;
            this.productListToShow = this.productList;
          }
          if (res.data.couponList) {
            this.couponList = res.data.couponList;
            this.couponListToShow = this.couponList;
          }
          if (this.liveInfo.status === 1) {
            this.init();
          }
          //加载最新的N条聊天记录
          this.msgList = [];
          this.loadNewestChat();
        } else {
          this.$Message.error(res.msg);
          this.$router.push({
            name: "liveManage"
          });
        }
      });
    },
    /**
     * 加载最新的20条聊天记录
     */
    loadNewestChat() {
      this.$httpGet(
        "/shop/front/live/chat/newest",
        {
          live_id: this.liveId,
          num: 15
        },
        res => {
          if (res.code == 200) {
            //后台返回的列表是降序的，这里要反过来显示
            if (res.data.list && res.data.list.length) {
              let len = res.data.list.length;
              for (let i = len - 1; i >= 0; i--) {
                let msg = res.data.list[i];
                if (this.isObject(res.data.list[i]).content) {
                  // 这种一般是系统消息，暂时是没有的，以后再扩展
                } else {
                  this.addMsgToList({
                    clientid: msg.client_id,
                    member_id: msg.member_id,
                    headurl: msg.headurl,
                    name: msg.nickname,
                    data: msg.content,
                    link: msg.link,
                    created_at: msg.created_at
                  });
                }
              }
            }
          } else {
            this.$Message.error(res.msg);
          }
        }
      );
    },
    /**
     * 保存聊天记录
     */
    saveChat(content) {
      this.$httpUpload(
        "/shop/front/live/chat/add",
        {
          live_id: this.liveId,
          client_id: this.ws.clientId,
          member_id: this.memberId,
          nickname: this.memberName,
          headurl: this.memberHead,
          content: content,
          link: this.newMessageLinkObj.url
        },
        res => {
          if (res.code == 200) {
            //添加成功，无需做任何处理
            // this.$Message.success("回复成功");
          } else {
            this.$Message.error(res.msg);
          }
        }
      );
    },
    /**
     * 评论链接
     */
    onLinkSelected(linkInfo) {
      this.newMessageLinkObj = linkInfo;
    },
    /**
     * 发送消息到socket
     */
    sendMessage(event) {
      if (!event.shiftKey && event.keyCode == 13) {
        this.sendMessageAct();
      }
    },
    sendMessageAct() {
      console.log(11111, this.newMessage.charCodeAt(0), 2222);
      if (!this.newMessage.trim()) return;
      let message = {
        act: "sendMsgToGroup",
        groupid: this.groupId,
        msg: {
          clientid: this.ws.clientId,
          name: this.memberName,
          headurl: this.memberHead,
          data: this.newMessage,
          member_id: -1,
          created_at: this.formatDate(new Date()),
          link: this.newMessageLinkObj.url
        }
      };
      this.ws.send(message);
      this.saveChat(this.newMessage);
      this.newMessage = "";
      this.newMessageLinkObj = {};
    },
    /**
     * 商品搜索
     */
    searchProduct() {
      this.productListToShow = this.productList.filter(
        x => x.product.name.indexOf(this.productKeyword) > -1
      );
    },
    /**
     * 商品推送上屏、下屏
     */
    pushProduct(product, liveProduct) {
      if (product === null) {
        let message = {
          act: "sendMsgToGroup",
          groupid: this.groupId,
          msg: {
            type: "PRODUCT_DOWN"
          }
        };
        this.ws.send(message);
        liveProduct.is_onscreen = 0;
      } else {
        product.small_image = product.small_images.split(",")[0];
        let message = {
          act: "sendMsgToGroup",
          groupid: this.groupId,
          msg: {
            type: "PRODUCT_UP",
            product: product
          }
        };
        this.ws.send(message);
        liveProduct.is_onscreen = 1;
        this.productList.forEach(x => {
          if (x.product_id == liveProduct.product_id) {
            x.is_onscreen = 1;
          } else {
            x.is_onscreen = 0;
          }
        });
      }
      this.$httpUpload(
        "/shop/admin/live/product/onscreen",
        {
          live_id: this.liveId,
          product_id: liveProduct.product_id,
          is_onscreen: product === null ? 0 : 1
        },
        res => {
          if (res.code == 200) {
            //添加成功，无需做任何处理
            if (product != null) {
              this.$Message.success("推送成功");
            }
          } else {
            this.$Message.error(res.msg);
          }
        }
      );
    },
    /**
     * 优惠券搜索
     */
    searchCoupon() {
      this.couponListToShow = this.couponList.filter(
        x => x.coupon.title.indexOf(this.couponKeyword) > -1
      );
    },
    /**
     * 优惠券推送上屏、下屏
     */
    pushCoupon(coupon, liveCoupon) {
      if (coupon === null) {
        let message = {
          act: "sendMsgToGroup",
          groupid: this.groupId,
          msg: {
            type: "COUPON_DOWN"
          }
        };
        this.ws.send(message);
        liveCoupon.is_onscreen = 0;
      } else {
        let message = {
          act: "sendMsgToGroup",
          groupid: this.groupId,
          msg: {
            type: "COUPON_UP",
            coupon: coupon
          }
        };
        this.ws.send(message);
        liveCoupon.is_onscreen = 1;
        this.couponList.forEach(x => {
          if (x.coupon_id == liveCoupon.coupon_id) {
            x.is_onscreen = 1;
          } else {
            x.is_onscreen = 0;
          }
        });
      }
      this.$httpUpload(
        "/shop/admin/live/coupon/onscreen",
        {
          live_id: this.liveId,
          coupon_id: liveCoupon.coupon_id,
          is_onscreen: coupon === null ? 0 : 1
        },
        res => {
          if (res.code == 200) {
            //添加成功，无需做任何处理
            if (coupon != null) {
              this.$Message.success("推送成功");
            }
          } else {
            this.$Message.error(res.msg);
          }
        }
      );
    },
    /** 推送公告 */
    sendNotice() {
      let message = {
        act: "sendMsgToGroup",
        groupid: this.groupId,
        msg: {
          clientid: this.ws.clientId,
          name: "系统公告",
          member_id: -2,
          headurl: "",
          data: this.liveInfo.notice,
          link: this.liveInfo.notice_link,
          created_at: this.formatDate(new Date())
        }
      };
      this.ws.send(message);
      this.$Message.success("公告推送成功");
    },
    /** 推送图片 */
    sendImageClick() {
      this.showFilesSelector = true;
    },
    sendImage(image) {
      if (!image) return;
      if (!image.length) return;
      let message = {
        act: "sendMsgToGroup",
        groupid: this.groupId,
        msg: {
          type: "PUSH_IMAGE",
          image: image[0]
        }
      };
      console.log(message);
      this.ws.send(message);
      this.$Message.success("推送图片");
    },
    /** 切换全员禁言 */
    toggleMuted() {
      this.liveInfo.muted = !this.liveInfo.muted;
      let message = {
        act: "sendMsgToGroup",
        groupid: this.groupId,
        msg: {
          type: "MUTED",
          status: this.liveInfo.muted
        }
      };
      this.ws.send(message);
      this.$httpUpload(
        "/shop/admin/live/setmuted",
        {
          id: this.liveId,
          muted: this.liveInfo.muted
        },
        res => {
          if (res.code == 200) {
            //添加成功，无需做任何处理
            this.$Message.success(
              this.liveInfo.muted ? "全员禁言已开启" : "全员禁言已解除"
            );
          } else {
            this.$Message.error(res.msg);
          }
        }
      );
    },
    /**
     * 获取正确的直播视频流地址
     */
    loadVideoSrc(resolve) {
      this.getHlsSrc(
        this.liveInfo.live_platform,
        this.liveInfo.live_src,
        res => {
          this.liveInfo.live_src = res;
          this.loadingVideo = false;
          if (!this.liveInfo.live_src) {
            this.$Message.error("开播失败：无法自动获取到正确的直播地址");
            return;
          }
          resolve();
        },
        () => {
          this.loadingVideo = true;
        }
      );
    },
    showOpenDialog() {
      this.openDialog = true;
    },
    /**
     * 开始直播
     */
    async openLive() {
      if (this.old_live_src !== this.liveInfo.live_src) {
        await new Promise(resolve => {
          this.loadVideoSrc(resolve);
        });
      }
      this.old_live_src = this.liveInfo.live_src;
      this.$refs.form.validate(valid => {
        if (valid) {
          this.btnLoading = true;
          this.$httpUpload(
            "/shop/admin/live/open",
            {
              id: this.liveId,
              live_platform: this.liveInfo.live_platform,
              live_src: this.liveInfo.live_src
            },
            res => {
              this.btnLoading = false;
              if (res.code == 200) {
                this.liveInfo.status = res.data.status;
                this.openDialog = false;
                let message = {
                  act: "sendMsgToGroup",
                  groupid: this.groupId,
                  msg: {
                    type: "OPENLIVE",
                    live_src: this.liveInfo.live_src
                  }
                };
                this.init();
                setTimeout(() => {
                  this.ws.send(message);
                }, 2000); //延时两秒以便socket可以连接成功
                this.$Message.success("开播成功");
              } else {
                this.$Message.error(res.msg);
              }
            }
          );
        } else {
          this.$Message.error("开播失败");
        }
      });
    },
    /**
     * 结束直播
     */
    closeLive() {
      var lock = false;
      this.$Modal.confirm({
        title: "提示",
        content: "是否确定结束该场直播",
        onOk: () => {
          if (lock) {
            return;
          } else {
            lock = true;
          }
          this.$httpUpload(
            "/shop/admin/live/close",
            {
              id: this.liveId
            },
            res => {
              if (res.code == 200) {
                this.liveInfo.status = res.data.status;
                let message = {
                  act: "sendMsgToGroup",
                  groupid: this.groupId,
                  msg: {
                    type: "CLOSELIVE"
                  }
                };
                this.ws.send(message);
                this.ws.close();
                this.getInfo();
                this.$Message.success("直播已结束");
              } else {
                this.$Message.error(res.msg);
              }
            }
          );
        }
      });
    }
  }
};
</script>
<style lang="less" scoped>
.live-desk {
  padding: 24px !important;
  .vertical-line-titlebar-wrapper {
    display: inline-block;
  }
  .tip-text {
    font-size: 12px;
    color: #657180;
    span {
      color: #ed9218;
    }
  }
  .flex-wrapper {
    display: flex;
    margin-top: 22px;
    .videoframe {
      width: 377px;
      height: 669px;
      display: flex;
      flex-direction: column;
      border: 1px solid #efefef;
      margin-right: 39px;
      .phone-head {
        width: 100%;
        position: relative;
        .page-name {
          position: absolute;
          width: 100%;
          top: 30px;
          text-align: center;
          font-size: 16px;
        }
      }
      .phone-body {
        flex: 1;
        position: relative;
        .mask {
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          position: absolute;
          z-index: 99;
        }
      }
    }
    .oppanel {
      flex: 1;
      /deep/.ivu-btn-ghost {
        margin-right: 10px;
        line-height: 18px;
        .iconfont {
          margin-right: 5px;
          vertical-align: -1px;
        }
      }
      .tabs {
        position: relative;
        margin-top: 20px;
        .mask {
          display: flex;
          align-items: center;
          justify-content: center;
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 5px;
          .tips {
            color: white;
            font-size: 18px;
          }
        }
        /deep/.ivu-tabs-tab {
          width: auto;
        }
        /deep/.ivu-tabs-tabpane {
          border-left: 1px solid #dcdee2;
          border-right: 1px solid #dcdee2;
          border-bottom: 1px solid #dcdee2;
          border-radius: 0px 0px 5px 5px;
        }
        /deep/.ivu-table-wrapper {
          margin-top: 19px;
        }
        .product-list,
        .coupon-list {
          height: 578px;
          padding: 22px 25px;
          box-sizing: border-box;
          overflow: auto;
        }
        .search-wrapper {
          margin-bottom: 19px;
          /deep/.ivu-input-wrapper {
            width: 300px;
            margin-right: 16px;
          }
        }
        .chat-msg-list {
          height: 379px;
          overflow: auto;
          padding: 14px 14px 19px;
          box-sizing: border-box;
          border-bottom: 1px solid #dcdee2;
          .msg-item {
            color: #657180;
            font-size: 12px;
            line-height: 26px;
            .circle {
              display: inline-block;
              width: 24px;
              height: 24px;
              border-radius: 12px;
              line-height: 24px;
              text-align: center;
              background: #9ea7b4;
              color: white;
              vertical-align: middle;
              margin-right: 6px;
            }
            .name {
              color: #4a6af5;
            }
            .text {
              word-break: break-all;
              a {
                text-decoration: underline;
              }
            }
          }
        }
        .chat-input {
          display: flex;
          height: 198px;
          padding: 14px 24px;
          color: #464c5b;
          font-size: 12px;
          .title {
            margin-top: 7px;
            margin-right: 14px;
          }
          .input-msg {
            margin-bottom: 14px;
            /deep/textarea {
              width: 380px;
              height: 80px;
              resize: none;
            }
            &.with-link {
              /deep/textarea {
                text-decoration: underline;
              }
            }
          }
          /deep/.ivu-input-suffix {
            width: 42px;
            line-height: 32px;
          }
          .linkcontainer {
            display: flex;
            margin-bottom: 10px;
            .name {
              white-space: nowrap;
              line-height: 32px;
            }
            /deep/.link-btn {
              width: 100%;
            }
          }
          .btncontainer {
            display: flex;
            align-items: center;
            justify-content: space-between;
            .name {
              margin-left: 15px;
              margin-right: 10px;
            }
            .link-btn {
              flex-grow: 1;
            }
          }
        }
      }
      /deep/.live-setting-products-icon {
        position: absolute;
        top: -9px;
        height: 24px;
        left: -5px;
        overflow: hidden;
        z-index: 1;
        &::before {
          content: "";
          position: absolute;
          top: 0px;
          left: -19px;
          display: block;
          border-width: 12px;
          border-style: solid;
          border-color: #f8a9ba #f8a9ba transparent transparent;
        }
        &::after {
          content: "拼团";
          position: relative;
          display: block;
          width: 38px;
          height: 19px;
          line-height: 20px;
          font-size: 12px;
          text-align: center;
          border-radius: 0 19px 19px 0;
          color: #fff;
          background: linear-gradient(#fd6b8a, #ff645a);
        }
      }
    }
  }
}
.loading-dialog {
  /deep/.ivu-modal-content {
    color: #4a6af5;
    width: 341px;
    height: 157px;
    text-align: center;
    .ivu-modal-body {
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      .ivu-icon {
        animation: ani-demo-spin 1s linear infinite;
      }
    }
  }
}
@keyframes ani-demo-spin {
  0% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  50% {
    -webkit-transform: rotate(180deg);
    transform: rotate(180deg);
  }
  to {
    -webkit-transform: rotate(1turn);
    transform: rotate(1turn);
  }
}
/deep/.ivu-modal-body {
  padding: 16px;
  .title {
    color: #464c5b;
    font-size: 16px;
    font-weight: bold;
    height: 42px;
    line-height: 42px;
    margin-bottom: 10px;
    .ivu-icon {
      font-size: 28px;
      color: rgb(237, 64, 20);
      margin-right: 10px;
    }
  }
  .ivu-form {
    padding-left: 33px;
    textarea {
      height: 100%;
      resize: none;
    }
  }
  .footer {
    margin-top: 16px;
    text-align: right;
    .ivu-btn-primary {
      margin-left: 10px;
    }
  }
}
.spvideo {
  position: relative;
  /deep/.ivu-spin {
    width: 100%;
    height: 100%;
    /deep/.ivu-spin-main {
      width: 100%;
      background: white;
    }
    .demo-spin-icon-load {
      animation: ani-demo-spin 1s linear infinite;
    }
    @keyframes ani-demo-spin {
      from {
        transform: rotate(0deg);
      }
      50% {
        transform: rotate(180deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
    .demo-spin-col {
      height: 100px;
      position: relative;
      border: 1px solid #eee;
    }
  }
}
</style>
