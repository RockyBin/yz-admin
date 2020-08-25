<template>
  <Modal
    v-model="ShowModal"
    :title="'余额充值/扣减'"
    width="400"
    :mask-closable="false"
    class="member-rechange-modal"
  >
    <Form
      ref="formItem"
      :model="changeData"
      :rules="ruleCustom"
      :label-width="94"
      style="text-align:left;"
    >
      <div v-if="memberInfo&&memberInfo.mobile=='--'" class="member-rechange-modal-mobiletip">
        <Icon type="md-alert" />
        <span>该会员还没有绑定手机号，为了资金安全，请绑定手机号后再充值</span>
      </div>
      <verticalLineTitlebar title="会员信息" class="verticaltitle" />
      <div
        v-if="memberInfo"
        style="display:flex;align-items:center;width: 303px;height:76px;border-radius: 5px;border: solid 1px #dcdee2;margin-left:13px;padding: 14px;"
      >
        <div
          style="margin-right: 14px;"
        >
          <img
            style="height: 40px;width: 40px;display: block;border-radius: 5px;"
            :src="memberInfo.headurl ? getHeadImg(memberInfo.headurl) : require('../../images/head-portrait.png')"
          />
        </div>
        <div
          style="line-height: 1.5;width: calc(100% - 74px);"
        >
          <span>
            <div
              style="overflow: hidden;text-overflow: ellipsis;white-space: nowrap;font-size: 13px;color: #657180;"
            >
              {{ memberInfo.nickname }}
            </div>
            <div style="color: #9ea7b4;">
              姓名：{{ memberInfo.name || "--" }}
            </div>
            <div style="color: #9ea7b4;">手机：{{ memberInfo.mobile }}</div>
            <div style="color: #9ea7b4;">ID：{{ memberInfo.id }}</div>
          </span>
        </div>
      </div>
      <div style="padding-left: 15px;margin-top: 12px;">
        <Button @click="selectBtnClick" type="primary">{{memberInfo?'重新选择':'选择'}}</Button>
      </div>
      <verticalLineTitlebar
        :title="'余额变化'"
        class="verticaltitle"
        style="margin-top:20px"
      />
      <FormItem label="财务方向：" prop="financialDirection" style="height:32px;margin-bottom:20px">
        <RadioGroup v-model="changeData.financialDirection">
          <Radio :label="1">充值</Radio>
          <Radio :label="0">扣减</Radio>
        </RadioGroup>
      </FormItem>
      <FormItem
        label="金额："
        prop="rechangeMoney"
        class="margin-bottom-form margin-bottom-form-money"
        style="height:32px;margin-bottom:30px"
      >
        <InputNumber
          :placeholder="moneyPlaceholder"
          :precision="2"
          :min="0"
          :max="changeData.financialDirection === 0 && memberInfo ? Number(memberInfo.balance) : 9999999"
          v-model="changeData.rechangeMoney"
          class="common-input-text common-input-text-210"
        ></InputNumber>
        <label class="money-symbol">￥</label>
      </FormItem>
      <FormItem label="备注：" prop="about" class="about">
        <Input
          v-model="changeData.about"
          type="textarea"
          :maxlength="40"
          placeholder="请输入备注"
          class="input-textarea"
        />
        <span class="suffix">{{changeData.about.length}}/40</span>
      </FormItem>
    </Form>
    <div slot="footer">
      <Button type="text" @click="onCancelClick">取消</Button>
      <Button :disabled="memberInfo&&memberInfo.mobile=='--'?true:false" :class="{'ivu-btn-primary-disabled':memberInfo&&memberInfo.mobile=='--'}" type="primary" :loading="loading" @click="onConfirmClick">确定</Button>
    </div>
  </Modal>
</template>
<script>
import verticalLineTitlebar from "COMPONENTS/titlebar/vertical-line-titlebar";
import constants from "@/views/shop/components/constants.js";
const changeData = {
  financialDirection: 1,
  rechangeMoney: null,
  about: ""
};
export default {
  /**
   * type params: true为积分, false为余额
   */
  props: ["value", "memberInfo"],
  components: {
    verticalLineTitlebar
  },
  inject: ["target"],
  data() {
    return {
      ShowModal: false,
      loading: false,
      changeData: Object.assign({}, changeData),
      ruleCustom: {
        rechangeMoney: [
          {
            validator: (rule, value, callback) => {
              if (!this.type && !value) {
                callback(new Error("请输入金额"));
              } else {
                callback();
              }
            },
            trigger: "blur",
            required: true
          }
        ],
      }
    };
  },
  computed: {
    moneyPlaceholder() {
      if (this.changeData.financialDirection == 0 && this.memberInfo) {
        if (this.memberInfo.balance) {
          return "最多只能扣减 ¥" + this.memberInfo.balance;
        } else {
          return "无余额可扣减";
        }
      } else {
        return "请输入金额";
      }
    }
  },
  watch: {
    ShowModal(val) {
      this.$emit("input", val);
      if (val) {
        this.resetData()
      }
    },
    value(val) {
      this.ShowModal = val;
    },
  },
  methods: {
    getHeadImg(url) {
      if (!/^(http)/i.test(url)) {
        url = this.$store.state.siteComdataPath + url;
      }
      return url;
    },
    selectBtnClick() {
      this.$emit("selectBtnClick")
    },
    onCancelClick(){
      this.ShowModal = false;
    },
    // 确认
    onConfirmClick() {
      if(!this.memberInfo) {
        this.$Message.error("请选择会员");
        return this.resetLoading();
      }
      this.$refs["formItem"].validate(valid => {
        if (valid) {
          this.changeBalanceData();
        } else {
          this.resetLoading();
          if (this.changeData.financialDirection == 1) {
            this.$Message.error("充值失败");
          } else {
            this.$Message.error("扣减失败");
          }
        }
      });
    },
    resetData() {
      this.changeData = Object.assign({}, changeData);
      this.$refs["formItem"].resetFields();
    },
    resetLoading() {
      this.loading = true;
      this.$nextTick(() => {
        this.loading = false;
      });
    },
    changeBalanceData() {
      this.loading = true;
      this.$httpPost(
        "/shop/admin/finance/rechange",
        {
          rechange_money: this.changeData.rechangeMoney,
          about: this.changeData.about,
          member_id: this.memberInfo.id,
          financial_direction: this.changeData.financialDirection
        },
        res => {
          this.loading = false;
          if (res.code === 200) {
            this.ShowModal = false;
            this.target.getBalanceList().finally(() => {
              if (this.changeData.financialDirection === 0) {
                this.$Message.success("扣减成功");
              } else {
                this.$Message.success("充值成功");
              }
            });
          } else {
            this.resetLoading();
            this.$Message.error(res.msg);
          }
        }
      );
    }
  }
};
</script>

<style lang="less" scoped>
@import "../../css/_color-val.less";
.member-rechange-modal {
  /deep/.ivu-modal-body {
    padding: 24px 24px 30px;
    .member-rechange-modal-mobiletip{
      border: 1px solid #FFD77A;
      background-color: #FFF9E6;
      padding: 8px 10px;
      box-shadow: 0px 2px 2px 0px rgba(0,0,0,0.16);
      margin-bottom: 10px;
      .ivu-icon{
        color: #FF9900;
        font-size: 16px;
        margin-right: 5px;
        vertical-align: text-top;
      }
      span{
        font-size: 12px;
        color: #464C5B;
      }
    }
    .margin-bottom-form {
      position: relative;
      .money-symbol {
        position: absolute;
        top: 3px;
        left: 8px;
      }
      &.margin-bottom-form-money .ivu-input-number-input {
        padding-left: 24px;
      }
    }
    .verticaltitle {
      font-size: 14px;
      margin-bottom: 20px;
    }
    .input-textarea {
      .ivu-input {
        height: 60px !important;
        font-size: 13px;
      }
    }
    .ivu-form-item {
      margin-bottom: 30px;
      &:last-child {
        margin-bottom: 0px;
      }
    }
    .is-show-error {
      .ivu-input {
        border-color: @error-color;
      }
      .ivu-input:hover {
        border-color: @error-color;
        transition: border 0.2s ease-in-out, box-shadow 0.2s ease-in-out,
          -webkit-box-shadow 0.2s ease-in-out;
      }
    }
    .about {
      position: relative;
      .suffix {
        position: absolute;
        bottom: -4px;
        right: 16px;
        font-size: 12px;
        color: #999999;
      }
    }
  }
  /deep/.ivu-modal-footer{
    .ivu-btn-primary-disabled{
      opacity: 0.5;
    }
  }
}
</style>

