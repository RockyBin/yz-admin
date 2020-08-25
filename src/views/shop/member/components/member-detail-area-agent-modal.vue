<template>
  <Modal
    class-name="areaAgent-modal"
    v-model="modalStatus"
    :title="title"
    @on-ok="submit"
    :loading="loading"
  >
    <Form ref="dataform" :label-width="80">
      <Form-item label="区域代理：" required>
        <div class="areaAgent-baseInfo">
          <div class="areaAgent-user-img">
            <img src="../../images/head-portrait.png" alt />
          </div>
          <div class="areaAgent-baseInfo-content">
            <p class="areaAgent-baseInfo-content-item">
              <span>昵称：</span>
              <span>我叫小小</span>
            </p>
            <p class="areaAgent-baseInfo-content-item">
              <span>姓名：</span>
              <span>马化腾</span>
            </p>
            <p class="areaAgent-baseInfo-content-item">
              <span>手机：</span>
              <span>18915631364</span>
            </p>
            <p class="areaAgent-baseInfo-content-item">
              <span>ID：</span>
              <span>6541658416985</span>
            </p>
          </div>
        </div>
      </Form-item>
      <Form-item label="代理区域：" required style="min-width:490px">
        <Form :inline="true" :rules="ruleValidate" v-model="areaAgentForm" ref="form">
          <Form-item class="areaAgent-identity">
            <i-select v-model="areaAgentForm.identity"  @on-change="handelIdentity">
              <i-option
                :value="item.value"
                v-for="item in identityList"
                :key="item.id"
              >{{item.label}}</i-option>
            </i-select>
          </Form-item>
          <Form-item prop="province">
            <i-select v-model="areaAgentForm.province" @on-change="setAreaCity" placeholder="请选择省份">
              <i-option
                :value="item.label"
                v-for="item in areaProvice"
                :key="item.ID"
              >{{item.label}}</i-option>
            </i-select>
          </Form-item>
          <Form-item prop="city" v-if="modalType == 3 || modalType == 2">
            <i-select v-model="areaAgentForm.city" @on-change="setAreaRegion" placeholder="请选择城市">
              <i-option :value="item.label" v-for="item in cityArray" :key="item.ID">{{item.label}}</i-option>
            </i-select>
          </Form-item>
          <Form-item style="margin-right:0px" prop="region" v-if="modalType == 3">
            <i-select v-model="areaAgentForm.region" placeholder="请选择县区">
              <i-option
                :value="item.label"
                v-for="item in regionArray"
                :key="item.ID"
              >{{item.label}}</i-option>
            </i-select>
          </Form-item>
        </Form>
      </Form-item>
    </Form>
  </Modal>
</template>

<script>
import cityDataThree from "@/views/shop/components/cityDataThree";
import { areaArray, cityArray } from "@/views/shop/components/areaData";
let areaProvice = areaArray(cityDataThree[0].provinceArr, 2);
export default {
  name: "modalAreaAgent",
  props: {
    title: {
      type: String,
      default: "修改区域代理商"
    }
  },
  data() {
    const provinceCheck = (rule, value, callback) => {//校验省份
      if (!this.areaAgentForm.province) {
        return callback(new Error("请选择省份"));
      } else{
         return  callback();
      }
    };
    const cityCheck = (rule,value,callback) => {//校验城市
        if ((this.modalType == 3 || this.modalType == 2) &&!this.areaAgentForm.city) {
           return callback(new Error("请选择城市"));
      } else{
        return callback()
      }
    }
    const regionCheck = (rule,value,callback) => {//校验县区
       if (this.modalType == 3 && !this.areaAgentForm.region) {
         return callback(new Error("请选择县区"));
      }else{
        return callback()
      }
    }
    return {
      areaAgentForm: {
        //表单数据
        identity: 1,
        city: "",
        province: "",
        region: ""
      },
      identityList: [
        //代理身份列表
        { id: 1, label: "省代", value: 1 },
        { id: 2, label: "市代", value: 2 },
        { id: 3, label: "区代", value: 3 }
      ],
      loading: true,
      modalStatus: false,
      areaProvice: areaProvice, //省份数据
      cityArray: [], //城市数据
      regionArray: [], //县区数据
      modalType: "", //弹框的判断 1.省代 2.市代 3.区代
      ruleValidate: {
        province: [{ validator: provinceCheck, trigger: "change" }],
        city: [{ validator: cityCheck, trigger: "change" }],
        region: [{ validator: regionCheck, trigger: "change" }]
      }
    };
  },
  methods: {
    submit() {//表单提交
      this.$refs["form"].validate(validate => {
        if (validate) {
          this.modalStatus = false;
          this.$emit("on-changeInfo", this.areaAgentForm);
          this.$Message.info("点击了确定");
        } else {
        }
      });
      this.$nextTick(() => (this.loading = true));
      this.loading = false;
    },
    handelIdentity(value) {//处理代理身份
      this.modalType = value;
    },
    setAreaCity(value) { //省份地区的城市筛选
      this.cityArray = [];
      this.regionArray = [];
      this.areaAgentForm.city = "";
      this.areaAgentForm.region = "";
      this.cityArray = cityArray(this.areaProvice, value);
    },
    setAreaRegion(value) { //城市地区的县区筛选
      if (!value) return;
      this.regionArray = [];
      this.areaAgentForm.region = "";
      if (this.cityArray && this.cityArray.length)
        this.regionArray = cityArray(this.cityArray, value);
    },
    create(type) { //显示区域代理商弹框方法
      this.loading = true;
      this.modalStatus = true;
      this.modalType = type;
      this.areaAgentForm.identity = type
    }
  }
};
</script>

<style lang="less" scoped>
/deep/ .areaAgent-modal {
  display: flex;
  align-items: center;
  justify-content: center;
  /deep/.ivu-modal {
    top: 0;
  }
  .areaAgent-baseInfo {
    display: flex;
    align-items: center;
    width: 289px;
    height: 80px;
    border: 1px solid #dcdee2;
    border-radius: 5px;
    .areaAgent-user-img {
      width: 40px;
      height: 43px;
      margin: 0 14px;
      border: 1px solid #dcdee2;
      & > img {
        display: block;
        width: 100%;
        height: 100%;
        border-radius: 4px;
      }
    }
    .areaAgent-baseInfo-content {
      font-size: 12px;
      color: #657180;
      &-item {
        line-height: 16px;
        color: #9ea4b1;
        &:first-child {
          color: #657180;
        }
        & > span:first-child {
          margin-right: 5px;
        }
      }
    }
  }

  /deep/ .ivu-select {
    width: 100px;
  }
}
.areaAgent-identity {
  /deep/.ivu-select {
    width: 80px;
  }
}
</style>