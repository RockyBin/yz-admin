<template>
  <div v-if="module.module_type == 'ModuleBlank'" :style="'height:' + module.height + 'px;'"></div>
</template>
<script type="text/ecmascript-6">
export default {
  components: {},
  props: ["module"],
  data() {
    return {};
  },
  methods: {}
};
</script>
