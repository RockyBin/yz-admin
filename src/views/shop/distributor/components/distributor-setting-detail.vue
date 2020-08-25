<template>
  <div class="distributor-setting-list">
    <Modal
      class="distributor-setting-detail-modal"
      v-model="modalStatus"
      :loading="modelLoading"
      :width="700"
      :mask-closable="false"
      title="新增商品"
      @on-ok="onComfrimClick"
    >
      <Form ref="formValidate" :model="productData" :rules="ruleValidate" :label-width="88">
        <FormItem label="商品名称：" prop="productName">
          <div class="product-detail-item">
            <Input
              type="textarea"
              style="width: 320px;"
              v-model.trim="productData.productName"
              :maxlength="50"
              placeholder="请输入商品名称"
            />
            <span class="textarea-num">{{productData.productName.length}}/50</span>
          </div>
        </FormItem>
        <FormItem label="商品图：" prop="pruductImage">
          <div class="product-detail-item">
            <more-message text="推荐上传尺寸800*800以上的jpg、png图片格式，每张图片大小限制2M以内，最多能上传6张！"></more-message>
            <image-dragable
              :class="{'has-error': imageIsError}"
              v-model="productData.pruductImage"
              :pictureNumber="6"
            ></image-dragable>
          </div>
        </FormItem>
        <FormItem label="运费：" prop="freightTemplate">
          <div class="product-detail-item">
            <RadioGroup v-model="productData.productFreight">
              <Radio label="0">免运费</Radio>
              <Radio label="1">买家承担运费</Radio>
            </RadioGroup>
            <div
              class="product-detail-newsline"
              style="margin-top: 10px;margin-bottom: 6px;"
              v-show="productData.productFreight === '1'"
            >
              <Select
                v-model="productData.freightTemplate"
                class="common-input-text-160"
                placeholder="选择运费模版"
                not-found-text
              >
                <Option
                  v-for="item in freightTemplateList"
                  :productData="item.id"
                  :value="item.id"
                  :key="item.id"
                >{{item.template_name}}</Option>
              </Select>
              <Button
                type="primary"
                style="margin-left: 6px;height: 32px;"
                @click="$router.push({name: 'settingLogisticsList'})"
              >新增</Button>
            </div>
          </div>
        </FormItem>
        <FormItem label="销售价：" prop="productPrice" style="margin-bottom: 30px;">
          <div class="product-detail-item">
            <Input
              class="common-input-text-160"
              v-model.trim="productData.productPrice"
              placeholder="请输入金额"
              :maxlength="7"
            />
          </div>
        </FormItem>
        <FormItem label="重量：" style="margin-bottom: 30px;">
          <div class="product-detail-item">
            <InputNumber
              class="common-input-text-160"
              v-model="productData.weight"
              :precision="3"
              :min="0"
              :max="9999999"
              placeholder="请输入重量"
            />
            <span style="font-size: 12px;vertical-align: middle;margin: 0 10px;">kg</span>
            <more-message text="当该商品选择了<按重量计算的运费模板>时，请填写商品重量！"></more-message>
          </div>
        </FormItem>
        <FormItem label="图文详情：" style="margin-bottom: 0;" prop="productDetail">
          <div class="product-detail-item">
            <ue-editor
              elmClass=".distributor-setting-detail-modal .ivu-modal-body"
              posTop="150px"
              ref="detailEditor"
              :setting="{initialFrameHeight: '300'}"
              :value="productData.productDetail"
            ></ue-editor>
          </div>
        </FormItem>
      </Form>
    </Modal>
  </div>
</template>

<script>
import imageDragable from "@/views/shop/components/image-select/image-select-dragable.vue";
import ueEditor from "@/views/shop/components/editor/editor.vue";
import { getImageData } from "@/views/shop/utils/utils.js";
import moreMessage from "@/views/shop/components/more-message/more-message.vue";
export default {
  components: {
    imageDragable,
    ueEditor,
    moreMessage
  },
  props: {
    value: {
      type: Boolean,
      required: true
    },
    productInfo: {
      type: Object
    },
    freightTemplateList: {
      type: Array,
      default: []
    }
  },
  data() {
    return {
      modalStatus: false,
      modelLoading: true, // 设置弹窗loading
      imageIsError: false,
      productData: {
        productName: "",
        pruductImage: [],
        productPrice: "",
        weight: null,
        productFreight: "0",
        freightTemplate: "0",
        productDetail: ""
      },
      ruleValidate: {
        productName: [
          {
            required: true,
            trigger: "blur",
            message: "请输入商品名称"
          }
        ],
        // 运费模板
        freightTemplate: [
          {
            required: true,
            validator: (rule, value, callback) => {
              if (this.productData.productFreight === "1" && value === "0") {
                return callback(new Error("请选择运费模板"));
              }
              return callback();
            }
          }
        ],
        // 销售价
        productPrice: [
          {
            required: true,
            validator: (rule, value, callback) => {
              if (Number(value.toString().trim()) > 0) {
                let point = value.toString().split(".")[1];
                if (point && point.length > 2) {
                  return callback(new Error("最多两位小数"));
                }
                return callback();
              }
              return callback(new Error("请输入金额"));
            },
            trigger: "blur"
          }
        ],
        // 图片
        pruductImage: [
          {
            required: true,
            validator: (rule, value, callback) => {
              if (value.length) {
                this.imageIsError = false;
                return callback();
              }
              this.imageIsError = true;
              return callback(new Error("请选择商品图片"));
            }
          }
        ]
      }
    };
  },
  watch: {
    value(val) {
      if (val !== this.modalStatus) {
        this.modalStatus = val;
        // 清除验证提示
        this.$refs["formValidate"].fields.forEach(item => {
          item.validateState = "";
          item.validateMessage = "";
          item.validateDisabled = true;
        });
        // 当打开弹窗时获取产品信息显示
        if (this.modalStatus) {
          this.getProductInfo(this.productInfo);
        }
      }
    },
    modalStatus(val) {
      if (val !== this.value) {
        this.$emit("input", val);
      }
    }
  },
  methods: {
    onComfrimClick() {
      // 阻止弹窗关闭
      this.modelLoading = false;

      let validFlag = true;
      this.$refs["formValidate"].validate(valid => {
        validFlag = valid;
      });
      if (validFlag) {
        // 触发弹窗关闭
        this.$emit("input", false);
        let data = {
          id: this.productData.id || "",
          name: this.productData.productName,
          small_images: this.productData.pruductImage.map(
            item =>
              typeof item === "string"
                ? item.replace(this.$store.state.siteComdataPath, "")
                : item
          ),
          price: this.productData.productPrice,
          productFreight: this.productData.productFreight,
          freight_id: this.productData.freightTemplate,
          weight: this.productData.weight,
          detail: this.$refs["detailEditor"].getCurrContent()
        };
        // 获取第一个图片，判断图片是否是对象，转码只用于展示，上传只需要用到small_images
        if (
          Array.isArray(this.productData.pruductImage) &&
          this.productData.pruductImage.length
        ) {
          data.image = [];
          this.productData.pruductImage.forEach(item => {
            if (typeof item === "object") {
              getImageData([item], file => {
                data.image.push(file);
              });
            } else {
              data.image.push(item);
            }
          });
        }
        this.$emit("onModalProductData", data);
      }
      // 恢复loading初始状态
      this.$nextTick(() => {
        this.modelLoading = true;
      });
    },
    /**
     * 获取产品信息显示
     */
    getProductInfo(val) {
      let info = val || {};
      let pruductImage = [];
      if (Array.isArray(info.small_images)) {
        pruductImage = info.small_images.map(
          item =>
            typeof item === "string"
              ? this.$store.state.siteComdataPath + item
              : item
        );
      } else if (info.small_images) {
        pruductImage = info.small_images
          .split(",")
          .map(item => this.$store.state.siteComdataPath + item);
      }
      this.productData = {
        id: info.id || "",
        productName: info.name || "",
        pruductImage: pruductImage,
        productPrice: info.price || "",
        productFreight:
          (info.freight_id &&
            (info.freight_id.toString() === "0" ? "0" : "1")) ||
          "0",
        weight: info.weight || (info.weight === 0 ? 0 : null),
        freightTemplate: info.freight_id || "0",
        productDetail: info.detail || ""
      };
      this.$nextTick(() => {
        this.$refs["detailEditor"].setCurrContent(this.productData.productDetail);
      });
    }
  }
};
</script>

<style lang="less" scoped>
.distributor-setting-detail-modal {
  /deep/.ivu-modal-wrap {
    .ivu-modal-body {
      padding: 30px;
      height: 500px;
      overflow-y: auto;

      .ivu-radio-wrapper {
        margin-right: 27px;
      }

      .ivu-form {
        .ivu-form-item{
          .ivu-form-item-label{
            padding: 9px 12px 9px 0;
          }
          .ivu-form-item-content{
            .product-detail-item{
              font-size: 0;
              .ivu-radio-group{
                font-size: 0;
              }
            }
          }
        }
      }
    }
  }
  // 文本框数字下标
  span.textarea-num {
    font-size: 12px;
    color: #999999;
    margin-left: 10px;
    vertical-align: bottom;
    position: relative;
    bottom: -10px;
  }
}
</style>
