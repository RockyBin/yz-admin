<template>
  <div class="product-detail-specifications">
    <div class="product-detail-specifications-list" v-for="(item, index) in  value.specificationsData" :key="index">
      <div
        class="product-detail-specifications-list-close"
        v-if="!disabled && !supplierInfo.id"
      >
        <Icon type="ios-close" @click="onSpecificationsDelete(index)"/>
      </div>
      <div class="product-detail-specifications-list-title">
        {{ "规格" + (index + 1) }}
      </div>
      <!-- 设置规格名字 -->
      <div class="product-detail-specifications-list-name">
        <Input
          :disabled="disabled"
          v-model="item.name"
          :maxlength="10"
          @on-change="onSpecificationsChange(item)"
          clearable
          placeholder="请输入规格名称"
          :class="{'product-detail-specifications-list-border': !setArray['sku_name_' + item.id],'ivu-form-item-error': setArray['sku_name_' + item.id]}"
        />
        <Checkbox
          :disabled="disabled || !!supplierInfo.id"
          v-model="item.has_image"
          @on-change="onSelectSpecificationsImage(index)"
        >添加规格图片</Checkbox>
        <more-message text="开启添加规格图片，可对每个规格值添加一张图片 建议上传800*800以上的jpg png 图片格式"></more-message>
      </div>
      <!-- 规格值 -->
      <div class="product-detail-specifications-list-value">
        <div
          class="product-detail-specifications-list-input"
          v-for="(valueItem, index1) in item.values"
          :key="index1"
        >
          <specifications-poper
            :disabled="disabled"
            v-model="valueItem.image"
            v-show="item.has_image"
          ></specifications-poper>
          <i-input
            :disabled="disabled"
            v-model="valueItem.value"
            :maxlength="30"
            placeholder="请输入规格值"
            :class="{
              'specifications-left': item.has_image,
              'product-detail-specifications-list-border': !setArray[
                'sku_value_' + valueItem.id
              ],
              'ivu-form-item-error': setArray['sku_value_' + valueItem.id],
              'product-detail-specifications-list-notclose': supplierInfo.id
            }"
            @on-change="onSpecificationsValueChange(valueItem)"
          >
            <Icon
              slot="append"
              type="ios-close"
              @click="onSpecificationsValueDelete(index,index1)"
            />
          </i-input>
        </div>
        <!-- 添加值按钮 -->
        <div
          class="product-detail-specifications-list-value-add"
          v-if="!supplierInfo.id"
        >
          <Button
            v-show="item.values.length < value.product_sku_num.sku_value_num"
            :disabled="disabled"
            type="dashed"
            size="small"
            @click="onAddSpecificationsValue(index)"
          >
            <i class="iconfont icon-ios-add"/>
            <span>添加规格值</span>
          </Button>
          <more-message
            :text="
              `每一组最多能添加${value.product_sku_num.sku_value_num}个规格值`
            "
          ></more-message>
        </div>
      </div>
    </div>
    <!-- 添加规格按钮 -->
    <Button
      type="primary"
      :disabled="disabled"
      @click="onAddSpecifications"
      shape="circle"
      v-if="!supplierInfo.id"
      v-show="
        value.specificationsData.length < value.product_sku_num.sku_name_num
      "
    >
      <i class="iconfont icon-ios-add"></i>
      <span>添加规格</span>
    </Button>
  </div>
</template>
<script>
import specificationsPoper from "./product-detail-sku-specifications-poper.vue";
import moreMessage from "@/views/shop/components/more-message/more-message.vue";
export default {
  props: {
    value: {
      type: Object,
      default() {
        return {};
      }
    },
    setArray: {
      required: true
    },
    disabled: {
      type: Boolean,
      default: false
    },
    supplierInfo: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  components: {
    specificationsPoper,
    moreMessage
  },
  inject: ["productDetail"],
  data() {
    return {};
  },
  watch: {
    "value.specificationsData": {
      handler(val) {
        this.productDetail.setSkuArray();
      }
    }
  },
  methods: {
    checkData() {
      let check = {status: true};
      if (!this.value.multiSpecificationsStatus) {
        return check;
      }
      // 如果多规格都添加规格值
      // 如果有规格
      if (!this.value.specificationsData.length) {
        check.status = false;
        check.msg = "至少添加一个商品规格";
        return check;
      }
      this.value.specificationsData.forEach(el =>
        // 并且规格名称不为空并且规格值长度不为0并且规格值不为空
        {
          // 检测规格名称是否输入
          if (!el.name.toString().trim()) {
            this.$set(this.setArray, "sku_name_" + el.id, true);
            check.status = false;
            check.msg = "请输入规格名称";
          }
          // 检查规格值是否输入
          if (el.values.length) {
            el.values.forEach(item => {
              if (!item.value.toString().trim()) {
                this.$set(this.setArray, "sku_value_" + item.id, true);
                if (check.status) {
                  check.msg = "请输入规格值";
                }
                check.status = false;
              }
            });
          } else {
            if (check.status) {
              check.msg = "请添加规格值";
            }
            check.status = false;
          }
        }
      );
      return check;
    },
    /**
     * 删除规格
     */
    onSpecificationsDelete(index) {
      this.value.specificationsData.splice(index, 1);
    },
    /**
     * 修改选择图片的规格组
     */
    onSelectSpecificationsImage(index) {
      if (this.supplierInfo.id) {
        return;
      }
      this.value.specificationsData.forEach((el, index1) => {
        if (index1 !== index && el.has_image) {
          this.$set(el, "has_image", false);
        }
      });
    },
    /**
     * 修改规格名称有值时删除有错误提醒
     */
    onSpecificationsChange(item) {
      if (event.target.value) {
        this.$set(this.setArray, "sku_name_" + item.id, false);
      }
    },
    /**
     * 修改规格值有值时删除有错误提醒
     */
    onSpecificationsValueChange(item) {
      if (event.target.value) {
        this.$set(this.setArray, "sku_value_" + item.id, false);
      }
    },
    /**
     * 删除规格值
     */
    onSpecificationsValueDelete(index, index1) {
      if (this.disabled || this.supplierInfo.id) {
        return;
      }
      let data = this.value.specificationsData.concat();
      if (data[index].values.length <= 1) {
        this.$Message.error("每个规格必须保留一个规格值");
        return;
      }
      data[index].values.splice(index1, 1);
      this.$set(this.value,"specificationsData", data);
    },
    /**
     * 添加规格值
     * index 第几个规格
     */
    onAddSpecificationsValue(index) {
      if (
        this.value.specificationsData[index].values.length >=
        this.value.product_sku_num.sku_value_num
      ) {
        return;
      }
      let data = this.value.specificationsData.concat();
      let value = {
        id:
          "new_" +
          (new Date().getTime() + Math.floor((10 + Math.random()) * 1000000)),
        value: "",
        image: ""
      };
      data[index].values.push(value);
      this.$set(this.value,"specificationsData", data);
    },
    /**
     * 添加规格
     */
    onAddSpecifications() {
      if (
        this.value.specificationsData.length >=
        this.value.product_sku_num.sku_name_num
      ) {
        return;
      }
      let data = this.value.specificationsData.concat();
      let value = {
        id: "new_" + Math.floor((10 + Math.random()) * 1000000),
        name: "",
        has_image: false,
        values: []
      };
      data.push(value);
      this.$set(this.value,"specificationsData", data);
    }
  }
};
</script>
<style lang="less" scoped>
.product-detail-specifications {
  .product-detail-specifications-list {
    position: relative;
    background-color: #f5f6f7;
    border-radius: 5px;
    padding: 16px;
    margin-bottom: 20px;
    overflow: hidden;
    border: 1px solid #E3E5E8;
    // 删除按钮
    .product-detail-specifications-list-close {
      position: absolute;
      right: 0;
      top: 0;
      border: 15px solid #BFC2C8;
      border-left-color: transparent;
      border-bottom-color: transparent;
      // 按钮
      i.ivu-icon {
        position: absolute;
        display: inline-block;
        line-height: 1;
        right: -18px;
        top: -18px;
        color: #fff;
        font-size: 22px;
        cursor: pointer;
      }
    }
    // 规格名称
    .product-detail-specifications-list-name {
      margin-top: 10px;
      /deep/.ivu-input-wrapper {
        margin-right: 12px !important;
      }
      .ivu-checkbox-wrapper {
        vertical-align: middle;
      }
    }
    // 规格值
    .product-detail-specifications-list-value {
      /deep/.ivu-input-wrapper.ivu-input-wrapper-default {
        width: 180px;
        display: inline-table;
        // margin-bottom: 7px;
      }
      .product-detail-specifications-list-input {
        display: inline-block;
        vertical-align: top;
        // margin-bottom: 7px;
        position: relative;
        margin-top: 10px;
        .specifications-left /deep/input.ivu-input {
          padding-left: 30px;
        }
        .product-detail-specifications-list-notclose {
          /deep/.ivu-input-group-append {
            display: none;
          }
          /deep/.ivu-input {
            border-radius: 4px;
          }
        }
        /deep/.ivu-poptip-popper {
          min-width: auto;
          .ivu-poptip-body {
            padding: 5px;
          }
        }
      }
      // 添加按钮
      .product-detail-specifications-list-value-add {
        display: inline-block;
        margin-top: 10px;
        button {
          width: 180px;
          margin-right: 8px;
          vertical-align: initial;
        }
      }
      // 规格值输入框和按钮
      /deep/.ivu-input-wrapper.ivu-input-wrapper-default {
        .ivu-input {
          height: 28px;
          &:disabled + .ivu-input-group-append {
            cursor: not-allowed;
          }
        }
        .ivu-input-group-append {
          cursor: pointer;
          padding: 0 3px;
          border-color: #dcdee2;
          .ivu-icon {
            font-size: 20px;
          }
        }
      }
      /deep/.ivu-poptip .iconfont,
      /deep/.ivu-btn-small {
        height: 28px;
        line-height: 1;
      }
    }
    .product-detail-specifications-list-title {
      line-height: 1;
    }
  }
  /deep/.ivu-btn-circle{
    padding:6px 10px;
  }
}
</style>
