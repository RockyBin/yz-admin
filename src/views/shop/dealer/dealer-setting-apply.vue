<template>
  <div class="agent-setting-joining" v-if="joiningData">
    <Form
      ref="formValidateJoining"
      :label-width="158"
      :model="joiningData"
      :rules="ruleValidateJoining"
    >
      <switch-titlebar
        style="margin: 0 0 24px;"
        v-model="joiningData.apply_setting.status"
        title="是否开启加盟功能"
        @on-change="onStatusChange"
      />
      <FormItem
        label="申请加盟方式："
        prop="apply_setting.apply_types"
        v-show="joiningData.apply_setting.status"
      >
        <Checkbox
          v-model="joiningData.apply_setting.can_apply"
          :true-value="1"
          :false-value="0"
          >允许会员在前台主动申请</Checkbox
        >
        <more-message
          text="是指允许会员在前台点击【经销商中心】,主动去申请成为分销商。"
          style="margin-right: 20px;"
        ></more-message>
        <Checkbox
          v-model="joiningData.apply_setting.can_invite"
          :true-value="1"
          :false-value="0"
          >允许经销商授权邀请</Checkbox
        >
        <more-message
          text="是指允许经销商通过前台的【经销商中心-授权邀请】,去主动邀请他人成为该等级的经销商。"
          style="margin-right: 20px;"
        ></more-message>
      </FormItem>
      <FormItem
        class="agent-setting-apply"
        label="允许主动加盟等级："
        prop="apply_setting.can_apply_level"
        v-show="joiningData.apply_setting.status&&joiningData.apply_setting.can_apply"
      >
        <CheckboxGroup v-model="joiningData.apply_setting.can_apply_level">
          <Checkbox
            v-for="(item, index) in joiningData.levels"
            :key="index"
            :class="{'show-disable-line':!item.status}"
            :label="item.id"
            :disabled="!item.status"
            >{{ item.name }}</Checkbox
          >
          <p v-show="forbidden" style="line-height: 10px;color: #9EA7B4;font-size: 12px;">* 带划线的等级为禁用等级</p>
        </CheckboxGroup>
      </FormItem>
      <FormItem
        class="agent-setting-invite"
        label="允许授权邀请等级："
        prop="apply_setting.can_invite_level"
        v-show="joiningData.apply_setting.status&&joiningData.apply_setting.can_invite"
      >
        <CheckboxGroup v-model="joiningData.apply_setting.can_invite_level">
          <Checkbox
            v-for="(item, index) in joiningData.levels"
            :key="index"
            :class="{'show-disable-line':!item.status}"
            :label="item.id"
            :disabled="!item.status"
            >{{ item.name }}</Checkbox
          >
          <p v-show="forbidden" style="line-height: 10px;color: #9EA7B4;font-size: 12px;">* 带划线的等级为禁用等级</p>
        </CheckboxGroup>
      </FormItem>
      <FormItem label="经销商邀请设置：" class="agent-setting-invite" v-show="joiningData.apply_setting.status">
        <CheckboxGroup v-model="can_invite_setting">
          <Checkbox
            v-for="item in invite_settings"
            :key="item.key"
            :label="item.key"
            >{{ item.name }}</Checkbox>
        </CheckboxGroup>
      </FormItem>
      <FormItem v-show="joiningData.apply_setting.status" label="审核流程：">
        <div class="dealer-setting-base-itme dealer-seting-base-ts">
          <RadioGroup v-model="joiningData.apply_setting.verify_process">
            <Radio :label="0">推荐人审核-->上级审核-->公司审核</Radio>
            <Radio :label="1">推荐人审核-->上级审核</Radio>
          </RadioGroup>
        </div>
      </FormItem>
      <FormItem
        label="提交加盟申请资料："
        prop="apply_setting.extend_fields"
        v-show="joiningData.apply_setting.status&&((joiningData.apply_setting.can_apply&&joiningData.apply_setting.can_apply_level.length)||(joiningData.apply_setting.can_invite && joiningData.apply_setting.can_invite_level.length))"
      >
        <div class="agent-setting-joining-apply">
          <div v-for="(item, index) in applyData" :key="index">
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
            v-for="(item, index) in joiningData.apply_setting.extend_fields"
            :class="{ 'ivu-form-item-error': errorTip[index] }"
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
              >删除</a
            >
          </div>
          <Button type="primary" @click="onAddCustomData" icon="md-add"
            >新增自定义项</Button
          >
        </div>
        <div
          class="ivu-form-item-error-tip"
          v-show="applyTipShow"
          style="margin-top: -64px;"
        >
          {{ applyTipText }}
        </div>
      </FormItem>
      <FormItem
        label="显示申请协议："
        v-show="joiningData.apply_setting.status"
      >
        <RadioGroup v-model="joiningData.apply_setting.agreement_show">
          <Radio :label="1">显示</Radio>
          <Radio :label="0">隐藏</Radio>
        </RadioGroup>
      </FormItem>
      <FormItem
        label="申请协议："
        prop="apply_setting.agreement"
        v-show="
          joiningData.apply_setting.status &&
            joiningData.apply_setting.agreement_show
        "
      >
        <div class="distributor-setting-item" style="width: 607px;">
          <ue-editor
            style="line-height:normal;"
            :value="joiningData.apply_setting.agreement"
            ref="editor"
            posTop="72px"
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
        perm="dealer.config.operate"
        >保存</Button
      >
    </div>
  </div>
</template>
<script>
import ueEditor from "@/views/shop/components/editor/editor.vue";
import moreMessage from "@/views/shop/components/more-message/more-message.vue";
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
    switchTitlebar,
    moreMessage
  },
  data() {
    return {
      saveLoading: false,
      forbidden:false,
      joiningData: null,
      select_apply_level:[],//默认选中等级
      can_invite_setting: ['up_levels','same_levels','sub_levels'],
      invite_settings: [{
        key: 'up_levels',
        name: '越级推荐'
      }, {
        key: 'same_levels',
        name: '同级推荐'
      }, {
        key: 'sub_levels',
        name: '下级推荐'
      }],
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
        "apply_setting.apply_types": [
          {
            trigger: "change",
            validator: (rule, value, callback) => {
              // if (
              //   this.joiningData.apply_setting.can_apply ||
              //   this.joiningData.apply_setting.can_invite
              // ) {
                return callback();
              // }
              // return callback(new Error("至少选择一种加盟方式"));
            }
          }
        ],
        "apply_setting.can_apply_level": [
          {
            trigger: "change",
            validator: (rule, value, callback) => {
              // if (value.length) {
                return callback();
              // }
              // return callback(new Error("至少选择一个加盟等级"));
            }
          }
        ],
        "apply_setting.can_invite_level": [
          {
            trigger: "change",
            validator: (rule, value, callback) => {
              // if (value.length) {
                return callback();
              // }
              // return callback(new Error("至少选择一个加盟等级"));
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
        this.$httpGet("/shop/admin/dealer/apply/setting/info", null, res => {
          if (res.code === 200) {
            let data = res.data;
            if (!data.apply_setting.extend_fields) {
              data.apply_setting.extend_fields = [];
            }
            // 防止新站点导致选择等级出错
            if (!data.apply_setting.can_apply_level) {
              data.apply_setting.can_apply_level = [];
            }
            if (!data.apply_setting.can_invite_level) {
              data.apply_setting.can_invite_level = [];
            }
            if (!data.apply_setting.can_invite_setting) {
              data.apply_setting.can_invite_setting = {};
              this.can_invite_setting = this.invite_settings.map(item => item.key);
            } else {
              this.can_invite_setting = this.invite_settings.map(item => item.key).filter(item => data.apply_setting.can_invite_setting[item] == 1)
            }
            resolve();
            //是否有禁用等级
            for (var i=0;i<res.data.levels.length;i++){
              if (!res.data.levels[i].status){
                  this.forbidden = true;
              }else{
                  this.select_apply_level.push(res.data.levels[i].id);
              }
            }
            this.joiningData = res.data;
            //打开加盟设置后选中的等级
            if (!res.data.apply_setting.status) {
                this.joiningData.apply_setting.can_apply_level = this.select_apply_level;
                this.joiningData.apply_setting.can_invite_level = this.select_apply_level;
            }
            this.joiningData.apply_setting.apply_types = [];
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
      var can_invite_setting = this.joiningData.apply_setting.can_invite_setting;
      this.invite_settings.forEach(item => {
        can_invite_setting[item.key] = this.can_invite_setting.includes(item.key) ? 1 : 0
      });
      let data = Object.assign({}, this.joiningData.apply_setting);

      data.agreement = this.$refs["editor"].getCurrContent();
      this.$httpPost("/shop/admin/dealer/apply/setting/save", data, res => {
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
    onStatusChange(val) {
      if (!val) {
        this.$nextTick(() => {
          this.$set(this.joiningData.apply_setting, "status", 1);
          this.$Modal.confirm({
            title: "提示",
            content:
              "若关闭了经销商加盟功能，用户将不能在客户端主动提交申请加盟成为经销商，只能通过后台手动添加经销商，是否确定关闭？",
            onOk: () => {
              this.$set(this.joiningData.apply_setting, "status", 0);
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
        this.joiningData.apply_setting.extend_fields.filter(item => item.show)
          .length;
      //  自定义项是否都有标题
      let status1 =
        this.joiningData.apply_setting.extend_fields.filter((item, index) => {
          let val = item.name.trim();
          this.errorTip[index] = !val;
          return !!val;
        }).length === this.joiningData.apply_setting.extend_fields.length;
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
    padding: 24px;
    /*height: calc(100vh - 120px);*/
    overflow: auto;
    .ivu-form-item{
      .ivu-form-item-label{
        color: #657180 !important;
      }
      .ivu-radio-group{
        color: #657180 !important;
        .ivu-radio-wrapper{
          margin-right: 20px;
          .ivu-radio{
            margin-right: 5px;
          }
        }
      }
    }
    .ivu-form-item-content {
      /deep/.ivu-checkbox-wrapper {
        margin-right: 5px;
        vertical-align: middle;
        color: #657180;
        /deep/.ivu-checkbox {
          margin-right: 5px;
        }
      }
    }
    .agent-setting-invite,
    .agent-setting-apply {
      .show-disable-line{
        text-decoration: line-through;
      }
      .ivu-form-item-content .ivu-checkbox-wrapper {
        margin-right: 20px;
      }
    }
    .dealer-seting-base-ts{
      /deep/.ivu-radio-wrapper {
        margin-right: 5px;
      }
    }
  }
  .agent-setting-joining-apply {
    & > div + div {
      margin-top: 20px;
    }
    .ivu-checkbox-group {
      display: inline-block;
      vertical-align: top;
      margin-left: 14px;
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
      font-size: 12px;
      margin-top: 20px;
      border-radius: 17px;
      height: 32px;
      width: 114px;
      padding: unset;
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
