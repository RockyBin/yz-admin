<template>
  <div class="container" :style="{width: getWidth(), height: getHeight()}">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      version="1.1"
      class="svg-triangle"
      :style="{width: getWidth(), height: getHeight()}"
    >
      <polygon class="p1" :points="getP1Points()" :style="getP1Style()"></polygon>
      <polygon class="p2" :points="getP2Points()" :style="getP2Style()"></polygon>
    </svg>
  </div>
</template>
<script type="text/ecmascript-6">
export default {
  props: {
    width: {
      type: Number,
      default: 20
    },
    height: {
      type: Number,
      default: 10
    },
    borderColor: {
      type: String,
      default: "#e5e5e5"
    },
    borderWidth: {
      type: Number,
      default: 1
    },
    backgroundColor: {
      type: String,
      default: "#f9fbfd"
    }
  },
  data() {
    return {};
  },
  methods: {
    getWidth() {
      return this.width + "px";
    },
    getHeight() {
      return this.width / 2 + "px";
    },
    getP1Points() {
      var p1x = this.width / 2;
      var p1y = 0;
      var p2x = 0;
      var p2y = this.height;
      var p3x = this.width;
      var p3y = this.height;
      return `${p1x},${p1y} ${p2x},${p2y}, ${p3x},${p3y}`;
    },
    getP1Style() {
      return `fill: ${this.borderColor};`;
    },
    getP2Points() {
      var p1x = this.width / 2;
      var p1y = this.borderWidth;
      var p2x = this.borderWidth;
      var p2y = this.height;
      var p3x = this.width - this.borderWidth;
      var p3y = this.height;
      return `${p1x},${p1y} ${p2x},${p2y}, ${p3x},${p3y}`;
    },
    getP2Style() {
      return `fill: ${this.backgroundColor};`;
    }
  }
};
</script>
<style lang="less" scoped>
.container {
  position: relative;
}
.svg-triangle {
  margin: 0 auto;
  position: absolute;
}

.svg-triangle .p1 {
  fill: transparent;
  stroke: red;
  stroke-width: 0;
}
.svg-triangle .p2 {
  fill: white;
  stroke: transparent;
  stroke-width: 0;
}
</style>
