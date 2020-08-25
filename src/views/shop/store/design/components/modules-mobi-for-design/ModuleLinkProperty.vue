<template>
  <div class="property-container" v-if="module.module_type == 'ModuleLink'">
    <h3>
      <span>导航栏设置</span>
    </h3>
    <Form class="property-form" :label-width="80">
      <FormItem label="选择类型" class="style-select">
        <triangle class="arrow" :width="16" :height="8" :border-width="1" />
        <div class="wrapper">
          <div
            class="layout layout-1"
            :class="module.layout == 1 ? 'selected':''"
            @click="changeLayout(1)"
          >
            <img class="img-sample" src="images/sample/daohang1.png" alt />
            <img class="check-mark" src="images/xuanzhong.png" alt />
            图文导航
          </div>
          <div
            class="layout layout-2"
            :class="module.layout == 2 ? 'selected':''"
            @click="changeLayout(2)"
          >
            <img class="img-sample" src="images/sample/daohang2.png" alt />
            <img class="check-mark" src="images/xuanzhong.png" alt />
            图片导航
          </div>
          <div
            class="layout layout-3"
            :class="module.layout == 3 ? 'selected':''"
            @click="changeLayout(3)"
          >
            <img class="img-sample" src="images/sample/daohang3.png" alt />
            <img class="check-mark" src="images/xuanzhong.png" alt />
            文字导航
          </div>
        </div>
      </FormItem>
      <FormItem v-if="module.layout==1||module.layout==2" label="图片边角" class="form-radio">
        <RadioGroup v-model="module.border_radius">
          <Radio label="0px">直角</Radio>
          <Radio label="2px">圆角</Radio>
          <Radio label="50%">圆形</Radio>
        </RadioGroup>
      </FormItem>
      <FormItem label="上下边距" class="form-slider">
        <Slider v-model="module.padding_top_bottom" :min="0" :max="15" :step="1" show-input></Slider>
      </FormItem>
      <FormItem label="页面边距" class="form-slider">
        <Slider v-model="module.padding_left_right" :min="0" :max="15" :step="1" show-input></Slider>
      </FormItem>
      <FormItem label="显示方式" class="form-radio">
        <RadioGroup v-model="module.slide">
          <Radio :label="0">固定</Radio>
          <Radio :label="1">滑动</Radio>
        </RadioGroup>
        <div v-if="module.slide == 1&&module.layout==3" class="wrapper1">
          <span style="margin-right:10px">一屏显示</span>
          <Select
            :value="module.show_num"
            @on-change="selectChange"
            style="width:200px;height:32px;"
          >
            <Option :value="4">4个</Option>
            <Option :value="5">5个</Option>
            <Option :value="6">6个</Option>
          </Select>
        </div>
        <div v-if="module.slide == 1&&module.layout!=3" class="wrapper2">
          <triangle class="arrow" :width="16" :height="8" :border-width="1" />
          <span style="margin-right:10px">选择行数</span>
          <RadioGroup v-model="module.row_count">
            <Radio :label="1">一行</Radio>
            <Radio :label="2">两行</Radio>
          </RadioGroup>
          <div style="height: 8px;"></div>
          <span style="margin-right:10px">一屏显示</span>
          <Select
            v-show="module.row_count == 1"
            :value="module.show_num"
            @on-change="selectChange"
            style="width:200px;height:32px;position: relative;"
          >
            <Option v-if="module.layout==2" :value="3">3个</Option>
            <Option :value="4">4个</Option>
            <Option :value="5">5个</Option>
            <Option v-if="module.layout==1" :value="6">6个</Option>
          </Select>
          <Select
            v-show="module.row_count == 2"
            :value="module.show_num"
            @on-change="selectChange"
            style="width:200px;height:32px;"
          >
            <Option v-if="module.layout==2" :value="6">6个</Option>
            <Option :value="8">8个</Option>
            <Option :value="10">10个</Option>
            <Option v-if="module.layout==1" :value="12">12个</Option>
          </Select>
        </div>
      </FormItem>
      <FormItem v-if="module.slide == 0 && module.layout != 3" label="每行数量" class="form-radio">
        <RadioGroup v-model="module.row_num">
          <Radio v-if="module.layout==2" :label="3">3个</Radio>
          <Radio :label="4">4个</Radio>
          <Radio :label="5">5个</Radio>
          <Radio :label="6">6个</Radio>
        </RadioGroup>
      </FormItem>
      <FormItem label="背景颜色" class="form-colorselect">
        <ColorPicker v-model="module.background" recommend editable alpha />
        <span class="reset-link" @click="module.background=initialBackground">重置</span>
      </FormItem>
      <FormItem label="文字颜色" v-show="module.layout != 2" class="form-colorselect">
        <ColorPicker v-model="module.font_color" recommend editable alpha />
        <span class="reset-link" @click="module.font_color=initialFontColor">重置</span>
      </FormItem>
      <FormItem label="添加导航" class="form-nav" >
        <draggable v-model="module.items" :options="options">
          <div v-for="(item, index) in module.items" :key="index" class="item">
            <h4 class="handle">
              {{"导航"+(index+1)}}
              <span class="delete-link" @click="deleteItem(index)">删除</span>
            </h4>
            <div class="item-body">
              <div v-if="module.layout!=2" class="row">
                <div class="label">标题：</div>
                <i-input
                  class="input"
                  v-model="item.link_text"
                  placeholder="请输入标题名称"
                  :maxlength="4"
                >
                  <span slot="suffix">{{item.link_text ? item.link_text.length : 0}}/4</span>
                </i-input>
              </div>
              <div v-if="module.layout!=3" class="row" style="height:44px;">
                <div style="align-self:center;" class="label">图片：</div>
                <div>
                  <Button
                    type="dashed"
                    :class="{'img-btn': true,'noborder':item.image}"
                    @click="onShowFilesSelector(item)"
                  >
                    <Icon
                      v-if="item.image"
                      type="md-close-circle"
                      size="16"
                      @click.stop="deleteImage(index)"
                    />
                    <Icon v-if="!item.image" type="md-add" size="20" color="#dcdedc" />
                    <img v-if="item.image" :src="item.image" />
                  </Button>
                  <span style="color:#999;">建议尺寸:86*86像素</span>
                </div>
              </div>
              <div class="row">
                <div class="label">链接：</div>
                <Tooltip :content="item.link_desc?item.link_desc:'请选择链接'" placement="top-start">
                  <LinkButton
                    style="flex:1;"
                    :context="item"
                    :text="item.link_desc"
                    @onSelectLink="onLinkSelected"
                  ></LinkButton>
                </Tooltip>
              </div>
            </div>
          </div>
        </draggable>
        <div v-if="module.items.length < limit || limit === 0" class="bottom-add">
          <Button type="primary" @click="addItem()">添加导航</Button>
          <span>
            <span v-if="limit > 0">{{`最多可添加${limit}个，`}}</span>可拖拽排序
          </span>
        </div>
      </FormItem>
      
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
import ModuleLink from "./ModuleLink";
export default {
  extends: BaseModuleProperty,
  components: { LinkButton, FilesSelector, draggable, triangle },
  props: ["module"],
  data() {
    return {
      initialBackground: this.module.background,
      initialFontColor: this.module.font_color,
      showFilesSelector: false,
      curEditItem: null,
      options: {
        handle: ".handle",
        emptyInsertThreshold: 5,
        direction: "vertical",
        forceFallback: true,
        fallbackClass: "drag-class",
        fallbackOnBody: false,
        animation: 150,
        filter: ".delete-link"
      },
      hideItems: []
    };
  },
  computed: {
    limit() {
      if (this.module.slide == 0) {
        if (this.module.layout == 3) return 8;
        else return this.module.row_num * 2;
      } else {
        return this.module.show_num * 2;
      }
    }
  },
  watch: {
    "module.layout": {
      handler(layout) {
        this.initShowNum();
        if (layout == 3 && this.module.slide == 1) {
          this.module.show_num = Math.max(4, Math.min(6, this.module.show_num));
        }
      },
      immediate: true
    },
    "module.row_count": {
      handler(newVal) {
        this.initShowNum();
      },
      immediate: true
    }
  },
  methods: {
    initShowNum() {
      if (this.module.layout == 1) {
        if (this.module.row_count == 1) {
          this.module.show_num = Math.max(4, Math.min(6, this.module.show_num));
        } else if (this.module.row_count == 2) {
          this.module.show_num = Math.max(
            8,
            Math.min(12, this.module.show_num)
          );
        }
      } else {
        if (this.module.row_count == 1) {
          this.module.show_num = Math.max(3, Math.min(5, this.module.show_num));
        } else if (this.module.row_count == 2) {
          this.module.show_num = Math.max(
            6,
            Math.min(10, this.module.show_num)
          );
        }
      }
    },
    changeLayout(layout) {
      this.module.layout = layout;
    },
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
      if (this.module.items.length < this.limit) {
        this.module.items.push(ModuleLink.newItem());
      } else {
        this.$Message.info(`最多可添加${this.limit}个导航`);
      }
    },
    deleteItem(index) {
      this.module.items.splice(index, 1);
    },
    deleteImage(index) {
      this.module.items[index].image = "";
    },
    selectChange(num) {
      if (num) {
        this.module.show_num = num;
      }
    }
  }
};
</script>
<style lang="less" scoped>
.drag-class {
  border: 1px dashed #0066cc;
  opacity: 10.8;
}
/deep/.style-select {
  .ivu-form-item-content {
    position: relative;
    padding-top: 5px;
    .arrow {
      position: absolute;
      top: -2px;
      left: 12px;
    }
  }
}
.form-nav{
  /deep/.ivu-form-item-label {
    margin-bottom: 18px;
  }
}
.layout {
  position: relative;
  display: inline-block;
  width: 102px;
  height: 100px;
  background-color: #ffffff;
  border: 1px solid transparent;
  text-align: center;
  .img-sample {
    margin-bottom: -10px;
    width: 99.99%;
  }
  .check-mark {
    position: absolute;
    top: 0;
    right: 0;
    display: none;
  }
  &.selected {
    border: solid 1px #fd9d14;
    .check-mark {
      display: block;
    }
  }
}
.layout:nth-child(1) {
  margin-left: 0px;
}
.item {
  border-radius: 5px;
  border: 1px solid #dde0e1;
  margin-bottom: 16px;
  overflow: hidden;
  h4 {
    font-size: 13px;
    font-weight: normal;
    height: 42px;
    line-height: 42px;
    padding-left: 12px;
    background: #f9fbfd;
    border-bottom: 1px solid #dde0e1;
    cursor: move;
    .delete-link {
      float: right;
      color: #4570ea;
      margin-right: 12px;
      font-weight: normal;
      cursor: pointer;
    }
  }
  .item-body {
    padding: 20px;
    .row {
      display: flex;
      margin-bottom: 20px;
      /deep/.ivu-tooltip {
        width: 200px;
      }
      &:last-child {
        margin-bottom: 0;
      }
      .label {
        width: 40px;
      }
      .input {
        flex: 1;
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
          display: none;
          position: absolute;
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
        img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
      }
    }
  }
}
.bottom-add {
  padding: 13px 23px;
  border-radius: 5px;
  border: solid 1px #dde0e1;
  /deep/.ivu-btn {
    margin-right: 10px;
  }
}
.wrapper {
  width: 337px;
  height: 117px;
  background-color: #f9fbfd;
  border: solid 1px #e5e5e5;
  margin: 0 -10px;
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  .layout {
    border-radius: 2px;
  }
}
.wrapper1 {
  height: 70px;
  margin: 0;
  padding: 15px;
  background-color: #f9fbfd;
  border: solid 1px #e5e5e5;
}
.wrapper2 {
  position: relative;
  height: 106px;
  margin: 8px 0 0 0;
  padding: 12px 15px 15px 15px;
  background-color: #f9fbfd;
  border: solid 1px #e5e5e5;

  .arrow {
    position: absolute;
    top: -8px;
    left: 60px;
  }
}
</style>
