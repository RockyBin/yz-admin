<template>
  <div class="agent-setting-joining" v-if="joiningData">
    <Form
        ref="formValidateJoining"
        :label-width="182"
        :model="joiningData"
        :rules="ruleValidateJoining"
    >
      <switch-titlebar
          style="margin: 0 0 20px;"
          v-model="joiningData.apply_setting.status"
          title="是否开启加盟功能"
          @on-change="onAgentStatusChange"
          :tipShow="!joiningData.base_setting && joiningData.apply_setting.status"
          tipText="请前往【区代设置>基础设置】开启区域代理功能后，加盟功能才生效。"
      />
      <FormItem
          label="允许加盟代理级别："
          prop="apply_setting.apply_level"
          v-show="joiningData.apply_setting.status"
      >
        <CheckboxGroup v-model="allowUpdateLevel">
          <Checkbox :label="10">省代</Checkbox>
          <Checkbox :label="9">市代</Checkbox>
          <Checkbox :label="8">区代</Checkbox>
        </CheckboxGroup>
      </FormItem>
      <FormItem
          label="设置条件，申请成为区域代理："
          class="agent-setting-condition"
          v-show="joiningData.apply_setting.status&&allowUpdateLevel.length&&hasLicensePerm('ENABLE_AREA_AGENT')&&(hasLicensePerm('ENABLE_DISTRIBUTION')||hasLicensePerm('ENABLE_AGENT'))"
          :class="{'agent-setting-condition-one': allowUpdateLevel.includes(10), 'agent-setting-condition-two': allowUpdateLevel.includes(9), 'agent-setting-condition-three': allowUpdateLevel.includes(8)}"
      >
        <Tabs type="card" :animated="false" v-model="tabSelect">
          <TabPane
              v-for="(item, index) in agentLevelText"
              :label="item"
              :key="index"
              tab="condition"
          >
            <update-condition
                ref="updateCondition"
                :agentLevel="joiningData.agent_level"
                :dataItem="joiningData.apply_setting.self_level[10-tabSelect]"
                :distributorLevel="distributorLevel"
            >
            </update-condition>
          </TabPane>
        </Tabs>
      </FormItem>
      <FormItem
          label="提交加盟申请资料："
          prop="apply_setting.extend_fields"
          v-show="joiningData.apply_setting.status"
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
              v-for="(item,index) in joiningData.apply_setting.extend_fields"
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
      <FormItem label="显示申请协议：" v-show="joiningData.apply_setting.status">
        <RadioGroup v-model="joiningData.apply_setting.agreement_show">
          <Radio :label="1">显示</Radio>
          <Radio :label="0">隐藏</Radio>
        </RadioGroup>
      </FormItem>
      <FormItem
          label="申请协议："
          prop="apply_setting.agreement"
          v-show="joiningData.apply_setting.status && joiningData.apply_setting.agreement_show"
      >
        <div class="distributor-setting-item" style="width: 607px;">
          <ue-editor
              style="line-height:normal;"
              :value="joiningData.apply_setting.agreement"
              ref="editor"
              posTop="60px"
              :setting="ueSetting"
              :hideImageSelector="true"
              elmClass=".agent-setting .ivu-form.ivu-form-label-right"
          ></ue-editor>
        </div>
      </FormItem>
    </Form>
    <div class="footer">
      <Button
          type="primary"
          shape="circle"
          @click="saveJoiningData"
          :loading="saveLoading"
          perm="area.agent.config.operate"
      >保存</Button
      >
    </div>
  </div>
</template>
<script>
  import ueEditor from "@/views/shop/components/editor/editor.vue";
  import switchTitlebar from "COMPONENTS/titlebar/switch-titlebar";
  import updateCondition from "./areaagent-setting-update-condition";
  const agentLevelText = ["省代", "市代", "区代"];
  const upgradeData = [
    // 代理商等级升级条件
    {name:"省代",value:10},
    {name:"市代",value:9},
    {name:"区代",value:8},
  ];
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
      switchTitlebar,
      updateCondition
    },
    data() {
      return {
        saveLoading: false,
        joiningData: null,
        tabSelect: 0,
        agentLevelText,
        upgradeData,
        distributorLevel:[],
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
          "apply_setting.apply_level": [
            {
              required: true,
              trigger: "change",
              validator: (rule, value, callback) => {
                if (this.allowUpdateLevel.length) {
                  return callback();
                }
                return callback(new Error("至少选择一个加盟等级"));
              }
            }
          ],
          "apply_setting.extend_fields": [
            {
              required: true,
              trigger: "none",
              validator: (rule, value, callback) => {
                callback();
              }
            }
          ],
          "apply_setting.agreement": [
            {
              required: true,
              trigger: "none",
              validator: (rule, value, callback) => {
                if (
                  this.joiningData.apply_setting.agreement_show &&
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
      Promise.all([this.getJoiningData(),this.getDistributorLevel()])
        .catch(e => {
          this.$Message.error(e);
        })
        .finally(() => {
          this.$store.state.COMMON_loading = false;
        });
    },
    computed: {
      allowUpdateLevel: {
        get() {
          return upgradeData
            .filter(item => {
              return !!item.upgrade_condition.status;
            })
            .map(item => item.value);
        },
        set(val) {
          console.log(val)
          upgradeData.forEach(item => {
            let oldData = item.upgrade_condition;
            this.$set(
              item,
              "upgrade_condition",
              Object.assign({}, oldData, {
                status: val.includes(item.value) ? 1 : 0
              })
            );
          });
          // 如果tab没选中显示的那个则重新选择一下
          if (val.length && !val.includes(10-this.tabSelect)) {
            this.tabSelect = 10-val[0];
          }
        }
      }
    },
    methods: {
      //获取分销商等级
      getDistributorLevel() {
        return new Promise((resolve, reject) => {
          this.$httpGet("/shop/admin/distribution/level/list", null, res => {
            if (res.code === 200) {
              resolve();
              this.distributorLevel = res.data || [];
            } else {
              reject(res.msg);
            }
          });
        });
      },
      /**
       * 获取加盟数据
       */
      getJoiningData() {
        return new Promise((resolve, reject) => {
          this.$httpGet("/shop/admin/area/agent/apply/setting/info", null, res => {
            if (res.code === 200) {
              let data = res.data;
              if (!data.apply_setting.extend_fields) {
                data.apply_setting.extend_fields = [];
              }
              // 防止新站点导致选择等级出错
              if (!data.apply_setting.apply_level) {
                data.apply_setting.apply_level = [];
              }
              if (!data.apply_setting.self_level){
                data.apply_setting.self_level = this.getNewUpgradeCondition();
              }
              resolve();
              upgradeData.forEach(item => {
                let oldData = item.upgrade_condition;
                this.$set(
                  item,
                  "upgrade_condition",
                  Object.assign({}, oldData, {
                    status: data.apply_setting.apply_level.includes(item.value) ? 1 : 0
                  })
                );
              });
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
        let data = Object.assign({}, this.joiningData.apply_setting);
        data.apply_level = this.allowUpdateLevel;
        data.agreement = this.$refs["editor"].getCurrContent();
        this.$httpPost("/shop/admin/area/agent/apply/setting/save", data, res => {
          this.saveLoading = false;
          if (res.code === 200) {
            this.$Message.success("保存成功");
          } else {
            this.$Message.error(res.msg);
          }
        });
      },
      /**
       * 生成upgrade_condition数据
       */
      getNewUpgradeCondition() {
        return {
          10:{
            agent:{
              value:[],
              logistic: "or"
            },
            distribution:{
              value:[],
                logistic: "or"
            },
          },
          9:{
            agent:{
              value:[],
              logistic: "or"
            },
            distribution:{
              value:[],
              logistic: "or"
            },
          },
          8:{
            agent:{
              value:[],
              logistic: "or"
            },
            distribution:{
              value:[],
              logistic: "or"
            },
          }
        };
      },
      onExtendFieldChange() {},
      /**
       * 删除定义项
       */
      onDeleteExtendField(index) {
        this.applyTipShow = false;
        this.errorTip.length > index && this.errorTip.splice(index, 1);
        this.joiningData.apply_setting.extend_fields.splice(index, 1);
      },
      /**
       * 添加自定义项
       */
      onAddCustomData() {
        this.joiningData.apply_setting.extend_fields.push({
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
              this.joiningData.apply_setting,
              "status",
              1
            );
            this.$Modal.confirm({
              title: "提示",
              content:
                "若关闭了区域代理的加盟功能，用户将不能在客户端主动提交申请加盟成为区域代理，只能通过后台手动添加才能成为区域代理商，是否确定关闭？",
              onOk: () => {
                this.$set(
                  this.joiningData.apply_setting,
                  "status",
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
          this.joiningData.apply_setting,
          key + "_show",
          value.includes("show") ? 1 : 0
        );
        this.$set(
          this.joiningData.apply_setting,
          key + "_require",
          value.includes("require") ? 1 : 0
        );
      },
      /**
       * 获取选中状态
       */
      getApplyValue(key) {
        let selectArray = [];
        if (this.joiningData.apply_setting[key + "_show"]) {
          selectArray.push("show");
        }
        if (this.joiningData.apply_setting[key + "_require"]) {
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
        if (!this.joiningData.apply_setting.status) {
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
            item => this.joiningData.apply_setting[item + "_show"]
          ).length ||
          this.joiningData.apply_setting.extend_fields.filter(
            item => item.show
          ).length;
        //  自定义项是否都有标题
        let status1 =
          this.joiningData.apply_setting.extend_fields.filter(
            (item, index) => {
              let val = item.name.trim();
              this.errorTip[index] = !val;
              return !!val;
            }
          ).length === this.joiningData.apply_setting.extend_fields.length;
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
    .agent-setting-condition {
      &.agent-setting-condition-one {
        /deep/.ivu-tabs {
          .ivu-tabs-bar {
            .ivu-tabs-nav-container {
              .ivu-tabs-tab:nth-child(2) {
                display: inline-block;
              }
            }
          }
        }
      }
      &.agent-setting-condition-two {
        /deep/.ivu-tabs {
          .ivu-tabs-bar {
            .ivu-tabs-nav-container {
              .ivu-tabs-tab:nth-child(3) {
                display: inline-block;
              }
            }
          }
        }
      }
      &.agent-setting-condition-three {
        /deep/.ivu-tabs {
          .ivu-tabs-bar {
            .ivu-tabs-nav-container {
              .ivu-tabs-tab:nth-child(4) {
                display: inline-block;
              }
            }
          }
        }
      }
      /deep/.ivu-tabs {
        /*width: 900px;*/
        overflow: unset;
        .ivu-tabs-bar {
          margin-bottom: 0;
          padding-left: 0 !important;
          .ivu-tabs-nav-container {
            height: 40px;
            .ivu-tabs-tab {
              display: none;
              height: 39px;
              width: 80px;
              text-align: center;
              &.ivu-tabs-tab-active {
                height: 40px;
                font-weight: bold;
                color: #2c3e50 !important;
              }
            }
          }
        }
      }
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
        top: -28px;
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
