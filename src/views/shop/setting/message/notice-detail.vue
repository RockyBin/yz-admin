<template>
  <div class="flex-wrapper">
    <third-menu :list="thirdMenu"/>
    <div class="main-content">
      <div class="main-board">
        <verticalLineTitlebar class="title" title="发送设置"/>
        <div v-if="currentNotice.type!=3" class="send-time flex">
          <div class="label">发送时间点：</div>
          <div class="content" v-html="currentNotice.time"></div>
        </div>
        <p v-if="currentNotice.type==3" class="send-time">发送时间点：买家下单 <InputNumber v-model="nopay_notice_minute" style="width:50px;"></InputNumber> 分钟未付款</p>
        <verticalLineTitlebar class="title" title="发送方式"/>
        <div class="template-wrapper">
          <div class="template template-sms">
            <h3>短信通知模板
              <iSwitch 
                v-model="currentStatus.sms.status"
                :true-value="1" 
                :false-value="0"
                style="float:right;"
              >
                <span slot="open">开</span>
                <span slot="close">关</span>
              </iSwitch>
            </h3>
            <p class="time">3月8日星期五</p>
            <div class="message">
              <img class="avatar" src="images/default_head.png"/>
              <div class="text">{{currentNotice.sms}}</div>
            </div>
            <img class="footer-mobile" src="images/dibu.png">
          </div>
          <div v-if="$route.query.tab!=1&&currentStatus.wx" class="template template-wx">
            <h3>公众号消息模板
              <iSwitch 
                v-model="currentStatus.wx.status" 
                :true-value="1" 
                :false-value="0"
                style="float:right;vertical-align:middle;"
              >
                <span slot="open">开</span>
                <span slot="close">关</span>
              </iSwitch>
            </h3>
            <p class="time">3月8日14:15</p>
            <div style="padding:0 14px;">
              <div class="info">
                <div style="font-size:14px;">{{currentNotice.wx.head}}</div>
                <div style="margin-top:10px;margin-bottom:16px;">3月8日</div>
                <div v-html="currentNotice.wx.body"></div>
                <div class="bottom">详情</div>
              </div>
            </div>
            <img class="footer-mobile" src="images/dibu2.png">
          </div>
        </div>
      </div>
      <foot-button  @onSaveClick="saveSetting"></foot-button>
      <!--<div class="footer">-->
        <!--<Button class="save-btn" type="primary" shape="circle" @click="saveSetting" perm="notice.config.operate">保存</Button>-->
      <!--</div>-->
    </div>
  </div>
</template>
<script>
import axios from "axios";
import { Switch } from "iview";
import footButton from "COMPONENTS/button/foot-button.vue";
import thirdMenu from "@/views/shop/menu/third-menu.vue";
import thirdMenuData from "../components/third-menu-for-setting-message";
import verticalLineTitlebar from "COMPONENTS/titlebar/vertical-line-titlebar";
export default {
  components: {
    iSwitch: Switch,
    thirdMenu,
    verticalLineTitlebar,
    footButton
  },
  data() {
    return {
      nopay_notice_minute: 0,
      allNoticeType: [],
      currentNotice: {},
      currentStatus: {
        sms: {},
        wx: {}
      },
      thirdMenu:[]
    };
  },
  created() {
    this.thirdMenu = thirdMenuData.getThirdMenu();
    var buyerNoticeType = require("./notice-type.json").buyer;
    var sellerNoticeType = require("./notice-type.json").seller;
    buyerNoticeType.forEach(cate => this.allNoticeType.push(...cate.items));
    sellerNoticeType.forEach(cate => this.allNoticeType.push(...cate.items));
    var notice = this.allNoticeType.find(item => {
      return item.type == this.$route.query.type;
    });
    this.currentNotice = notice || {};
    axios
      .get("/shop/admin/message/config/info", {
        params: {
          type: this.currentNotice.type
        }
      })
      .then(res => {
        if (res.code == 200) {
          this.currentStatus = res.data;
        } else {
          this.$Message.error(res.msg);
        }
      })
      .catch(err => {
        this.$Message.error(err);
      });
    if (this.$route.query.type == 3) {
      axios
        .get("/shop/admin/orderconfig/info")
        .then(res => {
          if (res.code == 200) {
            this.nopay_notice_minute = res.data.nopay_notice_minute;
          } else {
            this.$Message.success(res.msg);
          }
        })
        .catch(err => {
          this.$Message.error(err);
        });
    }
  },
  methods: {
    saveSetting() {
      axios
        .post("/shop/admin/message/config/save", {
          type: this.currentNotice.type,
          wx_status: this.currentStatus.wx && this.currentStatus.wx.status,
          sms_status: this.currentStatus.sms && this.currentStatus.sms.status
        })
        .then(res => {
          if (res.code == 200) {
            if (this.$route.query.type == 3) {
              axios
                .get("/shop/admin/orderconfig/edit", {
                  params: {
                    nopay_notice_minute: this.nopay_notice_minute
                  }
                })
                .then(res => {
                  if (res.code == 200) {
                    this.$Message.success("保存成功");
                  } else {
                    this.$Message.error(res.msg);
                  }
                })
                .catch(err => {
                  this.$Message.error(err);
                });
            }else{
              this.$Message.success("保存成功");
            }
            this.$router.go(-1)
          } else {
            this.$Message.error(res.msg);
          }
        })
        .catch(err => {
          this.$Message.error(err);
        });
    }
  }
};
</script>
<style lang="less" scoped>
.flex-wrapper {
  position: absolute;
  width:100%;
  height: calc(100vh - 70px);
  background: #f2f4fd;
  display: flex;
  .main-content {
    flex:1;
    height: 100%;
    background: white;
    overflow: auto;
  }
}
.main-board {
  height: calc(100vh - 120px);
  padding: 24px;
  overflow:auto;
  .title {
    margin-bottom: 22px;
  }
  .send-time {
    padding: 0 16px;
    margin-bottom: 40px;
    /deep/.ivu-input-number{
      margin:0 10px;
      width:100px !important;
    }
  }
  .flex{
    display:flex;
    .label{

    }
    .content{
      flex:1
    }
  }
  .template-wrapper {
    padding: 0 16px;
    display: flex;
  }
  .template {
    position: relative;
    width: 288px;
    height: 450px;
    background: #f3f3f3;
    border: solid 1px #f8f5f5;
    h3 {
      height: 40px;
      font-size: 14px;
      color: #464c5b;
      padding: 10px 14px;
      background: #fcfcfc;
    }
    .time {
      font-size: 10px;
      color: #464c5b;
      text-align: center;
    }
    .footer-mobile {
      position: absolute;
      bottom: 0;
      left: 0;
    }
  }
  .template-sms {
    margin-right: 34px;
    .time {
      margin-top: 40px;
      margin-bottom: 10px;
    }
    .message {
      display: flex;
      padding: 0 14px;
      .avatar {
        width: 28px;
        height: 28px;
        border-radius: 28px;
        margin-right: 10px;
      }
      .text {
        width: 210px;
        min-height: 72px;
        padding: 10px;
        font-size: 12px;
        border-radius: 10px;
        background: white;
        border: 1px solid #eae6e6;
      }
    }
  }
  .template-wx {
    .time {
      height: 50px;
      line-height: 50px;
    }
    .info {
      padding: 16px 16px 0;
      font-size: 12px;
      color: #464c5b;
      background: #fff;
      border-radius: 5px;
      .bottom {
        color: #4570ea;
        height: 40px;
        line-height: 40px;
        margin-top: 16px;
        border-top: 1px solid #ededed;
      }
    }
  }
}
.footer {
  position:absolute;
  width:100%;
  bottom:0;
  height: 50px;
  line-height: 50px;
  text-align: center;
  background: white;
  border-top: 1px solid #e9e9e9;
  .save-btn {
    width: 110px;
    height: 34px;
    background: #4570ea;
  }
}
</style>