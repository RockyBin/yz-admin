<template>
  <div class="agent-setting-joining" v-if="joiningData">
    <Form
      ref="formValidateJoining"
      :label-width="152"
      :model="joiningData"
      :rules="ruleValidateJoining"
    >
      <switch-titlebar
        style="margin: 0 0 20px;"
        v-model="joiningData.agent_apply_setting.agent_apply_status"
        title="是否开启加盟功能"
        @on-change="onAgentStatusChange"
        :tipShow="!joiningData.agent_base_setting.baseSetting && joiningData.agent_apply_setting.agent_apply_status"
        tipText="请前往【代理设置>基础设置】开启团队分红功能后，加盟功能才生效。"
      />
      <FormItem
        label="允许加盟等级："
        prop="agent_apply_setting.agent_apply_level"
        v-show="joiningData.agent_apply_setting.agent_apply_status"
      >
        <CheckboxGroup v-model="joiningData.agent_apply_setting.agent_apply_level">
          <Checkbox :label="1">一级代理</Checkbox>
          <Checkbox :label="2">二级代理</Checkbox>
          <Checkbox :label="3">三级代理</Checkbox>
        </CheckboxGroup>
      </FormItem>
      <FormItem
        label="提交加盟申请资料："
        prop="agent_apply_setting.extend_fields"
        v-show="joiningData.agent_apply_setting.agent_apply_status"
      >
        <div class="agent-setting-joining-apply">
          <div v-for="(item,index) in applyData" :key="index">
            <Input :placeholder="item" class="common-input-text-210" readonly />
            <CheckboxGroup
              :value="getApplyValue(index)"
              @on-change="setApplyValue.apply(this, [index, ...arguments])"
            >
              <Checkbox label="show">
                <span>显示</span>
              </Checkbox>
              <Checkbox label="require">
                <span>必填</span>
              </Checkbox>
            </CheckboxGroup>
          </div>
          <div
            class="distributor-setting-item-submitinfo"
            v-for="(item,index) in joiningData.agent_apply_setting.extend_fields"
            :class="{'ivu-form-item-error': errorTip[index]}"
            :key="index"
          >
            <Input class="common-input-text-210" v-model="item.name" />
            <CheckboxGroup
              :value="getExtendValue(item)"
              @on-change="setExtendValue.apply(this, [item, ...arguments])"
            >
              <Checkbox label="show">
                <span>显示</span>
              </Checkbox>
              <Checkbox label="require">
                <span>必填</span>
              </Checkbox>
            </CheckboxGroup>
            <a
              href="javacript:;"
              style="vertical-align: middle;display:inline-block;line-height: 1;margin-top: 1px;margin-left:15px;"
              @click="onDeleteExtendField(index)"
            >删除</a>
          </div>
          <Button type="primary" @click="onAddCustomData" icon="md-add">新增自定义项</Button>
        </div>
        <div
          class="ivu-form-item-error-tip"
          v-show="applyTipShow"
          style="margin-top: -64px;"
        >{{applyTipText}}</div>
      </FormItem>
      <FormItem label="显示申请协议：" v-show="joiningData.agent_apply_setting.agent_apply_status">
        <RadioGroup v-model="joiningData.agent_apply_setting.agreement_show">
          <Radio :label="1">显示</Radio>
          <Radio :label="0">隐藏</Radio>
        </RadioGroup>
      </FormItem>
      <FormItem
        label="申请协议："
        prop="agent_apply_setting.agreement"
        v-show="joiningData.agent_apply_setting.agent_apply_status && joiningData.agent_apply_setting.agreement_show"
      >
        <div class="distributor-setting-item" style="width: 607px;">
          <ue-editor
            style="line-height:normal;"
            :value="joiningData.agent_apply_setting.agreement"
            ref="editor"
            posTop="60px"
            :setting="ueSetting"
            :hideImageSelector="true"
            elmClass=".agent-setting .ivu-form.ivu-form-label-right"
          ></ue-editor>
        </div>
      </FormItem>
    </Form>
    <!-- <foot-button
      @onSaveClick="saveJoiningData"
      :loading="saveLoading"
      perm="agent.config.operate"
    ></foot-button> -->
    <div class="footer">
      <Button
        type="primary"
        shape="circle"
        @click="saveJoiningData"
        :loading="saveLoading"
        perm="agent.config.operate"
        >保存</Button
      >
    </div>
  </div>
</template>
<script>
import ueEditor from "@/views/shop/components/editor/editor.vue";
import switchTitlebar from "COMPONENTS/titlebar/switch-titlebar";
const applyData = {
  company: "公司名称",
  business_license: "营业执照号",
  business_license_file: "上传营业执照",
  idcard: "身份证号",
  idcard_file: "上传身份证",
  applicant: "申请人",
  mobile: "手机号码",
  sex: "性别",
  address: "地址信息",
  remark: "备注"
};
export default {
  components: {
    ueEditor,
    switchTitlebar
  },
  data() {
    return {
      saveLoading: false,
      joiningData: null,
      ueSetting: {
        toolbars: [
          [
            "source",
            "|",
            "undo",
            "redo",
            "|",
            "bold",
            "italic",
            "underline",
            "forecolor",
            "backcolor",
            "fontborder",
            "strikethrough",
            "superscript",
            "subscript",
            "removeformat",
            "formatmatch",
            "autotypeset",
            "blockquote",
            "pasteplain",
            "|",
            "insertorderedlist",
            "insertunorderedlist",
            "selectall",
            "cleardoc",
            "|",
            "rowspacingtop",
            "rowspacingbottom",
            "lineheight",
            "|",
            "customstyle",
            "paragraph",
            "fontfamily",
            "fontsize",
            "|",
            "directionalityltr",
            "directionalityrtl",
            "indent",
            "|",
            "justifyleft",
            "justifycenter",
            "justifyright",
            "justifyjustify",
            "|",
            "touppercase",
            "tolowercase",
            "|",
            "horizontal",
            "|",
            "deletetable",
            "insertparagraphbeforetable",
            "insertrow",
            "deleterow",
            "insertcol",
            "deletecol",
            "mergecells",
            "mergeright",
            "mergedown",
            "splittocells",
            "splittorows",
            "splittocols"
          ]
        ]
      },
      applyData,
      ruleValidateJoining: {
        "agent_apply_setting.agent_apply_level": [
          {
            required: true,
            trigger: "change",
            validator: (rule, value, callback) => {
              if (value.length) {
                return callback();
              }
              return callback(new Error("至少选择一个加盟等级"));
            }
          }
        ],
        "agent_apply_setting.extend_fields": [
          {
            required: true,
            trigger: "none",
            validator: (rule, value, callback) => {
              callback();
            }
          }
        ],
        "agent_apply_setting.agreement": [
          {
            required: true,
            trigger: "none",
            validator: (rule, value, callback) => {
              if (
                this.joiningData.agent_apply_setting.agreement_show &&
                !this.$refs["editor"].getCurrContent().trim().length
              ) {
                return callback("协议内容不能为空");
              }
              return callback();
            }
          }
        ]
      },
      applyTipShow: false,
      applyTipText: "",
      errorTip: []
    };
  },
  created() {
    this.$store.state.COMMON_loading = true;
    Promise.all([this.getJoiningData()])
      .catch(e => {
        this.$Message.error(e);
      })
      .finally(() => {
        this.$store.state.COMMON_loading = false;
      });
  },
  methods: {
    /**
     * 获取加盟数据
     */
    getJoiningData() {
      return new Promise((resolve, reject) => {
        this.$httpGet("/shop/admin/agent/apply/setting/info", null, res => {
          if (res.code === 200) {
            let data = res.data;
            if (!data.agent_apply_setting.extend_fields) {
              data.agent_apply_setting.extend_fields = [];
            }
            // 防止新站点导致选择等级出错
            if (!data.agent_apply_setting.agent_apply_level) {
              data.agent_apply_setting.agent_apply_level = [];
            }
            resolve();
            this.joiningData = res.data;
          } else {
            reject(res.msg);
          }
        });
      });
    },
    /**
     * 保存加盟数据
     */
    saveJoiningData() {
      if (!this.joiningData || !this.checkData()) {
        this.$Message.error("保存失败");
        return;
      }
      this.saveLoading = true;
      let data = Object.assign({}, this.joiningData.agent_apply_setting);
      data.agreement = this.$refs["editor"].getCurrContent();
      this.$httpPost("/shop/admin/agent/apply/setting/save", data, res => {
        this.saveLoading = false;
        if (res.code === 200) {
          this.$Message.success("保存成功");
        } else {
          this.$Message.error(res.msg);
        }
      });
    },
    onExtendFieldChange() {},
    /**
     * 删除定义项
     */
    onDeleteExtendField(index) {
      this.applyTipShow = false;
      this.errorTip.length > index && this.errorTip.splice(index, 1);
      this.joiningData.agent_apply_setting.extend_fields.splice(index, 1);
    },
    /**
     * 添加自定义项
     */
    onAddCustomData() {
      this.joiningData.agent_apply_setting.extend_fields.push({
        name: "",
        require: 0,
        show: 1
      });
    },
    /**
     * 开启加盟状态改变提示
     */
    onAgentStatusChange(val) {
      if (!val) {
        this.$nextTick(() => {
          this.$set(
            this.joiningData.agent_apply_setting,
            "agent_apply_status",
            1
          );
          this.$Modal.confirm({
            title: "提示",
            content:
              "若关闭了代理的加盟功能，用户将不能在客户端主动提交申请加盟成为团队代理，只能通过后台手动添加才能成为团队代理，是否确定关闭？",
            onOk: () => {
              this.$set(
                this.joiningData.agent_apply_setting,
                "agent_apply_status",
                0
              );
              this.$refs["formValidateJoining"].fields.forEach(el => {
                el.validateState = "";
              });
            }
          });
        });
      }
    },
    /**
     * 修改选中状态
     */
    setApplyValue(key, value) {
      this.$set(
        this.joiningData.agent_apply_setting,
        key + "_show",
        value.includes("show") ? 1 : 0
      );
      this.$set(
        this.joiningData.agent_apply_setting,
        key + "_require",
        value.includes("require") ? 1 : 0
      );
    },
    /**
     * 获取选中状态
     */
    getApplyValue(key) {
      let selectArray = [];
      if (this.joiningData.agent_apply_setting[key + "_show"]) {
        selectArray.push("show");
      }
      if (this.joiningData.agent_apply_setting[key + "_require"]) {
        selectArray.push("require");
      }
      return selectArray;
    },
    /**
     * 修改自定义的选中状态
     */
    setExtendValue(item, value) {
      this.$set(item, "show", value.includes("show") ? 1 : 0);
      this.$set(item, "require", value.includes("require") ? 1 : 0);
    },
    /**
     * 获取自定义的选中状态
     */
    getExtendValue(item) {
      let selectArray = [];
      if (item.require) {
        selectArray.push("require");
      }
      if (item.show) {
        selectArray.push("show");
      }
      return selectArray;
    },
    checkData() {
      let status = true;
      if (!this.joiningData.agent_apply_setting.agent_apply_status) {
        return status;
      }
      this.$refs["formValidateJoining"].validate(valid => {
        status = valid;
      });
      // 报错提示
      this.errorTip = [];
      this.applyTipShow = false;
      // 是否有选上显示的
      let length =
        Object.keys(applyData).filter(
          item => this.joiningData.agent_apply_setting[item + "_show"]
        ).length ||
        this.joiningData.agent_apply_setting.extend_fields.filter(
          item => item.show
        ).length;
      //  自定义项是否都有标题
      let status1 =
        this.joiningData.agent_apply_setting.extend_fields.filter(
          (item, index) => {
            let val = item.name.trim();
            this.errorTip[index] = !val;
            return !!val;
          }
        ).length === this.joiningData.agent_apply_setting.extend_fields.length;
      // 控制显示
      if (!length || !status1) {
        this.applyTipShow = true;
        this.applyTipText = "至少选择一项显示";
        status = false;
        if (length && !status1) {
          this.applyTipText = "请输入填写内容";
        }
      }
      return status;
    }
  }
};
</script>
<style lang="less" scoped>
.agent-setting-joining {
  padding-bottom: 50px;
  /deep/.ivu-form {
    padding: 24px 24px 4px;
    /*height: calc(100vh - 120px);*/
    overflow: auto;
  }
  .agent-setting-joining-apply {
    & > div + div {
      margin-top: 14px;
    }
    .ivu-checkbox-group {
      display: inline-block;
      vertical-align: top;
      margin-left: 12px;
      /deep/.ivu-checkbox-wrapper {
        margin-right: 0;
        & + .ivu-checkbox-wrapper {
          margin-left: 16px;
        }
      }
    }
    .ivu-input-wrapper {
      vertical-align: top;
    }
    .ivu-btn {
      margin-top: 30px;
      border-radius: 17px;
      height: 34px;
    }
  }
  /deep/.distributor-setting-item {
    & + .ivu-form-item-error-tip {
      top: -30px;
    }
  }
  .footer {
    position: fixed;
    bottom: 10px;
    height: 50px;
    line-height: 50px;
    width: calc(100% - 260px);
    background-color: #fff;
    text-align: center;
    border-top: 1px solid #eee;
    z-index: 100;
    button {
      width: 70px;
      height: 32px;
    }
  }
}
</style>
