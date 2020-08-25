<template>
  <div class="property-container">
    <h3>
      <span>广告轮播设置</span>
    </h3>
    <div class="body">
      <h4>广告位轮播时长</h4>
      <Row>
        <Slider
          v-model="info.interval"
          :min="0"
          :max="20"
          :step="1"
          show-tip="never"
          show-input
        ></Slider>
      </Row>
      <h4>弹窗展示样式</h4>
      <Row>
        <RadioGroup v-model="info.size_type">
          <Radio :label="1">半屏</Radio>
          <Radio :label="2">全屏</Radio>
        </RadioGroup>
      </Row>
      <h4>弹窗出现方式</h4>
      <Row>
        <RadioGroup class="radio-multi-line" v-model="info.show_type" @on-change="resetError('error1')">
          <Radio :label="1">每次启动平台时，主页只出现一次</Radio>
          <Radio :label="2">每次打开主页时，都出现</Radio>
          <Radio :label="3" :class="{'ivu-form-item-error': errorShow.error1}"
            >每隔<InputNumber
              :min="1"
              :max="100"
              v-model="info.show_interval"
              @on-change="resetError('error1')"
            />分钟，主页出现一次</Radio
          >
        </RadioGroup>
      </Row>
      <h4>弹窗关闭方式</h4>
      <Row>
        <RadioGroup class="radio-multi-line" v-model="info.autoclose" @on-change="resetError('error2')">
          <Radio :label="0">只能手动关闭</Radio>
          <Radio :label="1" :class="{'ivu-form-item-error': errorShow.error2}"
            >出现弹窗<InputNumber
              :min="1"
              :max="9999"
              v-model="info.autoclose_second"
              @on-change="resetError('error2')"
            />秒后，自动关闭</Radio
          >
        </RadioGroup>
      </Row>
      <h4>广告位设置</h4>
      <draggable v-model="info.items" v-bind="dragOption">
        <PopupItemProperty
          v-for="(item, index) in info.items"
          :item="item"
          :key="index"
          :order="index"
          @delete="deletePopupItem(index)"
        />
      </draggable>
      <div v-if="info.items && info.items.length < 10" class="popup-item-add">
        <Button type="primary" class="btn-add" @click="addPopupItem"
          >添加广告位</Button
        >
        <span>最多可添加10个，可拖拽排序</span>
      </div>
    </div>
  </div>
</template>
<script>
import PopupItemProperty from "./PopupItemProperty";
import draggable from "vuedraggable";
export default {
  components: {
    PopupItemProperty,
    draggable
  },
  props: ["info", "errorShow"],
  data() {
    return {
      dragOption: {
        emptyInsertThreshold: 10,
        direction: "vertical",
        forceFallback: true,
        fallbackClass: "drag-class",
        fallbackOnBody: false,
        animation: 150,
        cursor: "move",
        handle: ".drag-handle",
        filter: ".delete-item"
      }
    };
  },
  methods: {
    resetError(key) {
      this.$set(this.errorShow, key, false);
    },
    addPopupItem() {
      if (this.info.items.length == 10) {
        this.$Message.info("最多可添加10个");
        return;
      }
      var item = {
        id: ++this.nextId,
        type: 0, //0=图片，1=视频
        src: "",
        poster: "", //视频的封面
        link_type: "external",
        link_data: "",
        link_url: "",
        link_desc: ""
      };
      this.info.items.push(item);
    },
    deletePopupItem(index) {
      this.info.items.splice(index, 1);
    }
  }
};
</script>
<style lang="less" scoped>
.property-container {
  position: relative;
  height: 100%;
  & > h3 {
    height: 44px;
    line-height: 44px;
    padding-left: 17px;
    background: rgba(249, 251, 253, 1);
    border-bottom: 1px solid rgba(229, 229, 229, 1);
    span {
      &:before {
        content: "";
        display: inline-block;
        vertical-align: -4px;
        width: 4px;
        height: 18px;
        border-radius: 2px;
        background: rgba(69, 112, 234, 1);
        margin-right: 10px;
      }
    }
  }
  & > .body {
    padding: 20px;
    height: calc(100% - 44px);
    overflow: auto;
    h4 {
      font-weight: normal;
      line-height: 17px;
      color: rgba(153, 153, 153, 1);
      &:first-child {
        margin-bottom: 18px;
      }
      &:not(:first-child) {
        margin-top: 20px;
        margin-bottom: 10px;
      }
    }
    .color-picker-offset/deep/.ivu-select-dropdown {
      left: 0 !important;
    }
    /deep/.ivu-select-dropdown .ivu-color-picker-confirm-color {
      width: 148px !important;
    }
    .btn-text {
      color: #4d77eb;
      cursor: pointer;
    }
    /deep/.ivu-row {
      .ivu-input-number {
        width: 60px;
        height: 32px;
        line-height: 32px;
        margin-left: 10px;
        margin-right: 7px;
      }
      .ivu-slider {
        &::after {
          position: absolute;
          left: 237px;
          top: 7px;
          content: "秒";
          color: #333;
          font-size: 13px;
        }
        .ivu-input-number {
          float: left;
          margin-left: 170px;
        }
        .ivu-slider-wrap {
          width: 160px;
          margin-top: 14px;
          margin-bottom: 14px;
        }
      }

      .ivu-radio-group {
        font-size: 0;
        .ivu-radio-wrapper {
          line-height: 32px;
          height: 32px;
          margin-right: 20px;
        }
      }
    }
    /deep/.popup-item-block {
      margin-bottom: 16px;
    }
    /deep/.ivu-color-picker {
      margin-right: 10px;
    }
    .fore-color {
      position: relative;
      border: 1px solid rgba(229, 229, 229, 1);
      border-radius: 5px;
      background: rgba(249, 251, 253, 1);
      .arrow {
        position: absolute;
        top: -8px;
        left: 15px;
      }
    }
    .popup-item-add {
      border: 1px solid rgba(229, 229, 229, 1);
      border-radius: 5px;
      padding: 13px 12px 15px;
      font-size: 12px;
      color: #999;
      .btn-add {
        margin-right: 12px;
        margin-bottom: 0;
      }
    }
    .reset {
      color: rgba(69, 112, 234, 1);
    }
  }
  .radio-multi-line {
    /deep/.ivu-radio-wrapper {
      display: block;
    }
  }
}
</style>
