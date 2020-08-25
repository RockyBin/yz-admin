<template>
  <div class="distributor-level-detail" v-show="!$store.state.COMMON_loading">
    <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="144">
      <div>
        <verticalLineTitlebar :title="titles[0]" />
        <div class="distributor-level-detail-content">
          <FormItem label="等级权重：" prop="weight" class="margin-bottom-form">
            <Select
              class="common-input-text-160"
              :disabled="formValidate.weight === 0"
              v-model="formValidate.weight"
              not-found-text
            >
              <Option
                :value="item.id"
                v-for="item in levelList"
                :key="item.id"
                :disabled="item.disabled"
              >{{item.id}}</Option>
            </Select>
            <more-message style="margin-left: 10px;" text="分销等级权重，值越大越重要"></more-message>
          </FormItem>
          <FormItem label="分销商等级名称：" prop="name" class="margin-bottom-form">
            <i-input
              v-model.trim="levelName"
              class="common-input-text-260"
              :maxlength="10"
              placeholder="请输入等级名称"
            >
              <span style="line-height:32px;margin-right:5px;" slot="suffix">{{levelName.length}}/10</span>
            </i-input>
          </FormItem>
          <FormItem label="一级佣金比例：" prop="commissionOne" class="margin-bottom-form">
            <InputNumber
              :max="100"
              :min="0"
              :step="1"
              :precision="3"
              v-model="formValidate.commissionOne"
              class="common-input-text-160"
              placeholder="请输入佣金比例"
            />
            <span style="margin-left: 10px;">%</span>
            <more-message style="margin-left: 10px;" text="佣金设置为0，代表不参与分佣；一级二级三级佣金比例之和不能大于100%"></more-message>
          </FormItem>
          <FormItem label="二级佣金比例：" prop="commissionTwo" class="margin-bottom-form">
            <InputNumber
              :max="100"
              :min="0"
              :step="1"
              :precision="3"
              v-model="formValidate.commissionTwo"
              class="common-input-text-160"
              placeholder="请输入佣金比例"
            />
            <span style="margin-left: 10px;">%</span>
          </FormItem>
          <FormItem label="三级佣金比例：" prop="commissionThree" class="margin-bottom-form">
            <InputNumber
              :max="100"
              :min="0"
              :step="1"
              :precision="3"
              v-model="formValidate.commissionThree"
              class="common-input-text-160"
              placeholder="请输入佣金比例"
            />
            <span style="margin-left: 10px;">%</span>
          </FormItem>
        </div>
      </div>
      <div v-if="this.formValidate.weight" v-show="this.levelID > 0">
        <verticalLineTitlebar :title="titles[2]" />
        <div class="distributor-level-detail-content">
          <FormItem label="是否对新对象开放：" prop="new_open" class="margin-bottom-form">
            <more-message style="margin-right: 10px;" text="当关闭该功能时，新分销商不能升级到该等级。旧分销商仍可享受该等级优惠。"></more-message>
            <RadioGroup v-model="formValidate.new_open">
              <Radio :label="1">是</Radio>
              <Radio :label="0">否</Radio>
            </RadioGroup>
          </FormItem>
        </div>
      </div>
      <div v-show="formValidate.new_open">
        <verticalLineTitlebar :title="titles[1]" />
        <div class="distributor-level-detail-content">
          <FormItem label="是否允许会员自动升级：" class="margin-bottom-form">
            <RadioGroup v-model="formValidate.auto_upgrade">
              <Radio :label="1">是</Radio>
              <Radio :label="0">否</Radio>
            </RadioGroup>
          </FormItem>
        </div>
      </div>
      <div class="upgrade-conditions">
        <verticalLineTitlebar :title="titles[3]" />
        <div class="distributor-level-detail-content">
          <FormItem label="升级条件：" class="margin-bottom-form">
            <div>
              <more-message
                :maxWidth="374"
                style="margin-right: 10px;"
                :text="'数据的统计范围根据系统开启的分销层级来计算；\n例如：当只开启了2级分销，则统计1级+2级的数据。'"
              ></more-message>
              <add-more
                style="margin-bottom: -4px;"
                text="添加条件"
                @onAddMoreClick="onSelectLevelUpgradeCondition"
              ></add-more>
              <upgrade-condition
                ref="upgradeCondition"
                :productSelectData="productSelectData"
                :distributorLevel="levelData"
                :memberLevel="memberLevelData"
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
    <foot-button @onSaveClick="onSaveStart('formValidate')" :loading="saveLoading"></foot-button>
  </div>
</template>

<script>
import footButton from "COMPONENTS/button/foot-button.vue";
import verticalLineTitlebar from "COMPONENTS/titlebar/vertical-line-titlebar";
import upgradeConditionModal from "./components/distributor-level-select-modal";
import {
  conditionData,
  distributionKey,
  conditionType
} from "@/views/shop/components/common-data.js";
import moreMessage from "@/views/shop/components/more-message/more-message.vue";
import upgradeCondition from "./components/distributor-level-detail-condition";
import addMore from "@/views/shop/components/button/add-more.vue";
export default {
  components: {
    footButton,
    verticalLineTitlebar,
    upgradeConditionModal,
    upgradeCondition,
    addMore,
    moreMessage
  },
  data() {
    return {
      modalStatus: false,
      titles: ["等级信息", "升级限制", "开放分销商对象", "升级条件"],
      levelID: 0,
      condition: [],
      saveLoading: false,
      formValidate: {
        weight: "",
        name: "",
        status: "",
        new_open: 1,
        auto_upgrade: 0,
        commissionOne: null,
        commissionTwo: null,
        commissionThree: null
      },
      levelData: [],
      memberLevelData: [],
      productSelectData: [],
      ruleValidate: {
        weight: [
          {
            required: true,
            validator: (rule, value, callback) => {
              if (value === "") {
                return callback(new Error("请选择等级权重"));
              }
              return callback();
            },
            trigger: "blur"
          }
        ],
        name: [
          {
            required: true,
            validator: (rule, value, callback) => {
              if (!value.length) {
                return callback(new Error("请输入等级名称"));
              }
              // 名称重复
              if (
                this.levelData.find(
                  item =>
                    (item.id === 0 || this.levelID !== item.id) &&
                    value.trim() === item.name.trim()
                )
              ) {
                return callback(new Error("该名称已存在，请重新输入"));
              }
              return callback();
            },
            trigger: "blur"
          }
        ],
        commissionOne: [
          {
            required: true,
            validator: (rule, value, callback) => {
              if (value === null) {
                return callback(new Error("请输入佣金比例"));
              } else {
                return callback();
              }
            },
            trigger: "blur"
          }
        ],
        commissionTwo: [
          {
            required: true,
            validator: (rule, value, callback) => {
              if (value === null) {
                return callback(new Error("请输入佣金比例"));
              } else {
                return callback();
              }
            },
            trigger: "blur"
          }
        ],
        commissionThree: [
          {
            required: true,
            validator: (rule, value, callback) => {
              if (value === null) {
                return callback(new Error("请输入佣金比例"));
              } else {
                return callback();
              }
            },
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
    },
    levelList() {
      let listArray = Array.from({
        length: 99
      }).map((item, index) => {
        return {
          id: index + 1
        };
      });
      if (this.formValidate.weight === 0) {
        listArray.unshift({
          id: 0
        });
      }
      this.levelData.forEach(item => {
        if (item.weight && item.status && item.id !== this.levelID) {
          listArray[item.weight - 1].disabled = true;
        }
      });
      return listArray;
    },
    levelName: {
      set(val) {
        // 先赋值刷新数据，防止每次截取的字符串一样的情况下不触发get
        this.formValidate.name = val;
        this.$nextTick(() => {
          this.formValidate.name = this.maxLengthVal(val, 20);
        });
      },
      get() {
        return this.formValidate.name;
      }
    },
    conditionPlaceholder() {
      var id = this.selectConditionID;
      if (id == 1 || id == 3 || id == 5 || id == 7) {
        return "请输入金额";
      } else if (id == 2 || id == 4 || id == 6) {
        return "请输入次数";
      } else {
        return "请输入数量";
      }
    }
  },
  mounted() {
    this.levelID = Number(this.$route.query.id) || 0;
    this.$store.state.COMMON_loading = true;
    Promise.all([this.getMemberLevelList(), this.getDistributorList()]).then(
      () => {
        this.getData();
      }
    );
  },
  methods: {
    /**
     * 限制长度
     */
    maxLengthVal(str, length) {
      let strcopy = str;
      while (strcopy.replace(/[^\x00-\xFF]/g, "**").length > length) {
        strcopy = strcopy.substr(0, strcopy.length - 1);
      }
      return strcopy;
    },
    // 保存
    onSaveStart(name) {
      this.$refs[name].validate(valid => {
        if (valid) {
          if (
            this.formValidate.commissionOne +
              this.formValidate.commissionTwo +
              this.formValidate.commissionThree >
            100
          ) {
            this.$Modal.error({
              title: "提交失败",
              content: "各层级佣金比例之和不得超过100%。请重新设置。"
            });
            return;
          }
          if (!this.$refs["upgradeCondition"].checkData()) {
            this.$Message.error(this.$store.state.FAIL_MSG);
            return;
          }
          this.saveLoading = true;
          let data = {
            weight: this.formValidate.weight,
            name: this.formValidate.name,
            auto_upgrade: this.formValidate.auto_upgrade,
            levelCommission: {
              "1": this.formValidate.commissionOne,
              "2": this.formValidate.commissionTwo,
              "3": this.formValidate.commissionThree
            },
            upgradeCondition: {
                upgrade: this.condition,
              product_id:
                this.condition.find(item => conditionType.product[item.type])
                  ? this.productSelectData.map(n => n.id)
                  : []
            }
          };
          let url = "/shop/admin/distribution/level/add";
          if (this.levelID > 0) {
            url = "/shop/admin/distribution/level/edit";
            data.id = this.levelID;
            data.new_open = this.formValidate.new_open;
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
                path: "/distributor/level"
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
          "/shop/admin/distribution/level/info",
          {
            id: this.levelID
          },
          res => {
            this.$store.state.COMMON_loading = false;
            this.formValidate.weight = res.data.weight;
            this.formValidate.name = res.data.name;
            this.formValidate.status = res.data.status;
            this.formValidate.new_open = res.data.new_open;
            this.formValidate.auto_upgrade = res.data.auto_upgrade;
            this.formValidate.commissionOne =
              res.data.commission && res.data.commission["1"];
            this.formValidate.commissionTwo =
              res.data.commission && res.data.commission["2"];
            this.formValidate.commissionThree =
              res.data.commission && res.data.commission["3"];
            this.condition = this.sortConditionData(
              (res.data.condition && res.data.condition.upgrade) || []
            );
            this.productSelectData = res.data.product_list || [];
          }
        );
      } else {
        this.$store.state.COMMON_loading = false;
      }
    },
    /**
     * 获取会员等级列表
     */
    getMemberLevelList() {
      return new Promise(resolve => {
        this.$httpGet("/shop/admin/member/level/list", null, res => {
          if (res.code === 200) {
            this.memberLevelData = res.data.list || [];
            resolve();
          } else {
            this.$store.state.COMMON_loading = false;
            this.$Message.error(res.msg);
          }
        });
      });
    },
    /**
     * 获取分销商列表（用于判断权重是否可用）
     */
    getDistributorList() {
      return new Promise(resolve => {
        this.$httpGet("/shop/admin/distribution/level/list", null, res => {
          if (res.code === 200) {
            this.levelData = res.data || [];
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
          if (conditionType.person.extra[item]) {
            condition.push({
              type: item,
              logistic: "or",
              value: {
                distribution_level_id: null,
                member_count: null
              }
            });
            return;
          }
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
    }
  }
};
</script>

<style lang="less" scoped>
.distributor-level-detail {
  .distributor-level-detail-content {
    padding: 20px 0 24px;
  }
  form {
    padding: 24px 24px 0;
    overflow: hidden;
    /deep/.ivu-form-item-label {
      height: 32px;
    }
    /deep/.ivu-form-item-content {
      height: 32px;
      & > div {
        vertical-align: top;
      }
      .ivu-radio-wrapper {
        margin-right: 20px;
      }
    }
    /deep/.ivu-input-suffix {
      width: 40px;
    }

    .distributor-level-btn {
      padding: 0;
      width: 70px;
      height: 32px;
      border: none;
      span {
        display: block;
        line-height: 32px;
      }
    }

    .upgrade-conditions {
      /deep/.ivu-form-item-content {
        height: auto;

        .ivu-input-number {
          vertical-align: bottom;
        }
        .ivu-form-item-error-tip {
          margin-left: 220px;
          margin-top: -28px;
        }
      }

      /deep/.ivu-radio {
        margin-right: 8px;
      }
    }
  }
}
</style>
