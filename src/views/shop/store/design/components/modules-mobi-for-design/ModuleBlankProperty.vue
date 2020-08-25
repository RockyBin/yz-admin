<template>
  <div class="property-container" v-if="module.module_type == 'ModuleBlank'">
    <h3>
      <span>辅助空白设置</span>
    </h3>
    <Form class="property-form" :label-width="80">
      <FormItem label="背景颜色">
        <ColorPicker v-model="module.background" recommend editable alpha/>
        <a class="reset-link" @click="module.background = initialBackground">重置</a>
      </FormItem>
      <FormItem label="空白高度">
        <Slider v-model="module.height" :min="0" :max="100" :step="1" show-input></Slider>
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
      initialBackground: this.module.background
    };
  },
  // watch: {
  //   module() {
  //     this.initialBackground = this.module.background;
  //   }
  // },
  methods: {}
};
</script>
