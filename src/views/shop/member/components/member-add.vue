<template>
  <div class="container">
    <Form
      ref="formValidate"
      :model="formValidate"
      :rules="ruleValidate"
      :label-width="120"
      class="member-add"
    >
      <div class="level-news">
        <verticalLineTitlebar title="等级信息"/>
        <div class="news-container">
          <FormItem label="等级权重:" prop="weight">
            <Select v-model="formValidate.weight" :disabled="disabled" class="common-input-text-160">
              <Option
                v-for="(item, index) in levelList"
                :value="item.value"
                :disabled="Number(item.status) === 1"
                :key="index"
              >{{ item.value }}</Option>
            </Select>
            <more-message text="会员等级权重，值越大越重要" class="common-ml-8"></more-message>
          </FormItem>
          <FormItem label="等级名称:" prop="name">
            <i-input v-model="formValidate.name" class="common-input-text-260" :maxlength="10" placeholder="请输入等级名称">
              <span slot="suffix">{{formValidate.name?formValidate.name.length:0}}/10</span>
            </i-input>
            <!-- <more-message text="最多可输入20个字符" class="common-ml-8"></more-message> -->
          </FormItem>
          <FormItem label="折扣:" prop="discount">
            <InputNumber
              v-model="formValidate.discount"
              class="common-input-text-160"
              :min="0"
              :max="100"
              :precision="3"
              placeholder="请输入折扣"
            ></InputNumber>
            <span class="common-ml-8" style="vertical-align: middle">%</span>
            <more-message text="折扣范围：0.001-100%" class="common-ml-8"></more-message>
          </FormItem>
        </div>
      </div>
      <div class="upgrade-conditions" v-if="modify&&formValidate.weight">
        <verticalLineTitlebar title="开放对象用户"/>
        <div class="conditions-container">
          <FormItem label="是否对新用户开放：" prop="for_newmember">
            <more-message style="margin-right: 14px;" text="当关闭该功能时，新用户不能升级到该等级。旧用户仍可享受该等级优惠"></more-message>
            <RadioGroup v-model="formValidate.for_newmember">
              <Radio :label="1">是</Radio>
              <Radio :label="0">否</Radio>
            </RadioGroup>
          </FormItem>
        </div>
      </div>
      <div class="upgrade-conditions" v-if="formValidate.weight>0 || formValidate.weight==null">
        <verticalLineTitlebar title="升级条件"/>
        <div class="conditions-container">
          <FormItem label="升级条件：" class="margin-bottom-form" prop="upgrade_value">
            <div>
              <more-message
                :maxWidth="374"
                style="margin-right: 12px;"
                :text="'不设升级条件则表示将没有会员可以升级到该等级。'"
              ></more-message>
              <add-more
                style="margin-bottom: -24px;"
                text="添加条件"
                @onAddMoreClick="onSelectLevelUpgradeCondition"
              ></add-more>
              <upgrade-condition
                ref="upgradeCondition"
                :productSelectData="productSelectData"
                :distributorLevel="levelData"
                :dataItem="condition"
              ></upgrade-condition>
            </div>
          </FormItem>
        </div>
      </div>
    </Form>
    <upgrade-condition-modal
      v-model="modalStatus"
      :selectID="selectConditionID"
      @getSelectID="getSelectConditionID"
    ></upgrade-condition-modal>
    <foot-button>
      <Button type="primary" class="save" @click="onSaveStart('formValidate')" perm="member.level.operate">保存</Button>
      <!-- <Button class="cancel" @click="onCancel('formValidate')">取消</Button> -->
    </foot-button>
  </div>
</template>
<script>
import footButton from "COMPONENTS/button/foot-button.vue";
import verticalLineTitlebar from "COMPONENTS/titlebar/vertical-line-titlebar";
import upgradeCondition from "./member-level-detail-condition";
import upgradeConditionModal from "./member-level-select-modal";
import moreMessage from "COMPONENTS/more-message/more-message";
import addMore from "@/views/shop/components/button/add-more.vue";
import {
  conditionData,
  distributionKey,
  conditionType
} from "./member-level.js";
export default {
  components: {
    footButton,
    verticalLineTitlebar,
    moreMessage,
    upgradeCondition,
    upgradeConditionModal,
    addMore
  },
  props: {
    modify: {
      type: Boolean,
      default: false
    },
    modifyData: {
      type: Object,
      default() {
        return {};
      }
    },
    member_count: {
      type: Number,
      default: 0
    },
    levelList: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  data() {
    return {
      showAdd: false, // 关闭添加界面
      modalStatus: false,
      formValidate: {
        weight: null,
        name: "",
        discount: null,
        for_newmember: 0,
        upgrade_value:0
      },
      productSelectData: [],
      condition: [],
      levelData: [],
      disabled:false,
      levelID:0,
      ruleValidate: {
        weight: [
          {
            type: "number",
            required: true,
            message: "请选择等级权重",
            trigger: "change"
          }
        ],
        discount: [
          {
              required:true,
              type:"number",
            validator(rule, value, callback) {
              if (value < 0.001 || value > 100) {
                callback(new Error("输入0.001到100之间的数字"));
              } else {
                callback();
              }
            }
          },
          // {
          //   message: "只能保留一位小数",
          //   trigger: "blur",
          //   pattern: /^(([1-9]\d{0,9})|0)(\.\d{0,1})?$/
          // },
          // {
          //   required:true,
          //   type:"number",
          //   min:0.001,
          //   max:100,
          //   trigger:"change",
          //   message:"折扣必须为0.001到100之间的数字"
          // }
        ],
        name: [
          // {
          //   required: true,
          //   message: "请选择等级名称",
          //   trigger: "blur",
          //   type: String
          // },
          {
            // validator(rule, value, callback) {
            //   if (value) {
            //     let maxLength = 20;
            //     let len = 0;
            //     let str = "";
            //     let status = false;
            //     for (let i in value) {
            //       // let nums =
            //       //   value.charCodeAt(i) > 127 || value.charCodeAt(i) == 94
            //       //     ? 2
            //       //     : 1;
            //       len += 1;
            //       str += value[i];
            //       if (len > maxLength) {
            //         status = true;
            //         break;
            //       }
            //     }
            //     if (status) {
            //       // setTimeout(() => {
            //       //   this.formValidate.name = str;
            //       // }, 1);
            //       // this.formValidate.name = str;
            //       // this.$nextTick(() => {
            //       // console.log(this.formValidate, "aq");
            //       // });
            //       callback(new Error(""));
            //     } else {
            //       callback();
            //     }
            //   } else {
            //     callback(new Error("请选择等级名称"));
            //   }
            // },
            required: true,
            message: "请选择等级名称",
            trigger: "blur"
          }
        ]
      }
    };
  },
  computed: {
    selectConditionItem() {
      return conditionData.filter(item => item.id === this.selectConditionID);
    },
    selectConditionID() {
      return this.condition.map(n => n.type);
    },
    // 升级条件输入框保留位数
    precision() {
      return this.selectConditionItem[0] &&
      this.selectConditionItem[0].unit === "元"
              ? 2
              : 0;
    }
  },
  mounted() {
    this.levelID = Number(this.$route.query.id) || 0;
    this.$store.state.COMMON_loading = true;
    this.getDistributorList().then(() => {
      this.getData();
    });
  },
  methods: {
    // 保存
    onSaveStart(name) {
      this.$refs[name].validate(valid => {
        if (valid) {
          if (this.formValidate.weight){
            if (!this.$refs["upgradeCondition"].checkData()) {
              this.$Message.error(this.$store.state.FAIL_MSG);
              return;
            }
          }
          this.saveLoading = true;
          let conditionType = [];
          this.condition.filter(item=>{
            item.name=item.typeName+"满"+item.value+"元";
            conditionType.push({
              type:item.type,
              value:item.value,
              logistic:item.logistic,
              name:item.name,
            })
          });
          let data = {
            weight: this.formValidate.weight,
            name: this.formValidate.name,
            discount: this.formValidate.discount,
            condition: conditionType
          };
          let url = "/shop/admin/member/level/add";
          if (this.levelID > 0) {
            url = "/shop/admin/member/level/edit";
            data.id = this.levelID;
            data.for_newmember = this.formValidate.for_newmember;
          }
          this.http({
            url,
            method: "POST",
            data
          }).then(res => {
            this.saveLoading = false;
            if (res.code === 200) {
              this.$Message.success(this.$store.state.SUCCESS_MSG);
              this.$router.push({
                path: "/member/level"
              });
            } else {
              this.$Message.error(this.$store.state.FAIL_MSG);
            }
          });
        } else {
          this.$Message.error(this.$store.state.FAIL_MSG);
        }
      });
    },
    // 获取数据
    getData() {
      if (this.levelID > 0) {
        this.$httpGet(
          "/shop/admin/member/level/info",
          {
            id: this.levelID
          },
          res => {
            this.$store.state.COMMON_loading = false;
            if (!res.data.weight){
              this.disabled = true;
            }
            this.formValidate.weight = res.data.weight;
            this.formValidate.name = res.data.name;
            this.formValidate.status = res.data.status;
            this.formValidate.for_newmember = res.data.for_newmember;
            this.formValidate.discount = res.data.discount;
            this.condition = this.sortConditionData(
                    res.data.condition || []
            );
            // this.productSelectData = res.data.product_list || [];
          }
        );
      } else {
        this.$store.state.COMMON_loading = false;
      }
    },
    /**
     * 获取等级列表（用于判断权重是否可用）
     */
    getDistributorList() {
      return new Promise(resolve => {
        this.$httpGet("/shop/admin/member/level/list", null, res => {
          if (res.code === 200) {
            this.levelData = res.data.list || [];
            resolve();
          } else {
            this.$store.state.COMMON_loading = false;
            this.$Message.error(res.msg);
          }
        });
      });
    },
    /**
     * 弹出升级条件选择弹窗
     */
    onSelectLevelUpgradeCondition() {
      this.modalStatus = true;
    },
    /**
     * 获取选中的升级条件
     */
    getSelectConditionID(ids) {
      let condition = this.createConditionData(ids);
      this.condition = this.sortConditionData(condition);
      this.$refs["upgradeCondition"].distributorError = {};
    },
    /**
     * 生成升级条件数据
     */
    createConditionData(ids) {
      let condition = this.condition.concat();
      ids.forEach(item => {
        if (!this.selectConditionID.includes(item)) {
          // if (conditionType.person.extra[item]) {
          //   condition.push({
          //     type: item,
          //     logistic: "or",
          //     value: {
          //       member_level_id: null,
          //       member_count: null
          //     }
          //   });
          //   return;
          // }
          condition.push({
            type: item,
            logistic: "or",
            value: null
          });
        }
      });
      return condition;
    },
    /**
     * 升级条件数据排序
     */
    sortConditionData(conditionArray) {
      let condition = {};
      conditionArray.forEach(n => {
        condition[n.type] = n;
      });
      return Object.values(distributionKey)
              .filter(n => condition[n])
              .map(n => condition[n]);
    },
    // 保存启用按钮
    // onSaveStart(name) {
    //   this.$refs[name].validate(valid => {
    //     if (valid) {
    //       let urls = "";
    //       let obj = {};
    //       obj = this.formValidate;
    //       if (this.modify) {
    //         urls = "/shop/admin/member/level/edit";
    //       } else {
    //         urls = "/shop/admin/member/level/add";
    //         for (var k in obj) {
    //           if (k == "for_newmember") {
    //             delete obj[k];
    //           }
    //         }
    //       }
    //       if (obj.discount === 0) {
    //         obj.discount = null;
    //       }
    //       this.$httpGet(urls, obj, res => {
    //         if (res.code === 511 || res.code === 512) {
    //           this.$Modal.error({
    //             title: "启用失败",
    //             className: ".common-modal-style",
    //             content:
    //               res.msg +
    //               ": 累计消费金额 " +
    //               this.formValidate.upgrade_value +
    //               "元。" +
    //               "请重新设置。"
    //           });
    //         } else if (res.code === 200) {
    //           this.$emit("backMemberLevel", this.showAdd);
    //           this.$Message.success(this.$store.state.SUCCESS_MSG);
    //         } else {
    //           this.$Message.error(this.$store.state.FAIL_MSG);
    //         }
    //       });
    //     } else {
    //       this.$Message.error(this.$store.state.FAIL_MSG);
    //     }
    //   });
    // },
    // 取消按钮
    onCancel(name) {
      this.$refs[name].resetFields();
      this.$emit("backMemberLevel", this.showAdd);
    }
  },
  watch: {
    // 监听是否发生修改
    modify(val) {
      if (val) {
        this.formValidate = this.modifyData;
        this.formValidate.upgrade_value = Number(
          this.formValidate.upgrade_value
        );
      }
    }
  }
};
</script>
<style lang="less" scoped>
.container {
  /deep/.foot-button {
    .foot-button-content {
      left: 0;
    }
  }
  .member-add {
    text-align: left;
    .level-news {
      .news-container {
        padding: 24px 0 16px 16px;
        & > div:nth-child(2) {
          margin: 30px 0;
        }
        /deep/.ivu-form-item-label {
          width: 120px;
        }
        /deep/.ivu-input-with-suffix {
          padding-right: 40px;
        }
        /deep/.ivu-input-suffix {
          width: 40px;
          line-height: 32px;
        }
      }
    }
    .upgrade-conditions {
      .conditions-container {
        padding: 30px 0 30px 16px;
        & > div:nth-child(2) {
          margin: 30px 0;
        }
        /deep/.ivu-form-item-label {
          width: 120px;
        }
      }
      /deep/.ivu-radio {
        margin-right: 8px;
      }
    }
  }
}
// 公共css
.common-line {
  display: inline-block;
  width: 4px;
  height: 20px;
  background-image: linear-gradient(#4570ea, #4570ea),
    linear-gradient(#4570ea, #4570ea);
  background-blend-mode: normal, normal;
  border-radius: 2px;
}
// 标题样式
.common-title {
  font-size: 14px;
  font-weight: normal;
  letter-spacing: 1px;
  color: #464c5b;
  vertical-align: super;
  margin-left: 16px;
}
// 图标
.common-icon {
  vertical-align: middle;
  font-size: 18px;
  margin-left: 10px;
}
// input样式
.consumption-money {
  width: 160px;
}
.save {
  background: #4a6af5;
  border-color: #4a6af5;
  color: #fff;
  width: 70px;
  height: 32px;
}
.save:hover {
  background: #5d7af7;
}
</style>
