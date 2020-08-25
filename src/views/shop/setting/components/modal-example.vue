<template>
  <Modal
    class="poster-demo-modal"
    v-model="modalShow"
    :title="modalTitle[indexSelect]"
    :width="650"
    :footer-hide="true"
  >
    <div class="poster-demo-modal-content">
      <div>
        <div style="margin-bottom: 20px;text-align:center;">{{modalData[indexSelect].text1}}</div>
        <div class="poster-demo-modal-img">
          <img v-if="modalShow" :src="modalData[indexSelect].image1" alt />
        </div>
      </div>
      <div>
        <div style="margin-bottom: 20px;text-align:center;">{{modalData[indexSelect].text2}}</div>
        <div class="poster-demo-modal-img">
          <img v-if="modalShow" :src="modalData[indexSelect].image2" alt />
        </div>
      </div>
    </div>
  </Modal>
</template>
<script>
const modalData = [
  {
    text1: "双列排版",
    text2: "单列排版",
    image1: require("../../images/Double row.png"),
    image2: require("../../images/Single row.png")
  },
  {
    text1: "商品列表",
    text2: "商品详情",
    image1: require("../../images/Product list.png"),
    image2: require("../../images/product details.png")
  }
];
export default {
  props: {
    value: {
      type: Boolean,
      default: false
    },
    indexSelect: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      modalShow: false,
      modalData: modalData,
      modalTitle: ["排版示例", "销量示例"]
    };
  },
  watch: {
    value(val) {
      this.modalShow = val;
    },
    modalShow(val) {
      this.$emit("input", val);
    }
  }
};
</script>
<style lang="less" scoped>
.poster-demo-modal {
  /deep/.ivu-modal-body {
    padding: 50px 117px;
    .poster-demo-modal-content {
      display: flex;
      justify-content: space-between;
      .poster-demo-modal-img {
        width: 180px;
        height: 320px;
        img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
      }
    }
  }
}
</style>