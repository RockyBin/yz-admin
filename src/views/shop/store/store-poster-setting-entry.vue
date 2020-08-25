<template>
  <div class="store-poster-entry" v-if="settingData">
    <div class="store-poster-entry-nav">
      <template v-for="(item, index) in pageData">
        <div
          v-if="((!item.perm || hasLicensePerm(item.perm)) && settingData[item.key])"
          :key="index"
          :class="{'active': tabSelectIndex === index}"
          @click="onChangeNavClick(index)"
        >
          {{pageData[index].name}}
          <i class="iconfont icon-md-checkmark-circle"></i>
        </div>
      </template>
    </div>
    <div class="store-poster-entry-location">
      <span v-if="tabSelectIndex!=5">海报位置：{{pageData[tabSelectIndex].name}} > 二维码</span>
      <span v-else>海报位置：员工端 > 邀请客户</span>
      <more-message :text="pageData[tabSelectIndex].tip" :max-width="246"></more-message>
      <span @click="demoModalShow = true">查看示例图</span>
    </div>
    <div class="store-poster-entry-content">
      <div class="store-poster-entry-content-title">{{pageData[tabSelectIndex].type}}海报：</div>
      <Button
        type="primary"
        @click="posterModalShow = true"
        v-if="!posterSelectInfo[pageData[tabSelectIndex].key]"
      >选择海报</Button>
      <div v-else class="store-poster-entry-content-select">
        <img
          :src="posterSelectInfo[pageData[tabSelectIndex].key].preview_image ? http.defaults.baseURL + '/' + posterSelectInfo[pageData[tabSelectIndex].key].preview_image : defaultImage"
          alt
        />
        <Button type="primary" perm="poster.config.operate" @click="posterModalShow = true">重新选择</Button>
      </div>
    </div>
    <demo-modal v-model="demoModalShow" :indexSelect="tabSelectIndex"></demo-modal>
    <poster-modal v-model="posterModalShow" :currentItem="selectItem" @onOk="onModalSelectChange"></poster-modal>
    <foot-button>
      <Button type="primary" perm="poster.config.operate" style="width: 70px;padding-left: 0;padding-right: 0;height: 32px;" :loading="saveLoading" @click="onSaveClick">保存</Button>
    </foot-button>
  </div>
</template>
<script>
import moreMessage from "@/views/shop/components/more-message/more-message.vue";
import demoModal from "./components/poster-demo-modal";
import posterModal from "./components/poster-choose-modal";
import footButton from "@/views/shop/components/button/foot-button.vue";
const pageData = [
  {
    name: "会员中心",
    key: "memberSetting",
    tip: "以推广商城发展下线为目的，海报展示在【会员中心】页面的顶部位置",
    type: "会员",
    typeValue: 0
  },
  {
    name: "分销中心",
    key: "distributionSetting",
    perm: "ENABLE_DISTRIBUTION",
    tip: "以推广商城发展下线为目的，海报展示在【分销中心】页面的顶部位置",
    type: "分销",
    typeValue: 1
  },
  {
    name: "代理中心",
    key: "agentSetting",
    perm: "ENABLE_AGENT",
    tip: "以推广商城发展下线为目的，海报展示在【代理中心】页面的顶部位置",
    type: "代理",
    typeValue: 2
  },
  {
    name: "区域代理",
    key: "areaAgentSetting",
    perm: "ENABLE_AREA_AGENT",
    tip: "以推广商城发展区域代理为目的，海报展示在【区域代理中心】页面的顶部位置",
    type: "区域代理",
    typeValue: 5
  },
  {
    name: "经销商中心",
    key: "dealerSetting",
    perm: "ENABLE_CLOUDSTOCK",
    tip: "以经销商云仓管理为目的，海报展示在【经销商中心】页面的顶部位置",
    type: "经销商",
    typeValue: 3
  },
  {
    name: "员工海报",
    key: "staffSetting",
    tip: "以员工发展客户为目的，海报展示在员工端【邀请客户】页面",
    type: "员工",
    typeValue: 4
  }
];
export default {
  components: {
    moreMessage,
    demoModal,
    posterModal,
    footButton
  },
  data() {
    return {
      pageData,
      tabSelectIndex: 0,
      defaultImage: require("./images/poster_default.png"),
      demoModalShow: false,
      posterModalShow: false,
      saveLoading: false,
      posterSelectInfo: {},
      settingData: null
    };
  },
  created() {
    this.getSettingData();
  },
  computed: {
    selectItem() {
      return this.posterSelectInfo[pageData[this.tabSelectIndex].key];
    }
  },
  methods: {
    onChangeNavClick(index) {
      this.tabSelectIndex = index;
    },
    /**
     * 选择海报
     */
    onModalSelectChange(val) {
      this.$set(this.posterSelectInfo, this.pageData[this.tabSelectIndex].key, val);
    },
    getSettingData() {
      this.$store.state.COMMON_loading = true;
      this.$httpGet("/shop/admin/sharepaper/mobi/paper/config", null, res => {
        this.$store.state.COMMON_loading = false;
        if (res.code === 200) {
          this.settingData = res.data.config;
          this.posterSelectInfo = res.data.info;
        } else {
          this.$Message.error(res.msg);
        }
      });
    },
    /**
     * 保存设置
     */
    onSaveClick() {
      this.saveLoading = true;
      this.$httpPost(
        "shop/admin/sharepaper/mobi/paper/save/paper/show",
        {
          data: Object.keys(this.posterSelectInfo)
            .filter(item => this.posterSelectInfo[item])
            .map(item => {
              var v = this.pageData.find(value => {
                return value.key == item;
              });
              return {
                type: v.typeValue,
                id: this.posterSelectInfo[item].id
              };
            })
        },
        res => {
          if (res.code === 200) {
            this.saveLoading = false;
            this.$Message.success("保存成功");
          } else {
            this.$Message.error(res.msg);
          }
        }
      );
    }
  }
};
</script>
<style lang="less" scoped>
.store-poster-entry {
  padding: 20px 24px;
  .store-poster-entry-nav {
    display: flex;
    & > div {
      position: relative;
      width: 172px;
      height: 56px;
      line-height: 56px;
      margin-right: 12px;
      text-align: center;
      border: 1px solid #dcdee2;
      border-radius: 3px;
      font-weight: bold;
      font-size: 14px;
      cursor: pointer;
      &.active {
        border-color: #4a6af5;
        color: #4a6af5;
        i {
          display: initial;
        }
      }
      i {
        display: none;
        position: absolute;
        bottom: -7px;
        right: -7px;
        background: #fff;
        line-height: 14px;
        width: 16px;
        font-size: 18px;
        font-weight: initial;
        color: #4a6af5;
        &::before {
          margin-left: -2px;
        }
      }
    }
  }
  .store-poster-entry-location {
    height: 32px;
    line-height: 32px;
    margin-top: 20px;
    span {
      &:last-child {
        color: #4a6af5;
        font-weight: bold;
        margin-left: 16px;
        cursor: pointer;
      }
    }
    /deep/.more-message {
      line-height: 28px;
      margin-left: 6px;
    }
  }
  .store-poster-entry-content {
    margin-top: 20px;
    justify-content: space-between;
    .store-poster-entry-content-title {
      display: inline-block;
      height: 34px;
      line-height: 34px;
      vertical-align: top;
      margin-right: 14px;
    }
    .store-poster-entry-content-select {
      display: inline-block;
      position: relative;
      width: 190px;
      height: 285px;
      box-shadow: 0px 3px 6px 0px rgba(74, 106, 245, 0.2);
      img {
        width: 100%;
        height: 100%;
        border-radius: 4px;
      }
      button {
        display: none;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        border: none;
        height: 34px;
        color: #fff;
        background-color: rgba(112, 112, 112, 0.8);
        &:focus {
          box-shadow: 0 0 0 2px rgba(112, 112, 112, 0.2);
        }
      }
      &:hover {
        button {
          display: block;
        }
      }
    }
  }
}
</style>
