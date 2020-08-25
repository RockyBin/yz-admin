<template>
  <Modal
    class="product-list-modal-stock"
    v-model="modalShow"
    :width="multiStatus ? 626 : 372"
    title="商品库存"
    :mask-closable="false"
  >
    <div :style="contentWidth">
      <div
        class="product-list-modal-stock-head"
        :style="multiStatus ? 'width: 578px;margin-right: -20px;' : ''"
        v-if="info"
      >
        <div class="product-list-modal-stock-info">
          <img :src="productImage" alt="" />
          <div :style="multiStatus ? 'width: 210px;' : ''">
            {{ info.productData.name }}
          </div>
        </div>
        <div v-if="multiStatus" style="flex: 1;margin-right: -3px;">
          <Form>
            <FormItem label="库存预警：">
              <InputNumber
                style="width: 180px;"
                :precision="0"
                :min="0"
                :max="9999999"
                v-model="info.productData.warning_inventory"
              />
            </FormItem>
          </Form>
        </div>
      </div>
      <div
        v-if="modalShow && info"
        style="margin-top: 20px;"
      >
        <table-stock v-if="multiStatus" ref="table" :value="info" style="margin:0;"></table-stock>
        <Form v-else ref="formValidate" :model="info" :label-width="74">
          <FormItem
            label="库存："
            prop="skus[0].inventory"
            :rules="ruleValidate"
          >
            <InputNumber
              style="width: 250px;"
              :precision="0"
              :min="0"
              :max="9999999"
              v-model="info.skus[0].inventory"
            />
          </FormItem>
          <FormItem label="库存预警：">
            <InputNumber
              style="width: 250px;"
              :precision="0"
              :min="0"
              :max="9999999"
              v-model="info.productData.warning_inventory"
            />
          </FormItem>
        </Form>
      </div>
    </div>
    <div slot="footer">
      <Button type="text" size="large" @click="modalShow = false">取消</Button>
      <Button
        type="primary"
        size="large"
        perm="product.operate"
        :loading="modalLoading"
        @click="onModalClick"
        >确定</Button
      >
    </div>
  </Modal>
</template>
<script>
import tableStock from "./product-list-table-stock";
export default {
  props: {
    info: {
      type: Object,
      default: null
    },
    value: {
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
      modalLoading: false,
      ruleValidate: {
        required: true,
        validator: (rule, value, callback) => {
          if (value !== null) {
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
      this.modalLoading = false;
    },
    modalShow(val) {
      this.$emit("input", val);
    }
  },
  computed: {
    contentWidth() {
      let width =
        this.info && this.info.skuName.length > 3
          ? 150 + 140 * this.info.skuName.length
          : "";
      return width ? `width: ${width}px;` : "";
    },
    multiStatus() {
      return this.info && this.info.skuName.length;
    },
    productImage() {
      return this.info && this.info.productData.small_images
        ? this.$store.state.siteComdataPath +
            this.info.productData.small_images.split(",")[0]
        : "";
    }
  },
  methods: {
    onModalClick() {
      let status = true;
      if (this.multiStatus) {
        status = this.$refs.table.checkData();
      } else {
        this.$refs.formValidate.validate(valid => {
          status = valid;
        });
      }
      if (status) {
        this.saveData();
      } else {
        this.$Message.error("修改失败");
      }
    },
    saveData() {
      this.modalLoading = true;
      this.$httpPost(
        "/shop/admin/product/save/inventory",
        {
          product_id: this.info.productData.id,
          warning_inventory: this.info.productData.warning_inventory,
          skus: this.info.skus.map(n => ({
            id: n.id,
            inventory: n.inventory
          }))
        },
        res => {
          if (res.code === 200) {
            this.modalShow = false;
            this.$Message.success("修改成功");
            this.$emit("reload");
          } else {
            this.$Message.error(res.msg);
          }
        }
      );
    }
  }
};
</script>
<style lang="less" scoped>
.product-list-modal-stock {
  /deep/.ivu-modal-body {
    padding: 24px;
  }
  .product-list-modal-stock-head {
    display: flex;
    border: 1px solid #f5f6f7;
    border-radius: 4px;
    padding: 12px 12px 12px 16px;
    .product-list-modal-stock-info {
      display: flex;
      margin-right: 32px;
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
