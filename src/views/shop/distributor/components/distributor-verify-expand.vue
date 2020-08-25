<template>
  <div class="distributor-verify-expand">
    <!-- 头像和ID -->
    <div style="width: 18.4%;">
      <img
        :src="member_info.headurl || require('../../images/head-portrait.png')"
        alt
        style="width: 80px;height: 80px;borderRadius: 5px"
      />
      <div>{{base_info.nickname}}</div>
      <div>{{`手机号：${member_info.mobile || ""}`}}</div>
      <div class="distributor-verify-expand-line-color">ID：{{base_info.member_id}}</div>
    </div>
    <!-- 信息 -->
    <div style="width: 20.1%;">
      <div class="distributor-verify-expand-head">会员信息：</div>
      <div>
        <span class="distributor-verify-expand-line-height">
          <div>{{`会员等级：${base_info.member_level_name || "--"}`}}</div>
          <div>{{`会员状态：${['冻结', '正常'][member_info.status] || ''}`}}</div>
          <div>{{`注册时间：${member_info.created_at || ""}`}}</div>
          <div>{{`终端来源：${terminalArray[member_info.terminal_type] || (Object.keys(member_info).length ? "手工录入" : '')}`}}</div>
          <div>{{`绑定微信：${member_info.bind_weixin || "--"}`}}</div>
          <div>{{`所在城市：${member_info.provname + member_info.cityname + member_info.areaname || ""}`}}</div>
          <div>{{`性别：${member_info.sex === 1 ? "男" : member_info.sex === 2 ? "女" : "保密"}`}}</div>
          <div>{{`年龄：${member_info.age || "--"}`}}</div>
        </span>
      </div>
    </div>
    <!-- 会员信息 -->
    <div style="width: 22.66%;box-sizing:border-box;padding: 0 1.82%;">
      <div class="distributor-verify-expand-head"></div>
      <div>
        <span class="distributor-verify-expand-line-height">
          <div>{{`申请分销商时间：${base_info.created_at || ""}`}}</div>
          <div>{{`审核状态：${['待审核','通过'][base_info.status] || "不通过"}`}}</div>
          <div>{{`分销商等级：${(base_info.status === 1 && base_info.distributor_level_name) || '--'}`}}</div>
          <div>{{`推荐人：${(parent_info && parent_info.nickname) || '总店' }`}}</div>
        </span>
      </div>
    </div>
    <!-- 分割线 -->
    <div style="height: 20px;">
      <div class="distributor-verify-dotted-line"></div>
    </div>
    <!-- 分销情况 -->
    <div style="width: 38.84%;padding: 0 0 0 1.82%;">
      <div class="distributor-verify-expand-head">
        申请分销商的审核情况
        <more-message
          text="申请条件：指会员在申请分销商时，系统记录当时所设置的申请条件。"
          style="margin-right: 7px;margin-left: -2px;line-height: 13px;height: 15px;vertical-align: text-bottom;"
        ></more-message>
      </div>
      <div v-if="condition === 0">
        <div class="distributor-verify-dotted-type">申请条件：无条件</div>
      </div>
      <div v-else-if="condition === 1">
        <div class="distributor-verify-dotted-type">申请条件：提交申请资料</div>
        <div class="distributor-verify-dotted-type">提交资料：</div>
        <div>
          <span
            class="distributor-verify-expand-line-height"
            style="width: 51.7%;box-sizing: border-box;padding-right: 5.52%;"
          >
            <div>{{`类型：${base_info.business_type ? '企业' : '个人'}`}}</div>
            <div v-if="base_info.business_type">{{`公司名称：${base_info.company || ""}`}}</div>
            <div
              v-if="distributorApplyData['business_license'] && base_info.business_type"
            >{{`营业执照号：${base_info.business_license || ""}`}}</div>
            <div
              v-if="distributorApplyData['business_license_file'] && base_info.business_type"
              class="distributor-verify-expand-image"
            >
              <span>{{`上传营业执照：`}}</span>
              <div class="distributor-verify-expand-image-content">
                <img
                  v-if="base_info.business_license_file.replace($store.state.siteComdataPath,'')"
                  @click="onShowLargeImageClick(base_info.business_license_file)"
                  :src="base_info.business_license_file"
                />
                <a
                  v-if="base_info.business_license_file.replace($store.state.siteComdataPath,'')"
                  @click="onShowLargeImageClick(base_info.business_license_file)"
                  href="javascript:;"
                >(点击查看大图)</a>
                <span v-else>---</span>
              </div>
            </div>
            <div v-if="distributorApplyData['idcard_file']" class="distributor-verify-expand-image">
              <span>{{`上传身份证件：`}}</span>
              <div class="distributor-verify-expand-image-content">
                <img
                  v-if="base_info.idcard_file.replace($store.state.siteComdataPath,'')"
                  @click="onShowLargeImageClick(base_info.idcard_file)"
                  :src="base_info.idcard_file"
                />
                <a
                  v-if="base_info.idcard_file.replace($store.state.siteComdataPath,'')"
                  @click="onShowLargeImageClick(base_info.idcard_file)"
                  href="javascript:;"
                >(点击查看大图)</a>
                <span v-else>---</span>
              </div>
            </div>
          </span>
          <span
            class="distributor-verify-expand-line-height distributor-verify-expand-material-top"
            style="width: 48.3%;"
          >
            <div v-if="distributorApplyData['idcard']">{{`身份证号：${base_info.idcard || ""}`}}</div>
            <div v-if="distributorApplyData['applicant']">{{`申请人：${base_info.applicant || ""}`}}</div>
            <div v-if="distributorApplyData['mobile']">{{`手机号码：${base_info.mobile || ""}`}}</div>
            <div v-if="distributorApplyData['sex']">{{`性别：${base_info.sex === 1?'男':'女'}`}}</div>
            <div
              v-if="distributorApplyData['address']"
            >{{`地址信息：${getAddressShow(base_info.prov,base_info.city,base_info.area) || ""}`}}</div>
            <div v-if="distributorApplyData['address']">{{`详细地址：${base_info.address || ""}`}}</div>
            <template v-if="base_info.extend_fields">
              <div
                v-for="(item,index) in base_info.extend_fields"
                :key="index"
              >{{item.name}}：{{item.value}}</div>
            </template>
            <div v-if="distributorApplyData['remark']">{{`备注：${base_info.remark || ""}`}}</div>
          </span>
        </div>
      </div>
      <div v-else-if="condition === 2">
        <div class="distributor-verify-dotted-type">申请条件：累计{{base_info.apply_condition.calc_valid_condition ? '维权期后' : '付款后'}}交易笔数满{{base_info.apply_condition.buy_times}}笔</div>
        <div class="distributor-verify-dotted-type">
          <span style="width: auto;">实际情况：</span>
          <span class="distributor-verify-expand-line-height">
            <div>目前累计付款后交易笔数为{{member_info.buy_times}}笔</div>
            <div>目前累计成交后交易笔数为{{member_info.deal_times}}笔</div>
          </span>
        </div>
      </div>
      <div v-else-if="condition === 3">
        <div class="distributor-verify-dotted-type">申请条件：累计{{base_info.apply_condition.calc_valid_condition ? '维权期后' : '付款后'}}交易金额满¥{{base_info.apply_condition.buy_money}}</div>
        <div class="distributor-verify-dotted-type">
          <span style="width: auto;">实际情况：</span>
          <span class="distributor-verify-expand-line-height">
            <div>目前累计付款后交易金额为￥{{member_info.buy_money}}</div>
            <div>目前累计成交后交易金额为￥{{member_info.deal_money}}</div>
          </span>
        </div>
      </div>
      <div v-else-if="condition === 4" class="distributor-verify-dotted-type">
        <div>申请条件：购买指定商品</div>
        <span class="distributor-verify-expand-line-height">实际情况：已购买</span>
      </div>
    </div>
    <Modal
      v-model="imageModalStatus"
      class="distributor-verify-expand-image-view"
      footer-hide
      fullscreen
    >
      <div slot="header">
        <div>占位</div>
      </div>
      <img :src="imageViewUrl" alt />
    </Modal>
  </div>
</template>
<script>
import cityData from "@/views/shop/components/cityDataThree";
import moreMessage from "@/views/shop/components/more-message/more-message.vue";
let areaData = {
  prov: {},
  city: {},
  area: {}
};
cityData[0].provinceArr.forEach(item => {
  areaData.prov[item.value] = item;
  item.children.forEach(item1 => {
    areaData.city[item1.value] = item1;
    item1.children.forEach(item2 => {
      areaData.area[item2.value] = item2;
    });
  });
});
const distributorApplyData = {
  business_license: false,
  business_license_file: false,
  idcard: false,
  idcard_file: false,
  applicant: false,
  mobile: false,
  sex: false,
  address: false,
  remark: false
};
export default {
  props: {
    id: {
      required: true,
      type: Number
    },
    levelData: {
      required: true,
      type: Array,
      default() {
        return [];
      }
    },
    selectID: {
      required: true,
      type: Number
    }
  },
  components: {
    moreMessage
  },
  data() {
    return {
      terminalArray: {
        1: "PC",
        2: "H5",
        3: "微信公众号",
        4: "微信小程序"
      }, // 终端来源
      base_info: {},
      member_info: {},
      parent_info: {},
      imageModalStatus: false,
      imageViewUrl: "",
      condition: -1,
      distributorApplyData: {}
    };
  },
  mounted() {
    this.getDistributorInfo();
  },
  methods: {
    /**
     * 放大图片
     */
    onShowLargeImageClick(url) {
      this.imageViewUrl = url;
      this.$nextTick(() => {
        this.imageModalStatus = true;
      });
    },
    getAddressShow(...list) {
      if (
        areaData.prov[list[0]] &&
        areaData.city[list[1]] &&
        areaData.area[list[2]]
      ) {
        return [
          areaData.prov[list[0]].label,
          areaData.city[list[1]].label,
          areaData.area[list[2]].label
        ].join(",");
      } else {
        return "";
      }
    },
    /**
     * 获取分销商信息
     */
    getDistributorInfo() {
      this.$httpGet(
        "/shop/admin/distribution/distributor/info",
        {
          id: this.id,
          type: 1
        },
        res => {
          this.condition = Number(
            (res.data.base_info.apply_condition &&
              res.data.base_info.apply_condition.condition) ||
              0
          );
          this.base_info = res.data.base_info || {};
          this.member_info = res.data.member_info || {};
          this.parent_info = res.data.parent_info || {};
          if (this.condition === 1) {
            let applyObject = Object.assign({}, distributorApplyData);
            Object.keys(applyObject).forEach(item => {
              if (
                res.data.base_info.apply_condition.form_setting[item + "_show"]
              ) {
                applyObject[item] = true;
              }
            });
            this.distributorApplyData = applyObject;
          }
        }
      );
    }
  }
};
</script>

<style lang="less" scoped>
.distributor-verify-expand {
  position: relative;
  overflow: hidden;
  margin-top: -10px;
  padding-top: 10px;
  margin-bottom: -10px;
  padding-bottom: 10px;

  & > div {
    float: left;
  }

  .distributor-verify-expand-line-color {
    color: #9ea4b1;
  }

  .distributor-verify-expand-line-height {
    line-height: 23px;
    float: left;
  }

  .distributor-verify-expand-head {
    height: 30px;
    font-size: 13px;
    margin-top: -2px;
    color: #464c5b;
  }

  .distributor-verify-expand-image {
    & > span {
      vertical-align: top;
    }

    .distributor-verify-expand-image-content {
      display: inline-block;
      img {
        width: 70px;
        height: 45px;
        margin-bottom: -8px;
      }

      a {
        display: block;
        vertical-align: text-bottom;
        color: #9ea7b4;
      }
    }
  }
  .distributor-verify-expand-material-top {
    margin-top: -46px;
  }

  .distributor-verify-dotted-line {
    border-left: dashed 1px #d1d1d1;
    width: 1px;
    overflow: hidden;
    position: absolute;
    height: 100%;
    transform: translateY(50%);
    top: -50%;
  }

  .distributor-verify-dotted-type {
    line-height: 23px;
    color: #657180;
    span {
      line-height: 23px;
      vertical-align: top;
      width: calc(100% - 160px);
      display: inline-block;
      float: none;
    }
  }

  button {
    height: 20px;
    padding: 0 5px;
    width: 176px;
    text-align: left;
    line-height: 1;
  }

  .ivu-select.ivu-select-single {
    height: 20px;
    width: 164px;

    /deep/ .ivu-select-selection {
      height: 20px;

      .ivu-select-placeholder,
      .ivu-select-selected-value {
        height: 20px;
        line-height: 20px;
      }
    }
  }
}

.distributor-verify-expand-image-view {
  /deep/.ivu-modal-content {
    background: #000;

    .ivu-modal-header {
      border-color: #000;
      color: #000;
    }

    .ivu-modal-body img {
      max-width: 800px;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    .ivu-modal-close .ivu-icon-ios-close:hover {
      color: #fff;
    }
  }
}
</style>
