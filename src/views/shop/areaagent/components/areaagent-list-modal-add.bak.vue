<template>
  <div>
    <Modal
      :width="528"
      :title="isNew ? '新增区域代理商' : '修改区域代理商'"
      :loading="modalLoading"
      :mask-closable="false"
      v-model="modalStatus"
      @on-ok="onModalComfrimClick"
    >
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
            v-if="selectData"
            style="width: 260px;height: 82px;padding: 0 12px;border-radius: 5px;border: solid 1px #dcdee2;line-height: initial;"
            :style="isNew ? 'margin-bottom:12px;' : ''"
          >
            <member-infor
              :id="selectData.id"
              :goDetail="false"
              :headurl="
                selectData.headurl
                  ? getHeadImg(selectData.headurl)
                  : require('../../images/head-portrait.png')
              "
              :nickname="selectData.nickname"
              :mobile="selectData.mobile"
              :name="selectData.name || '--'"
            />
          </div>
          <Button
            type="primary"
            v-if="isNew"
            style="height: 32px;padding-top: 0;padding-bottom: 0;vertical-align: top;"
            @click="onSelectMemberClick"
            >{{ selectData ? "重新选择" : "选择" }}</Button
          >
        </FormItem>
        <div class="areaagent-list-modal-add-form">
          <FormItem label="代理区域：">
            <Select
              v-model="validateData.type"
              transfer
              style="width: 80px;"
              @on-change="onSelectTypeChange"
            >
              <Option :value="10">省代</Option>
              <Option :value="9">市代</Option>
              <Option :value="8">区代</Option>
            </Select>
          </FormItem>
          <address-select
            v-if="modalStatus"
            :validateData="validateData"
            :level="[10, 9, 8].findIndex(n => n === validateData.type) + 1"
          />
        </div>
      </Form>
    </Modal>
  </div>
</template>

<script>
import memberInfor from "@/views/shop/components/table/member-infor.vue";
import addressSelect from "@/views/shop/components/selector/address-select";
const validateData = {
  memberId: 0,
  type: 10,
  province: null,
  city: null,
  area: null
};
export default {
  components: {
    memberInfor,
    addressSelect
  },
  props: {
    value: {
      type: Boolean,
      default: false
    },
    isNew: {
      type: Boolean,
      default: true
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
      validateData: { ...validateData },
      ruleValidate: {
        memberId: [
          {
            required: true,
            validator: (rule, value, callback) => {
              if (!this.isNew || value) {
                return callback();
              } else {
                return callback(new Error("请选择会员"));
              }
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
      }
      if (val) {
        // 如果是修改的把原来地区的数据添加进来
        let data =
          this.selectData && this.selectData.areaData
            ? this.selectData.areaData
            : {};
        this.validateData = { ...validateData, ...data };
      } else {
        this.$refs["formCustom"].resetFields();
      }
    },
    modalStatus(val) {
      if (val !== this.value) {
        this.$emit("input", val);
      }
    },
    selectData(val) {
      this.$set(this.validateData, "memberId", val ? val.id : 0);
      val &&
        this.$refs["formCustom"].fields.forEach(n => {
          if (["memberId"].includes(n.prop)) {
            n.validateState = "";
          }
        });
    }
  },
  methods: {
    /**
     * 恢复报错提示
     */
    onSelectTypeChange() {
      this.$refs["formCustom"].fields.forEach(n => {
        if (["province", "city", "area"].includes(n.prop)) {
          n.validateState = "";
        }
      });
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
     * 添加会员
     */
    onModalComfrimClick() {
      // 判断是否选择了会员和等级
      this.$refs["formCustom"].validate(valid => {
        if (valid) {
          this.$emit("onModalComfrimClick", this.validateData, () => {
            this.modalStatus = false;
          });
        } else {
          this.$Message.error(this.isNew ? "新增失败" : "修改失败");
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
.areaagent-list-modal-add-form {
  /deep/.ivu-form-item {
    display: inline-block;
    margin-bottom: 0 !important;
    
    .ivu-form-item-label {
      height: 32px;
    }
    .ivu-form-item-content .ivu-select {
      vertical-align: top;
    }
    .ivu-select {
      width: 100px;
    }
  }
  /deep/.address-select {
    margin-left: 5px;
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
</style>
