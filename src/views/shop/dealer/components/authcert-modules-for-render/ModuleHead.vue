<template>
    <div class="img-container">
      <img class="img" src="images/share-paper/head.png">
    </div>
</template>
<script type="text/ecmascript-6">
export default {
  components: {},
  props: ["module","currentEditingModule"],
  data() {
    return {};
  },
  methods: {
    
  }
};
</script>
<style lang="less" scoped>
.img-container {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.img {
  width: 100%;
  border-radius: 50%;
  object-fit: contain;
}
</style>