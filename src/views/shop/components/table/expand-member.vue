<template>
  <div>
    <template v-for="(item, index) in saveDetails">
      <div :key="index" class="member-expand">
        <div class="details-container">
          <img
            :src="item.headurl ? getHeadImg(item.headurl) : require('../../images/head-portrait.png')"
          >
          <div>
            <!-- <label>会员昵称：</label> -->
            <label v-if="!isShowInput[index].nickname">{{ item.nickname }}</label>
            <div v-else class="nickname">
              <Input
                v-model="changeData[index].nickname"
                style="width: auto"
                @on-blur="onBlurData"
              />
            </div>
            <a
              href="javascript:void(0)"
              v-if="!isShowInput[index].nickname"
              class="reset"
              @click="onResetData('nickname')"
              perm="member.operate"
            >修改昵称</a>
            <a href="javascript:void(0)" v-else class="reset" @click="onResetData('nickname')">确认</a>
          </div>
          <div>
            <label>手机号：</label>
            <label class="data-color">{{ item.mobile||"--" }}</label>
            <!-- <label class="data-color" v-if="!isShowInput[index].mobile">{{ item.mobile }}</label>
            <Input v-else v-model="changeData[index].mobile" class="mobile" style="width: auto" @on-blur="onBlurData"/>
            <a href="javascript:void(0)" v-if="!isShowInput[index].mobile" class="reset" @click="onResetData('mobile')">修改</a>
            <a href="javascript:void(0)" v-else class="reset" @click="onResetData('mobile', changeData[index].mobile)">确认</a>-->
          </div>
          <div>
            <label>ID：</label>
            <label class="data-color">{{ item.id||"--" }}</label>
          </div>
          <div>
            <label>推荐人：</label>
            <label class="data-color">{{ item.invite_nickname||"总店" }}</label>
          </div>
        </div>
        <div class="details-container">
          <div class="font-size-13">会员信息：</div>
          <div>
            <label>会员等级：</label>
            <label
              class="data-color"
              v-if="!isShowInput[index].level"
            >{{ matchName(item.level, memberLevelList) }}</label>
            <Select
              v-else
              v-model="changeData[index].level"
              style="width:160px"
              @on-change="onBlurData"
            >
              <template v-for="item in memberLevelList">
                <Option :value="item.id" :key="item.id" v-if="item.status === 1">{{ item.name }}</Option>
              </template>
            </Select>
            <a
              href="javascript:void(0)"
              class="reset"
              v-if="!isShowInput[index].level"
              @click="onResetData('level')"
              perm="member.operate"
            >修改</a>
            <a href="javascript:void(0)" v-else class="reset" @click="onResetData('level')">确认</a>
          </div>
          <div>
            <label>会员状态：</label>
            <label class="data-color">{{ item.status?"正常":"封号" }}</label>
          </div>
          <div>
            <label>注册时间：</label>
            <label class="data-color">{{ item.created_at||"--" }}</label>
          </div>
          <div>
            <label>终端来源：</label>
            <label
              class="data-color"
            >{{ matchValue(item.terminal_type, constants.terminalTypes)||"--" }}</label>
          </div>
          <div>
            <label>绑定微信：</label>
            <label class="data-color">{{ item.bind_weixin||"--" }}</label>
          </div>
          <div>
            <label>所在城市：</label>
            <label
              class="data-color"
              v-if="!isShowInput[index].place"
            >{{ (item.prov_text+item.city_text+item.area_text)||'--' }}</label>
            <Cascader
              v-else
              :data="cityDataThree[0].provinceArr"
              v-model="changeData[index].place"
              @on-change="onBlurData"
            ></Cascader>
            <a
              href="javascript:void(0)"
              v-if="!isShowInput[index].place"
              class="reset"
              @click="onResetData('place')"
              perm="member.operate"
            >修改</a>
            <a href="javascript:void(0)" v-else class="reset" @click="onResetData('place')">确认</a>
          </div>
          <div>
            <label>性别：</label>
            <label class="data-color">{{ matchValue(item.sex, sexData)||"--" }}</label>
            <Select
              v-if="isShowInput[index].sex"
              v-model="changeData[index].sex"
              style="width:160px"
              @on-change="onBlurData"
            >
              <Option v-for="item in sexData" :value="item.id" :key="item.id">{{ item.value }}</Option>
            </Select>
            <a
              href="javascript:void(0)"
              v-if="!isShowInput[index].sex"
              class="reset"
              @click="onResetData('sex')"
              perm="member.operate"
            >修改</a>
            <a href="javascript:void(0)" v-else class="reset" @click="onResetData('sex')">确认</a>
          </div>
          <div>
            <label>年龄：</label>
            <label class="data-color" v-if="!isShowInput[index].age">{{ item.age||"--" }}</label>
            <Input
              v-else
              v-model="changeData[index].age"
              style="width: auto"
              @on-blur="onBlurData"
            />
            <a
              href="javascript:void(0)"
              v-if="!isShowInput[index].age"
              class="reset"
              @click="onResetData('age')"
              perm="member.operate"
            >修改</a>
            <a href="javascript:void(0)" v-else class="reset" @click="onResetData('age')">确认</a>
          </div>
        </div>
        <div class="details-container">
          <div style="margin-bottom:16px;" class="font-size-13">余额情况：</div>
          <div class="integral-status-margin">
            <div>
              <label>当前可用余额：</label>
              <label class="data-color">￥{{ Number(item.balance).toFixed(2) }}</label>
            </div>
            <div>
              <label>提现中余额：</label>
              <label class="data-color">￥{{ Number(item.balance_blocked).toFixed(2) }}</label>
            </div>
            <div>
              <label>累计充值金额：</label>
              <label class="data-color">￥{{ Number(item.balance_history).toFixed(2) }}</label>
            </div>
            <div>
                <a href="javascript:void(0)" style="cursor:pointer" @click="showModal()" perm="finance.operate">充值/扣减</a>
            </div>
          </div>
          <div class="integral-status font-size-13">交易情况：</div>
          <div>
            <label>付款：</label>
            <label class="data-color">{{ item.buy_times+"次/￥"+Number(item.buy_money).toFixed(2) }}</label>
          </div>
          <div>
            <label>成交：</label>
            <label class="data-color">{{ item.deal_times+"次/￥"+Number(item.deal_money).toFixed(2) }}</label>
          </div>
        </div>
        <div class="details-container">
          <!-- <div class="account font-size-13">账号安全：</div>
          <div class="login">
            <label>登录密码：</label>
            <label class="data-color">******</label>
            <label v-if="!isShowInput[index].password">******</label>
            <Input v-else v-model="changePassword" style="width: auto" @on-blur="onBlurPassword"/>
            <a href="javascript:void(0)" class="reset" @click="onResetData('password')">修改</a>
          </div>-->
          <div style="margin-top:0" class="font-size-13 integral-status">积分情况：</div>
          <div class="integral-status-margin">
            <div>
              <label>当前可用积分：</label>
              <label class="data-color">{{ item.point }}</label>
            </div>
            <div>
              <label>当前冻结积分：</label>
              <label class="data-color">{{ item.point_blocked }}</label>
            </div>
            <div>
              <label>累计消费积分：</label>
              <label class="data-color">{{ item.point_consume }}</label>
            </div>
            <div>
              <label>累计获取积分：</label>
              <label class="data-color">{{ item.point_history }}</label>
            </div>
          </div>
        </div>
      </div>
      <rechangeModal :isShowModal="isShowModal" :formItem="formItem" @cancelButton="cancelButton" @confrimButton="confrimButton" :memberInfo="changeData[index]"></rechangeModal>
    </template>
  </div>
</template>
<script>
import cityDataThree from "../cityDataThree.js";
import rechangeModal from "@/views/shop/member/components/member-rechange-model.vue";
import constants from "@/views/shop/components/constants.js";
export default {
  components: {
    rechangeModal
  },
  props: {
    rowIndex: {
      type: Number,
      default() {
        return 0;
      }
    },
    changeData: {
      type: Array,
      default() {
        return [];
      }
    },
    saveDetails: {
      type: Array,
      default() {
        return [];
      }
    },
    memberLevelList: {
      type: Array,
      default() {
        return [];
      }
    },
    place: {
      type: Array,
      default() {
        return [];
      }
    },
    resetData: {
      type: Object,
      default() {
        return {};
      }
    },
    isShowInput: {
      type: Array,
      default() {
        return [];
      }
    },
    password: {
      type: String,
      default: ""
    }
  },
  watch: {
    place(val) {
      this.places = val;
    },
    password(val) {
      this.changePassword = val;
    }
  },
  data() {
    return {
      isShowModal: false, // 控制充值弹窗
      formItem: {
        rechangeMoney: null, // 充值金额
        about: "", // 备注
        financialDirection: 1 //财务方向
      },
      changeDetailData: [],
      constants,
      places: [],
      cityDataThree,
      changePassword: "",
      resetObj: {},
      sexData: [
        {
          id: 0,
          value: "保密"
        },
        {
          id: 1,
          value: "男"
        },
        {
          id: 2,
          value: "女"
        }
      ]
    };
  },
  methods: {
    showModal() {
      this.isShowModal = true;
    },
    cancelButton() {
      this.isShowModal = false;
    },
    getHeadImg(url) {
      if (!/^(http)/i.test(url)) {
        url = this.$store.state.siteComdataPath + url;
      }
      return url;
    },
    // 匹配名称
    matchName(val, data) {
      let name = "";
      data.forEach(item => {
        if (item.id === val) {
          name = item.name;
        } else if (val === 0) {
          name = "--";
        }
      });
      return name;
    },
    matchValue(val, data) {
      let name = "";
      data.forEach(item => {
        if (item.id === val) {
          name = item.value;
        }
      });
      return name;
    },
    onBlurData() {
      this.$emit("passBlurData", this.changeData);
    },
    // 修改密码
    onBlurPassword() {
      let passwordObj = {};
      passwordObj.id = this.resetData.id;
      passwordObj.password = this.changePassword;
      this.$emit("passwordBlurData", passwordObj);
    },
    // 点击修改显示input
    onResetData(name, num) {
      if (name === "mobile" && num) {
        if (!/^1[0-9]\d{9}$/.test(num)) {
          return;
        }
      }
      let index = this.rowIndex;
      this.$emit("resetInputData", { name, index });
    },
    confrimButton(val) {
      this.formItem.member_id = this.changeData[0].id;
      this.formItem.balanceStatus = val;
      this.isShowModal = false;
      this.$emit("rechange", this.formItem);
      this.formItem = {
        rechangeMoney: null, // 充值金额
        about: "", // 备注
        financialDirection: 1 //财务方向
      };
    }
  }
};
</script>

<style lang="less" scoped>
.member-expand {
  padding: 0 40px;
}
.font-size-13 {
  font-size: 13px;
}
label {
  color: #657180;
}
.data-color {
  color: #657180;
}
.details-container:first-child {
  width: 210px;
  vertical-align: top;
  .nickname {
    display: inline-block;
    /deep/input {
      width: 100px;
    }
  }
  img {
    width: 80px;
    height: 80px;
    border-radius: 5px;
  }
  & > div {
    margin-top: 8px;
  }
}
.details-container:nth-child(2) {
  position: relative;
  width: calc(((100% - 210px) / 3) + 40px);
  padding-right: 30px;
  padding-left: 30px;
  height: 205px;
  border-left: 1px dashed #d1d1d1;
  border-right: 1px dashed #d1d1d1;
  /deep/.ivu-cascader {
    display: inline-block;
    .ivu-cascader-arrow {
      left: 142px;
    }
  }
  div:first-child {
    margin-bottom: 16px;
  }
  div:not(:first-child) {
    margin-bottom: 4px;
  }
}
.details-container:nth-child(3) {
  width: calc(((100% - 210px) / 3) - 20px);
  vertical-align: top;
  height: 205px;
  padding-left: 30px;
  padding-right: 30px;
  border-right: 1px dashed #d1d1d1;
  .account {
    margin-bottom: 16px;
  }
  .login {
    margin-bottom: 4px;
  }
}
.details-container:last-child {
  padding-left: 30px;
  width: calc(((100% - 210px) / 3) - 20px);
  vertical-align: top;
  .make-bargain {
    margin-bottom: 16px;
  }
  div:nth-child(2) {
    margin-bottom: 4px;
  }
}
.details-container {
  display: inline-block;
  margin-top: 20px;
  text-align: left;
  /deep/input {
    display: inline-block;
    width: 160px;
    height: 20px;
    background-color: #ffffff;
    border-radius: 2px;
    border: solid 1px #dcdee2;
  }
  /deep/.ivu-select-single .ivu-select-selection {
    height: 22px;
    .ivu-select-placeholder {
      height: 22px;
      line-height: 22px;
    }
    .ivu-select-selected-value {
      height: 22px;
      line-height: 22px;
    }
  }
}
.integral-status {
  margin: 18px 0 16px 0;
}
.integral-status-margin {
  div {
    margin-bottom: 4px;
  }
}
.reset {
  margin-left: 12px;
  cursor: pointer;
}
</style>
