<template>
  <div>
    <Modal
      :width="400"
      title="新增云仓"
      class="common-modal-member-select"
      :loading="modalLoading"
      :mask-closable="false"
      v-model="modalStatus"
      @on-ok="onModalComfrimClick"
    >
      <Form ref="formCustom" :label-width="74" :model="validateData" :rules="ruleValidate">
        <FormItem label="经销商：" prop="validValue">
          <div
            v-for="item in showData"
            :key="item.id"
            style="width: 260px;height: 66px;border-radius: 5px;border: solid 1px #dcdee2;margin-bottom:12px;"
          >
            <div
              style="float:left;position: relative;top: 50%;transform: translateY(-50%);margin: 0 17px 0 15px;"
            >
              <img
                style="height: 40px;width: 40px;display: block;border-radius: 5px;"
                :src="item.headurl ? getHeadImg(item.headurl) : require('../../images/head-portrait.png')"
              >
            </div>
            <div
              style="float:left;line-height: 1.5;position: relative;top: 50%;transform: translateY(-50%);width: calc(100% - 74px);"
            >
              <span>
                <div>ID：{{item.id}}</div>
                <div
                  style="overflow: hidden;text-overflow: ellipsis;white-space: nowrap;"
                >昵称：{{item.nickname}}</div>
                <div>手机号：{{item.mobile}}</div>
              </span>
            </div>
          </div>
          <Button
            type="primary"
            style="height: 32px;padding-top: 0;padding-bottom: 0;vertical-align: top;"
            @click="onSelectMemberClick"
          >{{showData.length?"重新选择":"选择"}}</Button>
        </FormItem>
        <FormItem label="经销商等级：" style="margin-bottom: 0 !important;">
          <div>{{levelName[selectData && selectData.agent_apply_level - 1] || "--"}}</div>
        </FormItem>
        <FormItem label="云仓等级：" style="margin-bottom: 0 !important;">
          <div>{{repositoryName[selectData && selectData.agent_apply_level - 1] || "--"}}</div>
        </FormItem>
      </Form>
    </Modal>
  </div>
</template>
<script>
const levelName = ["一级经销商", "二级经销商", "三级经销商"];
const repositoryName = ["一级云仓", "二级云仓", "三级云仓"];
export default {
  props: {
    value: {
      type: Boolean,
      default: false
    },
    listData: {
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
      showData: [],
      levelName,
      repositoryName,
      validateData: {
        // 表单验证，数据没用的
        validValue: true
      },
      ruleValidate: {
        validValue: [
          {
            required: true,
            message: "请选择经销商"
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
      let msg = "请选择经销商";
      if (!this.selectData) {
        this.modalLoading = false;
        this.$Message.error(msg);
        this.$nextTick(() => {
          this.modalLoading = true;
        });
        return;
      }
      // 向上级传递数据
      this.$emit("onModalComfrimClick", {
        member_id: this.selectData.member_id,
        level: this.selectData.agent_apply_level
      });
    },
    // 触发重置数据
    resetData() {
      this.selectLevel = 0;
      this.showData = [];
    }
  }
};
</script>

<style lang="less" scoped>
.distributor-list-modal-new-distributor {
  /deep/.ivu-modal-body {
    padding: 30px 24px;

    button span {
      display: block;
    }
  }
}
</style>
