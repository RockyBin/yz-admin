<template>
  <div class="supplier-container">
    <!-- 头部 -->
    <div class="member-detail-supplier-head">
      <div class="member-detail-supplier-head-left">
        <div
          class="member-detail-supplier-head-image"
          :style="`background-image: url(${getHeadImg(value.headurl)});`"
        ></div>
        <div class="member-detail-supplier-head-info">
          <div>昵称：{{ value.nickname }}</div>
          <div>姓名：{{ value.name || "--" }}</div>
          <div>会员ID：{{ value.id }}</div>
          <div>手机：{{ value.mobile }}</div>
        </div>
      </div>
      <div class="member-detail-supplier-head-right">
        <div class="member-detail-supplier-head-item">
          <titlebar title="供应商平台"></titlebar>
          <div class="member-detail-supplier-head-item-content">
            <div class="member-detail-supplier-head-item-line">
              <i class="iconfont icon-gonghuoshang"></i>
              <span>{{ value.supplier_name }}</span>
            </div>
          </div>
        </div>
        <div class="member-detail-supplier-head-item">
          <titlebar title="供应概况"></titlebar>
          <div class="member-detail-supplier-head-item-content">
            <div class="member-detail-supplier-head-item-line">
              <span>总订单数：</span>
              {{ value.order_count }}笔
            </div>
            <div class="member-detail-supplier-head-item-line">
              <span>总订单金额：</span>
              ￥{{ value.order_money }}
            </div>
          </div>
        </div>
        <div class="member-detail-supplier-head-item">
          <titlebar title="货款回款概况"></titlebar>
          <div class="member-detail-supplier-head-item-content">
            <div class="member-detail-supplier-head-item-line">
              <span>已结算：</span>
              ￥{{ value.settled }}
            </div>
            <div class="member-detail-supplier-head-item-line">
              <span>待结算：</span>
              ￥{{ value.unsettled }}
            </div>
            <div class="member-detail-supplier-head-item-line">
              <span>可提现：</span>
              ￥{{ value.balance }}
            </div>
            <div class="member-detail-supplier-head-item-line">
              <span>已提现：</span>
              ￥{{ value.withdrawn }}
            </div>
            <div class="member-detail-supplier-head-item-line">
              <span>提现中：</span>
              ￥{{ value.withdrawing }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import titlebar from "@/views/shop/components/titlebar/vertical-line-titlebar";
export default {
  components: {
    titlebar
  },
  props: {
    value: {
      type: Object,
      default() {
        return null;
      }
    },
    tabIndex: {
      type: String
    }
  },
  inject: ["yunzhiHome"],
  data() {
    return {
      defaultImg: require("../../images/head-portrait.png")
    };
  },
  methods: {
    resetData() {},
    getHeadImg(url) {
      //处理会员头像
      if (url) {
        if (!/^(http)/i.test(url)) {
          return this.$store.state.siteComdataPath + url;
        }
        return url;
      } else {
        return this.defaultImg;
      }
    }
  }
};
</script>

<style lang="less" scoped>
@border-color: #e9eaf2;
.supplier-container {
  padding: 24px;
  color: #464c5b;
  // 头部样式
  .member-detail-supplier-head {
    display: flex;
    .member-detail-supplier-head-left {
      width: 220px;
      height: 240px;
      box-sizing: border-box;
      text-align: center;
      padding-top: 20px;
      border: 1px solid @border-color;
      border-radius: 5px 0 0 5px;
      background-color: #fcfcfd;
      .member-detail-supplier-head-image {
        width: 63px;
        height: 63px;
        border-radius: 5px;
        margin: 0 auto 12px;
        background-repeat: no-repeat;
        background-size: cover;
        background-position: center;
      }
      .member-detail-supplier-head-info {
        line-height: 22px;
        text-align: left;
        font-size: 13px;
        padding: 0 20px;
        color: #657180;
        & > div {
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }
      }
    }
    .member-detail-supplier-head-right {
      display: flex;
      width: calc(100% - 200px);
      height: 240px;
      .member-detail-supplier-head-item {
        padding-left: 16px;
        border: 1px solid @border-color;
        border-left: none;
        /deep/.vertical-line-titlebar-wrapper {
          font-size: 14px;
          margin-bottom: 15px;
          margin-top: 10px;
        }
        &:nth-child(1) {
          width: 228px;
          i {
            margin-right: 5px;
            vertical-align: middle;
            color: #41b44d;
          }
          span {
            line-height: 16px;
            vertical-align: middle;
            word-break: break-all;
          }
        }
        &:nth-child(2) {
          width: 250px;
        }
        &:nth-child(3) {
         flex: 1;
        }
        &:last-child {
          border-radius: 0 5px 5px 0;
        }
        .member-detail-supplier-head-item-content {
          padding: 0 14px;
          .member-detail-supplier-head-item-line {
            color: #657180;
            line-height: 28px;
            .notice-text {
              margin-top: -2px;
            }
          }
        }
      }
    }
  }
}
</style>
