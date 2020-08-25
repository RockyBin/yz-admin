<template>
  <div class="image" :style="getStyle()"></div>
</template>
<script type="text/ecmascript-6">
export default {
  components: {},
  props: ["module","currentEditingModule"],
  data() {
    return {};
  },
  methods: {
    getStyle(){
      return {
        'background-image': 'url('+this.module.src+')',
        'border-radius': this.module.borderRadius
      }
    }
  }
};
</script>
<style lang="less" scoped>
.image {
  position: absolute;
  width: 100%;
  height: 100%;
  background-position: center;
  background-size: cover;
}
</style>
