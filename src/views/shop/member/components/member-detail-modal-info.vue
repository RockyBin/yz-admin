<template>
  <Modal
    class="member-detail-modal-info"
    v-model="modalStatus"
    title="修改个人信息"
    :width="501"
    :loading="loading"
    :mask-closable="false"
    @on-ok="onConfirmCLick"
  >
    <Form :model="dataInfo" :label-width="44" ref="form">
      <FormItem label="昵称：" prop="nickname">
        <i-input
          v-model="dataInfo.nickname"
          placeholder="请输入昵称"
          style="width: 273px;"
          :maxlength="16"
        >
          <span slot="suffix" style="line-height: 32px;margin-left: -20px;"
            >{{ dataInfo.nickname.length }}/16</span
          >
        </i-input>
      </FormItem>
      <FormItem label="姓名：" prop="nickname">
        <i-input
            v-model="dataInfo.name"
            placeholder="请输入姓名"
            style="width: 273px;"
            :maxlength="16"
        >
          <span slot="suffix" style="line-height: 32px;margin-left: -20px;"
          >{{ dataInfo.name.length }}/16</span
          >
        </i-input>
        <moreMessage style="margin-left: 10px;" :text="'姓名仅对商家内部员工可见'"></moreMessage>
      </FormItem>
      <FormItem label="性别：" prop="sex">
        <Select v-model="dataInfo.sex" style="width:185px;vertical-align: top;">
          <Option :value="0">保密</Option>
          <Option :value="1">男</Option>
          <Option :value="2">女</Option>
        </Select>
      </FormItem>
      <FormItem label="生日：" prop="birthday">
        <DatePicker
          type="date"
          placement="bottom"
          :options="dateOptions"
          v-model="dataInfo.birthday"
          placeholder="选择生日"
          style="width: 185px;"
        ></DatePicker>
      </FormItem>
      <FormItem label="城市：" prop="place">
        <Cascader
          transfer
          :data="provinceArr"
          v-model="dataInfo.place"
        ></Cascader>
      </FormItem>
      <FormItem label="备注：" prop="place">
        <div class="input-wrapper">
          <Input v-model="dataInfo.about" :maxlength="500" :rows="5" type="textarea" placeholder="可输入会员备注，仅限内部员工可见" />
          <span class="suffix">{{dataInfo.about?dataInfo.about.length:0}}/500</span>
        </div>
      </FormItem>
    </Form>
  </Modal>
</template>
<script>
import cityDataThree from "@/views/shop/components/cityDataThree.js";
import moreMessage from "@/views/shop/components/more-message/more-message.vue";
export default {
    components: {
        moreMessage,
    },
  props: {
    value: {
      type: Boolean,
      default: false
    },
    data: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  inject: ["target"],
  data() {
    return {
      modalStatus: false,
      provinceArr: [],
      dataInfo: {
        nickname: "",
          name:"",
        sex: "",
        birthday: "",
          about:"",
        place: []
      },
      dateOptions: {
        disabledDate(date) {
          return date && date.valueOf() > Date.now();
        }
      },
      loading: true
    };
  },
  watch: {
    value(val) {
      this.modalStatus = val;
      if (val) {
        this.dataInfo = {
          nickname: this.data.nickname || "",
            name: this.data.name || "",
            about: this.data.about || "",
          sex: this.data.sex,
          birthday: this.data.birthday || "",
          place:
            this.data.prov && this.data.city && this.data.area
              ? [
                  this.data.prov.toString(),
                  this.data.city.toString(),
                  this.data.area.toString()
                ]
              : []
        };
        // 设置异步不会造成页面卡顿，否则弹出页面卡顿
        window.setTimeout(() => {
          this.provinceArr = cityDataThree[0].provinceArr;
        }, 0);
      } else {
        this.$refs["form"].resetFields();
      }
    },
    modalStatus(val) {
      this.$emit("input", val);
    }
  },
  methods: {
    onCitySelectChange() {},
    onConfirmCLick() {
      this.saveChangeData();
    },
    saveChangeData() {
      let data = {
        id: this.$route.query.id,
        birthday: "",
        sex: this.dataInfo.sex,
          name: this.dataInfo.name,
          about: this.dataInfo.about,
        nickname: this.dataInfo.nickname,
        prov: this.dataInfo.place[0] || "",
        city: this.dataInfo.place[1] || "",
        area: this.dataInfo.place[2] || ""
      };
      // 如果有设置生日
      if (this.dataInfo.birthday) {
        let year = this.dataInfo.birthday.getFullYear().toString();
        let month = (this.dataInfo.birthday.getMonth() + 1).toString();
        let day = this.dataInfo.birthday.getDate().toString();
        data.birthday =
          year +
          "-" +
          (month[1] ? "" : "0") +
          month +
          "-" +
          (day[1] ? "" : "0") +
          day;
      }
      this.$httpPost("/shop/admin/member/base/edit", data, res => {
        if (res.code === 200) {
          this.$set(this.target.memberInfo, "birthday", data.birthday);
          this.$set(this.target.memberInfo, "sex", data.sex);
          this.$set(this.target.memberInfo, "nickname", data.nickname);
          this.$set(this.target.memberInfo, "prov", data.prov);
          this.$set(this.target.memberInfo, "city", data.city);
          this.$set(this.target.memberInfo, "area", data.area);
          this.$set(this.target.memberInfo, "about", data.about);
          this.$set(this.target.memberInfo, "name", data.name);
          // 查找地址名称
          let textArray = [];
          if (data.prov) {
            let areaItem = cityDataThree[0].provinceArr.find(
              item => item.value === data.prov
            );
            textArray.push(areaItem.label);
            areaItem = areaItem.children.find(item => item.value === data.city);
            textArray.push(areaItem.label);
            areaItem = areaItem.children.find(item => item.value === data.area);
            textArray.push(areaItem.label);
          }
          this.$set(this.target.memberInfo, "prov_text", textArray[0] || "");
          this.$set(this.target.memberInfo, "city_text", textArray[1] || "");
          this.$set(this.target.memberInfo, "area_text", textArray[2] || "");
          // 另外两个页面如果有数据则更新昵称
          Object.keys(this.target.distributorInfo).length &&
            this.$set(this.target.distributorInfo, "nickname", data.nickname);
          Object.keys(this.target.agentInfo).length &&
            this.$set(this.target.agentInfo, "nickname", data.nickname);
          this.$Message.success("修改成功");
          this.modalStatus = false;
        } else {
          this.$Message.error(res.msg);
          this.resetLoading();
        }
      });
    },

    resetLoading() {
      this.loading = false;
      this.$nextTick(() => {
        this.loading = true;
      });
    }
  }
};
</script>
<style lang="less" scoped>
.member-detail-modal-info {
  /deep/.ivu-modal-body {
    overflow: unset;
    .ivu-form-item {
      &:last-child {
        margin-bottom: 6px;
      }
      .ivu-form-item-label {
        padding: 9px 4px 10px 0;
        font-weight: bold;
      }
      .ivu-form-item-content {
        font-size: 0;
        .ivu-date-picker .ivu-select-dropdown {
          font-size: 13px;
        }
      }
    }
    .input-wrapper {
      position: relative;
      /deep/ textarea {
        resize: none;
        padding-right: 60px;
      }
      .suffix {
        position: absolute;
        right: 10px;
        bottom: 0px;
        color: #999;
      }
    }
  }
}
</style>
