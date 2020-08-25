<template>
  <div class="property-container" v-if="module.module_type == 'ModuleLine'">
    <h3>
      <span>分隔线设置</span>
    </h3>
    <Form class="property-form" :label-width="80">
      <FormItem label="线条类型" class="form-radio">
        <RadioGroup v-model="module.type">
          <Radio :label="1">实线</Radio>
          <Radio :label="2">虚线</Radio>
          <Radio :label="3">点状线</Radio>
        </RadioGroup>
      </FormItem>
      <FormItem label="线条颜色">
        <ColorPicker v-model="module.color" recommend editable alpha/>
        <a class="reset-link" @click="module.color = initialColor;return false;">重置</a>
      </FormItem>
      <FormItem label="背景色">
        <ColorPicker v-model="module.background" recommend editable alpha/>
        <a class="reset-link" @click="module.background = initialBackground;return false;">重置</a>
      </FormItem>
      <FormItem label="页面边距" class="form-slider">
        <Slider v-model="module.padding_left_right" :min="0" :max="15" :step="1" show-input></Slider>
      </FormItem>
      <FormItem label="上下边距" class="form-slider">
        <Slider v-model="module.padding_top_bottom" :min="0" :max="30" :step="1" show-input></Slider>
      </FormItem>
    </Form>
  </div>
</template>
<script type="text/ecmascript-6">
import BaseModuleProperty from "./BaseModuleProperty";
export default {
  extends: BaseModuleProperty,
  components: {},
  props: ["module"],
  data() {
    return {
      initialBackground: this.module.background,
      initialColor: this.module.color
    };
  },
  // watch: {
  //   module() {
  //     this.initialBackground = this.module.background;
  //     this.initialColor = this.module.color;
  //   }
  // },
  methods: {}
};
</script>
