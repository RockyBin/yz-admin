<template>
  <Modal
    class="poster-demo-modal"
    v-model="modalShow"
    title="位置示例图"
    :width="650"
    :footer-hide="true"
  >
    <div class="poster-demo-modal-content">
      <div>
        <div v-if="indexSelect!=4" style="margin-bottom: 20px;">1.点击{{modalData[indexSelect].text1}}顶部二维码</div>
        <div v-else style="margin-bottom: 20px;">1.点击工作台的邀请客户</div>
        <div class="poster-demo-modal-img">
          <img v-if="modalShow" :src="modalData[indexSelect].image1" alt />
        </div>
      </div>
      <div>
        <div style="margin-bottom: 20px;">2.生成{{modalData[indexSelect].text2}}海报，保存即可分享他人</div>
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
    text1: "会员中心",
    text2: "会员",
    image1: require("./../images/mem_1.png"),
    image2: require("./../images/mem_2.png")
  },
  {
    text1: "分销中心",
    text2: "分销",
    image1: require("./../images/dis_1.png"),
    image2: require("./../images/dis_2.png")
  },
  {
    text1: "代理中心",
    text2: "代理",
    image1: require("./../images/agent_1.png"),
    image2: require("./../images/agent_2.png")
  },
  {
    text1: "区域代理中心",
    text2: "区域代理",
    image1: require("./../images/area_agent_1.png"),
    image2: require("./../images/area_agent_2.png")
  },
  {
    text1: "经销商中心",
    text2: "经销商",
    image1: require("./../images/dealer_1.jpg"),
    image2: require("./../images/dealer_2.jpg")
  },
  {
    text1: "员工端",
    text2: "员工",
    image1: require("./../images/staff_1.png"),
    image2: require("./../images/staff_2.png")
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
      modalData
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
    padding: 53px 114px 105px;
    .poster-demo-modal-content {
      display: flex;
      justify-content: space-between;
      .poster-demo-modal-img {
        width: 159px;
        height: 285px;
        img {
          width: 100%;
          height: 100%;
        }
      }
    }
  }
}
</style>