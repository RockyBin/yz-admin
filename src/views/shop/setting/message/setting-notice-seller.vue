<template>
  <div class="flex-wrapper">
    <third-menu :list="thirdMenu" />
    <div class="main-content">
      <div class="main-board">
        <Tabs :value="tabValue" :animated="false" @on-click="switchTab">
          <TabPane :label="cate.title" v-for="(cate, index) in sellerNoticeType" :name="index+''" :key="index">
            <div class="content">
              <Card v-for="(item,subIndex) in cate.items" :key="subIndex"
                @click.native="$router.push({
                  name:'noticeDetailSeller',
                  query:{
                    tab:1,
                    type:item.type,
                    extraTitle:item.title
                  }
                })"
              >
                <span slot="title">{{item.title}}</span>
                <span slot="extra">设置</span>
                <div>
                  <Icon
                    v-if="allStatusData[item.type]&&allStatusData[item.type].sms.status"
                    type="md-checkmark"
                    color="#15BC39"
                    size="18"
                    style="margin-right:6px;margin-top: -2px;font-weight:bold;"
                  />
                  <Icon
                    v-else
                    type="md-close"
                    color="#c7c7c7"
                    size="18"
                    style="margin-right:6px;margin-top: -2px;font-weight:bold;"
                  />短信通知消息
                </div>
                <!-- <div>
                <Icon v-if="allStatusData[item.type]&&allStatusData[item.type].wx.status" type="md-checkmark" color="#15BC39" size="18" style="margin-right:6px;margin-top: -2px;font-weight:bold;"/>
                <Icon v-else type="md-close" color="#c7c7c7" size="18" style="margin-right:6px;margin-top: -2px;font-weight:bold;"/>
                公众号模版消息
                </div>-->
              </Card>
            </div>
          </TabPane>
        </Tabs>
      </div>
    </div>
  </div>
</template>
<script>
import axios from "axios";
import thirdMenu from "@/views/shop/menu/third-menu.vue";
import verticalLineTitlebar from "COMPONENTS/titlebar/vertical-line-titlebar";
import thirdMenuData from "../components/third-menu-for-setting-message";
export default {
  components: {
    thirdMenu,
    verticalLineTitlebar
  },
  data() {
    let noticeType = require("./notice-type.json").seller;
    noticeType = noticeType.filter(item => {
      item.items = item.items.filter(subItem => {
        return subItem['licensePerm'] ? this.hasLicensePerm(subItem['licensePerm']) : true;
      })
      return item.items.length && (item['licensePerm'] ? this.hasLicensePerm(item['licensePerm']) : true);
    })
    return {
      allStatusData: {},
      sellerNoticeType: noticeType,
      thirdMenu: []
    };
  },
  created() {
    this.thirdMenu = thirdMenuData.getThirdMenu();
    axios
      .get("/shop/admin/message/config/list")
      .then(res => {
        if (res.code == 200) {
          this.allStatusData = res.data.list;
        } else {
          this.$Message.error(res.msg);
        }
      })
      .catch(err => {
        this.$Message.error(err);
      });
  },
  computed:{
    tabValue(){
      let max = this.sellerNoticeType.length - 1;
      if(!this.$route.query.tab || Number(this.$route.query.tab) > max){
        return "0"
      }else{
        return this.$route.query.tab
      }
    }
  },
  methods: {
    switchTab(tab) {
      this.$router.replace({
        name: "noticeSeller",
        query: {
          tab
        }
      });
    }
  }
};
</script>
<style lang="less" scoped>
.flex-wrapper {
  position: absolute;
  left: 0px;
  top: 0px;
  width: 100%;
  height: 100%;
  background: #f2f4fd;
  display: flex;
  .main-content {
    width: 100%;
    height: 100%;
  }
}
.main-board {
  background: white;
  /deep/.ivu-tabs-bar {
    padding-left: 24px;
  }
  /deep/.ivu-tabs-tabpane {
    height: calc(100vh - 120px);
    overflow-y: auto;
  }
  .title {
    margin-left: 25px;
    height: 75px;
    line-height: 75px;
  }
  .content {
    display: flex;
    flex-wrap: wrap;
    padding: 24px;
    /deep/.ivu-card {
      width: 260px;
      // height:120px;
      margin-right: 23px;
      margin-bottom: 23px;
      font-size: 14px;
      overflow:hidden;
      cursor:pointer;
      &:hover{
        box-shadow:0px 1px 8px #D6DFFA;
        .ivu-card-head{
          background:#D6DFFA;
        }
        .ivu-card-extra{
          display:block;
        }
      }
      .ivu-card-head {
        height: 40px;
        line-height: 40px;
        padding: 0 16px;
        background: #f1f4fd;
        color: #464C5B;
      }
      .ivu-card-extra {
        display:none;
        top:0;
        span{
          display:inline-block;
          height:40px;
          line-height:40px;
          text-align:center;
          color:#4570EA;
          font-size:12px;
        }
      }
      .ivu-card-body {
        padding:0px 20px;
        font-size: 12px;
        color: #657180;
        line-height:88px;
      }
    }
  }
  /deep/.ivu-tabs-bar {
    margin-bottom: 0;
  }
}
.footer {
  height: 70px;
  line-height: 70px;
  text-align: center;
  border-top: 1px solid #e9e9e9;
  .save-btn {
    width: 80px;
    height: 34px;
    background: #4570ea;
  }
}
</style>