<template>
  <Modal
    v-model="modalStatus"
    :title="title"
    @on-ok="onModalConfirm"
    :width="430"
  >
    <RadioGroup v-model="radiusValue" vertical>
      <Radio :label="0" style="height: 32px;line-height: 32px;">{{
        text[0]
      }}</Radio>
      <Radio :label="1" style="height: 32px;line-height: 32px;">{{
        text[1]
      }}</Radio>
    </RadioGroup>
  </Modal>
</template>

<script>
export default {
  props: {
    value: {
      type: Boolean,
      default: false
    },
    text: {
      type: Array,
      default() {
        return ["审核当前页面所有商品", "审核全部页面所有商品"];
      }
    },
    title: {
      type: String,
      default: "审核"
    }
  },
  data() {
    return {
      radiusValue: 0,
      modalStatus: false
    };
  },
  watch: {
    value(val) {
      this.modalStatus = val;
      if (val) {
        this.radiusValue = 0;
      }
    },
    modalStatus(val) {
      this.$emit("input", val);
    }
  },
  methods: {
    onModalConfirm() {
      this.$emit("on-select", this.radiusValue);
    }
  }
};
</script>

<style>
</style>
