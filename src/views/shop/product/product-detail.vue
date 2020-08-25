<template>
  <div class="product-detail" v-show="!$store.state.COMMON_loading">
    <Tabs v-model="tabChangeFlag" :animated="false" name="productDetail">
      <TabPane
        :label="
          () => {
            return $createElement('div', `基本信息`);
          }
        "
        :index="1"
        :name="tabChangeArray[0]"
      >
        <product-base
          ref="productBase"
          :supplierInfo="supplierInfo"
          :disableChange="productDiableChange"
          v-model="formValidateBase"
        ></product-base>
      </TabPane>
      <TabPane
        :label="
          () => {
            return $createElement('div', `商品SKU`);
          }
        "
        :index="2"
        :name="tabChangeArray[1]"
      >
        <product-sku
          :supplierInfo="supplierInfo"
          :productType="formValidateBase.productType"
          :maxCommision="maxCommision"
          :setArray="skuValidSet"
          :disableChange="productDiableChange"
          ref="productSku"
          v-model="formValidateSku"
          :productID="productID"
          :skuNumWarning="formValidateSenior.productSkuNumWarning"
          :memberPriceList="memberPriceList"
        ></product-sku>
      </TabPane>
      <TabPane
        class="product-detail-tabpane-graphic"
        :label="
          () => {
            return $createElement('div', `图文详情`);
          }
        "
        :index="3"
        :name="tabChangeArray[2]"
      >
        <product-graphic
          :disableChange="productDiableChange"
          ref="productGraphic"
          v-model="formValidateGraphic"
        ></product-graphic>
      </TabPane>
      <TabPane
        :label="
          () => {
            return $createElement('div', `高级设置`);
          }
        "
        :index="4"
        :name="tabChangeArray[3]"
      >
        <product-senior
          :disableChange="productDiableChange"
          :memberList="formValidateSku.memberLevelList"
          ref="productSenior"
          v-model="formValidateSenior"
        ></product-senior>
      </TabPane>
      <TabPane
        :label="
          () => {
            return $createElement('div', `佣金设置`);
          }
        "
        :index="5"
        :name="tabChangeArray[4]"
        v-if="commissionShow"
      >
        <product-commission
          v-model="formValidateSku"
          ref="productCommission"
          :maxCommision="maxCommision"
          :setArray="skuValidSet"
          :singleSku="singleSku"
          :distributionCommissionList="distributionCommissionList"
          :agentConfig="agentConfig"
          :areaagentConfig="area_agent_config"
        ></product-commission>
      </TabPane>
      <TabPane
        :label="
          () => {
            return $createElement('div', `云仓价格`);
          }
        "
        :index="6"
        :name="tabChangeArray[5]"
        v-if="cloudstockShow"
      >
        <product-cloudstock
          v-model="formValidateSku"
          ref="productCloudstock"
          :setArray="skuValidSet"
          :singleSku="singleSku"
          :dealerConfig="dealer_config"
        ></product-cloudstock>
      </TabPane>
    </Tabs>

    <foot-button>
      <div class="product-detail-foot-button">
        <Button
          type="text"
          v-if="tabIndex > 0"
          class="product-detail-foot-button-prev"
          @click="onPrevClick"
        >
          <img :src="imageArrow" /><span>上一步</span>
        </Button>
        <Button
          type="primary"
          style="margin-right: 12px;"
          :loading="verifySaveLoading"
          :disabled="saveLoading"
          v-if="supplierInfo.verify_status === 0 && supplierInfo.id"
          @click="onVerifySupplierClick"
          perm="product.operate"
          >保存并审核</Button
        >
        <Button
          type="primary"
          :loading="saveLoading"
          :disabled="verifySaveLoading"
          @click="onProductDetailSave()"
          perm="product.operate"
          >保存</Button
        >
        <Button
          type="text"
          class="product-detail-foot-button-next"
          v-if="Object.keys(checkFormObject).filter(n => n > tabIndex).length"
          @click="onNextClick"
        >
          <span>下一步</span>
          <img :src="imageArrow" />
        </Button>
        <Button
          v-if="$route.name !== 'supplierProductDetail'"
          @click="
            $router.push({
              name: 'productManage',
              query: { index: $route.query.tab }
            })
          "
          style="position: absolute;margin-left: 12px;left: 0;top: 50%;transform: translateY(-50%);border-radius: 5px;"
          perm="product.view"
        >
          <i class="iconfont icon-m-menu" style="vertical-align: middle;"></i>
          <span style="vertical-align: middle;margin-left:4px;">返回列表</span>
        </Button>
      </div>
    </foot-button>
    <modal-supplier-verify
      v-model="verifyStatus"
      @onConfirmClick="onSupplierVerifyConfirm"
    ></modal-supplier-verify>
  </div>
</template>
<script>
import productBase from "@/views/shop/product/components/product-detail-base.vue";
import productGraphic from "@/views/shop/product/components/product-detail-graphic.vue";
import productSku from "@/views/shop/product/components/product-detail-sku.vue";
import productSenior from "@/views/shop/product/components/product-detail-senior.vue";
import productCommission from "./components/product-detail-commission.vue";
import productCloudstock from "./components/product-detail-cloudstock.vue";
import footButton from "@/views/shop/components/button/foot-button.vue";
import modalSupplierVerify from "./components/product-detail-modal-supplier-verify";
const tabChangeArray = [
  "productBase",
  "productSku",
  "productGraphic",
  "productSenior",
  "productCommission",
  "productCloudstock"
];
const skuItem = {
  id: 0,
  sku_code: "",
  supply_price: null, // 进货价
  price: null, // 销售价
  inventory: null, // 库存
  market_price: null, // 市场价
  member_rule: "0",
  fenxiao_rule: "0",
  serial_number: "",
  weight: null // 重量
};
const dealer_config = {
  levels: []
};
export default {
  provide() {
    return {
      productDetail: this
    };
  },
  data() {
    return {
      productID: 0,
      finish: false,
      imageArrow: require("@/views/shop/css/images/arrow-left.png"),
      saveLoading: false,
      verifySaveLoading: false,
      skuValidSet: {},
      maxCommision: 0, // 最大分佣比例
      productDiableChange: false,
      formValidateBase: {
        productName: "",
        productType: "0",
        // productNumber: "",
        productClass: [],
        productClassList: [],
        productFreight: "0",
        pruductImage: [],
        video: "",
        video_poster: [],
        freightTemplate: "",
        freightTemplateList: [],
        status: 1
      },
      formValidateGraphic: {
        productDetailText: ""
      },
      fenxiao_rule: null, // 单规格分销规则id（用于提交数据判断）
      member_rule: null, // 单规格会员价规则id（用于提交数据判断）
      reward_rule: null, // 单规格分红规则id（用于提交数据判断）
      sale_rule: null, // 单规格销售返佣规则id（用于提交数据判断）
      cloud_stock_rule: null, // 单规格云仓价格规则id（用于提交数据判断）
      dealer_sale_reward_rule: null, // 单规格云仓销售价规则id（用于提交数据判断）
      area_agent_rule: null, // 单规格区域返佣规则id（用于提交数据判断）
      memberPriceList: [], // 用于单规格显示
      distributionCommissionList: [], // 用于单规格分佣表格显示
      singleSku: {},
      agentCommissionList: [], // 用于单规格分红表格显示
      saleCommissionList: [], // 用于单规格返佣表格显示

      agentConfig: {},
      area_agent_config: {
        levels: [],
        setting: {}
      },
      dealer_config,

      formValidateSku: {
        multiSpecificationsStatus: false, // 是否开启多规格
        specificationsData: [], // 多规格参数
        supplyPrice: null, // 供货价
        marketPrice: null, // 市场价
        sellPrice: null, // 销售价
        memberPriceType: 0, // 会员价类型
        memberLevelPriceType: 0,
        memberLevelList: [], // 会员价列表
        distributionCommissionType: 0, // 分销佣金类型
        rewardCommissionType: 0, // 订单分红类型
        saleCommissionType: 0, // 销售返佣类型
        areaagentCommissionType: 0, // 区域返佣类型
        cloudstockCommissionType: 0,
        cloud_stock_status: 1, // 是否启用云仓
        dealerSaleCommissionType: 0,
        distributionLevel: 0, // 用于判断是否开启分佣
        distributionLevelType: 0,
        distributionLevelList: [], // 分销商等级权重
        productQuantity: null, // 商品重量
        productSkuNum: null, // 商品库存
        skus: {},
        skuArray: [],
        product_sku_num: {
          sku_name_num: 3,
          sku_value_num: 10
        },
        productNumber: "",
        oldProductNumber: ""
      },
      formValidateSenior: {
        productSkuNumWarning: null,
        base_sold_count: null,
        sort: 0,
        min_buy_num: 1,
        buy_limit_status: 0,
        buy_limit_type: 99,
        buy_limit_num: null,
        paramsData: [],
        discoStatus: 0,
        pointRule: {
          id: 0,
          rule_info: {
            out_order_pay_point: null,
            out_order_pay_max_percent: null
          }
        },
        after_sale_setting: 0,
        view_perm: 0,
        buy_perm: 1,
        buyLevels: [],
        viewLevels: []
      },
      tabChangeFlag: tabChangeArray[0],
      tabChangeArray: tabChangeArray,
      checkFormObject: {},
      imagePath: "",
      supplierInfo: {},
      verifyStatus: false
    };
  },
  watch: {
    tabChangeFlag() {
      if (this.tabIndex === 2) {
        this.$nextTick(() => {
          this.$refs["productGraphic"].$refs[
            "detailEditor"
          ].initToolbarBoxPosition();
        });
      }
    },
    commissionShow: {
      handler(val) {
        if (val) {
          this.$nextTick(() => {
            this.$set(
              this.checkFormObject,
              tabChangeArray.findIndex(n => n === "productCommission"),
              this.$refs["productCommission"].$refs["formValidateCommission"]
            );
          });
        } else {
          delete this.checkFormObject[
            tabChangeArray.findIndex(n => n === "productCommission")
          ];
        }
      },
      immediate: true
    },
    cloudstockShow: {
      handler(val) {
        if (val) {
          this.$nextTick(() => {
            this.$set(
              this.checkFormObject,
              tabChangeArray.findIndex(n => n === "productCloudstock"),
              this.$refs["productCloudstock"].$refs["formValidateCloudstock"]
            );
          });
        } else {
          delete this.checkFormObject[
            tabChangeArray.findIndex(n => n === "productCloudstock")
          ];
        }
      },
      immediate: true
    }
  },
  computed: {
    tabIndex() {
      return this.tabChangeArray.findIndex(el => el === this.tabChangeFlag);
    },
    commissionShow() {
      return (
        this.hasLicensePerm("ENABLE_DISTRIBUTION") ||
        this.hasLicensePerm("ENABLE_AGENT") ||
        this.hasLicensePerm("ENABLE_AREA_AGENT")
      );
    },
    cloudstockShow() {
      return this.hasLicensePerm("ENABLE_CLOUDSTOCK") && !this.supplierInfo.id;
    }
  },
  mounted() {
    // 添加需要验证的form表单
    this.$set(
      this.checkFormObject,
      tabChangeArray.findIndex(n => n === "productBase"),
      this.$refs["productBase"].$refs["formValidateBase"]
    );
    this.$set(
      this.checkFormObject,
      tabChangeArray.findIndex(n => n === "productSku"),
      this.$refs["productSku"].$refs["formValidateSku"]
    );
    this.$set(
      this.checkFormObject,
      tabChangeArray.findIndex(n => n === "productGraphic"),
      this.$refs["productGraphic"].$refs["formValidateGraphic"]
    );
    this.$set(
      this.checkFormObject,
      tabChangeArray.findIndex(n => n === "productSenior"),
      this.$refs["productSenior"].$refs["formValidateSenior"]
    );

    this.productID = this.$route.query.id || 0;
    this.$store.state.COMMON_loading = true;
    this.getProductInfo();
  },
  methods: {
    /**
     * 获取商品数据
     */
    getProductInfo() {
      if (this.productID) {
        this.$httpGet(
          "/shop/admin/product/data/" + this.productID,
          null,
          res => {
            if (res.code !== 200) {
              this.$Message.error(res.msg);
              return;
            }
            this.imagePath = res.data.imagePath;
            let productImages =
              res.data.productData.big_images.split(",") || [];
            //this.productDiableChange = !!res.data.productData.status;
            // 防止后台没有设置commission报错
            if (!res.data.agent_base_config.commision) {
              res.data.agent_base_config.commision = {
                1: 0,
                2: 0,
                3: 0
              };
            }
            if (!res.data.agent_sale_reward_config.commision) {
              res.data.agent_sale_reward_config.commision = {
                1: 0,
                2: 0,
                3: 0
              };
            }
            this.agentConfig = {
              agent_base_config: res.data.agent_base_config,
              agent_sale_reward_config: res.data.agent_sale_reward_config
            };
            this.area_agent_config = res.data.area_agent_config;
            this.dealer_config = Object.assign(
              {},
              dealer_config,
              {
                dealer_sale_reward_config: res.data.dealer_sale_reward_config
              },
              res.data.dealer_config
            );
            this.sortDealerLevel();

            this.supplierInfo = {
              id: res.data.productData.supplier_member_id || "",
              supplier_name: res.data.productData.supplier_name || "",
              supplier_price: res.data.productData.supplier_price || 0,
              status: res.data.productData.supplier_status || 0,
              verify_status: res.data.productData.verify_status
            }

            // 基础信息
            this.formValidateBase = {
              productName: res.data.productData.name,
              productType: res.data.productData.type.toString() || "0",
              // productNumber: res.data.productData.serial_number || "",
              productClass: res.data.class || [],
              productClassList: res.data.classList || [],
              productFreight:
                res.data.productData.freight_id.toString() === "0" ? "0" : "1",
              pruductImage: productImages.map(el => {
                return this.imagePath + el;
              }),
              video: res.data.productData.video || "",
              video_poster: res.data.productData.video_poster ? [this.imagePath + res.data.productData.video_poster] : [],
              freightTemplate: res.data.productData.freight_id,
              freightTemplateList: res.data.freightTemplateList || [],
              status: res.data.productData.status
            };
            this.$refs["productGraphic"].$refs["detailEditor"].ue.ready(() => {
              this.$refs["productGraphic"].$refs["detailEditor"].setCurrContent(
                res.data.productData.detail || ""
              );
            });

            // sku列表
            let skuName = res.data.skuName || [];
            let skuNameObject = {};
            skuName.forEach(item => {
              item.values = [];
              item.has_image = !!item.has_image;
              skuNameObject[item.id] = item;
            });
            (res.data.skuValue || []).forEach(item => {
              item.image = item.small_image;
              skuNameObject[item.sku_name_id].values.push(item);
            });

            // sku数据
            let skuObjects = {};
            let skus = res.data.skus || [];
            let distributionLevelList = res.data.distributionLevelList || [];
            let memberLevelList = res.data.memberLevelList || [];
            let distributionLevel = res.data.distributionLevel;

            let baseDealerCombine = [];
            this.dealer_config.levels.forEach(item =>
              this.dealer_config.levels.forEach(n =>
                baseDealerCombine.push(item.id + "-" + n.id)
              )
            );

            skus.forEach(item => {
              item.sku_code = item.sku_code.replace(/(^,*)|(,*$)/g, "");
              skuObjects[item.sku_code] = item;
              item.supply_price = item.supply_price
                ? Number(item.supply_price)
                : null;
              item.market_price = item.market_price
                ? Number(item.market_price)
                : null;
              item.serial_number = item.serial_number || "";
              item.price = item.price ? Number(item.price) : null;
              item.weight = item.weight ? Number(item.weight) : null;
              item.inventory =
                item.inventory !== null ? Number(item.inventory) : null;
              if (distributionLevel && item.commission_info) {
                item.commission_info.rule = Object.assign(
                  {},
                  ...distributionLevelList.map(item1 => {
                    return {
                      [item1.id]: {
                        commission_rate: item.commission_info.rule[item1.id]
                          ? item.commission_info.rule[item1.id].commission_rate
                          : {},
                        weight: item.commission_info.rule[item1.id]
                          ? item.commission_info.rule[item1.id].weight
                          : item1.weight
                      }
                    };
                  })
                );
              }
              if (item.member_level_info) {
                item.member_level_info.rule = Object.assign(
                  {},
                  ...memberLevelList.map(item1 => {
                    return {
                      [item1.id]: {
                        discount: item.member_level_info.rule[item1.id]
                          ? item.member_level_info.rule[item1.id].discount
                          : null,
                        weight: item.member_level_info.rule[item1.id]
                          ? item.member_level_info.rule[item1.id].weight
                          : item1.weight
                      }
                    };
                  })
                );
              }

              if (item.cloud_stock_rule_info) {
                item.cloud_stock_rule_info.rule.commission = Object.assign(
                  {},
                  ...this.dealer_config.levels.map(item1 => {
                    let stockData = {
                      [item1.id]: item.cloud_stock_rule_info.rule.commission[
                        item1.id
                      ]
                        ? item.cloud_stock_rule_info.rule.commission[item1.id]
                        : null
                    };
                    item1.sub_levels.forEach(
                      n =>
                        (stockData[n.id] = item.cloud_stock_rule_info.rule
                          .commission[n.id]
                          ? item.cloud_stock_rule_info.rule.commission[n.id]
                          : null)
                    );
                    return stockData;
                  })
                );
              }

              if (item.dealer_sale_reward_info) {
                item.dealer_sale_reward_info.rule.commission = Object.assign(
                  {},
                  ...baseDealerCombine
                    .filter(n =>
                      item.dealer_sale_reward_info.rule.commission.hasOwnProperty(
                        n
                      )
                    )
                    .map(item1 => ({
                      [item1]:
                        item.dealer_sale_reward_info.rule.commission[item1]
                    }))
                );
              }

              if (item.area_agent_rule_info) {
                item.area_agent_rule_info.rule = Object.assign(
                  {},
                  ...this.area_agent_config.levels.map(item1 => {
                    return {
                      [item1.id]: {
                        commission_rate: item.area_agent_rule_info.rule[
                          item1.id
                        ]
                          ? item.area_agent_rule_info.rule[item1.id]
                              .commission_rate
                          : {},
                        weight: item.area_agent_rule_info.rule[item1.id]
                          ? item.area_agent_rule_info.rule[item1.id].weight
                          : item1.weight
                      }
                    };
                  })
                );
              }
            });

            let distributionCommissionList = distributionLevelList.map(item => {
              let showItem = Object.assign({}, item);
              if (skuName.length) {
                showItem.commission_custom = {};
              } else {
                showItem.commission_custom = Object.assign(
                  {},
                  (skus[0].commission_info &&
                    skus[0].commission_info.rule[item.id] &&
                    skus[0].commission_info.rule[item.id].commission_rate) ||
                    {}
                );
              }
              return showItem;
            });

            let memberPriceList = memberLevelList.map(item => {
              let showItem = Object.assign({}, item);
              if (skuName.length) {
                showItem.member_discount = null;
              } else {
                showItem.member_discount =
                  skus[0].member_level_info &&
                  skus[0].member_level_info.rule[item.id] &&
                  skus[0].member_level_info.rule[item.id].discount
                    ? Number(skus[0].member_level_info.rule[item.id].discount)
                    : null;
              }
              return showItem;
            });

            if (skuName.length) {
              this.singleSku = {};
            } else {
              this.singleSku = skus[0];
            }

            // 记录单规格的会员价分佣类型id
            this.fenxiao_rule = skuName.length
              ? null
              : skus[0] && skus[0].fenxiao_rule;
            this.member_rule = skuName.length
              ? null
              : skus[0] && skus[0].member_rule;
            this.reward_rule = skuName.length
              ? null
              : skus[0] && skus[0].agent_order_commission_rule;
            this.sale_rule = skuName.length
              ? null
              : skus[0] && skus[0].agent_sale_reward_rule;
            this.cloud_stock_rule = skuName.length
              ? null
              : skus[0] && skus[0].cloud_stock_rule;
            this.dealer_sale_reward_rule = skuName.length
              ? null
              : skus[0] && skus[0].dealer_sale_reward_rule;
            this.area_agent_rule = skuName.length
              ? null
              : skus[0] && skus[0].area_agent_rule;
            this.memberPriceList = memberPriceList;
            this.distributionCommissionList = distributionCommissionList;
            this.formValidateSku = {
              multiSpecificationsStatus: skuName.length ? true : false, // 是否开启多规格
              specificationsData: skuName, // 多规格参数
              supplyPrice: skuName.length
                ? null
                : Number(skus[0] && skus[0].supply_price), // 供货价
              marketPrice: skuName.length
                ? null
                : skus[0] && skus[0].market_price, // 市场价
              sellPrice: skuName.length ? null : skus[0] && skus[0].price, // 销售价
              memberPriceType:
                Number(res.data.skus[0].member_rule) > 0
                  ? 1
                  : Number(res.data.skus[0].member_rule), // 会员价类型
              distributionCommissionType:
                Number(res.data.skus[0].fenxiao_rule) > 0
                  ? 1
                  : Number(res.data.skus[0].fenxiao_rule), // 分销佣金类型
              areaagentCommissionType:
                Number(res.data.skus[0].area_agent_rule) > 0
                  ? 1
                  : Number(res.data.skus[0].area_agent_rule), // 区代分佣类型
              rewardCommissionType:
                Number(res.data.skus[0].agent_order_commission_rule) > 0
                  ? 1
                  : Number(res.data.skus[0].agent_order_commission_rule), // 订单分红类型
              saleCommissionType:
                Number(res.data.skus[0].agent_sale_reward_rule) > 0
                  ? 1
                  : Number(res.data.skus[0].agent_sale_reward_rule), // 销售返佣类型
              cloudstockCommissionType:
                Number(res.data.skus[0].cloud_stock_rule) > 0
                  ? 1
                  : Number(res.data.skus[0].cloud_stock_rule),
			  cloud_stock_status: Number(res.data.productData.cloud_stock_status || 0),
              dealerSaleCommissionType:
                Number(res.data.skus[0].dealer_sale_reward_rule) > 0
                  ? 1
                  : Number(res.data.skus[0].dealer_sale_reward_rule),
              memberLevelList: memberLevelList,
              memberLevelPriceType: skus[0].member_level_info
                ? skus[0].member_level_info.amountType
                : 0,
              distributionLevel: distributionLevel,
              distributionLevelType: skus[0].commission_info
                ? skus[0].commission_info.amountType
                : 0,
              distributionLevelList: distributionLevelList,
              productQuantity: (skus[0] && skus[0].weight) || 0, // 商品重量
              productSkuNum: (skus[0] && skus[0].inventory) || 0, // 商品库存
              skus: skuObjects,
              skuArray: [],
              product_sku_num: res.data.product_sku_num,
              productNumber: (skus[0] && skus[0].serial_number) || "",
              oldProductNumber: (skus[0] && skus[0].serial_number) || ""
            };
            this.getMaxCommision();
            let paramsData = JSON.parse(res.data.productData.params || "[]");
            this.formValidateSenior = {
              productSkuNumWarning: res.data.productData.warning_inventory
                ? res.data.productData.warning_inventory
                : null,
              base_sold_count: Number(res.data.productData.base_sold_count || 0),
              sort: Number(res.data.productData.sort || 0),
              min_buy_num: Number(res.data.productData.min_buy_num || 1),
              buy_limit_status: Number(res.data.productData.buy_limit_status || 0),
              buy_limit_type: Number(res.data.productData.buy_limit_type || 99),
              buy_limit_num: Number(res.data.productData.buy_limit_num || 1),
              paramsData: paramsData,
              discoStatus: Number(res.data.productData.point_status || 0),
              pointRule: res.data.productData.point_rule ? {
                id: res.data.productData.point_rule.id,
                rule_info: {
                  out_order_pay_point: Number(res.data.productData.point_rule.rule_info.out_order_pay_point) || null,
                  out_order_pay_max_percent: Number(res.data.productData.point_rule.rule_info.out_order_pay_max_percent) || null,
                }
              } : {},
              after_sale_setting: Number(
                res.data.productData.after_sale_setting || 0
              ),
              view_perm: Number(res.data.productData.view_perm || 0),
              buy_perm: Number(res.data.productData.buy_perm || 1),
              buyLevels:
                Number(res.data.productData.buy_perm || 1) === 2
                  ? res.data.buyLevels.map(item => {
                      return item.id;
                    })
                  : memberLevelList.map(n => n.id),
              viewLevels:
                Number(res.data.productData.view_perm || 0) === 2
                  ? res.data.viewLevels.map(item => {
                      return item.id;
                    })
                  : memberLevelList.map(n => n.id)
            };
            this.$store.state.COMMON_loading = false;
          }
        );
      } else {
        this.$httpGet("/shop/admin/product/add", null, res => {
          this.$store.state.COMMON_loading = false;
          if (res.code === 200) {
            let distributionLevelList = res.data.distributionLevelList || [];
            let memberLevelList = res.data.memberLevelList || [];
            // 防止后台没有设置commission报错
            if (!res.data.agent_base_config.commision) {
              res.data.agent_base_config.commision = {
                1: 0,
                2: 0,
                3: 0
              };
            }
            if (!res.data.agent_sale_reward_config.commision) {
              res.data.agent_sale_reward_config.commision = {
                1: 0,
                2: 0,
                3: 0
              };
            }
            this.agentConfig = {
              agent_base_config: res.data.agent_base_config,
              agent_sale_reward_config: res.data.agent_sale_reward_config
            };
            this.area_agent_config = res.data.area_agent_config;
            this.dealer_config = Object.assign(
              {},
              dealer_config,
              {
                dealer_sale_reward_config: res.data.dealer_sale_reward_config
              },
              res.data.dealer_config
            );
            this.sortDealerLevel();
            this.formValidateBase.productClassList = res.data.classList || [];
            this.formValidateSku = Object.assign({}, this.formValidateSku, {
              memberLevelList: memberLevelList,
              distributionLevelList: distributionLevelList,
              distributionLevel: res.data.distributionLevel,
              product_sku_num: res.data.product_sku_num
            });
            this.formValidateSenior.buyLevels = memberLevelList.map(n => n.id);
            this.formValidateSenior.viewLevels = memberLevelList.map(n => n.id);
            this.distributionCommissionList = distributionLevelList.map(
              item => {
                let showItem = Object.assign({}, item);
                showItem.commission_custom = {};
                return showItem;
              }
            );
            this.memberPriceList = memberLevelList.map(item => {
              let showItem = Object.assign({}, item);
              showItem.member_discount = null;
              return showItem;
            });
            this.singleSku = {};
            this.formValidateBase.freightTemplateList =
              res.data.freightTemplateList || [];
            this.getMaxCommision();
          } else {
            this.$Message.error(res.msg);
          }
        });
      }
    },
    /**
     * 经销商等级排序
     */
    sortDealerLevel() {
      // 等级排序(从低到高)
      this.dealer_config.levels.sort((a, b) => {
        return a.weight - b.weight;
      });
      this.dealer_config.levels.forEach(item =>
        item.sub_levels.sort((a, b) => {
          return a.weight - b.weight;
        })
      );
    },
    setSkuArray() {
      let skuArray = [];
      // 利用多规格整理出多规格商品列表
      let skuIdArray = [];
      this.formValidateSku.specificationsData.forEach(item => {
        // 获得最终的skuid组合
        if (!skuIdArray.length) {
          skuIdArray.push([]);
        }
        item.values &&
          item.values.length &&
          (skuIdArray = this.getSkuData(skuIdArray, item.values));
      });
      // 根据组合拿到数据
      skuIdArray.forEach(item => {
        let skuData = this.formValidateSku.skus[item.join()];
        if (!skuData) {
          skuData = Object.assign({}, skuItem, { sku_code: item.join() });
        }
        skuArray.push(skuData);
      });
      this.$set(this.formValidateSku, "skuArray", skuArray);
    },
    getSkuData(skuIdArray, itemArray) {
      let skuId = [];
      skuIdArray.forEach(item => {
        itemArray.forEach(item1 => {
          skuId.push([].concat(...item, item1.id));
        });
      });
      return skuId;
    },
    getMaxCommision() {
      // 获取所有数据
      let firstCommission = [];
      let secondCommission = [];
      let thirdCommission = [];
      this.formValidateSku.distributionLevelList.forEach(item => {
        if (item.status === 1) {
          firstCommission.push(item.commission[1] || null);
          secondCommission.push(item.commission[2] || null);
          thirdCommission.push(item.commission[3] || null);
        }
      });
      // 计算最大值（0必须，reduce需要参数才不报错）
      let maxArray = [
        0,
        Math.max(...firstCommission),
        Math.max(...secondCommission),
        Math.max(...thirdCommission)
      ];
      let maxCommision = maxArray
        .slice(0, this.formValidateSku.distributionLevel + 1)
        .reduce((a, b) => {
          return a + b;
        });
      this.maxCommision = maxCommision > 100 ? 100 : maxCommision;
    },
    /**
     * 检查下一步是否可跳转
     */
    checkNext() {
      let promiseArray = Object.keys(this.checkFormObject).map(item => {
        return new Promise(resolve => {
          this.checkFormObject[item].validate(valid => {
            resolve({ status: valid, index: item });
          });
        });
      });
      return Promise.all(promiseArray).then(valid => {
        let checkItem = valid.find(el => {
          return el.status === false;
        });
        if (checkItem) {
          this.tabChangeFlag = this.tabChangeArray[checkItem.index];
        }
        return !checkItem;
      });
    },
    /**
     * 下一步
     */
    onNextClick() {
      if (this.tabIndex < this.tabChangeArray.length - 1) {
        this.tabChangeFlag = this.tabChangeArray[this.tabIndex + 1];
      }
    },
    /**
     * 上一步
     */
    onPrevClick() {
      this.tabChangeFlag = this.tabChangeArray[this.tabIndex - 1];
    },
    /**
     * 设置保存的loading
     */
    setSaveLoading(status) {
      this.saveLoading = status;
    },
    /**
     * 审核供应商的商品
     */
    async onVerifySupplierClick() {
      if (!(await this.checkNext())) {
        this.$Message.error("保存失败");
        return;
      }
      this.verifyStatus = true;
    },
    onSupplierVerifyConfirm(data, callback) {
      this.$set(this.formValidateBase, "status", data.status);
      let verifyData = {
        is_verify: 1,
        verify_status: data.pass,
        reject_reason: data.reason
      }
      this.onProductDetailSave(verifyData, callback);
    },
    /**
     * 保存商品信息
     */
    async onProductDetailSave(data = {}, callback) {
      if (!(await this.checkNext())) {
        callback && callback();
        this.$Message.error("保存失败");
        return;
      }
      if (
        this.hasLicensePerm("ENABLE_SUPPLIER") &&
        this.supplierInfo.id &&
        !this.supplierInfo.status === 1
      ) {
        await new Promise(resolve => {
          this.$Modal.confirm({
            title: "提示",
            content:
              "该供应商【供应商平台】已经被取消了供应商资格，暂不能上架该商品；如有需要，请先启用该供应商的资格再上架商品。",
            onOk: () => {
              resolve();
            },
            onCancel: () => {
              callback && callback();
            }
          });
        });
      }
      this.setSaveLoading(true);
      // 上传商品图片
      let promiseImageArray = [];
      let postImageData = this.formValidateBase.pruductImage.map(item => {
        if (typeof item === "object") {
          return "";
        }
        return item.replace(this.imagePath, "");
      });
      this.formValidateBase.pruductImage.forEach((item, index) => {
        if (typeof item === "object") {
          let imageFormData = new FormData();
          imageFormData.append("image", item);
          promiseImageArray.push(
            new Promise(resolve => {
              this.$httpUpload(
                "/shop/admin/product/image/upload",
                imageFormData,
                res => {
                  if (res.code === 200) {
                    postImageData[index] = res.data.bigImage;
                    resolve();
                  } else {
                    this.setSaveLoading(false);
                    callback && callback();
                    this.$Message.error(res.msg);
                  }
                }
              );
            })
          );
        }
      });

      // 上传视频封面
      let videoPosterData = this.formValidateBase.video_poster.map(item => {
        if (typeof item === "object") {
          return "";
        }
        return item.replace(this.imagePath, "");
      });
      this.formValidateBase.video_poster.forEach((item, index) => {
        if (typeof item === "object") {
          let imageFormData = new FormData();
          imageFormData.append("image", item);
          promiseImageArray.push(
            new Promise(resolve => {
              this.$httpUpload(
                "/shop/admin/product/video/poster/upload",
                imageFormData,
                res => {
                  if (res.code === 200) {
                    videoPosterData[index] = res.data.bigImage;
                    resolve();
                  } else {
                    this.setSaveLoading(false);
                    callback && callback();
                    this.$Message.error(res.msg);
                  }
                }
              );
            })
          );
        }
      });

      // 上传规格图片
      if (this.formValidateSku.multiSpecificationsStatus) {
        this.formValidateSku.specificationsData.forEach((item, index) => {
          item.values.forEach((itemVal, indexVal) => {
            if (itemVal.image && typeof itemVal.image === "object") {
              let imageFormData = new FormData();
              imageFormData.append("skuImage", itemVal.image);
              promiseImageArray.push(
                new Promise(resolve => {
                  this.$httpUpload(
                    "/shop/admin/product/sku/image/upload",
                    imageFormData,
                    res => {
                      if (res.code === 200) {
                        this.formValidateSku.specificationsData[index].values[
                          indexVal
                        ].big_image = res.data.bigImage;
                        this.formValidateSku.specificationsData[index].values[
                          indexVal
                        ].small_image = res.data.smallImage;
                        resolve();
                      } else {
                        this.$Message.error(res.msg);
                        callback && callback();
                        this.setSaveLoading(false);
                      }
                    }
                  );
                })
              );
            }
          });
        });
      }

      // 等待图片上传完成
      await Promise.all(promiseImageArray);

      let postProductData = {
        productData: {
          // 基础部分
          name: this.formValidateBase.productName,
          type: this.formValidateBase.productType,
          detail: this.$refs["productGraphic"].$refs[
            "detailEditor"
          ].getCurrContent(),
          big_images: postImageData,
          small_images: JSON.parse(
            JSON.stringify(postImageData).replace(/_b/g, "_s")
          ),
          video: this.formValidateBase.video,
          video_poster: videoPosterData.length > 0 ? videoPosterData[0] : "",
          class_ids: this.formValidateBase.productClass,
          // sku
          price: Number(this.formValidateSku.sellPrice),
          supply_price: Number(this.formValidateSku.supplyPrice),
          market_price: this.formValidateSku.marketPrice,
          point_status: this.formValidateSenior.discoStatus,
		  point_rule: this.formValidateSenior.pointRule,
          after_sale_setting: this.formValidateSenior.after_sale_setting,
          view_perm: this.formValidateSenior.view_perm,
          buy_perm: this.formValidateSenior.buy_perm,
          viewLevels:
            this.formValidateSenior.view_perm === 2
              ? this.formValidateSenior.viewLevels
              : [],
          buyLevels:
            this.formValidateSenior.buy_perm === 2
              ? this.formValidateSenior.buyLevels
              : [],
          freight_id:
            this.formValidateBase.productFreight === "0"
              ? "0"
              : this.formValidateBase.freightTemplate,
          inventory: Number(this.formValidateSku.productSkuNum),
          weight: this.formValidateSku.productQuantity,
          serial_number: this.formValidateSku.productNumber,
          status: this.formValidateBase.status,
          cloud_stock_status: this.formValidateSku.cloud_stock_status,
          // 高级
          warning_inventory: this.formValidateSenior.productSkuNumWarning,
          base_sold_count: this.formValidateSenior.base_sold_count,
          sort: this.formValidateSenior.sort,
          min_buy_num: this.formValidateSenior.min_buy_num,
          buy_limit_status: this.formValidateSenior.buy_limit_status,
          buy_limit_type: this.formValidateSenior.buy_limit_type,
          buy_limit_num: this.formValidateSenior.buy_limit_num,
          ...data
          // 权限
        },
        skuData: this.formValidateSku.multiSpecificationsStatus
          ? this.formValidateSku.specificationsData
          : [],
        skus: this.formValidateSku.multiSpecificationsStatus
          ? this.formValidateSku.skuArray.map(item => Object.assign({}, item))
          : []
      };
      // 规则
      let fenxiao_rule =
        this.formValidateSku.distributionCommissionType === 1
          ? this.fenxiao_rule > 0
            ? this.fenxiao_rule
            : -99
          : this.formValidateSku.distributionCommissionType;
      let member_rule =
        this.formValidateSku.memberPriceType === 1
          ? this.member_rule > 0
            ? this.member_rule
            : -99
          : this.formValidateSku.memberPriceType;
      let reward_rule =
        this.formValidateSku.rewardCommissionType === 1
          ? this.reward_rule > 0
            ? this.reward_rule
            : -99
          : this.formValidateSku.rewardCommissionType;
      let sale_rule =
        this.formValidateSku.saleCommissionType === 1
          ? this.sale_rule > 0
            ? this.sale_rule
            : -99
          : this.formValidateSku.saleCommissionType;
      let cloud_stock_rule =
        this.formValidateSku.cloudstockCommissionType === 1
          ? this.cloud_stock_rule > 0
            ? this.cloud_stock_rule
            : -99
          : this.formValidateSku.cloudstockCommissionType;

      let dealer_sale_reward_rule =
        this.formValidateSku.dealerSaleCommissionType === 1
          ? this.dealer_sale_reward_rule > 0
            ? this.dealer_sale_reward_rule
            : -99
          : this.formValidateSku.dealerSaleCommissionType;

      let area_agent_rule =
        this.formValidateSku.areaagentCommissionType === 1
          ? this.area_agent_rule > 0
            ? this.area_agent_rule
            : -99
          : this.formValidateSku.areaagentCommissionType;

      let baseDealerCombine = [];
      this.dealer_config.levels.forEach(item =>
        this.dealer_config.levels.forEach(n =>
          baseDealerCombine.push(item.id + "-" + n.id)
        )
      );

      if (!this.formValidateSku.multiSpecificationsStatus) {
        postProductData.productData.fenxiao_rule = fenxiao_rule;
        postProductData.productData.member_rule = member_rule;

        let crule = {};
        if (this.distributionCommissionList.length > 0) {
          crule = Object.assign(
            ...this.distributionCommissionList.map(item => {
              return {
                [item.id]: {
                  weight: item.weight,
                  commission_rate: item.commission_custom
                }
              };
            })
          );
        }
        postProductData.productData.commission_info = {
          rule: crule,
          type: 0,
          amountType: this.formValidateSku.distributionLevelType
        };
        let prule = {};
        if (this.memberPriceList.length > 0) {
          prule = Object.assign(
            ...this.memberPriceList.map(item => {
              return {
                [item.id]: {
                  weight: item.weight,
                  discount: item.member_discount
                }
              };
            })
          );
        }
        postProductData.productData.member_level_info = {
          rule: prule,
          type: 0,
          amountType: this.formValidateSku.memberLevelPriceType
        };
        // 分红
        postProductData.productData.agent_order_commission_rule = reward_rule;
        if (![0, -1].includes(reward_rule)) {
          postProductData.productData.agent_order_commission_info = this.singleSku.agent_order_commission_info;
        }
        // 销售返佣
        postProductData.productData.agent_sale_reward_rule = sale_rule;
        if (![0, -1].includes(sale_rule)) {
          postProductData.productData.agent_sale_reward_info = this.singleSku.agent_sale_reward_info;
        }
        // 云仓价格
        postProductData.productData.cloud_stock_rule = cloud_stock_rule;
        if (![0].includes(cloud_stock_rule)) {
          postProductData.productData.cloud_stock_rule_info = this.singleSku.cloud_stock_rule_info;
        }
        // 云仓销售价
        postProductData.productData.dealer_sale_reward_rule = dealer_sale_reward_rule;
        if (![0].includes(dealer_sale_reward_rule)) {
          let saleInfo = this.singleSku.dealer_sale_reward_info;
          postProductData.productData.dealer_sale_reward_info = saleInfo;
          // 将没设置的云仓销售奖置0
          if (saleInfo) {
            saleInfo.rule.commission = Object.assign(
              {},
              ...baseDealerCombine.map(item1 => ({
                [item1]: saleInfo.rule.commission[item1] || 0
              }))
            );
          }
        }
        // 区域返佣
        // 销售返佣
        postProductData.productData.area_agent_rule = area_agent_rule;
        if (![0, -1].includes(area_agent_rule)) {
          postProductData.productData.area_agent_rule_info = this.singleSku.area_agent_rule_info;
        }
      } else {
        postProductData.skus.forEach(item => {
          delete item.maxCustomCommission;
          item.fenxiao_rule = fenxiao_rule;
          item.member_rule = member_rule;
          item.agent_order_commission_rule = reward_rule;
          item.agent_sale_reward_rule = sale_rule;
          item.cloud_stock_rule = cloud_stock_rule;
          item.dealer_sale_reward_rule = dealer_sale_reward_rule;
          item.area_agent_rule = area_agent_rule;
          // 将没设置的云仓销售奖置0
          if (item.dealer_sale_reward_info) {
            item.dealer_sale_reward_info.rule.commission = Object.assign(
              {},
              ...baseDealerCombine.map(item1 => ({
                [item1]:
                  item.dealer_sale_reward_info.rule.commission[item1] || 0
              }))
            );
          }
        });
      }
      if (this.productID) {
        postProductData.productData.id = this.productID;
      }
      postProductData.productData.params = this.formValidateSenior.paramsData;
      this.http({
        url: "/shop/admin/product/save",
        data: postProductData,
        method: "POST"
      })
        .then(res => {
          if (res.code === 200) {
            this.$Message.success(this.$store.state.SUCCESS_MSG);
            this.productID = res.data.id;
            // 如果是审核供应商的商品则跳回到待审核商品列表
            if (Object.values(data).length) {
              this.$router.replace({
                name: "supplierProductVerify"
              });
            } else {
              this.getProductInfo();
            }
          } else {
            this.$Message.error(res.msg);
          }
        })
        .finally(() => {
          this.setSaveLoading(false);
          callback && callback();
        });
    }
  },
  components: {
    productBase,
    productGraphic,
    productSku,
    productSenior,
    productCommission,
    productCloudstock,
    footButton,
    modalSupplierVerify
  }
};
</script>
<style lang="less" scoped>
.product-detail {
  text-align: left;
  /deep/.ivu-tabs {
    min-height: calc(100vh - 172px);
    .product-detail-tabpane-graphic {
      height: 100%;
      overflow: auto;
    }
    .ivu-tabs-bar {
      margin-bottom: 0;
    }
    .ivu-tabs-nav {
      margin-left: 24px;
    }
    // tab内边距
    .ivu-tabs-tabpane {
      padding: 24px 24px 0;
    }
    // 内容区高度
    .ivu-tabs-content {
      height: calc(100vh - 170px);
      overflow: auto;
    }
  }

  /deep/.product-detail-supplier-disabled {
    .ivu-input-number-input[disabled],
    .ivu-input[disabled] {
      opacity: 1;
      color: #464c5b;
      background-color: #f5f6f7;
    }
    .ivu-input-prefix i {
      color: #41b44d;
    }
  }

  /deep/.ivu-form-item {
    margin-top: 20px !important;
    margin-bottom: 20px !important;
    // 左边标签距离
  }
  /deep/.ivu-form .ivu-form-item-label {
    padding-right: 8px;
    height: 32px;
  }

  /deep/.product-detail-item {
    .ivu-radio-group {
      line-height: 32px;
      height: 32px;
      vertical-align: initial;
    }
    // 输入框宽度
    .ivu-input-wrapper,
    .ivu-select {
      width: 280px;
      vertical-align: top;
    }
    // 单选框右边距离
    .ivu-radio-wrapper {
      margin-right: 26px;
    }
    // 文字垂直居中（需要设置行高）
    .product-detail-verity {
      vertical-align: middle;
    }
    // 换行
    .product-detail-newsline {
      display: block;
      margin-top: 10px;
    }
    // 默认按钮高度样式
    button.ivu-btn-primary {
      line-height: 1;
      height: 32px;
      vertical-align: top;
      i {
        vertical-align: middle;
        font-size: 20px;
      }
      span {
        vertical-align: middle;
      }
    }
    // 悬停弹窗
    .ivu-poptip {
      .iconfont {
        font-size: 20px;
        margin-right: 10px;
      }
    }
    // 文本框数字下标
    span.textarea-num {
      font-size: 12px;
      color: #999999;
      margin-left: 10px;
      vertical-align: bottom;
      position: relative;
      bottom: -10px;
    }
  }
}
.product-detail-foot-button {
  /deep/button {
    & + button {
      margin-left: 0;
    }
    &.ivu-btn-primary {
      min-width: 70px;
    }
    &.ivu-btn-text {
      position: absolute;
      top: 50%;
      margin-top: -15px;
    }
    &.product-detail-foot-button-prev {
      margin-left: -133px;
      color: #464c5b;
      &:focus {
        box-shadow: none;
      }
      &:hover {
        text-decoration: unset;
      }
      img {
        margin-right: 7px;
      }
    }
    &.product-detail-foot-button-next {
      margin-left: 35px;
      color: #464c5b;
      &:focus {
        box-shadow: none;
      }
      &:hover {
        text-decoration: unset;
      }
      img {
        margin-left: 7px;
        transform: rotate(180deg);
      }
    }
    img {
      width: 20px;
      height: 11px;
      vertical-align: middle;
    }
    span {
      vertical-align: middle;
    }
  }
}
</style>
