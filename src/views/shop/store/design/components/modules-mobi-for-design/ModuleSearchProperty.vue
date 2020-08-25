<template>
  <div class="property-container" v-if="module.module_type == 'ModuleSearch'">
    <h3>
      <span>搜索栏设置</span>
    </h3>
    <Form class="property-form" :label-width="80">
      <FormItem label="展示形式">
        <i-switch
          v-model="module.fix_top"
          :true-value="1"
          :false-value="0"
          @on-change="checkFixTop()"
        >
          <span slot="open">开</span>
          <span slot="close">关</span>
        </i-switch>
        <span v-if="module.fix_top" class="tip-text">开启置顶</span>
        <span v-else class="tip-text">关闭置顶</span>
      </FormItem>
      <FormItem label="框体边角" class="form-radio">
        <RadioGroup v-model="module.style">
          <Radio :label="1">圆形</Radio>
          <Radio :label="2">直角</Radio>
          <Radio :label="3">圆角</Radio>
        </RadioGroup>
      </FormItem>
      <FormItem label="预设文字" class="form-input">
        <i-input class="input300" v-model="module.keyword" :maxlength="8" placeholder="请输入预设文字">
          <span slot="suffix">{{module.keyword?module.keyword.length:0}}/8</span>
        </i-input>
      </FormItem>
      <FormItem label="文字位置" class="form-radio">
        <RadioGroup v-model="module.keyword_align">
          <Radio :label="'center'">居中</Radio>
          <Radio :label="'left'">居左</Radio>
        </RadioGroup>
      </FormItem>
      <FormItem label="预设文字颜色" class="form-colorselect">
        <ColorPicker v-model="module.font_color" recommend editable alpha/>
        <span class="reset-link" @click="module.font_color=initialFontColor">重置</span>
      </FormItem>
      <FormItem label="图标颜色" class="form-colorselect">
        <ColorPicker v-model="module.icon_color" recommend editable alpha/>
        <span class="reset-link" @click="module.icon_color=initialIconColor">重置</span>
      </FormItem>
      <FormItem label="框体背景" class="form-colorselect">
        <ColorPicker v-model="module.input_background" recommend editable alpha/>
        <span class="reset-link" @click="module.input_background=initialInputBackground">重置</span>
      </FormItem>
      <FormItem label="背景颜色" class="form-colorselect">
        <ColorPicker v-model="module.background" recommend editable alpha/>
        <span class="reset-link" @click="module.background=initialBackground">重置</span>
      </FormItem>
      <FormItem label="上下间距" class="form-slider">
        <Slider v-model="module.padding_top_bottom" :min="0" :max="15" :step="1" show-input></Slider>
      </FormItem>
      <FormItem label="页面间距" class="form-slider">
        <Slider v-model="module.padding_left_right" :min="0" :max="15" :step="1" show-input></Slider>
      </FormItem>
    </Form>
    <FilesSelector v-model="showFilesSelector" @onSelected="onFilesSelected"></FilesSelector>
  </div>
</template>
<script type="text/ecmascript-6">
import BaseModuleProperty from "./BaseModuleProperty";
import FilesSelector from "@/components/files/files";
import jQuery from "jquery";
import iView from "iview";
import { Switch } from "iview";
export default {
  extends: BaseModuleProperty,
  components: {
    FilesSelector,
    "i-switch": Switch
  },
  props: ["module"],
  data() {
    return {
      initialBackground: this.module.background,
      initialFontColor: this.module.font_color,
      initialIconColor: this.module.icon_color,
      initialInputBackground: this.module.input_background,
      showFilesSelector: false,
      curEditItem: null
    };
  },
  created() {
    if (!this.module.icon_color) this.$set(this.module, "icon_color", this.module.font_color);
  },
  // watch: {
  //   module() {
  //     this.initialBackground = this.module.background;
  //     this.initialFontColor = this.module.font_color;
  //     this.initialInputBackground = this.module.input_background;
  //   }
  // },
  methods: {
    onShowFilesSelector(item) {
      this.showFilesSelector = true;
      this.curEditItem = item;
    },
    onFilesSelected(files) {
      if (files.length > 0) {
        this.curEditItem.image = files[0];
      }
    },
    checkFixTop() {
      if (
        this.module.fix_top &&
        jQuery.find(".module-item.fixed-top-edit").length > 0
      ) {
        iView.Message.error({
          content: "一个页面只能有一个置顶元素",
          duration: 2
        });
        setTimeout(() => {
          this.module.fix_top = 0;
        }, 10);
      }
    }
  }
};
</script>
<style lang="less" scoped>
.property-container .tip-text {
  margin-left: 10px;
  display: inline-block;
  vertical-align: middle;
}
</style>
