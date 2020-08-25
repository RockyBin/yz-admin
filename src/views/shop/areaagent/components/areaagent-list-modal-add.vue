<template>
  <div>
    <Modal
      :width="480"
      :title="title"
      :loading="modalLoading"
      :mask-closable="false"
      v-model="modalStatus"
      @on-ok="onModalComfrimClick"
    >
      <div class="title-warning" v-if="modalType=='recover'">
        <Icon type="ios-help-circle" size="34" color="#ed4014" />
        <span class="title-text">是否确定恢复区域代理资格？</span>
      </div>
      <Form
        ref="formCustom"
        :label-width="84"
        :model="validateData"
        :rules="ruleValidate"
      >
        <FormItem
          label="会员："
          prop="memberId"
          class="areaagent-list-modal-add-member"
        >
          <div
            v-if="selectedMember"
            style="width: 260px;height: 82px;padding: 0 12px;border-radius: 5px;border: solid 1px #dcdee2;line-height: initial;"
            :style="modalType ? 'margin-bottom:12px;' : ''"
          >
            <member-infor
              :id="selectedMember.id"
              :goDetail="false"
              :headurl="
                selectedMember.headurl
                  ? getHeadImg(selectedMember.headurl)
                  : require('../../images/head-portrait.png')
              "
              :nickname="selectedMember.nickname"
              :mobile="selectedMember.mobile"
              :name="selectedMember.name || '--'"
            />
          </div>
          <Button
            type="primary"
            v-if="modalType=='add'"
            style="height: 32px;padding-top: 0;padding-bottom: 0;vertical-align: top;"
            @click="onSelectMemberClick"
            >{{ selectedMember ? "重新选择" : "选择" }}</Button
          >
        </FormItem>
        <FormItem
          ref="selectedArea"
          label="区域代理："
          prop="selectedArea"
          class="areaagent-list-modal-add-area"
        >
          <add-more
            v-if="modalType!='recover'||!areaBind"
            text="添加区域"
            @onAddMoreClick="onAddAreaClick"
          ></add-more>
          <div v-if="selectedArea.length" :style="{marginTop:modalType!='recover'||!areaBind?'16px':'0px'}">
            <div :class="{'disabled-input-wrapper':true,'error':item.error}" v-for="(item,index) in selectedArea" :key="index">
              <span class="disabled-input">
                <div class="flex">
                  <span>{{["省代","市代","区代"][[10,9,8].indexOf(item.area_type)]}}：</span>
                  <span>{{getAreaText(item,addressData)}}</span>
                </div>
              </span>
              <span class="table-operation" v-if="modalType!='recover'||!areaBind" @click="onDeleteArea(index)">删除</span>
            </div>
          </div>
        </FormItem>
      </Form>
    </Modal>
  </div>
</template>

<script>
import addMore from "COMPONENTS/button/add-more.vue";
import memberInfor from "@/views/shop/components/table/member-infor.vue";
import addressSelect from "@/views/shop/components/selector/address-select";
import cityData from "@/views/shop/components/cityDataThree";
let addressData = cityData[0].provinceArr;
export default {
  components: {
    addMore,
    memberInfor,
    addressSelect
  },
  props: {
    value: {
      type: Boolean,
      default: false
    },
    modalType: {
      type: String,
      default: ""
    },
    areaBind: {
      type: Boolean,
      default: false
    },
    selectedMember: {
      type: Object,
      default() {
        return null;
      }
    },
    selectedArea: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  data() {
    return {
      modalStatus: false,
      modalLoading: true,
      addressData: addressData,
      validateData: {
        memberId: 0,
        selectedArea: this.selectedArea
      },
      ruleValidate: {
        memberId: [
          {
            required: true,
            validator: (rule, value, callback) => {
              if (this.modalType != "add" || value) {
                return callback();
              } else {
                return callback(new Error("请选择会员"));
              }
            }
          }
        ],
        selectedArea: [{
          required: true,
          validator: (rule, value, callback) => {
            if(value.length) {
              if(this.checkSelectedArea()) {
                callback();
              } else {
                callback("代理区域有冲突，请检查后重新添加");
              }
            } else {
              callback("请选择代理区域")
            }
          }
        }]
      }
    };
  },
  computed: {
    title() {
      switch(this.modalType) {
        case "add":
          return '新增区域代理商';
        case "modify":
          return '修改区域代理商';
        case "recover":
          return "恢复资格";
        default:
          return "";
      }
    }
  },
  watch: {
    value(val) {
      if (val !== this.modalStatus) {
        this.$nextTick(() => {
          this.modalStatus = val;
        })
      }
      if(val){
        this.validateData.selectedArea = this.selectedArea;
      } else {
        this.$refs["formCustom"].resetFields();
      }
    },
    modalStatus(val) {
      if (val !== this.value) {
        this.$emit("input", val);
      }
    },
    selectedMember(val) {
      this.$set(this.validateData, "memberId", val ? val.id : 0);
      val &&
        this.$refs["formCustom"].fields.forEach(n => {
          if (["memberId"].includes(n.prop)) {
            n.validateState = "";
          }
        });
    },
    "selectedArea.length": function(length){
      this.$set(this.validateData, "selectedArea", this.selectedArea);
      if(this.modalStatus) {
        this.$refs.selectedArea.validate();
      }
    }
  },
  methods: {
    getAreaText(info, arr, start = 10) {
      var keyMap = {
        10: "prov",
        9: "city",
        8: "district"
      };
      let item = arr.find(i => i.value ==info[keyMap[start]])
      if(item && start > info.area_type) {
        return `${item.label}-${this.getAreaText(info, item.children, --start)}`;
      } else if(item) {
        return item.label
      } else {
        return "未知"
      }
    },
    checkSelectedArea() {
      console.log(11111,this.selectedArea)
      this.selectedArea.forEach(item => {
        this.$set(item, "error", false);
      });
      this.selectedArea.forEach(item => {
        this.selectedArea.forEach(item1 => {
          if(item == item1) return ;
          var str = (item.prov ? String(item.prov) : "") + (item.city ? String(item.city) : "") + (item.district ? String(item.district) : "");
          var str1 = (item1.prov ? String(item1.prov) : "") + (item1.city ? String(item1.city) : "") + (item1.district ? String(item1.district) : "");
          if(str.indexOf(str1) == 0 || str1.indexOf(str) == 0) {
            !item.error && this.$set(item, "error", true);
            !item1.error && this.$set(item1, "error", true);
          }
        });
      });
      return this.selectedArea.filter(item => item.error).length == 0;
    },
    getHeadImg(url) {
      if (!/^(http)/i.test(url)) {
        url = this.$store.state.siteComdataPath + url;
      }
      return url;
    },
    /**
     * 选择会员
     */
    onSelectMemberClick() {
      this.$emit("onSelectMemberClick");
    },
    /**
     * 添加区域
     */
    onAddAreaClick() {
      this.$emit("onSelectAreaClick");
    },
    /**
     * 删除区域
     */
    onDeleteArea(index) {
      this.selectedArea.splice(index, 1);
    },
    /**
     * 添加会员
     */
    onModalComfrimClick() {
      // 判断是否选择了会员和等级
      this.$refs["formCustom"].validate(valid => {
        if (valid) {
          this.$emit("onConfirmClick", this.validateData, () => {
            this.modalStatus = false;
          });
        } else {
          var text = {add: "新增失败", modify: "修改失败", recover: "恢复失败"}
          this.$Message.error(text[this.modalType]);
          this.modalLoading = false;
          this.$nextTick(() => {
            this.modalLoading = true;
          });
        }
      });
    }
  }
};
</script>
<style lang="less" scoped>
.title-warning {
  margin-bottom: 15px;
  .ivu-icon {
    margin-right: 10px;
  }
  .title-text {
    color: #464C5B;
    font-size: 13px;
    font-weight: bold;
  }
}
.areaagent-list-modal-add-member {
  /deep/.ivu-form-item-error-tip {
    padding: 0;
    top: 0;
    left: 68px;
    line-height: 32px;
  }
}
.areaagent-list-modal-add-area {
  /deep/.add-more-btn {
    .btn-add {
      margin-bottom: 0px;
    }
  }
  .disabled-input-wrapper {
    margin-bottom: 10px;
    &:last-child {
      margin-bottom: 0;
    }
    &.error {
      .disabled-input {
        color: #ED4014;
        border: 1px solid #ED4014;
      }
    }
  }
  .disabled-input {
    display: inline-flex;
    align-items: center;
    width: 260px;
    height: 32px;
    border: 1px solid #E2DCDC;
    border-radius: 4px;
    background: #F3F3F3;
    padding: 0 8px;
    margin-right: 10px;
    vertical-align: middle;
    .flex {
      display: inline-flex;
      align-items: flex-start;
      line-height: 1.2;
      vertical-align: middle;
      :first-child {
        flex-shrink: 0;
      }
    }
  }
  /deep/.ivu-form-item-error-tip {
    padding: 0;
    top: 0;
    left: 103px;
    line-height: 32px;
  }
}
</style>
