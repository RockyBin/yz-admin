<template>
  <div>
    <div
      :class="['item',item.name == selectedColor || item.value == selectedColor ? 'active' : '']"
      v-for="(item,index) in colors"
      :key="index"
      @click="onSelect(item)"
    >
      <div class="in" :style="{'background-color': item.value}"></div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    colors: {
      type: Array,
      required: true,
      default: function() {
        return [
          { name: "red", value: "#ea3d44" },
          { name: "blue", value: "#41a3ee" },
          { name: "orange", value: "#f67238" }
        ];
      }
    },
    current: {
      type: String
    }
  },
  data() {
    return {
      selectedColor: ""
    };
  },
  watch: {
    current: {
      handler() {
        this.selectedColor = this.current;
      },
      immediate: true
    }
  },
  mounted() {
    // this.selectedColor = this.current;
  },
  methods: {
    onSelect(item) {
      this.selectedColor = item.name;
      this.$emit("onSelected", item);
    }
  }
};
</script>
<style lang="less" scoped>
.item {
  width: 22px;
  height: 22px;
  border-radius: 22px;
  position: relative;
  display: inline-block;
  margin-left: -2px;
  + .item {
    margin-left: 10px;
  }
  &:hover {
    border: 1px solid #dadfea;
  }
  .in {
    border-radius: 16px;
    position: absolute;
    width: 16px;
    height: 16px;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
  &.active {
    .in {
      border-radius: 18px;
      width: 18px;
      height: 18px;
    }
    &:after {
      content: "\F171";
      font-family: "Ionicons";
      font-size: 20px;
      color: white;
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
    }
  }
}
</style>
