<template>
  <div class="container" >
    <div class="page-info" :style="{height:pagePropertyHeight}">
      <div class="title-bar" @click="collapse">
        <div class="hline"></div>
        <div class="text">证书信息</div>
        <Icon type="ios-arrow-down" size="15" :style="{transform:isHide?'rotate(-90deg)':'rotate(0deg)'}"></Icon>
      </div>
      <div class="form">
        <!-- 证书标题 -->
        <div class="form-item title-container">
          <Form
            ref="info"
            :model="info"
            :rules="ruleValidate"
            :label-width="90"
            class="merchant-add"
          >
            <div class="poster-settiing">
              <div class="padding-form">
                <!-- 证书标题 -->
                <FormItem label="证书标题：" prop="name" class="margin-bottom-form">
                  <br />
                  <Input
                    v-model.trim="info.name"
                    class="common-input-text-260"
                    placeholder="请输入标题"
                    :maxlength="10"
                  />
                  <div class="fontcount">{{info.name ? info.name.length : 0}}/10</div>
                </FormItem>
                <FormItem class="custom-item" prop="background">
                  <div class="bg-container">
                    <div class="item-title ivu-form-item-label" style="float:none;">背景图片：</div>
                    <div class="item-data">
                      <fileSelectBtn :url="info.background" @fileSelected="onFilesSelected"></fileSelectBtn>
                      <div class="tip">建议上传尺寸为750*1334像素的jpg、png格式图片</div>
                    </div>
                  </div>
                </FormItem>
              </div>
            </div>
          </Form>
        </div>
      </div>
    </div>
    <ModuleProperty :module="currentEditingModule" />
  </div>
</template>
<script type="text/ecmascript-6">
import fileSelectBtn from "./fileSelectBtn.vue";
import ModuleProperty from "./ModuleProperty";
import moreMessage from "@/views/shop/components/more-message/more-message.vue";

export default {
  components: { ModuleProperty, fileSelectBtn, moreMessage },
  props: ["info", "currentEditingModule"],
  data() {2019/10/9
    return {
      isHide: false,
      ruleValidate: {
        name: [{ required: true, message: "请输入证书标题", trigger: "blur" }],
        background: [
          { required: true, message: "请上传背景图片", trigger: "change" }
        ]
      }
    };
  },
  watch: {
    currentEditingModule(val) {
      if(val) {
        this.isHide = true
      }
    }
  },
  computed: {
    pagePropertyHeight() {
      if(this.currentEditingModule) {
        if(this.isHide) {
          return "44px";
        } else {
          return "318px";
        }
      } else {
        if(this.isHide) {
          return "44px";
        } else {
          return "calc(100% - 2px)";
        }
      }
    }
  },
  methods: {
    myValidator() {
      this.$refs["info"].validate(valid => {
        this.$emit("dataIsOk", valid);
      });
    },
    onFilesSelected(file) {
      this.info.background = file;
    },
    collapse() {
      this.isHide=!this.isHide
      // if(!this.isHide) {
      //   this.$parent.currentEditingModule = null
      // }
    }
  }
};
</script>
<style lang="less" scoped>
@import "./property.less";
.container {
  overflow: auto;
  .page-info {
    overflow: hidden;
    transition: height 0.3s;
    // border: 1px solid red;
    margin-bottom: 2px;
    .title-bar {
      padding-right: 14px;
      .ivu-icon-ios-arrow-down {
        float: right;
        line-height: 44px;
        transform: rotate(0deg);
        transition: transform 0.3s;
      }
    }
  }
}
.form {
  padding: 30px 20px;
  .form-item.title-container {
    margin-bottom: 0 !important;
  }
}
.poster-settiing {
  .padding-form {
    padding: 0;
    /deep/.ivu-input {
      width: 100% !important;
    }

    /deep/.common-input-text-260 {
      width: 100% !important;
    }
    .custom-item {
      /deep/.ivu-form-item-error-tip {
        top: 78px;
        left: 65px;
      }
    }
    textarea {
      height: 46px;
      width: 150px !important;
      padding: 6px;
      border-radius: 5px;
      border-color: #dcdee2;
      color: #464c5b;
      line-height: 18px;
      overflow-y: hidden;
      &::-webkit-input-placeholder {
        color: #ccc;
      }
    }
    .fontcount {
      position: absolute;
      height: 32px;
      display: inline-block;
      right: 10px;
      line-height: 37px;
      font-size: 12px;
      color: #999999;
    }
    .fontcount.special {
      bottom: 7px;
    }
  }
  /deep/.ivu-form-item-label {
    text-align: left;
    padding: 0;
    margin-bottom: 20px;
    color: #999;
  }
  /deep/.ivu-form-item-content {
    margin-left: 0 !important;
    line-height: 1;
    margin-bottom: 30px;
  }
  /deep/.ivu-form-item {
    margin-bottom: 0 !important;
    .more-message {
      height: 14px;
      line-height: 14px;
    }
    &:last-child {
      .ivu-form-item-content {
        margin-bottom: 0px;
      }
    }
  }
}
</style>
