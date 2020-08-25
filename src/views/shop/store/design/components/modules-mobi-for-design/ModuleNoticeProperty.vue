<template>
  <div class="property-container" v-if="module.module_type == 'ModuleNotice'">
    <h3>
      <span>公告栏设置</span>
    </h3>
    <Form class="property-form" :label-width="80">
      <FormItem label="显示图标" class="form-radio">
        <RadioGroup v-model="module.icon">
          <Radio label="images/icon/1.png">
            <span>图标1</span>
          </Radio>
          <Radio label="images/icon/2.png">
            <span>图标2</span>
          </Radio>
          <Radio label="images/icon/3.png">
            <span>图标3</span>
          </Radio>
          <Radio label="images/icon/4.png">
            <span>图标4</span>
          </Radio>
        </RadioGroup>
      </FormItem>
      <FormItem label="文字颜色" class="form-colorselect">
        <ColorPicker v-model="module.color" recommend editable alpha />
        <a class="reset-link" @click="module.color = initialColor">重置</a>
      </FormItem>
      <FormItem label="背景颜色" class="form-colorselect">
        <ColorPicker v-model="module.background" recommend editable alpha />
        <a class="reset-link" @click="module.background = initialBgColor">重置</a>
      </FormItem>
      <FormItem label="上下边距">
        <Slider v-model="module.padding_top_bottom" :min="0" :max="15" :step="1" show-input></Slider>
      </FormItem>
      <FormItem label="页面边距">
        <Slider v-model="module.padding_left_right" :min="0" :max="15" :step="1" show-input></Slider>
      </FormItem>
      <div style="color:#999;">信息</div>
      <draggable v-model="module.items" :options="options">
        <div v-for="(item, index) in module.items" :key="index">
          <div class="item">
            <div class="item-head">
              <div class="title">信息{{index+1}}</div>
              <div class="delbtn">
                <a v-if="index > 0" type="primary" @click="deleteItem(index)">删除</a>
              </div>
            </div>
            <div class="item-body">
              <div class="item-text">
                <div class="title">信息：</div>
                <div class="data">
                  <Input
                    class="input"
                    v-model="item.content"
                    :maxlength="24"
                    placeholder="请输入公告内容"
                  />
                  <span class="charcount">{{item.content ? item.content.length : 0}}/24</span>
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
      <div v-if="module.items.length < 5" class="div-add">
        <div class="button">
          <Button type="primary" @click="addItem()">添加信息</Button>
        </div>
        <div class="text">最多可添加5个，可拖拽排序</div>
      </div>
    </Form>
    <FilesSelector v-model="showFilesSelector" @onSelected="onFilesSelected"></FilesSelector>
  </div>
</template>
<script type="text/ecmascript-6">
import draggable from "vuedraggable";
import BaseModuleProperty from "./BaseModuleProperty";
import LinkButton from "../link-select-button";
import FilesSelector from "@/components/files/files";
import ModuleNotice from "./ModuleNotice";
export default {
  extends: BaseModuleProperty,
  components: { draggable, LinkButton, FilesSelector },
  props: ["module"],
  data() {
    return {
      initialColor: this.module.color,
      initialBgColor: this.module.background,
      showFilesSelector: false,
      curEditItem: null,
      options: {
        handle: ".item-head,.title",
        direction: "vertical",
        forceFallback: true,
        fallbackClass: "drag-class",
        fallbackOnBody: false,
        animation: 150,
        cursor: "move"
      }
    };
  },
  computed: {
    isCustomIcon: function() {
      return !/[1234]\.(jpg|jpeg|gif|png)$/i.test(this.module.icon);
    }
  },
  // watch: {
  //   module() {
  //     this.initialColor = this.module.color;
  //   }
  // },
  methods: {
    onShowFilesSelector() {
      this.showFilesSelector = true;
    },
    onLinkSelected(linkInfo, item) {
      item.link_desc = linkInfo.desc;
      item.link_type = linkInfo.type;
      item.link_data = linkInfo.data;
      item.link_url = linkInfo.url;
    },
    onFilesSelected(files) {
      if (files.length > 0) {
        this.module.icon = files[0];
      }
    },
    addItem() {
      this.module.items.push(ModuleNotice.newItem());
    },
    deleteItem(index) {
      this.module.items.splice(index, 1);
      return false;
    }
  }
};
</script>
<style lang="less" scoped>
.selected {
  border: 1px solid red;
}
.item {
  border: solid 1px #e5e5e5;
  border-radius: 5px;
  margin-top: 15px;
  .item-head {
    display: flex;
    background-color: #f9fbfd;
    padding: 0 13px;
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
      height: 40px;
      line-height: 40px;
      width: 50px;
      cursor: move;
    }
    .data {
      height: 40px;
      line-height: 40px;
      flex: 1;
      position: relative;
      /deep/.ivu-input {
        padding-right: 40px;
      }
      .charcount {
        color: #999;
        display: inline-block;
        position: absolute;
        right: 5px;
        line-height: 44px;
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
