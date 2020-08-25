<template>
  <div class="product-detail-graphic">
    <Form ref="formValidateGraphic" :model="value" :label-width="75">
      <FormItem label="详情描述：" prop="productDetailText">
        <div class="product-detail-item">
          <div class="product-detail-editor">
            <div class="product-detail-editor-tab primary-color-border" v-show="false">
              <div>手机端</div>
            </div>
            <ue-editor
              ref="detailEditor"
              :value="value.productDetailText"
              :setting="{autoHeightEnabled: false,initialFrameHeight:'100%'}"
              elmClass=".product-detail-tabpane-graphic"
            ></ue-editor>
          </div>
        </div>
      </FormItem>
    </Form>
  </div>
</template>
<script>
import ueEditor from "@/views/shop/components/editor/editor.vue";
export default {
  props: {
    value: {
      default() {
        return {
          productDetailText: ""
        };
      },
      type: Object
    },
    disableChange: {
      default: false,
      type: Boolean
    }
  },
  data() {
    return {
      editorSetting: this.value.editorSetting
    };
  },
  watch: {
    disableChange(val) {
      if (val) {
        let ue = this.$refs["detailEditor"].ue;
        ue.ready(function() {
          //不可编辑
          ue.setDisabled();
        });
      }
    }
  },
  components: {
    ueEditor
  }
};
</script>
<style lang="less" scoped>
.product-detail-graphic {
  height: 100%;
  overflow: hidden;
  padding-bottom: 24px;
  /deep/.ivu-input-wrapper textarea.ivu-input {
    width: 350px;
    height: 80px;
  }
  form {
    height: 100%;
    /deep/.ivu-form-item {
      height: 100%;
      box-sizing: border-box;
      margin: 0;
      // padding: 30px 0;
      &:first-child{
        margin-top: 0px !important;
      }
      .ivu-form-item-content {
        height: 100%;
        .product-detail-item {
          height: 100%;
          line-height: 0;
          .product-detail-editor {
            height: 100%;
          }
        }
      }
    }
  }
  .product-detail-editor {
    display: inline-block;
    width: calc(100% - 86px);
    line-height: normal;
    .product-detail-editor-tab {
      margin-top: -8px;
      margin-left: 5px;
      font-size: 14px;
      height: 50px;
      line-height: 50px;
      width: 90px;
      box-sizing: border-box;
      text-align: center;
      border-bottom: 2px solid;
    }
  }
}
</style>
