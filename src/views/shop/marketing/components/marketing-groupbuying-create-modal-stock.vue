<template>
  <Modal
    class="marketing-groupbuying-create-modal-stock"
    v-model="modalShow"
    :width="contentWidth"
    title="选择商品规格"
    :mask-closable="false"
  >
    <div>
      <div
        style="width: 74px;display: inline-block;vertical-align: top;line-height: 32px;color: #657180;"
      >
        当前商品：
      </div>
      <div
        class="marketing-groupbuying-create-modal-stock-head"
        style="display: inline-block;width: 300px;"
        v-if="info"
      >
        <div class="marketing-groupbuying-create-modal-stock-info">
          <img :src="productImage" alt="" />
          <div>
            {{ info.name }}
          </div>
        </div>
      </div>
      <div v-if="info" style="margin-top: 20px;">
        <table-stock
          ref="table"
          :showInventory="showInventory"
          :showHeadDiscount="showHeadDiscount"
          :value="info"
        ></table-stock>
      </div>
    </div>
    <div slot="footer">
      <Button type="text" size="large" @click="modalShow = false">取消</Button>
      <Button type="primary" size="large" @click="onModalClick">确定</Button>
    </div>
  </Modal>
</template>
<script>
import tableStock from "./marketing-groupbuying-create-table-stock";
export default {
  props: {
    info: {
      type: Object,
      default: null
    },
    value: {
      type: Boolean,
      default: false
    },
    showInventory: {
      type: Boolean,
      default: false
    },
    showHeadDiscount: {
      type: Boolean,
      default: false
    },
    showTableError: {
      type: Boolean,
      default: false
    }
  },
  components: {
    tableStock
  },
  data() {
    return {
      modalShow: false,
      ruleValidate: {
        required: true,
        validator: (rule, value, callback) => {
          if (value) {
            callback();
          } else {
            callback(new Error("请输入商品库存"));
          }
        }
      }
    };
  },
  watch: {
    value(val) {
      this.modalShow = val;
      if (val && this.showTableError) {
        this.$nextTick(() => {
          this.$refs.table.checkData();
        });
      }
    },
    modalShow(val) {
      this.$emit("input", val);
    }
  },
  computed: {
    contentWidth() {
      return (
        48 +
        640 +
        100 * ((this.info && this.info.sku_names.length) || 0) -
        ((this.showInventory ? 0 : 1) + (this.showHeadDiscount ? 0 : 1)) * 120
      );
    },
    productImage() {
      return this.info && this.info.small_images
        ? this.$store.state.siteComdataPath +
            this.info.small_images.split(",")[0]
        : "";
    }
  },
  methods: {
    onModalClick() {
      let status = this.$refs.table.checkData();
      if (status) {
        this.saveData();
      } else {
        this.$Message.error("保存失败");
      }
    },
    saveData() {
      this.$emit("on-ok");
    }
  }
};
</script>
<style lang="less" scoped>
.marketing-groupbuying-create-modal-stock {
  /deep/.ivu-modal-body {
    padding: 16px 0 16px 16px;
    & > div {
      padding-right: 16px;
      box-sizing: content-box;
    }
  }
  .marketing-groupbuying-create-modal-stock-head {
    display: flex;
    border: 1px solid #f5f6f7;
    border-radius: 4px;
    padding: 12px 12px 12px 16px;
    .marketing-groupbuying-create-modal-stock-info {
      display: flex;
      color: #657180;
      img {
        display: block;
        width: 40px;
        height: 40px;
        border-radius: 4px;
        margin-right: 14px;
        flex: none;
        object-fit: contain;
      }
    }
  }
}
</style>
