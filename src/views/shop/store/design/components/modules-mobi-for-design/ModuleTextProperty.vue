<template>
  <div class="property-container" v-if="module.module_type == 'ModuleText'">
    <h3>
      <span>文本设置</span>
    </h3>
    <Form class="property-form" :label-width="80">
      <FormItem label="文本内容">
        <ue-editor
          class="rich-editor"
          ref="detailEditor"
          v-model="module.text"
          :setting="editorSetting"
        ></ue-editor>
      </FormItem>
      <FormItem label="背景色">
        <ColorPicker v-model="module.background" recommend editable alpha/>
        <a class="reset-link" @click="module.background = initialBgColor;return false;">重置</a>
      </FormItem>
      <FormItem label="上下边距">
        <Slider v-model="module.padding_top_bottom" :min="0" :max="15" :step="1" show-input></Slider>
      </FormItem>
      <FormItem label="页面边距">
        <Slider v-model="module.padding_left_right" :min="0" :max="15" :step="1" show-input></Slider>
      </FormItem>
    </Form>
  </div>
</template>
<script type="text/ecmascript-6">
import BaseModuleProperty from "./BaseModuleProperty";
import ueEditor from "@/views/shop/components/editor/editor.vue";
export default {
  extends: BaseModuleProperty,
  components: { ueEditor },
  props: ["module"],
  data() {
    return {
      initialBgColor: this.module.background,
      editorSetting: {
        initialFrameHeight: "300",
        autoHeightEnabled: false,
        initialFrameWidth: "100%",
        topOffset: 48,
        wordCount: true,
        maximumWords: 300,
        wordCountMsg: "{#count}/300",
        wordOverFlowMsg: "<span style='color:red;'>最多输入300个字符！</span>",
        toolbars: [
          [
			"source",
            "undo",
            "redo",
            "|",
            "bold",
            "italic",
            "underline",
            "forecolor",
            "backcolor",
            "removeformat",
            "insertorderedlist",
            "insertunorderedlist",
            "lineheight",
            "inserttable",
            "horizontal",
            "fontfamily",
            "fontsize",
            "justifyleft",
            "justifycenter",
            "justifyright",
            "justifyjustify",
            "link",
            "unlink",
            "map"
          ]
        ]
      }
    };
  },
  // watch: {
  //   module() {
  //     this.initialBgColor = this.module.background;
  //   }
  // },
  methods: {
    onContentChange(content) {
      module.text = content;
    }
  }
};
</script>
<style lang="less" scoped>
.rich-editor {
  line-height: 1.5;
  /deep/.edui-editor-iframeholder {
    height: 120px !important;
  }
}
</style>
