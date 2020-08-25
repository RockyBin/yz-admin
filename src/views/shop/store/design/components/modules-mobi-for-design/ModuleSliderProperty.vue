<template>
  <div class="property-container" v-if="module.module_type == 'ModuleSlider'">
    <h3>
      <span>图片轮播设置</span>
    </h3>
    <Form class="property-form" :label-width="80">
      <FormItem label="选择样式" class="form-styleselect">
        <triangle class="arrow" :width="16" :height="8" :border-width="1" />
        <div
          @click="module.layout = item.layout"
          :class="['layout-item',module.layout == item.layout ? 'active':'']"
          v-for="(item,index) in layouts"
          :key="index"
        >
          <div class="img">
            <img :src="item.image" />
          </div>
          <div class="text">{{item.name}}</div>
        </div>
      </FormItem>
      <FormItem label="上下边距" class="form-slider">
        <Slider v-model="module.padding_top_bottom" :min="0" :max="15" :step="1" show-input></Slider>
      </FormItem>
      <FormItem label="页面边距" class="form-slider">
        <Slider v-model="module.padding_left_right" :min="0" :max="15" :step="1" show-input></Slider>
      </FormItem>
      <FormItem label="轮播时间" class="form-slider">
        <Slider class="auto-play" v-model="module.auto_play" :min="2" :max="6" :step="1" show-input></Slider>
      </FormItem>
      <FormItem label="图片样式" class="form-radio">
        <RadioGroup v-model="module.image_style">
          <Radio :label="1">常规</Radio>
          <Radio :label="2">卡片投影</Radio>
        </RadioGroup>
      </FormItem>
      <FormItem label="图片边框" class="form-radio">
        <RadioGroup v-model="module.border_style">
          <Radio :label="1">直角</Radio>
          <Radio :label="2">圆角</Radio>
        </RadioGroup>
      </FormItem>
      <draggable v-model="module.items" :options="options">
        <div v-for="(item, index) in module.items" :key="index">
          <div class="item">
            <div class="item-head">
              <div class="title">图片{{index+1}}</div>
              <div class="delbtn">
                <a class="delete" v-if="index > 0" type="primary" @click="deleteItem(index)">删除</a>
              </div>
            </div>
            <div class="item-body">
              <div class="item-text">
                <div class="title">图片：</div>
                <div class="data">
                  <div
                    class="img"
                    :class="{'img-exist': item.image}"
                    style="cursor:pointer"
                    @click="onShowFilesSelector(item)"
                  >
                    <Icon
                      v-if="item.image"
                      type="md-close-circle"
                      size="16"
                      @click.stop="item.image=''"
                    />
                    <Icon v-if="!item.image" type="md-add" class="plus" />
                    <img v-if="item.image" :src="item.image" />
                  </div>
                  <div class="tips">建议尺寸：750px宽度 高度保持一致</div>
                </div>
              </div>
              <div class="item-link">
                <div class="title">链接：</div>
                <div class="data">
                  <Tooltip :content="item.link_desc?item.link_desc:'请选择链接'" placement="top-start">
                    <LinkButton
                      :context="item"
                      :text="item.link_desc"
                      @onSelectLink="onLinkSelected"
                    ></LinkButton>
                  </Tooltip>
                </div>
              </div>
            </div>
          </div>
        </div>
      </draggable>
      <div v-if="module.items.length < 10" class="div-add">
        <div class="button">
          <Button type="primary" @click="addItem()">添加图片</Button>
        </div>
        <div class="text">最多可添加10张，可拖拽排序</div>
      </div>
    </Form>
    <FilesSelector v-model="showFilesSelector" @onSelected="onFilesSelected"></FilesSelector>
  </div>
</template>
<script type="text/ecmascript-6">
import triangle from "../triangle";
import draggable from "vuedraggable";
import BaseModuleProperty from "./BaseModuleProperty";
import LinkButton from "../link-select-button";
import FilesSelector from "@/components/files/files";
import ModuleSlider from "./ModuleSlider";
export default {
  extends: BaseModuleProperty,
  components: { LinkButton, FilesSelector, draggable, triangle },
  props: ["module"],
  data() {
    return {
      showFilesSelector: false,
      curEditItem: null,
      layouts: [
        { layout: 1, name: "样式一", image: "images/slider/1.png" },
        { layout: 2, name: "样式二", image: "images/slider/2.png" },
        { layout: 3, name: "样式三", image: "images/slider/3.png" }
      ],
      options: {
        emptyInsertThreshold: 5,
        direction: "vertical",
        forceFallback: true,
        fallbackClass: "drag-class",
        fallbackOnBody: false,
        animation: 150,
        cursor: "move",
        handle: ".item-head",
        filter: ".delete"
      }
    };
  },
  methods: {
    onShowFilesSelector(item) {
      this.showFilesSelector = true;
      this.curEditItem = item;
    },
    onLinkSelected(linkInfo, item) {
      item.link_desc = linkInfo.desc;
      item.link_type = linkInfo.type;
      item.link_data = linkInfo.data;
      item.link_url = linkInfo.url;
    },
    onFilesSelected(files) {
      if (files.length > 0) {
        this.curEditItem.image = files[0];
      }
    },
    addItem() {
      this.module.items.push(ModuleSlider.newItem());
    },
    deleteItem(index) {
      this.module.items.splice(index, 1);
    }
  }
};
</script>
<style lang="less" scoped>
.drag-class {
  border: 1px dashed #0066cc;
  opacity: 10.8;
}
.selected {
  border: 1px solid red !important;
}
/deep/.form-styleselect {
  .ivu-form-item-content {
    position: relative;
    background-color: #f9fbfd;
    border: solid 1px #e5e5e5;
    padding: 10px;
    margin-top: 8px;
    .arrow {
      position: absolute;
      top: -8px;
      left: 14px;
    }
  }
}
.layout-item {
  cursor: pointer;
  width: 92px;
  height: 92px;
  display: inline-block;
  margin: 3px;
  position: relative;
  background-color: #fff;
  &.active {
    border: solid 1px #fd8b26;
    &::after {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-image: url(../../../../../../../public/images/xuanzhong.png);
      background-position: top right;
      background-repeat: no-repeat;
      z-index: 99;
    }
    .text {
      color: #fd892c;
    }
  }
  .img {
    position: relative;
    height: 60px;
    img {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }
  .text {
    text-align: center;
    color: #333;
  }
}
.item {
  border: solid 1px #e5e5e5;
  border-radius: 5px;
  margin-top: 15px;
  .item-head {
    display: flex;
    padding: 0 13px;
    background-color: #f9fbfd;
    border-bottom: solid 1px #e5e5e5;
    .title {
      height: 40px;
      line-height: 40px;
      color: #333333;
      flex: 1;
      cursor: move;
    }
    .delbtn {
      position: relative;
      width: 100px;
      height: 40px;
      line-height: 40px;
      > a {
        color: #3f66d3;
        position: absolute;
        right: 10px;
      }
    }
  }
  .item-body {
    padding: 20px;
  }
  .item-text {
    margin-bottom: 20px;
    display: flex;
    .title {
      height: 30px;
      line-height: 30px;
      width: 50px;
      cursor: move;
    }
    .data {
      .img {
        position: relative;
        width: 45px;
        height: 45px;
        border-radius: 2px;
        border: 1px dashed #dcdee2;
        &.img-exist {
          border-style: solid;
        }
        /deep/.ivu-icon-md-close-circle {
          display: none;
          position: absolute;
          z-index: 999;
          top: -8px;
          right: -8px;
          color: rgb(100, 100, 100) !important;
          &:hover {
            color: rgb(130, 130, 130) !important;
          }
        }
        &:hover {
          /deep/.ivu-icon-md-close-circle {
            display: inline-block;
          }
        }
      }
      .img .plus {
        color: #c0c2c9;
        font-size: 20px;
        position: relative;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
      .img img {
        position: relative;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        max-width: 100%;
        max-height: 100%;
      }
      .tips {
        margin-top: 10px;
        font-size: 12px;
        color: #999999;
      }
    }
  }
  .item-link {
    display: flex;
    .title {
      margin-top: 7px;
      width: 50px;
      cursor: move;
    }
    .data {
      flex: 1;
      /deep/.ivu-tooltip {
        width: 200px;
      }
    }
  }
}
.auto-play.ivu-slider-input:after {
  position: absolute;
  left: 275px;
  top: -7px;
  content: "秒" !important;
  color: #333;
  font-size: 13px;
}
.div-add {
  margin-top: 15px;
  display: flex;
  align-items: center;
  padding: 14px 12px;
  border-radius: 5px;
  border: solid 1px #e5e5e5;
  .button {
    width: 100px;
  }
  .text {
    color: #999999;
    text-align: right;
    flex: 1;
  }
}
</style>
