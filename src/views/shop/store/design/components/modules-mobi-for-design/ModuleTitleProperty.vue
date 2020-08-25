<template>
  <div class="property-container" v-if="module.module_type == 'ModuleTitle'">
    <h3>
      <span>标题栏设置</span>
    </h3>
    <Form class="property-form" :label-width="80">
      <FormItem label="选择类型">
        <RadioGroup v-model="module.type">
          <Radio :label="1">普通</Radio>
          <Radio :label="2">带链接</Radio>
        </RadioGroup>
        <div class="type-container">
          <triangle
            class="arrow"
            :style="{left:module.type==1?'20px':'80px'}"
            :width="16"
            :height="8"
            :border-width="1"
          />
          <div
            v-show="module.type==1"
            :class="{'type-item':true,'active':module.layout==1}"
            @click="module.layout=1"
          >
            <div class="item item1">标题名称</div>
            <p class="title">样式1</p>
          </div>
          <div
            v-show="module.type==1"
            :class="{'type-item':true,'active':module.layout==2}"
            @click="module.layout=2"
          >
            <div class="item item2">标题名称</div>
            <p class="title">样式2</p>
          </div>
          <div
            v-show="module.type==1"
            :class="{'type-item':true,'active':module.layout==3}"
            @click="module.layout=3"
          >
            <div class="item item3">
              <span class="relative">标题名称</span>
            </div>
            <p class="title">样式3</p>
          </div>
          <div
            v-show="module.type==2"
            :class="{'type-item':true,'active':module.layout==4}"
            @click="module.layout=4"
          >
            <div class="item item4">
              标题名称
              <span class="right">查看更多</span>
            </div>
            <p class="title">样式1</p>
          </div>
          <div
            v-show="module.type==2"
            :class="{'type-item':true,'active':module.layout==5}"
            @click="module.layout=5"
          >
            <div class="item item5">
              标题名称
              <Icon color="#999" size="16" type="ios-arrow-forward" />
            </div>
            <p class="title">样式2</p>
          </div>
        </div>
      </FormItem>
      <FormItem label="标题名称" class="form-title">
        <Input v-model="module.title" :maxlength="20" placeholder="请输入标题名称" />
        <span class="charcount">{{(module.title?module.title.length:0)+'/20'}}</span>
      </FormItem>
      <FormItem label="上下边距">
        <Slider v-model="module.padding_top_bottom" :min="0" :max="15" :step="1" show-input></Slider>
      </FormItem>
      <FormItem label="标题颜色" class="form-colorselect">
        <ColorPicker v-model="module.color" recommend editable alpha />
        <a class="reset-link" @click="module.color = initialColor;return false;">重置</a>
      </FormItem>
      <FormItem label="背景颜色" class="form-colorselect">
        <ColorPicker v-model="module.background" recommend editable alpha />
        <a class="reset-link" @click="module.background = initialBackground;return false;">重置</a>
      </FormItem>
      <FormItem label="链接地址" class="form-link" v-if="module.type == 2">
        <Tooltip :content="module.link_desc?module.link_desc:'请选择链接'" placement="top-start">
          <LinkButton
            :layout="2"
            :context="module"
            :text="module.link_desc"
            @onSelectLink="onLinkSelected"
          ></LinkButton>
        </Tooltip>
      </FormItem>
    </Form>
  </div>
</template>
<script type="text/ecmascript-6">
import BaseModuleProperty from "./BaseModuleProperty";
import LinkButton from "../link-select-button";
import triangle from "../triangle.vue";
export default {
  extends: BaseModuleProperty,
  components: { LinkButton, triangle },
  props: ["module"],
  data() {
    return {
      initialColor: this.module.color,
      initialBackground: this.module.background
    };
  },
  // watch: {
  //   module() {
  //     (this.initialColor = this.module.color),
  //       (this.initialBackground = this.module.background);
  //   }
  // },
  methods: {
    onLinkSelected(linkInfo) {
      this.module.link_desc = linkInfo.desc;
      this.module.link_type = linkInfo.type;
      this.module.link_data = linkInfo.data;
      this.module.link_url = linkInfo.url;
    }
  }
};
</script>
<style lang="less" scoped>
.selected {
  border: 1px solid red;
}
.form-title {
  position: relative;
  .charcount {
    color: #999;
    display: inline-block;
    position: absolute;
    right: 5px;
    line-height: 33px;
  }
}
.form-link {
  /deep/.ivu-tooltip {
    width: 100%;
  }
}
.type-container {
  position: relative;
  padding: 10px;
  background-color: #f9fbfd;
  border: solid 1px #e5e5e5;
  .arrow {
    position: absolute;
    top: -8px;
  }
  .type-item {
    position: relative;
    height: 102px;
    padding: 15px 6px 0 6px;
    margin-bottom: 8px;
    background: #fff;
    border: 1px solid transparent;
    cursor: pointer;
    &.active {
      border: 1px solid #fc8a2a;
      &:before {
        content: "";
        position: absolute;
        z-index: 10;
        width: 24px;
        height: 26px;
        top: 0;
        right: 0;
        background: url("../../../../../../../public/images/xuanzhong.png")
          no-repeat;
      }
    }
    .item {
      height: 40px;
      line-height: 40px;
      background-color: #ffffff;
      border: solid 1px #e5e5e5;
    }
    .item1 {
      text-align: center;
    }
    .item2 {
      position: relative;
      padding-left: 26px;
      &:before {
        content: "";
        position: absolute;
        left: 16px;
        top: 12px;
        width: 2px;
        height: 14px;
        background: #333;
      }
    }
    .item3 {
      text-align: center;
      .relative {
        position: relative;
        &:before {
          content: "";
          position: absolute;
          left: -23px;
          top: 6px;
          width: 15px;
          height: 2px;
          background: #333;
        }
        &:after {
          content: "";
          position: absolute;
          right: -23px;
          top: 6px;
          width: 15px;
          height: 2px;
          background: #333;
        }
      }
    }
    .item4 {
      padding-left: 17px;
      padding-right: 13px;
      .right {
        float: right;
        color: #999;
      }
    }
    .item5 {
      padding-left: 17px;
      padding-right: 13px;
      .ivu-icon {
        float: right;
        margin-top: 10px;
      }
    }
    .title {
      line-height: 42px;
      text-align: center;
    }
  }
}
</style>
