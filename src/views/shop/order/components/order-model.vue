<template>
  <Modal v-model="ShowModal" class="modal" :title="title" width="440" :mask-closable="false">
    <Form
      ref="formItem"
      :model="formItem"
      :rules="ruleCustom"
      :label-width="103"
      style="text-align:left;"
    >
      <FormItem class="verify-label" label="审核：" prop="refundStatus">
        <RadioGroup v-model="formItem.refundStatus">
          <Radio :label="1" class="common-mr-24">通过</Radio>
          <Radio :label="2">不通过</Radio>
        </RadioGroup>
      </FormItem>
      <div v-if="(formItem.refundStatus === 1 && (status==1 || status == 6))">
        <FormItem label="实际退款金额：" prop="refundAmount" class="margin-bottom-form">
          <InputNumber
            :precision="2"
            :min="0"
            v-model="formItem.refundAmount"
            class="common-input-text"
          ></InputNumber>
          <label>￥</label>
        </FormItem>
      </div>
      <FormItem label="拒绝原因：" prop="about" v-if="formItem.refundStatus === 2">
        <Input
          v-model="formItem.about"
          type="textarea"
          placeholder="最多输入20个字"
          class="input-textarea"
          :class="{'is-show-error': isShowError}"
        />
      </FormItem>

      <div style="width:393px;background:#F5F6F7;padding:16px;margin-top:30px;border-radius:6px;">
        <div style="font-weight:bold;margin-bottom:12px;font-size:13px;line-height:14px">会员信息</div>
        <div style="width: 260px;border-radius: 5px;margin:0px 0 8px 0px;">
          <member-infor
            :id="detail.member_id"
            :headurl="
              detail.headurl
                ? getHeadImg(detail.headurl)
                : require('../../images/head-portrait.png')
            "
            :nickname="detail.nickname"
            :mobile="detail.mobile"
            :name="detail.name || '--'"
          ></member-infor>
        </div>
        <p class="line"></p>
        <div v-if="detail.after_sale_status==1 || detail.after_sale_status==6">
          <div class="after-sale-info">退款信息</div>
          <p class="after-sale-info-line-height">
            <span style="width:60px;display:inline-block">退款原因：</span>
            <span>{{commonFunction.matchName(isNaN(detail.reason)?detail.reason_status:detail.reason, this.afterSeleReason)}}</span>
          </p>
          <p class="after-sale-info-line-height">
            <span style="width:60px;">实付金额：</span>
            <span>￥{{amountPay}}</span>
          </p>
          <p class="after-sale-info-line-height">
            <span style="width:60px;">申请退款：</span>
            <span>￥{{detail.actual_amount}}</span>
          </p>
          <p class="after-sale-info-line-height">
            <span style="width:60px;">退款至：</span>
            <span>{{commonFunction.matchName(detail.pay_type, constants.payChannel)}}</span>
          </p>
        </div>
        <div v-else>
          <div class="after-sale-info" style="margin-bottom: 20px;">退货信息</div>
          <div v-for="(item,index) in productList" :key="index">
            <div style="width:357px;">
              <div style="width:100%;display:flex;">
                <img style="width:50px;height:50px;flex-shrink:0;" :src="$store.state.siteComdataPath+item.image" />
                <div
                  style="margin-left: 17px;"
                >
                  <span class="after-sale-info-product-name" style>{{item.name}}</span>
                  <!-- 此处暂时先做一下兼容处理 -->
                  <span v-if="item.sku_names" style="color:#9EA7B4">规格：{{item.sku_names}}</span>
                  <span v-if="item.sku_name" style="color:#9EA7B4">规格：{{item.sku_name}}</span>
                </div>
              </div>
              <div style="line-height:33px;margin-top:10px;">
                退货数量：
                <span v-if="item.refund_num">{{item.refund_num}}</span>
                <span v-else>{{item.after_sale_item_num}}</span>
              </div>
            </div>
          </div>
          <div
            class="after-sale-info-line-height"
          >退货原因： {{commonFunction.matchName(isNaN(detail.reason)?detail.reason_status:detail.reason, this.afterSeleReason)}}</div>
        </div>
      </div>
    </Form>
    <div slot="footer">
      <Button type="text" size="large" @click="onCancelButton">取消</Button>
      <Button type="primary" size="large" @click="onCorfimButton" :loading="buttonLoading">
        <label v-if="!buttonLoading">确定</label>
        <label
          v-if="(formItem.refundStatus === 1 && (status==1 || status == 6) && !buttonLoading)"
        >打款</label>
      </Button>
    </div>
  </Modal>
</template>
<script>
import constants from "@/views/shop/components/constants.js";
import commonFunction from "@/views/shop/components/common-function.js";
import memberInfor from "@/views/shop/components/table/member-infor.vue";
export default {
  components: {
    memberInfor
  },
  props: [
    "isShowModal",
    "formItem",
    "amountPay",
    "types",
    "status",
    "buttonLoading",
    "detail",
    "productList"
  ],
  data() {
    const validateMoney = (rule, value, callback) => {
      if (!value && value !== 0) {
        callback(new Error("请输入金额"));
      } else if (value > this.amountPay) {
        callback(new Error("不可输入比实付金额更大的金额"));
      } else {
        callback();
      }
    };
    return {
      constants,
      commonFunction,
      ShowModal: false,
      aboutContainer: "",
      isShowError: false,
      title: "审核",
      afterSeleReason: [
        {
          id: 0,
          value: "发错货/少件/空包/包装破损"
        },
        {
          id: 1,
          value: "商品质量问题"
        },
        {
          id: 2,
          value: "实物与商品描述不符"
        },
        {
          id: 3,
          value: "买卖双方协商一致"
        },
        {
          id: 4,
          value: "不喜欢/不想要"
        },
        {
          id: 5,
          value: "未按约定时间发货"
        },
        {
          id: 6,
          value: "快递/物流一直未送到"
        },
        {
          id: 7,
          value: "货物破损已拒签"
        },
        {
          id: 8,
          value: "产品质量存在问题"
        },
        {
          id: 9,
          value: "效果与描述不符"
        }
      ],
      ruleCustom: {
        refundAmount: [{ required: true, validator: validateMoney, trigger: "blur" }],
        about: [
          {
            validator(rule, value, callback) {
              if (value) {
                let maxLength = 20;
                let len = 0;
                let status = false;
                for (let i in value) {
                  // let nums =
                  //   value.charCodeAt(i) > 127 || value.charCodeAt(i) == 94
                  //     ? 2
                  //     : 1;
                  len += 1;
                  if (len > maxLength) {
                    status = true;
                    break;
                  }
                }
                if (status) {
                  callback(new Error("最多可输入20个字"));
                } else {
                  callback();
                }
              } else {
                callback(new Error("请输入拒绝原因"));
              }
            },
            required: true,
            trigger: "change"
          }
        ]
      }
    };
  },
  watch: {
    refundTextarea: {
      handler() {
        if (this.refundTextarea.length > 500) {
          this.refundTextarea = this.refundTextarea.substring(0, 500);
        }
      },
      deep: true
    },
    ShowModal(val) {
      if (!val && this.isShowModal) {
        this.$emit("cancelButton");
      }
    },
    isShowModal(val) {
      this.$refs["formItem"].resetFields();
      this.formItem.refundAmount = Number(this.amountPay);
      if (
        this.formItem.refundStatus === 1 &&
        (this.status == 1 || this.status == 6)
      ) {
        this.title = "审核退款";
      } else {
        this.title = "审核退货";
      }
      this.ShowModal = val;
    }
  },
  methods: {
    getHeadImg(url) {
      if (!/^(http)/i.test(url)) {
        url = this.$store.state.siteComdataPath + url;
      }
      return url;
    },
    // 确认
    onCorfimButton() {
      this.$refs["formItem"].validate(valid => {
        if (valid) {
          this.$emit("confrimButton");
        } else {
          this.$Message.error("审核失败");
          return false;
        }
      });
    },
    // 取消
    onCancelButton() {
      this.$emit("cancelButton");
    }
  }
};
</script>

<style lang="less" scoped>
@import "../../css/_color-val.less";
.important-start {
  margin-right: 4px;
  position: absolute;
  line-height: 33px;
  font-size: 13px;
  color: #ed4014;
}

.margin-bottom-form {
  margin-bottom: 0px;
  position: relative;
  label {
    position: absolute;
    top: 2px;
    left: 10px;
  }
  /deep/.ivu-input-number-input {
    padding-left: 24px;
  }
}
.input-textarea {
  /deep/.ivu-input {
    height: 50px !important;
    font-size: 13px;
  }
}
.is-show-error {
  /deep/.ivu-input {
    border-color: @error-color;
  }
  /deep/.ivu-input:hover {
    border-color: @error-color;
    transition: border 0.2s ease-in-out, box-shadow 0.2s ease-in-out,
      -webkit-box-shadow 0.2s ease-in-out;
  }
}
.modal {
  /deep/.ivu-modal-body {
    max-height: 490px;
    overflow-x: auto;
  }
  .line {
    border-top: 1px solid #dcdee2;
    margin-bottom: 17px;
  }
  .after-sale-info-line-height {
    line-height: 32px;
  }
  .after-sale-info {
    margin-bottom: 10px;
    font-size: 13px;
    font-weight: bold;
    line-height: 14px;
  }
  .after-sale-info-product-name {
    line-height: 18px;
    margin-bottom: 5px;
    height: 33px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical
  }
  /deep/.ivu-modal {
    /deep/.ivu-modal-body {
      padding: 20px 24px 30px 24px;
    }
  }
  /deep/.ivu-form-item {
    margin-bottom: 10px;
  }
  .verify-label {
    /deep/.ivu-form-item-label {
      margin-left: 10px;
    }
  }
}
</style>

