<template>
  <div v-if="module.module_type == 'ModuleLine'" :class="{'module-line':true,'module-line-edit':editMode}">
    <div
      :style="'border-bottom-style:' + (module.type == '1' ? 'solid':(module.type == '2' ? 'dashed':'dotted')) + ';border-bottom-color:' + module.color + ';border-bottom-width:' + module.width + 'px;'"
      style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;width: 100%;"
    ></div>
  </div>
</template>
<script type="text/ecmascript-6">
export default {
  components: {},
  props: ["module","editMode"],
  data() {
    return {};
  },
  methods: {}
};
</script>
<style>
.module-line {
  display: flex;
  align-items: center;
}
.module-line-edit {
  height: 30px;
}
</style>
