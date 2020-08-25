<template>
  <div>
    <Modal
      :width="489"
      :title="title"
      class="common-modal-member-select"
      :loading="modalLoading"
      :mask-closable="false"
      v-model="modalStatus"
      @on-ok="onModalComfrimClick"
    >
      <Form ref="formCustom" :label-width="102" :model="validateData" :rules="ruleValidate">
        <FormItem label="会员：" prop="validValue">
          <div
            v-for="item in showData"
            :key="item.id"
            style="width: 260px;height: 82px;border-radius: 5px;border: solid 1px #dcdee2;margin-bottom:12px;"
          >
            <div
              style="float:left;position: relative;top: 50%;transform: translateY(-50%);margin: 0 17px 0 15px;"
            >
              <img
                style="height: 40px;width: 40px;display: block;border-radius: 5px;"
                :src="item.headurl ? getHeadImg(item.headurl) : require('../../images/head-portrait.png')"
              />
            </div>
            <div
              style="float:left;line-height: 1.5;position: relative;top: 50%;transform: translateY(-50%);width: calc(100% - 74px);"
            >
              <span>
                <div
                  style="overflow: hidden;text-overflow: ellipsis;white-space: nowrap;font-size: 13px;color: #657180;"
                >{{item.nickname}}</div>
                <div style="overflow: hidden;text-overflow: ellipsis;white-space: nowrap;color: #9ea7b4;">姓名：{{item.name ||'--'}}</div>
                <div style="color: #9ea7b4;">手机：{{item.mobile}}</div>
                <div style="color: #9ea7b4;">ID：{{item.id}}</div>
              </span>
            </div>
          </div>
          <Button
            type="primary"
            style="height: 32px;padding-top: 0;padding-bottom: 0;vertical-align: top;"
            @click="onSelectMemberClick"
          >{{showData.length?"重新选择":"选择"}}</Button>
          <span v-show="validValueError" style="color: #ED4014;font-size: 12px;padding-left: 10px;">请选择会员</span>
        </FormItem>
        <FormItem style="margin-bottom:0;" v-if="!isSupplier" :label="levelTitle + '：'" prop="selectLevel" :show-message="false">
          <Select v-model="validateData.selectLevel" class="common-input-text-260" transfer>
            <Option :value="item.id" v-for="item in levelData" :key="item.id" :disabled="item.disabled">{{item.name}}</Option>
          </Select>
          <div v-show="selectLevelError" style="color: #ED4014;font-size: 12px;line-height: 20px;">请选择{{levelTitle}}</div>
        </FormItem>
        <FormItem v-if="isSupplier" label="供应平台名称：" prop="supplier_name" class="margin-bottom-form">
          <Input
              v-model="validateData.supplier_name"
              style="width: 260px;"
              placeholder="请输入供应平台名称"
              :maxlength="20"
          >
            <span slot="suffix" style="padding-top: 7px;display: inline-block;">{{validateData.supplier_name?validateData.supplier_name.length:0}}/20</span>
          </Input>
        </FormItem>
      </Form>
    </Modal>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ""
    },
    levelTitle: {
      type: String,
      default: ""
    },
    isSupplier:{
      type: Boolean,
      default: false
    },
    levelData: {
      type: Array,
      default() {
        return [];
      }
    },
    selectData: {
      type: Object,
      default() {
        return null;
      }
    }
  },

  data() {
    return {
      modalStatus: false,
      modalLoading: true,
      validValueError:false,
      selectLevelError:false,
      showData: [],
      validateData: {
        selectLevel: null,
        // 表单验证，数据没用的
        validValue: true,
        supplier_name:""
      },
      ruleValidate: {
        selectLevel: [
          {
            required: true,
            trigger: "change",
            validator: (rule, value, callback) => {
              if (value) {
                this.selectLevelError = false;
                return callback();
              } else {
                this.selectLevelError = true;
                return callback(new Error(""));
              }
            }
          }
        ],
        supplier_name:[
          {
            required: true,
            trigger: "change",
            validator: (rule, value, callback) => {
              if (value) {
                return callback();
              } else {
                return callback(new Error("请填写供应平台名称"));
              }
            }
          }
        ],
        validValue: [
          {
            required: true
          }
        ]
      }
    };
  },
  watch: {
    value(val) {
      if (val !== this.modalStatus) {
        this.modalStatus = val;
      }
    },
    modalStatus(val) {
      if (val !== this.value) {
        this.$emit("input", val);
      }
    },
    selectData(val) {
      if (val) {
        this.validValueError = false;
        this.showData = [val];
      } else {
        this.showData = [];
      }
    }
  },
  methods: {
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
     * 添加会员
     */
    onModalComfrimClick() {
      // 判断是否选择了会员和等级
      let status = true;
      this.$refs["formCustom"].validate(valid => {
        status = valid;
      });
      // let msg = "请选择" + this.levelTitle;
      if (!this.selectData || !status) {
        if (!this.selectData) {
          // msg = "请选择会员";
          this.validValueError = true;
        }else{
          this.validValueError = false;
        }
        this.modalLoading = false;
        this.$Message.error("新增失败");
        this.$nextTick(() => {
          this.modalLoading = true;
        });
        return;
      }else{
        this.validValueError = false;
      }
      // 向上级传递数据
      let data = {
        member_id: this.selectData.id
      }
      if (this.isSupplier){
        data['supplier_name'] = this.validateData.supplier_name;
      } else{
        data['level'] = this.validateData.selectLevel;
      }
      this.$emit("onModalComfrimClick", data);
    },
    // 触发重置数据
    resetData() {
      this.$set(this.validateData, "selectLevel", null);
      this.$nextTick(() => {
        this.$refs["formCustom"].resetFields();
      });
      this.showData = [];
    }
  }
};
</script>

<style lang="less" scoped>
.common-modal-member-select {
  /deep/.ivu-modal-body {
    padding: 24px 24px;

    button span {
      display: block;
    }
    .margin-bottom-form{
      .ivu-form-item-content{
        .ivu-input-suffix{
          right: 5px;
        }
        .ivu-input-with-suffix{
          padding-right: 40px;
        }
      }
    }
  }
}
</style>
