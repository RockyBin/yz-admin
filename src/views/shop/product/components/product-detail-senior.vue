<template>
  <div class="product-detail-senior">
    <!-- 商品参数设置 -->
    <Form
      ref="formValidateSenior"
      :model="value"
      :rules="ruleValidateSenior"
      :label-width="86"
      :show-message="true"
    >
      <!-- 商品标签设置 -->
      <FormItem label="商品标签：" v-if="false">
        <div class="product-detail-item">
          <Poptip trigger="hover" word-wrap content="content">
            <i class="iconfont icon-ios-information-circ1"></i>
          </Poptip>
          <Button type="primary">
            <i class="iconfont icon-ios-add" />
            <span>标签管理</span>
          </Button>
          <div class="product-detail-newsline">
            <div class="product-detail-senior-tag">
              <Tag
                v-for="item in count"
                :key="item"
                :name="item"
                closable
                @on-close="onParamsClose"
              >标签{{ item + 1 }}</Tag>
              <Button
                :disabled="disableChange"
                icon="ios-add"
                type="dashed"
                size="small"
                shape="circle"
                @click="handleAdd"
              >添加标签</Button>
            </div>
          </div>
        </div>
      </FormItem>
      <FormItem label="库存预警：" prop="productSkuNumWarning">
        <div class="product-detail-item product-detail-item-height">
          <InputNumber
            :disabled="disableChange"
            style="vertical-align: top;width:280px"
            v-model="value.productSkuNumWarning"
            :min="0"
            :max="9999999"
            :precision="0"
            placeholder="请输入预警数量"
          />
          <more-message style="margin-left: 12px;" text="输入大于0的整数"></more-message>
        </div>
      </FormItem>
      <FormItem label="销量基数：" prop="base_sold_count">
        <div class="product-detail-item product-detail-item-height">
          <InputNumber
            style="vertical-align: top;width:280px"
            v-model="value.base_sold_count"
            :min="0"
            :max="9999999"
            :precision="0"
            placeholder="请输入销量基数"
          />
          <more-message style="margin-left: 12px;" text="商品销售基数不计入后台实际销售数据"></more-message>
        </div>
      </FormItem>
      <FormItem label="商品排序：" prop="sort">
        <div class="product-detail-item product-detail-item-height">
          <InputNumber
            style="vertical-align: top;width:280px"
            v-model="value.sort"
            :min="0"
            :max="9999999"
            :precision="0"
            placeholder="请输入商品排序"
          />
          <more-message style="margin-left: 12px;" text="数字越大越排前"></more-message>
        </div>
      </FormItem>
      <FormItem label="积分抵扣：" prop="discoStatus">
        <div class="product-detail-item product-detail-item-height">
          <more-message style="margin-right: 10px;" text="开启积分抵扣。该商品在购买过程中，可以使用积分抵扣金额"></more-message>
          <RadioGroup v-model="value.discoStatus">
            <Radio :label="0">跟随系统设置</Radio>
            <Radio :label="1">自定义积分</Radio>
            <Radio :label="-1">不参与</Radio>
          </RadioGroup>
        </div>
      </FormItem>
      <div class="custom-point-setting">
        <FormItem
          v-show="value.discoStatus == 1"
          prop="pointRule.rule_info.out_order_pay_point"
          style="margin-top: -10px !important;"
        >
          <div>
            每&nbsp;
            <InputNumber
              style="vertical-align: top;width:150px"
              v-model="value.pointRule.rule_info.out_order_pay_point"
              :min="1"
              :max="9999999"
              :precision="0"
              placeholder="请输入积分数"
            />&nbsp;积分可抵扣1元，最大积分抵扣&nbsp;
          </div>
        </FormItem>
        <FormItem
          v-show="value.discoStatus == 1"
          :label-width="0"
          prop="pointRule.rule_info.out_order_pay_max_percent"
        >
          <div>
            <InputNumber
              style="vertical-align: top;width:150px"
              v-model="value.pointRule.rule_info.out_order_pay_max_percent"
              :min="1"
              :max="100"
              :precision="0"
              placeholder="请输入积抵扣比例"
            />&nbsp;%
          </div>
        </FormItem>
      </div>
      <FormItem label="售后设置：">
        <div class="product-detail-item product-detail-item-height">
          <RadioGroup v-model="value.after_sale_setting">
            <Radio :label="0">跟随系统设置</Radio>
            <Radio :label="1">不参与</Radio>
          </RadioGroup>
        </div>
      </FormItem>
      <FormItem label="开启限购：" prop="buy_limit_status">
        <div class="product-detail-item product-detail-item-height">
          <RadioGroup v-model="value.buy_limit_status">
            <Radio :label="1">是</Radio>
            <Radio :label="0">否</Radio>
          </RadioGroup>
        </div>
      </FormItem>
      <FormItem label="周期限购：" v-show="value.buy_limit_status" prop="buy_limit_num">
        <div class="product-detail-item product-detail-item-height align-special">
          <Select v-model="value.buy_limit_type" class="limit-type">
            <Option :value="99">终身</Option>
            <Option :value="1">每天</Option>
            <Option :value="2">每周</Option>
            <Option :value="3">每月</Option>
            <Option :value="4">每季</Option>
            <!--<Option :value="5">每年</Option>-->
          </Select>
          <InputNumber
            class="limit-num"
            v-model="value.buy_limit_num"
            :min="1"
            :max="9999999"
            :precision="0"
            placeholder="请输入限购数量"
          />
          <more-message style="margin-left: 10px;" text="周期限购：是指该商品在规定限期内，单个会员累计的最大购买数量"></more-message>
        </div>
      </FormItem>

      <FormItem label="起售数量：" prop="min_buy_num">
        <div class="product-detail-item product-detail-item-height">
          本商品至少
          <InputNumber
            style="vertical-align: top;width:150px"
            v-model="value.min_buy_num"
            :min="1"
            :max="9999999"
            :precision="0"
            placeholder="请输入销量数量"
          />件起售
          <more-message style="margin-left: 12px;" text="起售数量是指单次下单时，最少的起售数量；当设置的起售数量大于商品库存时，无法购买"></more-message>
        </div>
      </FormItem>
      <FormItem label="浏览权限：" prop="view_perm" :class="{'product-bottom': value.view_perm === 2}">
        <div class="product-detail-item">
          <more-message style="margin-right: 10px;" text="没有浏览权限则不能浏览该商品。"></more-message>
          <RadioGroup v-model="value.view_perm">
            <Radio :label="0">公开</Radio>
            <Radio :label="1">全部登录会员</Radio>
            <Radio
              :label="2"
              :disabled="!hasMemberLevel()"
              :title="hasMemberLevel() ? '' : '您没有新增会员等级，此选项禁用'"
            >指定会员等级</Radio>
          </RadioGroup>
          <div class="product-detail-item product-member-level" v-show="value.view_perm === 2">
            <tree-select
              :data="accessClass"
              :placeholder="placeholder"
              ref="accesstree"
              @on-check-change="onSelectClass(1)"
              :transfer="true"
            ></tree-select>
          </div>
        </div>
      </FormItem>
      <FormItem label="购买权限：" prop="buy_perm">
        <div class="product-detail-item">
          <more-message style="margin-right: 10px;" text="没有购买权限则不能购买该商品。"></more-message>
          <RadioGroup v-model="value.buy_perm">
            <Radio :label="1">全部登录会员</Radio>
            <Radio
              :label="2"
              :disabled="!hasMemberLevel()"
              :title="hasMemberLevel() ? '' : '您没有新增会员等级，此选项禁用'"
            >指定会员等级</Radio>
          </RadioGroup>
        </div>
        <div class="product-detail-item product-member-level" v-show="value.buy_perm === 2">
          <tree-select
            :data="buyPermissionsClass"
            :placeholder="placeholder"
            ref="buytree"
            @on-check-change="onSelectClass(2)"
            :transfer="true"
          ></tree-select>
        </div>
      </FormItem>
      <FormItem label="商品参数：">
        <div class="product-detail-item">
          <div class="product-params-import">
            <Select
              :class="importParamsTipShow?'ivu-form-item-error':''"
              v-model="currentParams"
              placeholder="请选择参数模板"
              @on-change="importParamsTipShow = false"
            >
              <Option v-for="item in paramsList" :value="item.id" :key="item.id">{{item.name}}</Option>
            </Select>
            <Button type="primary" @click="importParams">导入数据</Button>
            <more-message
              style="margin-left: 10px;"
              text="导入模板后将会覆盖旧的参数内容；商品引用参数模板后，参数数据独立，修改模板数据将不会影响到此商品的参数。商品参数模板到“商品管理>商品设置>商品参数”设置。"
            ></more-message>
          </div>
          <div class="ivu-form-item-error-tip" v-show="importParamsTipShow">请选择参数模板</div>
          <div class="product-detail-senior-params">
            <Table
              v-if="!sorting"
              class="params-list"
              :columns="columnsParams"
              :data="value.paramsData"
            ></Table>
            <div class="row">
              <Button
                :disabled="disableChange"
                v-show="value.paramsData.length < 30"
                type="primary"
                shape="circle"
                @click="onProductDetailParamsAdd"
              >
                <i class="iconfont icon-ios-add" />
                <span>添加新参数</span>
              </Button>
              <a
                v-if="value.paramsData.length"
                class="table-operation"
                href="javascript:void(0)"
                @click="clearAll"
              >清空全部数据</a>
            </div>
          </div>
        </div>
      </FormItem>
      <FormItem prop="paramsData" :show-message="false" v-show="false"></FormItem>
    </Form>
  </div>
</template> 
<script>
import moreMessage from "@/views/shop/components/more-message/more-message.vue";
import treeSelect from "@/views/shop/components/selector/class-tree-select.vue";
import Sortable from "sortablejs";
import axios from "axios";
export default {
  components: { moreMessage, treeSelect },
  props: {
    value: {
      default() {
        return {
          productSkuNumWarning: "",
          paramsData: [],
          discoStatus: -1,
          after_sale_setting: 0,
          view_perm: 0,
          buy_perm: 1,
          buyLevels: [],
          viewLevels: []
        };
      }
    },
    disableChange: {
      default: false,
      type: Boolean
    },
    memberList: {
      default: [],
      type: Array
    }
  },
  data() {
    return {
      sorting: false,
      // showParamsImport:false,
      currentParams: null,
      paramsList: [],
      placeholder: "请选择会员等级",
      ruleValidateSenior: {
        "pointRule.rule_info.out_order_pay_point": [
          {
            required: true,
            validator: (rule, value, callback) => {
              if (this.value.discoStatus == 1 && !value) {
                callback(new Error("请输入积分数"));
                return;
              }
              callback();
            }
          }
        ],
        "pointRule.rule_info.out_order_pay_max_percent": [
          {
            required: true,
            validator: (rule, value, callback) => {
              if (this.value.discoStatus == 1 && !value) {
                callback(new Error("请输入积分抵扣比例"));
                return;
              }
              callback();
            }
          }
        ],
        view_perm: [
          {
            validator: (rule, value, callback) => {
              if (value === 2 && this.value.viewLevels.length <= 0) {
                return callback(new Error("请选择会员等级"));
              }
              return callback();
            },
            trigger: "blur"
          }
        ],
        buy_perm: [
          {
            validator: (rule, value, callback) => {
              if (value === 2 && this.value.buyLevels.length <= 0) {
                return callback(new Error("请选择会员等级"));
              }
              return callback();
            },
            trigger: "blur"
          }
        ],
        buy_limit_num: [
          {
            required: true,
            validator: (rule, value, callback) => {
              if (!value && this.value.buy_limit_status) {
                return callback(new Error("请设置限购数量"));
              }
              return callback();
            },
            trigger: "blur"
          }
        ],
        paramsData: [
          {
            validator: (rule, value, callback) => {
              let errorText = "";
              value.forEach(item => {
                if (!item.paramsName.trim()) {
                  errorText = errorText || "请输入参数名称";
                  this.$set(item, "nameError", true);
                }
                if (!(item.paramsDesc && item.paramsDesc.trim())) {
                  errorText = errorText || "请输入参数描述";
                  this.$set(item, "descError", true);
                }
              });
              return errorText ? callback(new Error(errorText)) : callback();
            },
            trigger: "blur"
          }
        ]
      },
      count: [],
      importParamsTipShow: false,
      columnsParams: [
        {
          title: "参数名称",
          width: 164,
          renderHeader: (h, p) => {
            return h("div", [
              h("span", "参数名称"),
              h(moreMessage, {
                style: {
                  "margin-left": "5px",
                  "font-weight": "normal"
                },
                props: {
                  text: "最多能添加30个参数"
                }
              })
            ]);
          },
          render: (h, params) => {
            return h(
              "div",
              {
                class: "wrapper"
              },
              [
                h("Input", {
                  style: {
                    height: "48px",
                    width: "100%"
                  },
                  props: {
                    type: "textarea",
                    disabled: this.disableChange,
                    value: params.row.paramsName,
                    placeholder: "请输入参数名称",
                    maxlength: 8
                  },
                  class: { "ivu-form-item-error": params.row.nameError },
                  on: {
                    input: el => {
                      this.value.paramsData[params.index] = params.row;
                      params.row.paramsName = el;
                      delete this.value.paramsData[params.index].nameError;
                    }
                  }
                }),
                h(
                  "span",
                  {
                    class: "suffix"
                  },
                  `${
                    params.row.paramsName ? params.row.paramsName.length : 0
                  }/8`
                )
              ]
            );
          }
        },
        {
          title: "参数描述",
          minWidth: 550,
          render: (h, params) => {
            return h(
              "div",
              {
                class: "wrapper"
              },
              [
                h("Input", {
                  style: {
                    height: "48px",
                    width: "100%"
                  },
                  props: {
                    type: "textarea",
                    disabled: this.disableChange,
                    value: params.row.paramsDesc,
                    placeholder: "请输入参数描述",
                    maxlength: 80
                  },
                  class: { "ivu-form-item-error": params.row.descError },
                  on: {
                    input: el => {
                      this.value.paramsData[params.index] = params.row;
                      params.row.paramsDesc = el;
                      delete this.value.paramsData[params.index].descError;
                    }
                  }
                }),
                h(
                  "span",
                  {
                    class: "suffix"
                  },
                  `${
                    params.row.paramsDesc ? params.row.paramsDesc.length : 0
                  }/80`
                )
              ]
            );
          }
        },
        {
          title: "操作",
          align: "center",
          width: 170,
          render: (h, params) => {
            return h(
              "span",
              {
                class: {
                  "table-operation": true
                },
                attrs: {
                  disabled: this.disableChange
                },
                on: {
                  click: () => {
                    this.value.paramsData.splice(params.index, 1);
                  }
                }
              },
              "删除"
            );
          }
        }
      ]
    };
  },
  computed: {
    accessClass() {
      return this.memberDataList(this.value.viewLevels);
    },
    buyPermissionsClass() {
      return this.memberDataList(this.value.buyLevels);
    }
  },
  created() {
    this.getParamsList();
  },
  mounted() {
    this.initSort();
  },
  methods: {
    memberDataList(memberProductClass) {
      var accessClassList = [];
      var parentObj = {
        children: [],
        data: {
          class_name: "全部会员等级",
          id: -999
        },
        expand: true,
        title: "全部会员等级"
      };
      // 处理会员等级数据
      var newMemberList = [];
      this.memberList.forEach(el => {
        var titem = {
          title: el.name
        };
        titem.expand = !!el.expand;
        titem.isDisabled = el.status === 0 ? true : false;
        titem.data = {
          id: el.id,
          class_name: el.name
        };
        if (
          memberProductClass.length > 0 &&
          memberProductClass.indexOf(el.id) > -1
        )
          titem.checked = true;
        newMemberList.push(titem);
      });
      parentObj.children = newMemberList;
      accessClassList.push(parentObj);
      return accessClassList;
    },
    /**
     * 获取选择的分类
     */
    onSelectClass(types) {
      // 判断是 1 浏览权限还是 2 购买权限
      let saveData = [];
      if (types === 1) {
        var list = this.$refs["accesstree"].getCheckedNodes();
        saveData = this.value.viewLevels;
      } else {
        var list = this.$refs["buytree"].getCheckedNodes();
        saveData = this.value.buyLevels;
      }
      var cls = [];
      let expandObj = {};
      list.forEach(item => {
        if (item.data.id !== -999) {
          cls.push(item.data.id);
        }
      });
      this.accessClass.forEach(item => {
        if (item.expand) {
          expandObj[item.data.id] = true;
        }
      });

      saveData.forEach(item => {
        if (expandObj[item.id]) {
          item.expand = true;
        } else {
          delete item.expand;
        }
      });
      types === 1
        ? (this.value.viewLevels = cls)
        : (this.value.buyLevels = cls);
    },
    /**
     * 添加标签
     */
    handleAdd() {
      if (this.count.length) {
        this.count.push(this.count[this.count.length - 1] + 1);
      } else {
        this.count.push(0);
      }
    },
    /**
     * 删除标签
     */
    onParamsClose(event, name) {
      const index = this.count.indexOf(name);
      this.count.splice(index, 1);
    },
    /**
     * 添加参数
     */
    onProductDetailParamsAdd() {
      if (this.value.paramsData.length >= 30) {
        return;
      }
      this.value.paramsData.push({
        // paramsName: "参数" + (this.value.paramsData.length + 1),
        paramsName: "",
        paramsDesc: ""
      });
    },
    /**
     * 拖拽排序
     */
    initSort() {
      var el = document.querySelector(".params-list .ivu-table-tbody");
      this.sortable = Sortable.create(el, {
        filter: ".ivu-input-wrapper",
        draggable: ".ivu-table-row",
        direction: "vertical",
        preventOnFilter: false,
        disabled: false,
        animation: 150,
        onEnd: event => {
          var newIndex = event.newIndex;
          var oldIndex = event.oldIndex;
          var [item] = this.value.paramsData.splice(oldIndex, 1);
          this.value.paramsData.splice(newIndex, 0, item);

          //强制重新渲染
          // this.tableKey=Math.random();
          // this.$nextTick(()=>{
          //   this.initSort()
          // })

          this.sorting = true;
          this.$nextTick(() => {
            this.sorting = false;
            this.$nextTick(() => {
              this.initSort();
            });
          });
        }
      });
    },
    getParamsList() {
      axios
        .get("/shop/admin/product/param/list", {
          params: {
            show_all: 1
          }
        })
        .then(res => {
          if (res.code == 200) {
            // this.$Message.success(res.msg);
            this.paramsList = res.data.list;
          } else {
            this.$Message.error(res.msg);
          }
        })
        .catch(err => {
          this.$Message.error(err);
        });
    },
    importParams() {
      if (this.currentParams) {
        this.importParamsTipShow = false;
        let obj = this.paramsList.find(item => {
          return item.id == this.currentParams;
        });
        if (obj) {
          this.value.paramsData = obj.params.map(item => {
            return {
              paramsName: item.paramsName,
              paramsDesc: item.paramsDescription
            };
          });
          // this.value.paramsData=Object.keys(obj.params).map(key=>{
          //   return{
          //     paramsName:key,
          //     paramsDesc:obj.params[key]
          //   }
          // })
        }
      } else {
        this.importParamsTipShow = true;
      }
    },
    clearAll() {
      this.value.paramsData = [];
    },
    // 是否有会员等级
    hasMemberLevel() {
      if (!this.memberList || this.memberList.length == 0) {
        return false;
      }
      return true;
    }
  }
};
</script>
<style lang="less" scoped>
.product-detail-senior {
  .ivu-switch {
    margin-left: 8px;
  }
  .product-detail-item {
    /deep/.limit-type {
      width: 60px;
      &.ivu-select {
        width: 60px;
        .ivu-select-selection {
          border-radius: 4px 0 0 4px;
          border-right: 0;
          background-color: #f8f8f9;
        }
      }
    }
    /deep/.limit-num {
      vertical-align: top;
      width: 150px;
      &.ivu-input-number {
        border-radius: 0 4px 4px 0;
      }
    }
  }
  /deep/.align-special + .ivu-form-item-error-tip {
    left: 60px;
  }
  .product-detail-item-height {
    line-height: 32px;
    height: 32px;
  }
  /deep/.custom-point-setting {
    .ivu-form-item {
      display: inline-block;
      margin-top: -10px !important;
      margin-bottom: 0 !important;
      &:first-child {
        .ivu-form-item-error-tip {
          left: 15px;
        }
      }
    }
  }
  /deep/.ivu-form-item:first-child {
    margin-top: 0 !important;
  }
  /deep/.ivu-form-item:nth-child(4),
  /deep/.ivu-form-item:nth-child(3) {
    margin-bottom: 30px;
    .product-member-level {
      margin-top: 10px;
    }
  }
  /deep/.product-bottom.ivu-form-item {
    margin-bottom: 70px;
  }
  // 参数模板导入
  .product-params-import {
    margin-bottom: 30px;
    /deep/.ivu-select {
      margin-right: 5px;
    }
    & + .ivu-form-item-error-tip {
      top: 74px;
    }
  }
  // 商品参数
  .product-detail-senior-params {
    display: inline-block;
    width: 100%;
    .table-operation {
      margin-left: 14px;
    }
    /deep/.ivu-btn {
      padding: 5px 9px 6px;
    }
    /deep/.ivu-table th {
      background: #f8f9fd;
    }
    /deep/table {
      td {
        cursor: move;
        .ivu-table-cell {
          padding: 9px 0 9px 14px;
        }
        &:last-child {
          .ivu-table-cell {
            padding: 0 14px;
          }
        }
      }
      th:not(:last-child) .ivu-table-cell {
        padding-left: 14px;
      }
    }
    /deep/textarea {
      resize: none;
      font-size: 13px;
      height: 52px;
    }
    .params-list {
      width: 886px;
      margin-bottom: 16px;
      /deep/textarea {
        padding-right: 40px;
        height: 100%;
      }
      /deep/input {
        height: 100%;
      }
      /deep/.wrapper {
        position: relative;
        .suffix {
          position: absolute;
          right: 8px;
          bottom: 8px;
          color: #999;
          line-height: 1;
          font-size: 12px;
        }
      }
    }
  }
  // 商品标签
  .product-detail-senior-tag {
    line-height: normal;
    width: 800px;
    padding: 13px;
    padding-bottom: 6px;
    border: 1px solid #e8eaec;
    .ivu-tag {
      height: 26px;
      line-height: 26px;
      margin-top: 0;
      margin-right: 7px;
    }
    .ivu-tag,
    .ivu-btn {
      margin-bottom: 7px;
    }
    /deep/.ivu-btn span {
      margin-left: -4px;
    }
  }
  /deep/.class-selector {
    width: 260px;
    position: relative;
  }
}
</style>
