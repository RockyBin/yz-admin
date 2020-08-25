<template>
  <div>
    <Modal
      title="新增充值/扣减记录"
      v-model="isShowNewRecord"
      width="490"
      class="marketing-integral-modal height-model add-height-model"
      :transition-names="['false']"
      :mask-closable="false"
      :class="{'have-data-modal': chooseMemberListData.id}"
    >
      <Form
        ref="formItem"
        :rules="ruleItem"
        :model="formItem"
        :label-width="84"
        style="text-align:left"
      >
      <verticalLineTitlebar title="会员信息" class="verticaltitle" style="float:left"/>
        <FormItem label="" prop="member">
          <div>
            <Button type="primary" v-if="chooseMemberListData.id" @click="chooseMember(1)">重新选择</Button>
            <Button type="primary" v-else @click="chooseMember(2)">选择会员</Button>
          </div>
          <div v-if="chooseMemberListData.id" class="member-news">
            <div class="member-info">
              <div class="head">
                <img :src="chooseImg(chooseMemberListData.headurl)">
              </div>
              <div class="info" style="flex:1">
                <div class="info-item">{{chooseMemberListData.nickname}}</div>
                <div class="info-item">姓名：{{chooseMemberListData.name || "--"}}</div>
                <div class="info-item">手机号：{{chooseMemberListData.mobile}}</div>
                <div class="info-item">ID：{{chooseMemberListData.id}}</div>
              </div>
            </div>
          </div>
        </FormItem>
        <verticalLineTitlebar title="积分变化" class="verticaltitle" style="margin-top:-4px;margin-bottom:10px;"/>
        <FormItem label="财务方向：" prop="bill">
          <RadioGroup v-model="formItem.bill" @on-change="changeRadio">
            <Radio v-for="item in radios" :key="item.val" :label="item.val">{{item.name}}</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem label="来源/用途：" prop="in_out_type">
          <Select v-model="formItem.in_out_type" class="common-input-text-260" transfer>
            <template v-for="item in terminalUse">
              <Option v-if="formItem.bill === 0" :value="item.val" :key="item.val">{{item.name}}</Option>
            </template>
            <template v-for="item in outTerminalUse">
              <Option v-if="formItem.bill === 1" :value="item.val" :key="item.val">{{item.name}}</Option>
            </template>
          </Select>
        </FormItem>
        <FormItem label="积分：" prop="point" class="margin-bottom-form">
          <InputNumber
            :min="1"
            :precision="0"
            v-model="formItem.point"
            class="common-input-text common-input-text-260"
            placeholder="请输入积分"
          ></InputNumber>
        </FormItem>
        <FormItem label="备注：" prop="about" class="about">
          <Input :maxlength="40" v-model="formItem.about" type="textarea" placeholder="请输入备注"/>
           <span class="suffix">{{formItem.about.length}}/40</span>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" @click="onChangeStatus">取消</Button>
        <Button type="primary" @click="onSuccessStatus">保存</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import constants from "@/views/shop/components/constants.js";
import verticalLineTitlebar from "COMPONENTS/titlebar/vertical-line-titlebar";
export default {
  props: ["value", "chooseMemberListData"],
  components: {
    verticalLineTitlebar
  },

  data() {
    return {
      isShowNewRecord: false,
      terminalRadios: constants.terminalSearch, // 终端来源
      terminalUse: constants.sourceArray, // 来源用途
      outTerminalUse: [
        {
          name: "其他",
          val: 0
        },
        {
          name: "订单抵扣",
          val: 11
        },
      ],
      formItem: {
        member: false,
        terminal_type: "",
        bill: 0,
        in_out_type: 0,
        point: null,
        about: "" // 备注
      },
      ruleItem: {
        point: {
          required: true,
          type: "number",
          message: "积分不能为空"
        }
      },
      radios: [
        {
          val: 0,
          name: "充值"
        },
        {
          val: 1,
          name: "扣减"
        }
      ]
    };
  },
  watch: {
    value: function(now) {
      this.isShowNewRecord = now;
      console.log(now);
      console.log(this.chooseMemberListData);
    },
    isShowNewRecord: function(now) {
        console.log(now);
      if (now) {
        this.$refs.formItem.resetFields();
        this.$emit("cancelAddMember");
      }
      this.$emit("input", now);
    }
  },
  created() {
    if(!this.hasLicensePerm("ENABLE_DISTRIBUTION")) {
      this.terminalUse = this.terminalUse.filter(item=>{
        return item.val != 9 && item.val !=10
      })
    }
  },
  methods: {
    chooseImg(headurl) {
      return headurl
        ? this.getHeadImg(headurl)
        : require("../../images/head-portrait.png");
    },
    getHeadImg(url) {
      if (!/^(http)/i.test(url)) {
        url = this.$store.state.siteComdataPath + url;
      }
      return url;
    },
    // 出入账发生改变
    changeRadio(val) {
      if (val === this.formItem.bill) {
        this.formItem.in_out_type = 0;
      }
    },
    //  确定
    onSuccessStatus() {
      this.$refs["formItem"].validate(valid => {
        if (valid) {
          if (!this.chooseMemberListData.id) {
            this.$Message.error("会员不能为空");
            return;
          }
          let addData = {};
          addData.about = this.formItem.about;
          addData.terminal_type = 5;// 5 代表是手工录用，在后台添加全部为手工录用
          addData.in_out_type = this.formItem.in_out_type;
          addData.member_id = this.chooseMemberListData.id;
          addData.point = this.formItem.point;
          if (this.formItem.bill === 1) {
            addData.point = Number("-" + this.formItem.point);
          }
          this.$emit("saveAddMember", addData);
        } else {
          return false;
        }
      });
    },
    // 取消
    onChangeStatus() {
      this.isShowNewRecord = false;
      this.$emit("cancelAddMember");
    },
    chooseMember(nums) {
      this.$emit("chooseMemberButton", nums);
    }
  },
  computed: {
    allTerminalRadios: function() {
      return this.terminalRadios.filter(function(terminal) {
        return terminal.id > 0;
      });
    }
  }
};
</script>
<style lang="less" scoped>
.marketing-integral-modal {
  /deep/.ivu-modal-body {
    // height: 442px;
    // overflow-y: auto;
    padding: 24px;
    .ivu-form-item-label {
      padding-right: 5px;
    }
    .ivu-form-item:last-child {
      margin-bottom: 0;
    }
    .ivu-radio-wrapper {
      margin-right: 20px;
      .ivu-radio{
        margin-right: 5px;
      }
    }
    textarea {
      min-height: 82px;
    }
    .verticaltitle {
      font-size: 13px;
    }
    .member-news {
      width: 260px;
      margin-top:10px;
      border-radius: 5px;
      border: solid 1px #dcdee2;
      font-size: 12px;
      position: relative;
      .member-info {
        display: flex;
        .head {
          display: flex;
          align-items: center;
          width: 62px;
          padding: 12px;
          img {
            display: block;
            width: 40px;
            height: 40px;
            object-fit: contain;
          }
        }
        .info {
          flex: 1;
          padding: 3px 0;
          .info-item {
            padding: 0;
            margin: 0;
            line-height: 20px;
            font-size: 13px;
            color: #657180;
            width: 180px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            &:nth-child(n + 2) {
              color: #9ea7b4;
              font-size: 12px;
            }
          }
        }
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
}
</style>
