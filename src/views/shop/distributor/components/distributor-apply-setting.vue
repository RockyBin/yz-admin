<template>
  <div class="distributor-apply-setting" v-show="!$store.state.COMMON_loading">
    <Form
      ref="formValidateBase"
      :model="formValidate"
      :rules="ruleValidate"
      :label-width="150"
      class="form-full-wrapper"
    >
      <switch-titlebar
        style="margin: 0 0 24px;"
        v-model="enableApplyDistribute"
        :true-value="true"
        :false-value="false"
        title="是否开启申请加盟设置"
        @on-change="confirm"
        :tipShow="!enableDistribute && enableApplyDistribute"
        tipText="请前往【分销设置>基础设置】开启分销功能，申请加盟才生效。"
      />
      <div v-show="enableApplyDistribute">
        
        <FormItem label="审核方式：" prop="review_type">
          <div class="distributor-setting-item">
            <more-message
              text="当开启了自动审核，会员达到了申请条件，并提交申请后，系统自动审核通过成为分销商。"
              style="margin-right: 12px;"
            ></more-message>
            <RadioGroup v-model.trim="formValidate.review_type">
              <Radio :label="1">自动审核</Radio>
              <Radio :label="0">手动审核</Radio>
            </RadioGroup>
            <p class="tip">* 审核成为分销商后，升级到默认等级：{{defaultLevelName}}</p>
          </div>
        </FormItem>
        <!-- 成为分销商资格 -->
        <!-- <verticalLineTitlebar title="成为分销商资格"/> -->
        <FormItem
          label="资格条件："
          class="first-item form-height"
          :class="{'distributor-setting-mb10': true}"
        >
          <div class="distributor-setting-item">
            <RadioGroup v-model.trim="formValidate.condition">
              <Radio :label="0">无条件</Radio>
              <Radio :label="1">提交资料</Radio>
              <Radio :label="2">交易笔数</Radio>
              <Radio :label="3">交易金额</Radio>
              <Radio :label="4">购买任意指定商品</Radio>
              <Radio :label="5">直推会员数量</Radio>
            </RadioGroup>
          </div>
        </FormItem>
        <FormItem
          label="提交资料："
          prop="condition"
          v-show="formValidate.condition === 1"
          class="distributor-setting-item-apply"
        >
          <div class="distributor-setting-item">
            <div
              class="distributor-setting-item-submitinfo"
              v-for="(item,index) in forminfo"
              :key="index"
            >
              <Input :value="forminfoValue[index]" class="common-input-text-210" readonly disabled/>
              <CheckboxGroup v-model="forminfo[index]">
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
              v-for="(item,index) in extend_fields"
              :key="index"
            >
              <Input
                class="common-input-text-210"
                :class="{'ivu-form-item-error': extend_fields_valid[index]}"
                @input="onExtendFieldChange(index)"
                v-model="item.name"
              />
              <CheckboxGroup v-model="item.value">
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
            <Button
              type="primary"
              @click="onAddCustomData"
              icon="md-add"
              style="margin-top: 12px;border-radius: 17px;height: 34px;"
            >新增自定义项</Button>
          </div>
        </FormItem>
        <FormItem label="显示申请协议：" style="margin: 30px 0;" v-show="formValidate.condition === 1">
          <div class="distributor-setting-item">
            <RadioGroup v-model.trim="agreement_show">
              <Radio :label="1">显示</Radio>
              <Radio :label="0">隐藏</Radio>
            </RadioGroup>
          </div>
        </FormItem>
        <FormItem
          label="申请协议："
          prop="agreement"
          v-show="formValidate.condition === 1 && agreement_show === 1"
        >
          <div class="distributor-setting-item" style="width: 607px;">
            <ue-editor
              style="line-height:normal;"
              :value="formValidate.agreement"
              ref="editor"
              :setting="ueSetting"
              :hideImageSelector="true"
              elmClass=".matter .__panel"
            ></ue-editor>
          </div>
        </FormItem>
        <FormItem
          label="累计交易笔数："
          prop="buy_times"
          v-show="formValidate.condition === 2"
          :class="{'distributor-setting-mb10': true}"
        >
          <div class="distributor-setting-item">
            <InputNumber
              :min="1"
              :precision="0"
              class="common-input-text-210"
              v-model="formValidate.buy_times"
            />
            <span style="margin-left: 12px;">笔</span>
          </div>
        </FormItem>
        <FormItem
          label="累计直推会员数量满："
          prop="directly_member"
          v-show="formValidate.condition === 5"
          :class="{'distributor-setting-mb10': true}"
        >
          <div class="distributor-setting-item">
            <InputNumber
              :min="1"
              :max="9999999"
              :precision="0"
              class="common-input-text-210"
              v-model="formValidate.directly_member"
            />
            <span style="margin-left: 5px;">人</span>
          </div>
        </FormItem>
        <FormItem
          label="累计交易金额："
          prop="buy_money"
          v-show="formValidate.condition === 3"
          :class="{'distributor-setting-mb10': true}"
        >
          <div class="distributor-setting-item">
            <InputNumber
              :min="1"
              :precision="2"
              class="common-input-text-210"
              v-model="formValidate.buy_money"
            />
            <span style="margin-left: 12px;">元</span>
          </div>
        </FormItem>
        <FormItem
          label="参与商品："
          v-show="formValidate.condition === 3"
        >
          <div class="distributor-setting-item">
            <RadioGroup v-model.trim="formValidate.apply_product_type">
              <Radio :label="0">所有商品</Radio>
              <Radio :label="1">商品分类</Radio>
              <Radio :label="2">指定商品</Radio>
            </RadioGroup>
          </div>
          
          <div 
            class="distributor-setting-item" 
            style="margin: 14px 0;position:relative;"
            v-if="formValidate.apply_product_type == 1"
          >
            <div style="display: inline-block;color: #ED4014;position:absolute;top:-26px;" v-show="productTipShow2">至少选择一个商品分类</div>
            <tree-simple
              :data="productClass"
              show-checkbox
              @on-check-change="onTreeCheckChange"
              @on-select-change="onTreeSelectChange"
            ></tree-simple>
          </div>
          <div 
            class="distributor-setting-item" 
            style="margin: 14px 0;"
            v-if="formValidate.apply_product_type == 2"
          >
            <addMore text="添加商品"  @onAddMoreClick="onAddMoreClick" ></addMore>
            <div style="display: inline-block;margin-left: 14px;color: #ED4014;" v-show="productTipShow1">至少添加一个商品</div>
          </div>
          <div
            class="distributor-setting-item"
            style="width:700px;"
            v-if="formValidate.apply_product_type == 2"
          >
            <common-table
              v-show="formValidate.apply_product_type === 2 && productSelectData1.length"
              :columnsData="productSelectTableColumn1"
              :listData="productSelectData1"
              type="border"
            ></common-table>
          </div>
        </FormItem>
        <FormItem
          label="选择指定商品："
          prop="selectDesignatedProduct"
          v-show="formValidate.condition === 4"
          :class="{'distributor-setting-mb10': true}"
        >
          <div class="distributor-setting-item">
            <RadioGroup v-model="formValidate.selectDesignatedProduct">
              <Radio :label="1">从商城商品库选择</Radio>
              <Radio :label="0">新增非商城商品</Radio>
            </RadioGroup>
          </div>
        </FormItem>
        <FormItem
          label
          v-if="formValidate.condition === 4"
          v-show="formValidate.selectDesignatedProduct === 1 || !NonMallGoods.length"
          :class="{'distributor-setting-mb10': true}"
        >
          <div class="distributor-setting-item">
            <addMore text="新增商品" v-show="formValidate.selectDesignatedProduct === 0" @onAddMoreClick="onAddOtherProductClick" ></addMore>
            <addMore text="选择商品" v-show="formValidate.selectDesignatedProduct === 1" @onAddMoreClick="onSelectShopProductClick" ></addMore>
            <div style="display: inline-block;margin-left: 14px;color: #ED4014;" v-show="productTipShow">至少添加一个商品</div>
          </div>
        </FormItem>
        <FormItem label v-show="formValidate.condition === 4">
          <div
            class="distributor-setting-item"
            :style="{width: formValidate.selectDesignatedProduct === 1 ? '700px' : '552px'}"
          >
            <common-table
              v-show="formValidate.selectDesignatedProduct === 1 && productSelectData.length"
              :columnsData="productSelectTableColumn"
              :listData="productSelectData"
              type="border"
            ></common-table>
            <common-table
              v-show="formValidate.selectDesignatedProduct === 0 && NonMallGoods.length"
              :columnsData="notProductSelectTableColumn"
              :listData="NonMallGoods"
              type="border"
            ></common-table>
          </div>
        </FormItem>
      </div>
    </Form>
    <product-list-modal @onGetProductInfo="onGetProductInfo"
      v-model="modalListStatus"
      :productIds="productIds"></product-list-modal>
    <product-list-modal @onGetProductInfo="onGetProductInfo1"
      v-model="modalListStatus1"
      :productIds="productIds1"></product-list-modal>
    <setting-detail
      ref="settingDetail"
      v-model="modalDetailEditStatus"
      :productInfo="NonMallGoods[0] || null"
      :freightTemplateList="freightTemplateList"
      @onModalProductData="onModalProductData"
    ></setting-detail>
    <detail-view
      v-model="modalDetailStatus"
      :freightTemplateList="freightTemplateList"
      :productInfo="NonMallGoods[0] || null"
    ></detail-view>
    <foot-button
      @onSaveClick="onSaveClick"
      :loading="loadingStatus"
      perm="distributor.config.operate"
    ></foot-button>
  </div>
</template>

<script>
import footButton from "@/views/shop/components/button/foot-button.vue";
import ueEditor from "@/views/shop/components/editor/editor.vue";
import moreMessage from "@/views/shop/components/more-message/more-message.vue";
import commonTable from "@/views/shop/components/table/common-table.vue";
import settingDetail from "./distributor-setting-detail.vue";
import detailView from "./distributor-setting-detail-view.vue";
import switchTitlebar from "COMPONENTS/titlebar/switch-titlebar";
import productListModal from "@/views/shop/store/design/components/product-list.vue";
import addMore from "COMPONENTS/button/add-more.vue";
import treeSimple from "COMPONENTS/selector/class-tree-simple";
export default {
  data() {
    let classColumn = {
      title: "商品分类",
      width: 173,
      align: "center",
      render: (h, params) => {
        let classObj = {};
        let classArray = params.row.product_class || params.row.class || [];
        classArray.forEach(item => {
          classObj[item.id] = true;
        });
        let text = classArray
          .filter(item => !classObj[item.parent_id])
          .map(item => item.class_name)
          .join(",");
        return h("div", { style: {"line-height": "initial"} }, params.row.status === -9 ? "--" : (text || ""));
      }
    };
    let productColumn = [
      {
        title: "商品信息",
        width: 286,
        render: (h, params) => {
          let status = params.row.status === 1 || this.formValidate.selectDesignatedProduct === 0;
          return h("div", {}, [
            h(
              "div",
              {
                style: {
                  display: "inline-block",
                  marginRight: "14px",
                  verticalAlign: "middle",
                  // border: "1px solid #eeeeee"
                }
              },
              [
                h("img", {
                  attrs: {
                    src: (() => {
                      if (Array.isArray(params.row.image)) {
                        return params.row.image[0];
                      }
                      if (Array.isArray(params.row.small_images)) {
                        return (
                          this.$store.state.siteComdataPath +
                          params.row.small_images[0]
                        );
                      }
                      if (params.row.small_images) {
                        return (
                          this.$store.state.siteComdataPath +
                          (params.row.small_images &&
                            params.row.small_images.split(",")[0])
                        );
                      }
                      if (params.row.image) {
                        return (
                          this.$store.state.siteComdataPath +
                          params.row.image.split(",")[0]
                        );
                      }
                    })()
                  },
                  style: {
                    height: "40px",
                    width: "40px",
                    display: "block",
                    objectFit: "contain"
                  }
                })
              ]
            ),
            h(
              "Tooltip",
              {
                style: {
                  display: "inline-block",
                  verticalAlign: "middle",
                  width: status ? "204px" : "144px",
                  textAlign: "left",
                  lineHeight: "initial",
                  "font-size": "0"
                },
                props: {
                  content: params.row.name,
                  maxWidth: 300,
                  transfer: true,
                  placement: "top"
                }
              },
              [
                h(
                  "div",
                  {
                    style: {
                      display: "-webkit-inline-box",
                      "-webkit-line-clamp": 2,
                      "-webkit-box-orient": "vertical",
                      overflow: "hidden",
                      lineHeight: "21px",
                      "font-size": "12px"
                    }
                  },
                  params.row.name
                )
              ]
            ),
            status ? "" : h("div" , {
              class: "table-error",
              style: {
                "vertical-align": "middle",
                "margin-left": "10px",
                "margin-right": "-4px"

              }
            },  params.row.status === 0 ? "已下架" : "已删除")
          ]);
        }
      },
      {
        title: "销售价",
        width: 110,
        align: "center",
        render: (h, params) => {
          return h("div", {}, params.row.status === -9 ? "--" : ("￥" + params.row.price));
        }
      }
    ];
    let operate = {
      title: "操作",
      width: 154,
      align: "center",
      render: (h, params) => {
        let showBtn = [
          h(
            "a",
            {
              class: {
                "table-operation": true
              },
              style: {
                "vertical-align": "middle"
              },
              on: {
                click: () => {
                  if (this.formValidate.selectDesignatedProduct === 1) {
                    this.productSelectData.splice(params.index, 1);
                  } else {
                    this.modalDetailEditStatus = true;
                  }
                }
              }
            },
            this.formValidate.selectDesignatedProduct === 1 ? "删除" : "重新编辑"
          ),
          params.row.status === -9 ? "" : h("span", {
            style: {
              display: "inline-block",
              width: "1px",
              "background-color": "#3f66d3",
              height: "12px",
              "vertical-align": "middle",
              margin: "0 14px"
            }
          }),
          params.row.status === -9 ? "" : h(
            "a",
            {
              class: {
                "table-operation": true
              },
              style: {
                "vertical-align": "middle"
              },
              on: {
                click: () => {
                  if (this.formValidate.selectDesignatedProduct == 1) {
                    this.$router.push({
                      path: "/product/detail",
                      query: {
                        id: params.row.id
                      }
                    });
                  } else {
                    this.modalDetailStatus = true;
                  }
                }
              }
            },
            "查看详情"
          )
        ];
        return h("div", showBtn);
      }
    }
    let operate1 = {
      title: "操作",
      width: 130,
      align: "center",
      render: (h, params) => {
        let showBtn = [
          h(
            "a",
            {
              class: {
                "table-operation": true
              },
              style: {
                "vertical-align": "middle"
              },
              on: {
                click: () => {
                  this.productSelectData1.splice(params.index, 1);
                }
              }
            },
            "删除"
          ),
          params.row.status === -9 ? "" : h("span", {
            style: {
              display: "inline-block",
              width: "1px",
              "background-color": "#3f66d3",
              height: "12px",
              "vertical-align": "middle",
              margin: "0 14px"
            }
          }),
          params.row.status === -9 ? "" : h(
            "a",
            {
              class: {
                "table-operation": true
              },
              style: {
                "vertical-align": "middle"
              },
              on: {
                click: () => {
                  this.$router.push({
                    path: "/product/detail",
                    query: {
                      id: params.row.id
                    }
                  });
                }
              }
            },
            "查看详情"
          )
        ];
        return h("div", {
          style: {
            "white-space": "nowrap"
          }
        }, showBtn);
      }
    }
    let notProductColumn = productColumn.concat(operate);
    let productColumn1 = productColumn.concat(operate1);
    productColumn1.splice(1, 0, classColumn);
    productColumn.splice(1, 0, classColumn);
    productColumn.push(Object.assign({}, operate, {width: 130}));
    return {
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
      loadingStatus: false,
      enableApplyDistribute: true,
      enableDistribute: true,
      formValidate: {
        level: 3, // 分销层级
        internal_purchase: 0, // 分销内购
        review_type: 0, //  审核方式
        condition: 0, // 成为分销商资格条件
        agreement: "",
        buy_times: null, // 交易笔数
        directly_member: null, // 累计直推会员数量
        //buy_times_flag: 1, // 交易笔数时的有效条件
        buy_money: null, // 交易金额
        //buy_money_flag: 1, // 交易金额时的有效条件
        apply_product_type: 0, // 0所有商品,1商品分类,2指定商品
        apply_product: "", // 交易金额条件下的参与商品--指定商品/商品分类
        selectDesignatedProduct: 0, // 选择指定产品
        buy_product_type: 8, // 指定商品的类型
        buy_product: 0, // 指定商品的ID
        calc_valid_condition:1, //计算条件：0 付款后；1 维权期后；
      },
      aftersale_isopen:1, //订单设置--售后设置是否开启
      productSelectData: [], // 商城商品选中的产品列表数据
      NonMallGoods: [], // 非商城商品信息
      productSelectData1: [], // 交易金额条件下的参与商品--指定商品
      productSelectClass: [], // 交易金额条件下的参与商品--商品分类
      productClass: [],
      // 申请提交的默认标题
      forminfoValue: {
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
      },
      productTipShow: false,
      productTipShow1: false,
      productTipShow2: false,
      forminfo: {}, // 申请提交的表单
      extend_fields: [], // 自定义项
      extend_fields_valid: [], // 自定义项验证提示
      agreement_show: 0, // 显示申请协议
      productSelectTableColumn: productColumn, // 购买任意指定商品
      productSelectTableColumn1: productColumn1, //交易金额条件
      notProductSelectTableColumn: notProductColumn,
      ruleValidate: {
        agreement: [
          {
            required: true,
            trigger: "none",
            validator: (rule, value, callback) => {
              callback();
            }
          }
        ],
        selectDesignatedProduct: [
          {
            required: true,
            trigger: "none",
            validator: (rule, value, callback) => {
              callback();
            }
          }
        ],
        condition: [
          {
            required: true,
            trigger: "none",
            validator: (rule, value, callback) => {
              if (
                !this.enableApplyDistribute ||
                this.formValidate.condition !== 1 ||
                (Object.keys(this.forminfo).filter(item =>
                  this.forminfo[item].includes("show")
                ).length ||
                  this.extend_fields.filter(item => item.value.includes("show"))
                    .length)
              ) {
                callback();
              } else {
                callback(new Error("至少选择一项显示"));
              }
            }
          }
        ],
        buy_times: [
          {
            required: true,
            trigger: "none",
            validator: (rule, value, callback) => {
              if (!this.enableApplyDistribute || this.formValidate.condition !== 2 || value) {
                callback();
              } else {
                callback(new Error("交易笔数不能为空"));
              }
            }
          }
        ],
        directly_member: [
            {
                required: true,
                trigger: "none",
                validator: (rule, value, callback) => {
                    if (!this.enableApplyDistribute || this.formValidate.condition !== 5 || value) {
                        callback();
                    } else {
                        callback(new Error("请输入人数"));
                    }
                }
            }
        ],
        buy_money: [
          {
            required: true,
            trigger: "none",
            validator: (rule, value, callback) => {
              if (!this.enableApplyDistribute || this.formValidate.condition !== 3 || value) {
                callback();
              } else {
                callback(new Error("交易金额不能为空"));
              }
            }
          }
        ]
      },
      modalListStatus: false, // 列表弹窗控制
      modalListStatus1: false, 
      modalDetailEditStatus: false, // 添加详情弹窗控制
      modalDetailStatus: false, // 查看详情
      freightTemplateList: [],
      classList: [],
      distributionLevelList: []
    };
  },
  components: {
    footButton,
    ueEditor,
    moreMessage,
    commonTable,
    settingDetail,
    detailView,
    switchTitlebar,
    productListModal,
    addMore,
    treeSimple
  },
  computed: {
    productIds() {
      return this.productSelectData.map(item => item.id);
    },
    productIds1() {
      return this.productSelectData1.map(item => item.id);
    },
    defaultLevelName() {
      let defaultLevel = this.distributionLevelList.find(n => n.weight === 0);
      return defaultLevel && defaultLevel.name;
    }
  },
  watch: {
    productSelectData1(val) {
      if(val.length) {
        this.productTipShow1 = false;
      }
    },
    productSelectClass(val) {
      if(val.length) {
        this.productTipShow2 = false;
      }
    }
  },
  mounted() {
    this.$store.state.COMMON_loading = true;
    this.getProductCommonInfo();
    this.getDistributeInfo();
  },
  methods: {
    getProductCommonInfo() {
      this.$httpGet("/shop/admin/product/add", null, res => {
        this.freightTemplateList = res.data.freightTemplateList || [];
        this.classList = res.data.classList || [];
        this.distributionLevelList = res.data.distributionLevelList || [];
      });
    },
    /**
     * 保存非商城商品信息
     */
    postCustomProduct() {
      return new Promise(resolve => {
        this.http({
          url: "/shop/admin/product/fenxiao/save",
          method: "POST",
          data: {
            productData: {
              id: this.NonMallGoods[0].id,
              name: this.NonMallGoods[0].name,
              type: this.isNotShopProduct(this.formValidate.buy_product_type)
                ? this.formValidate.buy_product_type
                : 8,
              detail: this.NonMallGoods[0].detail,
              big_images: this.NonMallGoods[0].image.map(item =>
                item.replace("_s", "_b")
              ),
              weight: this.NonMallGoods[0].weight,
              small_images: this.NonMallGoods[0].image,
              price: this.NonMallGoods[0].price,
              freight_id:
                this.NonMallGoods[0].productFreight === "1"
                  ? this.NonMallGoods[0].freight_id
                  : 0
            }
          }
        }).then(res => {
          resolve(res.data.id);
        });
      });
    },
    /**
     * 保存非商城商品图片
     */
    postCustomImage() {
      this.NonMallGoods[0].image = Array.isArray(
        this.NonMallGoods[0].image
      )
        ? this.NonMallGoods[0].image
        : [];
      let imageData = Array.isArray(this.NonMallGoods[0].small_images)
        ? this.NonMallGoods[0].small_images.concat()
        : (this.NonMallGoods[0].small_images &&
            this.NonMallGoods[0].small_images.split(",")) ||
          [];
      let promiseArray = [];
      imageData.map((item, index) => {
        if (typeof item === "object") {
          let formData = new FormData();
          formData.append("image", item);
          promiseArray.push(
            new Promise(resolve => {
              this.$httpUpload(
                "/shop/admin/product/image/upload",
                formData,
                res => {
                  this.NonMallGoods[0].image[index] =
                    res.data.smallImage;
                  resolve();
                }
              );
            })
          );
        } else {
          this.NonMallGoods[0].image[index] = item;
        }
      });
      return promiseArray;
    },
    /**
     * 保存信息
     */
    async onSaveClick() {
      let validStatus = true;
      this.productTipShow = false;
      this.$refs["formValidateBase"].validate(valid => {
        validStatus = valid;
      });

      let data = {
        baseinfo: Object.assign({}, this.formValidate)
      };
      data.baseinfo.apply_status = this.enableApplyDistribute ? 1 : 0;
      data.baseinfo.buy_times = data.baseinfo.buy_times ? data.baseinfo.buy_times : "";
      // 购买指定商品
      if (!validStatus) {
        return this.$Message.error("保存失败");
      } else if (this.formValidate.condition === 4) {
        // 验证用户是否选择了指定商品
        if (
          (this.enableApplyDistribute && this.formValidate.selectDesignatedProduct === 1 &&
            !this.productSelectData.length) ||
          (this.enableApplyDistribute && this.formValidate.selectDesignatedProduct === 0 &&
            !this.NonMallGoods.length)
        ) {
          this.$Message.error("保存失败");
          this.productTipShow = true;
          return;
        }
        // 添加非商城商品
        if (this.formValidate.selectDesignatedProduct === 0 && this.NonMallGoods.length) {
          await Promise.all(this.postCustomImage());

          data.baseinfo.buy_product = await this.postCustomProduct();
        } else {
          // 删除原来已有的非商城商品
          if (
            this.isNotShopProduct(data.baseinfo.buy_product_type) &&
            data.baseinfo.buy_product
          ) {
            await new Promise(resolve => {
              this.$httpPost(
                "/shop/admin/product/status/edit",
                {
                  productId: data.baseinfo.buy_product,
                  status: -9
                },
                () => {
                  resolve();
                }
              );
            });
          }
          this.NonMallGoods = [];
          data.baseinfo.buy_product = this.productSelectData.map(item => item.id).join();
        }
      } else if (this.formValidate.condition === 3) {
        if(this.enableApplyDistribute && this.formValidate.apply_product_type === 2 && !this.productSelectData1.length) {
          this.$Message.error("保存失败");
          this.productTipShow1 = true;
          return;
        } else if(this.enableApplyDistribute && this.formValidate.apply_product_type === 1 && !this.productSelectClass.length) {
          this.$Message.error("保存失败");
          this.productTipShow2 = true;
          return;
        } else {
          if(this.formValidate.apply_product_type === 2) {
            data.baseinfo.apply_product = this.productSelectData1.map(item => item.id).join();
          }
          if(this.formValidate.apply_product_type === 1) {
            data.baseinfo.apply_product = this.productSelectClass.map(item => item.id).join();
          }
        }
      }

      let forminfo = {};
      Object.keys(this.forminfo).forEach(item => {
        if (this.forminfo[item].includes("show")) {
          forminfo[item + "_show"] = 1;
        } else {
          forminfo[item + "_show"] = 0;
        }
        if (this.forminfo[item].includes("require")) {
          forminfo[item + "_require"] = 1;
        } else {
          forminfo[item + "_require"] = 0;
        }
      });
      forminfo.extend_fields = [];
      if (this.formValidate.condition === 1) {
        let status = true;
        forminfo.extend_fields = this.extend_fields.map((item, index) => {
          if (!item.name || !item.name.trim()) {
            this.$set(this.extend_fields_valid, index, true);
            status = false;
          }
          return {
            name: item.name,
            show: item.value.findIndex(item => item === "show") > -1 ? 1 : 0,
            require:
              item.value.findIndex(item => item === "require") > -1 ? 1 : 0
          };
        });
        if (!status) {
          this.$Message.error("提交资料选项不能为空");
          return;
        }

        if (
          this.agreement_show &&
          !this.$refs["editor"].getCurrContent().trim()
        ) {
          this.$Message.error("开启了申请协议，协议内容不能为空");
          return;
        }
      }
      forminfo.agreement_show = this.agreement_show;
      forminfo.agreement = this.$refs["editor"].getCurrContent();

      data.forminfo = forminfo;
      delete data.baseinfo.buy_product_type;
      delete data.baseinfo.selectDesignatedProduct;
      delete data.baseinfo.agreement;
      this.loadingStatus = true;
      this.http({
        url: "/shop/admin/distribution/setting/edit",
        method: "POST",
        data
      })
        .then(() => {
          this.getDistributeInfo();
          this.$Message.success(this.$store.state.SUCCESS_MSG);
        })
        .finally(() => {
          this.loadingStatus = false;
        });
    },
    /**
     * 重置数据
     */
    resetProductData() {},
    /**
     * 检测是否是非商城商品
     */
    isNotShopProduct(status) {
      return [8, 9].includes(status) ? true : false;
    },
    /**
     * 获取分销信息
     */
    getDistributeInfo() {
      this.$httpGet(
        "/shop/admin/distribution/setting/info",
        null,
        async res => {
          if (res.code == 200) {
            let returnData = res.data;
            this.formValidate = {
              review_type: Number(returnData.baseinfo.review_type),
              condition: Number(returnData.baseinfo.condition),
              agreement: returnData.forminfo.agreement || "",
              buy_times: returnData.baseinfo.buy_times || null,
              directly_member:returnData.baseinfo.directly_member || null,
              buy_money: returnData.baseinfo.buy_money || null,
              selectDesignatedProduct: this.isNotShopProduct(
                returnData.baseinfo.buy_product_type
              )
                ? 0
                : 1,
              buy_product_type: returnData.baseinfo.buy_product_type,
              buy_product: returnData.baseinfo.buy_product || "",
              apply_product_type: returnData.baseinfo.apply_product_type || 0,
              apply_product: returnData.baseinfo.apply_product || ""
            };
            this.aftersale_isopen=Number(returnData.baseinfo.aftersale_isopen);
            if (returnData.baseinfo.level == 0) {
              this.enableDistribute = false;
            }
            this.enableApplyDistribute = returnData.baseinfo.apply_status == 1;
            let forminfo = {};
            let forminfoData = returnData.forminfo;
            Object.keys(forminfoData).forEach(item => {
              if (item === "agreement_show") {
                return;
              }
              let showReg = /_show/;
              let requiredReg = /_require/;
              if (showReg.test(item)) {
                if (!forminfo[item.replace(showReg, "")]) {
                  forminfo[item.replace(showReg, "")] = forminfoData[item]
                    ? ["show"]
                    : [];
                } else if (forminfoData[item]) {
                  forminfo[item.replace(showReg, "")].push("show");
                }
              }
              if (requiredReg.test(item)) {
                if (!forminfo[item.replace(requiredReg, "")]) {
                  forminfo[item.replace(requiredReg, "")] = forminfoData[item]
                    ? ["require"]
                    : [];
                } else if (forminfoData[item]) {
                  forminfo[item.replace(requiredReg, "")].push("require");
                }
              }
            });
            this.forminfo = forminfo;
            let extend_fields = returnData.forminfo.extend_fields || [];
            this.extend_fields = extend_fields.map(item => {
              let showValue = [];
              if (item.show) {
                showValue.push("show");
              }
              if (item.require) {
                showValue.push("require");
              }
              return {
                name: item.name,
                value: showValue
              };
            });
            this.extend_fields_valid = extend_fields.map(() => false);
            this.agreement_show = Number(returnData.forminfo.agreement_show);
            this.getUEExist() &&
              this.getUEExist().ready(() => {
                this.getUEExist() &&
                  this.$refs["editor"].setCurrContent(this.formValidate.agreement);
              });
            await Promise.all([
              this.getProductInfo(),
              this.getProductClass(),
              this.getProductInfo1(),
              this.getDesignatedProduct()
            ]);
          } else {
            this.$Message.error(res.msg);
          }
          this.$store.state.COMMON_loading = false;
        }
      );
    },
    // 判断vue是否还存在，防止快速切换路由后请求回调还在执行这种极端的情况下找不到ue导致报错
    getUEExist() {
      return this.$refs["editor"] && this.$refs["editor"].ue;
    },
    /**
     * 保存选择的产品信息
     */
    onGetProductInfo(data) {
      this.productSelectData = [].concat(this.productSelectData, data);
    },
    onTreeCheckChange(data) {
      this.productSelectClass = [...data];
    },
    onTreeSelectChange(data, obj) {
      let checked = !obj.checked;
      this.productClass.forEach(el => {
        if (obj.id === el.id) {
          this.$set(el, "checked", checked);
          this.$set(el, "indeterminate", false);
          if (el.children) {
            for (let i = 0; i < el.children.length; i++) {
              this.$set(el.children[i], "checked", checked);
            }
          }
        } else {
          if (el.children) {
            let status = true; // 标记全选，为true就是全选
            let indStatus = true; // 标记全不选，为true就是全不选
            let isCurrent = false;
            for (let i = 0; i < el.children.length; i++) {
              if (obj.id === el.children[i].id) {
                this.$set(el.children[i], "checked", checked);
                isCurrent = true;
              }
              if (!el.children[i].checked) {
                status = false;
              } else {
                indStatus = false;
              }
            }
            if (isCurrent) {
              this.$set(el, "checked", status);
              // 只有部分选才为true，就是排除全选和全不选状态
              this.$set(el, "indeterminate", !(status || indStatus));
            }
          }
        }
      });
      let newArray = [];
      this.productClass.forEach(item => {
        if (item.checked) {
          newArray.push(item);
          if (item.children) {
            item.children.forEach(items => {
              if (items.checked) {
                newArray.push(items);
              }
            });
          }
        }
      });
      this.productSelectClass = [...newArray];
    },
    /**
     * 保存交易金额条件下的参与商品
     */
    onGetProductInfo1(data) {
      this.productSelectData1 = [].concat(this.productSelectData1, data);
    },
    /**
     * 获取弹窗里面的数据
     */
    onModalProductData(data) {
      this.NonMallGoods.splice(0, 1, data);
    },
    /**
     * 获取指定产品信息
     */
    getProductInfo() {
      return new Promise(resolve => {
        let id = this.formValidate.buy_product;
        if (this.formValidate.selectDesignatedProduct === 1 && id) {
          this.$httpPost(
            "/shop/admin/product/fenxiao/shop/data",
            { productId: id },
            res => {
              if (res.code === 200) {
                let returnData = res.data.list || [];
                
                this.productSelectData = returnData;
              }
              resolve();
            }
          );
        } else {
          resolve();
        }
      });
    },
    // 获取产品分类
    getProductClass() {
      this.$httpPost("/shop/admin/coupon/productclass", "", res => { 
        let productSelectClass = [];
        function checkItem(list, checkedItem) {
          list.forEach(item => {
            if(checkedItem.includes(item.id + "")) {
              item.checked = true;
              productSelectClass.push(item);
            }
            if(item.children && item.children.length) {
              item.expand = checkItem(item.children, checkedItem);
            }
          })
          if(list.some(item => item.checked)) {
            return true
          } else {
            return false
          }
        }
        if(this.formValidate.apply_product_type == 1 && this.formValidate.apply_product) {
          checkItem(res.data, this.formValidate.apply_product.split(","));
          this.productSelectClass = productSelectClass;
        }
        this.productClass = res.data;
      });
    },
    /**
     * 获取交易金额条件下的参与商品
     */
    getProductInfo1() {
      return new Promise(resolve => {
        if (this.formValidate.apply_product_type == 2 && this.formValidate.apply_product) {
          this.$httpPost(
            "/shop/admin/product/fenxiao/shop/data",
            { productId: this.formValidate.apply_product }, 
            res => {
              if (res.code === 200) {
                this.productSelectData1 = res.data.list || [];
              }
              resolve();
            }
          );
        } else {
          resolve();
        }
      });
    },
    /**
     * 获取非商城商品信息
     */
    getDesignatedProduct() {
      return new Promise(resolve => {
        if (
          this.formValidate.selectDesignatedProduct === 0 &&
          this.formValidate.buy_product
        ) {
          this.$httpGet(
            "/shop/admin/product/fenxiao/data",
            {
              productId: this.formValidate.buy_product
            },
            res => {
              res.data.productData.weight = res.data.skus[0].weight;
              this.NonMallGoods = [res.data.productData];
              resolve();
            }
          );
        } else {
          resolve();
        }
      });
    },
    /**
     * 选择商城产品
     */
    onSelectShopProductClick() {
      this.modalListStatus = true;
    },
    /**
     * 交易金额条件下的弹窗
     */
    onAddMoreClick() {
      this.modalListStatus1 = true;
    },
    /**
     * 添加非商城产品
     */
    onAddOtherProductClick() {
      this.modalDetailEditStatus = true;
    },
    /**
     * 自定义项修改时将验证改为false
     */
    onExtendFieldChange(index) {
      this.$set(this.extend_fields_valid, index, false);
    },
    /**
     * 删除自定义项
     */
    onDeleteExtendField(index) {
      this.extend_fields.splice(index, 1);
      this.extend_fields_valid.splice(index, 1);
    },
    /**
     * 新增自定义项
     */
    onAddCustomData() {
      this.extend_fields.push({
        name: "",
        value: ["show"]
      });
      this.extend_fields_valid.push(false);
    },
    /**
     * 关闭弹窗时的弹窗提醒
     */
    confirm(val) {
      if (!val) {
        this.$nextTick(() => {
          this.enableApplyDistribute = true;
          this.$Modal.confirm({
            title: "提示",
            content:
              "若关闭申请加盟功能，非分销商将不能在客户端用【申请】的方式申请成为分销商，只能通过【后台手动添加】或【设置分销商等级会员自动升级】才能成为分销商，是否确定关闭？",
            onOk: () => {
              this.enableApplyDistribute = false;
            }
          });
        });
      }
    }
  }
};
</script>

<style lang="less" scoped>
@radio-right: 26px;

.distributor-apply-setting {
  position: relative;
  height: calc(100% - 70px);
  .first-item {
    margin-top: 30px;
  }
  .form-height {
    height: 32px;
  }
  /deep/.add-more-btn {
    .btn-add {
      margin-bottom: 0;
    }
  }
  .wrapper {
    padding: 20px 0;
    background: #f5f6f7;
    margin-bottom: 24px;
    /deep/.ivu-form-item {
      margin-bottom: 0 !important;
    }
    /deep/.ivu-form-item-label {
      font-weight: bold;
      font-size: 13px;
      margin: 0 14px;
      width: auto !important;
      padding: 0 !important;
      line-height: 32px;
    }
    /deep/.ivu-form-item-content {
      margin-left: 0 !important;
    }
  }
  .vertical-line-titlebar-wrapper {
    margin-top: 10px;

    & ~ .vertical-line-titlebar-wrapper {
      margin-top: 24px;
    }
  }

  .distributor-setting-mb10 {
    margin-bottom: 14px !important;
  }

  .distributor-setting-item-apply {
    /deep/.ivu-input {
      border-color: #dcdee2;
      &:hover {
        border-color: #6e88f7;
      }
      &:focus {
        box-shadow: 0 0 0 2px rgba(74, 106, 245, 0.2);
      }
    }
    /deep/.ivu-form-item-error-tip {
      margin-top: -60px;
    }
  }

  .distributor-setting-item {
    text-align: left;

    /deep/.ivu-radio-wrapper {
      margin-right: @radio-right;
    }
    .tip {
      font-size: 12px;
      color: #9ea4b1;
      line-height: 1;
    }
    .distributor-setting-item-submitinfo {
      height: 32px;
      margin-bottom: 14px;

      /deep/.ivu-checkbox-group {
        display: inline-block;
        margin-left: 12px;
        height: 32px;
        vertical-align: middle;
      }

      /deep/input {
        color: #9ea4b1;

        &:disabled {
          cursor: default;
          background-color: #fff;
        }
      }
    }
  }
}
</style>
