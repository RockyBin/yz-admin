<template>
  <div>
    <div class="slide-item" v-for="(item, index) in info.items" :key="index">
      <a href @click.native="onClick(index,$event)">{{item.src}}</a>
    </div>
  </div>
</template>
<script>
export default {
  props: ["info", "editMode"],
  data() {
    return {};
  },
  mounted() {},
  methods: {
    onClick(index, event) {
      if (this.editMode) {
        event.preventDefault();
        event.stopPropagation();
      }
    }
  }
};
</script>
<style lang="less" scoped>
</style>
