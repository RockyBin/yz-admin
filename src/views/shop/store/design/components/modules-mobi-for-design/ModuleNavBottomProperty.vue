<template>
  <div class="property-container">
    <h3>
      <span>店铺导航</span>
    </h3>
    <div class="body">
      <h4>背景设置</h4>
      <Row>
        <ColorPicker
          class="color-picker-offset"
          v-model="info.background"
          recommend
          editable
          alpha
        />
        <a class="reset" href="javascript:void(0)" @click="info.background=initialBackgroundColor">重置</a>
      </Row>
      <h4>通用设置（导航文本和图标）</h4>
      <div class="fore-color">
        <triangle class="arrow" :width="16" :height="8" :border-width="1"/>
        <Row>
          <span style="margin:0 10px">默认状态：</span>
          <ColorPicker
            v-model="info.normal_color"
            recommend
            editable
            alpha
          />
          <a class="reset" href="javascript:void(0)" @click="info.normal_color=initialNormalColor">重置</a>
        </Row>
        <Row>
          <span style="margin:0 10px">选中状态：</span>
          <ColorPicker
            v-model="info.active_color"
            recommend
            editable
            alpha
          />
          <a class="reset" href="javascript:void(0)" @click="info.active_color=initialActiveColor">重置</a>
        </Row>
      </div>
      <h4>导航内容</h4>
      <draggable v-model="info.items" v-bind="dragOption">
        <NavItemProperty
          v-for="(item,index) in info.items"
          :item="item"
          :key="index"
          :order="index"
          :normalColor="info.normal_color"
          :activeColor="info.active_color"
          @delete="deleteNavItem(index)"
        />
      </draggable>
      <div v-if="info.items&&info.items.length<5" class="nav-item-add">
        <Button type="primary" class="btn-add" @click="addNavItem">添加导航</Button>
        <span>最多可添加5个，可拖拽排序</span>
      </div>
    </div>
  </div>
</template>
<script>
import NavItemProperty from "./NavItemProperty";
import draggable from "vuedraggable";
import triangle from '../triangle.vue'
export default {
  components: {
    NavItemProperty,
    draggable,
    triangle
  },
  props: ["info"],
  data() {
    return {
      initialBackgroundColor: this.info.background,
      initialNormalColor: this.info.normal_color,
      initialActiveColor: this.info.active_color,
      dragOption: {
        emptyInsertThreshold: 10,
        direction: "vertical",
        forceFallback: true,
        fallbackClass: "drag-class",
        fallbackOnBody: false,
        animation: 150,
        cursor: "move",
        handle:'.drag-handle',
        filter:'.delete-item'
      }
    };
  },
  watch: {
    info() {
      this.initialBackgroundColor = this.info.background;
      this.initialNormalColor = this.info.normal_color;
      this.initialActiveColor = this.info.active_color;
    }
  },
  methods: {
    addNavItem() {
      if (this.info.items.length == 5) {
        this.$Message.info("最多可添加5个");
        return;
      }
      var item = {
        id: ++this.nextId,
        icon_type: 0,
        icon: "",
        image: "",
        image_active: "",
        name: "",
        link_type: "external",
        link_data: "",
        link_url: "",
        link_desc: ""
      };
      this.info.items.push(item);
    },
    deleteNavItem(index) {
      if (this.info.items.length == 1) {
        this.$Message.info("最少1个导航按钮");
        return;
      }
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
    height:44px;
    line-height:44px;
    padding-left:17px;
    background:rgba(249,251,253,1);
    border-bottom:1px solid rgba(229,229,229,1);
    span{
      &:before{
        content:"";
        display:inline-block;
        vertical-align:-4px;
        width:4px;
        height:18px;
        border-radius:2px;
        background:rgba(69,112,234,1);
        margin-right:10px;
      }
    }
  }
  & > .body {
    padding: 18px;
    height: calc(100% - 44px);
    overflow: auto;
    h4 {
      font-weight: normal;
      color: rgba(153, 153, 153, 1);
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
      margin: 10px 0;
    }
    /deep/.ivu-color-picker {
      margin-right: 10px;
    }
    .fore-color {
      position:relative;
      border: 1px solid rgba(229, 229, 229, 1);
      border-radius: 5px;
      background: rgba(249, 251, 253, 1);
      .arrow{
        position:absolute;
        top:-8px;
        left:15px;
      }
    }
    .nav-item-add {
      border: 1px solid rgba(229, 229, 229, 1);
      border-radius: 5px;
      padding: 10px 20px;
      .btn-add {
        margin-right: 10px;
      }
    }
    .reset{
      color:rgba(69,112,234,1);
    }
  }
}
</style>
