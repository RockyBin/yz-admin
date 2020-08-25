<template>
  <div class="property-container">
    <div class="title-bar">
      <div class="hline"></div>
      <div class="text">二维码模块</div>
    </div>
    <div class="form">
      <p class="info">
        <i class="iconfont icon-ios-information-circ1"></i>可以通过鼠标拖动改变组件大小和位置
      </p>
      <div class="form-item">
        <div class="item-title">上传二维码LOGO：</div>
        <div class="item-data">
          <fileSelectBtn :url="module.logo" @fileSelected="onFilesSelected"></fileSelectBtn>
          <p class="tip">建议尺寸：建议上传比例为1:1的图片</p>

          <!-- <Button type="dashed" :class="{'img-btn': true,'noborder':module.logo}" @click="onShowFilesSelector()">
            <Icon
              v-if="module.logo"
              type="md-close-circle"
              size="20"
              @click.stop="clearLogo(index)"
            />
            <Icon v-if="!module.logo" type="md-add" size="20" color="#dcdedc"/>
            <img v-if="module.logo" :src="module.logo">
          </Button>-->
        </div>
      </div>
      <div class="form-item" style="margin-bottom: 0px">
        <div class="item-title">链接：</div>
        <RadioGroup v-model="module.qrtype" @on-change="checkState">
          <Radio :label="0">
            {{module.showlink ? "自定义":"商城"}}
            <more-message :text="urltips"></more-message>
          </Radio>
          <Radio :label="1">
            公众号
            <more-message text="扫码后直接进入商城绑定的公众号"></more-message>
          </Radio>
        </RadioGroup>
      </div>
      <div v-if="module.showlink && Number(module.qrtype) === 0" class="form-item">
        <LinkButton
          style="flex:1;"
          :context="module.linkinfo"
          :text="module.linkinfo.link_desc"
          @onSelectLink="onLinkSelected"
        ></LinkButton>
      </div>
    </div>
  </div>
</template>
<script type="text/ecmascript-6">
import fileSelectBtn from "./fileSelectBtn.vue";
import moreMessage from "@/views/shop/components/more-message/more-message.vue";
import LinkButton from "@/views/shop/store/design/components/link-select-button";
export default {
  components: { fileSelectBtn, moreMessage, LinkButton },
  props: ["module"],
  data() {
    return {
      isBoundWX: true, //是否绑定了微信公众号,
      urltips: "扫码后直接进入商城页面"
    };
  },
  created() {
    this.$set(this.module, "qrtype", this.module.qrtype ? 1 : 0);
    this.$httpGet("/shop/admin/wx/config/info", {}, res => {
      if (res.code == 200) {
        let config = res.data.config;
        if (config.name && config.id && config.wxid && config.wx_no) {
          this.isBoundWX = true;
        } else {
          this.isBoundWX = false;
        }
      } else {
        this.$Message.error(res.msg);
      }
    });
    if (this.$route.name == "dealerInviterPosterDesign") {
      this.urltips =
        "扫码后，若非经销商则进入经销商申请页，若为经销商则进入经销商中心。";
    }
  },
  methods: {
    onFilesSelected(file) {
      this.module.logo = file;
    },
    onLinkSelected(linkInfo) {
      this.module.linkinfo.link_desc = linkInfo.desc;
      this.module.linkinfo.link_type = linkInfo.type;
      this.module.linkinfo.link_data = linkInfo.data;
      this.module.linkinfo.link_url = linkInfo.url;
    },
    checkState() {
      if (this.module.qrtype == 1 && !this.isBoundWX) {
        this.$nextTick(() => {
          this.module.qrtype = 0;
        });
        this.$Modal.confirm({
          title: "提示",
          okText: "前往设置",
          content:
            "前往【渠道管理>公众号管理】绑定正确的公众号参数，即可使用“公众号”功能。",
          onOk: () => {
            this.$router.push("/channel/weixin/public-management");
          }
        });
      }
    }
  }
};
</script>
<style lang="less" scoped>
/deep/textarea.ivu-input {
  font-size: 13px;
}
.img-btn {
  position: relative;
  width: 44px;
  height: 44px;
  padding: 0;
  margin-right: 10px;
  vertical-align: text-bottom;
  cursor: pointer;
  &.noborder {
    border-width: 0;
  }
  /deep/.ivu-icon-md-close-circle {
    position: absolute;
    top: -10px;
    right: -10px;
    color: rgb(100, 100, 100) !important;
    &:hover {
      color: rgb(130, 130, 130) !important;
    }
  }
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}
.more-message {
  line-height: 18px;
  margin-left: 8px;
}
</style>
