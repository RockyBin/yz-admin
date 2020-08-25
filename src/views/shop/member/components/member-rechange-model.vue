<template>
  <Modal
    v-model="ShowModal"
    :title="type ? '积分充值/扣减' : '余额充值/扣减'"
    width="390"
    :mask-closable="false"
    class="member-rechange-modal"
    :loading="loading"
    @on-ok="onConfirmClick"
  >
    <Form
      ref="formItem"
      :model="changeData"
      :rules="ruleCustom"
      :label-width="94"
      style="text-align:left;"
    >
      <div v-if="!type&&memberInfo.mobile=='--'" class="member-rechange-modal-mobiletip">
        <Icon type="md-alert" />
        <span>该会员还没有绑定手机号，为了资金安全，请绑定手机号后再充值</span>
      </div>
      <verticalLineTitlebar title="会员信息" class="verticaltitle" />
      <div
        style="width: 260px;height: 84px;border-radius: 5px;border: solid 1px #dcdee2;margin-left:13px;"
      >
        <div
          style="float:left;position: relative;top: 50%;transform: translateY(-50%);margin: 0 17px 0 15px;"
        >
          <img
            style="height: 40px;width: 40px;display: block;border-radius: 5px;"
            :src="memberInfo.headurl ? getHeadImg(memberInfo.headurl) : require('../../images/head-portrait.png')"
          />
        </div>
        <div
          style="float:left;line-height: 1.5;position: relative;top: 50%;transform: translateY(-50%);width: calc(100% - 74px);"
        >
          <span>
            <div
              style="overflow: hidden;text-overflow: ellipsis;white-space: nowrap;font-size: 13px;color: #657180;"
            >{{memberInfo.nickname}}</div>
            <div style="color:#9ea7b4;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;">姓名：{{memberInfo.name || "--"}}</div>
            <div style="color:#9ea7b4;">手机：{{memberInfo.mobile}}</div>
            <div style="color:#9ea7b4;">ID：{{memberInfo.id}}</div>
          </span>
        </div>
      </div>
      <verticalLineTitlebar
        :title="type ? '积分变化' : '余额变化'"
        class="verticaltitle"
        style="margin-top:20px"
      />
      <FormItem label="财务方向：" prop="financialDirection" style="height:32px;margin-bottom:20px">
        <RadioGroup v-model="changeData.financialDirection">
          <Radio :label="1">充值</Radio>
          <Radio :label="0">扣减</Radio>
        </RadioGroup>
      </FormItem>
      <FormItem label="来源/用途：" prop="in_out_type" v-show="type">
        <Select v-model="changeData.in_out_type" class="common-input-text-210" v-if="type" transfer>
          <template v-for="item in terminalUse">
            <Option
              v-if="changeData.financialDirection === 1"
              :value="item.val"
              :key="item.val"
            >{{item.name}}</Option>
          </template>
          <template v-for="item in outTerminalUse">
            <Option
              v-if="changeData.financialDirection === 0"
              :value="item.val"
              :key="item.val"
            >{{item.name}}</Option>
          </template>
        </Select>
      </FormItem>
      <FormItem label="积分：" prop="point" class="margin-bottom-form" v-show="type">
        <InputNumber
          v-if="type"
          :min="0"
          :max="changeData.financialDirection === 0 ? Number(memberInfo.point) : 9999999999"
          :precision="0"
          v-model="changeData.point"
          class="common-input-text common-input-text-210"
          placeholder="请输入积分"
        ></InputNumber>
      </FormItem>
      <FormItem
        label="金额："
        prop="rechangeMoney"
        class="margin-bottom-form margin-bottom-form-money"
        style="height:32px;margin-bottom:30px"
        v-show="!type"
      >
        <InputNumber
          :placeholder="moneyPlaceholder"
          v-if="!type"
          :precision="2"
          :min="0"
          :max="changeData.financialDirection === 0 ? Number(memberInfo.balance) : 9999999"
          v-model="changeData.rechangeMoney"
          class="common-input-text common-input-text-210"
        ></InputNumber>
        <label>￥</label>
      </FormItem>
      <FormItem label="备注：" prop="about" class="about">
        <Input
          v-model="changeData.about"
          type="textarea"
          :maxlength="40"
          placeholder="请输入备注"
          class="input-textarea"
          :class="{'is-show-error': isShowError}"
        />
        <span class="suffix">{{changeData.about.length}}/40</span>
      </FormItem>
    </Form>
    <div slot="footer">
      <Button type="text" @click="onCancelClick">取消</Button>
      <Button :disabled="!type&&memberInfo.mobile=='--'?true:false" :class="{'ivu-btn-primary-disabled':!type&&memberInfo.mobile=='--'}" type="primary" :loading="loading" @click="onConfirmClick">确定</Button>
    </div>
  </Modal>
</template>
<script>
import verticalLineTitlebar from "COMPONENTS/titlebar/vertical-line-titlebar";
import constants from "@/views/shop/components/constants.js";
const changeData = {
  financialDirection: 1,
  rechangeMoney: null,
  point: null,
  in_out_type: null,
  about: ""
};
export default {
  /**
   * type params: true为积分, false为余额
   */
  props: ["value", "memberInfo", "type"],
  components: {
    verticalLineTitlebar
  },
  inject: ["target"],
  data() {
    return {
      moneyPlaceholder: "请输入金额",
      ShowModal: false,
      aboutContainer: "",
      isShowError: false,
      loading: false,
      changeData: Object.assign({}, changeData),
      terminalUse: constants.sourceArray, // 来源用途
      outTerminalUse: [
        {
          name: "其他",
          val: 0
        },
        {
          name: "订单抵扣",
          val: 11
        }
      ],
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
        point: [
          {
            validator: (rule, value, callback) => {
              if (this.type && !value) {
                callback(new Error("请输入积分"));
              } else {
                callback();
              }
            },
            trigger: "blur",
            required: true
          }
        ],
        in_out_type: [
          {
            validator: (rule, value, callback) => {
              if (this.type && value === null) {
                callback(new Error("请选择来源/用途"));
              } else {
                callback();
              }
            },
            trigger: "blur",
            required: true
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
      this.$emit("input", val);
      if (val) {
        this.changeData = Object.assign({}, changeData);
        this.$refs["formItem"].resetFields();
      }
    },
    value(val) {
      this.ShowModal = val;
      if(val) {
        this.loading = false;
      }
    },
    formItem: {
      handler(val) {
        if (val.financialDirection == 0) {
          if (this.memberInfo.balance == 0) {
            this.moneyPlaceholder = "无余额可扣减";
          } else {
            this.moneyPlaceholder = "最多只能扣减 ¥" + this.memberInfo.balance;
          }
        } else {
          this.moneyPlaceholder = "请输入金额";
        }
      },
      deep: true
    }
  },
  methods: {
    getHeadImg(url) {
      if (!/^(http)/i.test(url)) {
        url = this.$store.state.siteComdataPath + url;
      }
      return url;
    },
    //取消
    onCancelClick(){
      this.ShowModal = false;
    },
    // 确认
    onConfirmClick() {
      this.loading = true;
      this.$refs["formItem"].validate(valid => {
        if (valid) {
          if (this.type) {
            this.changePointData();
          } else {
            this.changeBalanceData();
          }
        } else {
          this.loading = false;
          if (this.changeData.financialDirection == 1) {
            this.$Message.error("充值失败");
          } else {
            this.$Message.error("扣减失败");
          }
        }
      });
    },
    resetLoading() {
      this.loading = true;
      this.$nextTick(() => {
        this.loading = false;
      });
    },
    changePointData() {
      this.$httpPost(
        "/shop/admin/point/add",
        {
          member_id: this.memberInfo.id,
          point: this.changeData.financialDirection ? this.changeData.point : - this.changeData.point,
          in_out_type: this.changeData.in_out_type,
          about: this.changeData.about,
          terminal_type :5// 5 代表是手工录用，在后台添加全部为手工录用
        },
        res => {
          if (res.code === 200) {
            this.target.getMemberInfo().finally(() => {
              this.ShowModal = false;
              if (this.changeData.financialDirection === 0) {
                this.$Message.success("扣减成功");
              } else {
                this.$Message.success("充值成功");
              }
            });
          } else {
            this.loading = false;
            this.$Message.error(res.msg);
          }
        }
      );
    },
    changeBalanceData() {
      this.$httpPost(
        "/shop/admin/finance/rechange",
        {
          rechange_money: this.changeData.rechangeMoney,
          about: this.changeData.about,
          member_id: this.memberInfo.id,
          financial_direction: this.changeData.financialDirection
        },
        res => {
          if (res.code === 200) {
            this.target.getMemberInfo().finally(() => {
              this.ShowModal = false;
              if (this.changeData.financialDirection === 0) {
                this.$Message.success("扣减成功");
              } else {
                this.$Message.success("充值成功");
              }
            });
          } else {
            this.loading = false;
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
      label {
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
      margin-bottom: 10px;
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

