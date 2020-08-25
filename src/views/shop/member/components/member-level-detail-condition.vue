<template>
    <div class="distributor-level-detail-condition">
    <span
            style="position: absolute;top: 0;line-height: 32px;font-size: 12px;color:#ED4014;left: 130px;"
            v-show="notInputStatus"
    >{{dataItem.length ? "已添加的条件数值不能为空" : "请选择升级条件"}}</span>
        <Collapse simple v-model="collapseSelectArray">
            <!-- 人数 -->
<!--            <Panel name="1" :hide-arrow="true" v-show="panelShow.person">-->
<!--                <div>-->
<!--                    <i-->
<!--                        class="iconfont icon-md-arrow-dropright"-->
<!--                        :class="{'distributor-level-detail-transform': collapseSelectArray.includes('1')}"-->
<!--                    ></i>-->
<!--                    <span>人数 :</span>-->
<!--                </div>-->
<!--                <div slot="content">-->
<!--                    <template v-for="(item, index) in dataItem">-->
<!--                        &lt;!&ndash; 有等级选择的 &ndash;&gt;-->
<!--                        <div-->
<!--                            class="distributor-level-detail-condition-item"-->
<!--                            :class="{'ivu-form-item-error': distributorError[item.type]}"-->
<!--                            :key="item.type"-->
<!--                            v-if="conditionType.person[item.type] && !conditionType.person.extra[item.type]"-->
<!--                        >-->
<!--                            <span v-if="item.type === 8">{{conditionType.person[item.type].conditionName}}满</span>-->
<!--                            <span v-else>{{conditionType.person[item.type].conditionName}}&nbsp;&nbsp;满</span>-->
<!--                            <InputNumber-->
<!--                                :min="0"-->
<!--                                :max="9999999"-->
<!--                                placeholder="请输入"-->
<!--                                :precision="0"-->
<!--                                class="common-input-text-120"-->
<!--                                @on-change="$event && $set(distributorError, item.type, false)"-->
<!--                                v-model="item.value"-->
<!--                            />-->
<!--                            <span class="distributor-level-detail-condition-classifier">人</span>-->
<!--                            <more-message-->
<!--                                :maxWidth="320"-->
<!--                                style="margin-right: 20px;"-->
<!--                                :text="conditionType.person[item.type].tip"-->
<!--                            ></more-message>-->
<!--                            <RadioGroup v-model="item.logistic">-->
<!--                                <Radio label="or">或</Radio>-->
<!--                                <Radio label="and">与</Radio>-->
<!--                            </RadioGroup>-->
<!--                            <span-->
<!--                                class="distributor-level-detail-condition-desc"-->
<!--                                v-if="conditionType.person[item.type].explain"-->
<!--                            >（只对【分销商】升级有效）</span>-->
<!--                            <span-->
<!--                                class="table-operation"-->
<!--                                style="margin-left: 24px;"-->
<!--                                @click="dataItem.splice(index, 1);$set(distributorError, item.type, false);"-->
<!--                            >删除</span>-->
<!--                        </div>-->
<!--                        <div-->
<!--                            class="distributor-level-detail-condition-item distributor-level-detail-condition-item-extra"-->
<!--                            :key="item.type"-->
<!--                            v-if="conditionType.person[item.type] && conditionType.person.extra[item.type]"-->
<!--                        >-->
<!--                            <span>{{conditionType.person.extra[item.type]}}</span>-->
<!--                            <tree-select-->
<!--                                :ref="'levelTeam' + item.type"-->
<!--                                class="distributor-level-detail-condition-input"-->
<!--                                :class="{'ivu-form-item-error': distributorError['levelTeam' + item.type]}"-->
<!--                                transfer-->
<!--                                :data="levelShowDataTeam(item.type)"-->
<!--                                placeholder="请选择"-->
<!--                                @on-check-change="onSelectDataChange(item.value,'distribution_level_id', 'levelTeam' + item.type)"-->
<!--                            ></tree-select>-->
<!--                            <span>等级{{conditionType.person[item.type].conditionName.replace(conditionType.person.extra[item.type], "")}}&nbsp;&nbsp;满</span>-->
<!--                            <span-->
<!--                                style="font-size: 0;"-->
<!--                                :class="{'ivu-form-item-error': distributorError[item.type]}"-->
<!--                            >-->
<!--                                <InputNumber-->
<!--                                    :min="0"-->
<!--                                    :max="9999999"-->
<!--                                    :precision="0"-->
<!--                                    placeholder="请输入"-->
<!--                                    class="distributor-level-detail-condition-input"-->
<!--                                    v-model="item.value.member_count"-->
<!--                                    @on-change="$event && $set(distributorError, item.type, false)"-->
<!--                                />-->
<!--                            </span>-->
<!--                            <span class="distributor-level-detail-condition-classifier">{{conditionType.person[item.type].unit}}</span>-->
<!--                            <more-message style="margin-right: 20px;" :text="conditionType.person[item.type].tip"></more-message>-->
<!--                            <RadioGroup v-model="item.logistic">-->
<!--                                <Radio label="or">或</Radio>-->
<!--                                <Radio label="and">与</Radio>-->
<!--                            </RadioGroup>-->
<!--                            <span-->
<!--                                class="distributor-level-detail-condition-desc"-->
<!--                                v-if="conditionType.person[item.type].explain"-->
<!--                            >（只对【分销商】升级有效）</span>-->
<!--                            <span-->
<!--                                class="table-operation"-->
<!--                                style="margin-left: 24px;"-->
<!--                                @click="dataItem.splice(index, 1);$set(distributorError, item.type, false);$set(distributorError, 'levelTeam' + item.type, false);"-->
<!--                            >删除</span>-->
<!--                        </div>-->
<!--                    </template>-->
<!--                </div>-->
<!--            </Panel>-->
            <!-- 订单 -->
            <Panel name="1" :hide-arrow="true" v-show="panelShow.order">
                <div>
                    <i
                        class="iconfont icon-md-arrow-dropright"
                        :class="{'distributor-level-detail-transform': collapseSelectArray.includes('1')}"
                    ></i>
                    <span>订单 :</span>
                </div>
                <div slot="content">
                    <template v-for="(item, index) in dataItem">
                        <div
                            class="distributor-level-detail-condition-item"
                            :class="{'ivu-form-item-error': distributorError[item.type]}"
                            v-if="conditionType.order[item.type]"
                            :key="item.type"
                        >
                            <span>{{conditionType.order[item.type].conditionName}}&nbsp;&nbsp;满</span>
                            <InputNumber
                                :min="0"
                                :max="9999999"
                                :precision="conditionType.order[item.type].precision"
                                placeholder="请输入"
                                class="common-input-text-120"
                                v-model="item.value"
                                @on-change="$event && $set(distributorError, item.type, false)"
                            />
                            <span class="distributor-level-detail-condition-classifier">{{conditionType.order[item.type].unit}}</span>
                            <more-message style="margin-right: 20px;" :text="conditionType.order[item.type].tip"></more-message>
                            <RadioGroup v-model="item.logistic">
                                <Radio label="or">或</Radio>
                                <Radio label="and">与</Radio>
                            </RadioGroup>
                            <span
                                class="distributor-level-detail-condition-desc"
                                v-if="conditionType.order[item.type].explain"
                            >（只对【分销商】升级有效）</span>
                            <span
                                class="table-operation"
                                style="margin-left: 24px;"
                                @click="dataItem.splice(index, 1);$set(distributorError, item.type, false);"
                            >删除</span>
                        </div>
                    </template>
                </div>
            </Panel>
            <!-- 充值 -->
            <Panel name="2" :hide-arrow="true" v-show="panelShow.recharge">
                <div>
                    <i
                        class="iconfont icon-md-arrow-dropright"
                        :class="{'distributor-level-detail-transform': collapseSelectArray.includes('2')}"
                    ></i>
                    <span>充值 :</span>
                </div>
                <div slot="content">
                    <template v-for="(item, index) in dataItem">
                        <div
                            class="distributor-level-detail-condition-item"
                            :class="{'ivu-form-item-error': distributorError[item.type]}"
                            v-if="conditionType.recharge[item.type]"
                            :key="item.type"
                        >
                            <span>{{conditionType.recharge[item.type].conditionName}}&nbsp;&nbsp;满</span>
                            <InputNumber
                                :min="0"
                                :max="9999999"
                                :precision="conditionType.recharge[item.type].precision"
                                placeholder="请输入"
                                class="common-input-text-120"
                                v-model="item.value"
                                @on-change="$event && $set(distributorError, item.type, false)"
                            />
                            <span class="distributor-level-detail-condition-classifier">{{conditionType.recharge[item.type].unit}}</span>
                            <more-message style="margin-right: 20px;" :text="conditionType.recharge[item.type].tip"></more-message>
                            <RadioGroup v-model="item.logistic">
                                <Radio label="or">或</Radio>
                                <Radio label="and">与</Radio>
                            </RadioGroup>
                            <span
                                class="distributor-level-detail-condition-desc"
                                v-if="conditionType.recharge[item.type].explain"
                            >（只对【分销商】升级有效）</span>
                            <span
                                class="table-operation"
                                style="margin-left: 24px;"
                                @click="dataItem.splice(index, 1);$set(distributorError, item.type, false);"
                            >删除</span>
                        </div>
                    </template>
                </div>
            </Panel>
            <!-- 商品 -->
<!--            <Panel name="3" :hide-arrow="true" v-show="panelShow.product">-->
<!--                <div>-->
<!--                    <i-->
<!--                        class="iconfont icon-md-arrow-dropright"-->
<!--                        :class="{'distributor-level-detail-transform': collapseSelectArray.includes('3')}"-->
<!--                    ></i>-->
<!--                    <span>商品 :</span>-->
<!--                </div>-->
<!--                <div slot="content">-->
<!--                    <template v-for="(item, index) in dataItem">-->
<!--                        <div-->
<!--                            class="distributor-level-detail-condition-item"-->
<!--                            :class="{'ivu-form-item-error': distributorError[item.type]}"-->
<!--                            v-if="conditionType.product[item.type]"-->
<!--                            :key="item.type"-->
<!--                        >-->
<!--                            <span>{{conditionType.product[item.type].conditionName}}&nbsp;&nbsp;满</span>-->
<!--                            <InputNumber-->
<!--                                :min="0"-->
<!--                                :max="9999999"-->
<!--                                :precision="0"-->
<!--                                placeholder="请输入"-->
<!--                                class="common-input-text-120"-->
<!--                                v-model="item.value"-->
<!--                                @on-change="$event && $set(distributorError, item.type, false)"-->
<!--                            />-->
<!--                            <span class="distributor-level-detail-condition-classifier">{{conditionType.product[item.type].unit}}</span>-->
<!--                            <more-message-->
<!--                                style="margin-right: 20px;"-->
<!--                                :text="conditionType.product[item.type].tip"-->
<!--                            ></more-message>-->
<!--                            <RadioGroup v-model="item.logistic">-->
<!--                                <Radio label="or">或</Radio>-->
<!--                                <Radio label="and">与</Radio>-->
<!--                            </RadioGroup>-->
<!--                            <span-->
<!--                                    class="distributor-level-detail-condition-desc"-->
<!--                                    v-if="conditionType.product[item.type].explain"-->
<!--                            >（只对【分销商】升级有效）</span>-->
<!--                            <span-->
<!--                                    class="table-operation"-->
<!--                                    style="margin-left: 24px;"-->
<!--                                    @click="dataItem.splice(index, 1);$set(distributorError, item.type, false);"-->
<!--                            >删除</span>-->
<!--                        </div>-->
<!--                    </template>-->
<!--                    <div-->
<!--                        class="distributor-level-detail-condition-item distributor-level-detail-condition-item-product"-->
<!--                        v-show="productSetEaxit"-->
<!--                    >-->
<!--                        <span style="width: 132px;margin-right: 6px;">购买以下任意指定商品</span>-->
<!--                        <span-->
<!--                            class="distributor-level-detail-condition-product-tip"-->
<!--                            v-show="productTipShow"-->
<!--                        >至少添加一个商品</span>-->
<!--                        <add-more text="添加商品" @onAddMoreClick="onAddProductClick"></add-more>-->
<!--                        <div style="width: 700px;margin-top: 20px;" v-show="productSelectData.length">-->
<!--                            <common-table-->
<!--                                :columnsData="productSelectTableColumn"-->
<!--                                :listData="productSelectData"-->
<!--                                type="border"-->
<!--                            ></common-table>-->
<!--                        </div>-->
<!--                    </div>-->
<!--                </div>-->
<!--            </Panel>-->
        </Collapse>
<!--        <product-list-modal-->
<!--            @onGetProductInfo="onGetProductInfo"-->
<!--            v-model="modalStatus"-->
<!--            :productIds="productIds"-->
<!--        ></product-list-modal>-->
    </div>
</template>
<script>
    import treeSelect from "@/views/shop/components/selector/class-tree-select.vue";
    import moreMessage from "@/views/shop/components/more-message/more-message.vue";
    import addMore from "@/views/shop/components/button/add-more.vue";
    import commonTable from "@/views/shop/components/table/common-table.vue";
    // import productListModal from "@/views/shop/store/design/components/product-list.vue";
    import { conditionType } from "./member-level.js";
    export default {
        components: {
            treeSelect,
            moreMessage,
            addMore,
            commonTable,
        },
        props: {
            dataItem: {
                type: Array,
                default() {
                    return [];
                }
            },
            distributorLevel: {
                type: Array,
                default() {
                    return [];
                }
            },
            productSelectData: {
                type: Array,
                default() {
                    return [];
                }
            }
        },
        data() {
            return {
                productTipShow: false,
                collapseSelectArray: ["1", "2"],
                notInputStatus: false,
                distributorError: {},
                conditionType,
                modalStatus: false,
                productSelectTableColumn: [
                    {
                        title: "商品信息",
                        width: 250,
                        render: (h, params) => {
                            let status = params.row.status === 1
                            return h("div", {}, [
                                h(
                                    "div",
                                    {
                                        style: {
                                            display: "inline-block",
                                            marginRight: "8px",
                                            verticalAlign: "middle"
                                            // border: "1px solid #eeeeee"
                                        }
                                    },
                                    [
                                        h("img", {
                                            attrs: {
                                                src:
                                                    params.row.small_images.split(",").length &&
                                                    this.$store.state.siteComdataPath +
                                                    params.row.small_images.split(",")[0]
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
                                            width: status ? "172px" : "114px",
                                            textAlign: "left",
                                            lineHeight: 1.5
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
                                                    overflow: "hidden"
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
                        title: "商品分类",
                        width: 150,
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
                            return h("div", { style: {"line-height": "initial"} },params.row.status === -9 ? "--" : (text || ""));
                        }
                    },
                    {
                        title: "销售价",
                        align: "center",
                        render: (h, params) => {
                            return h("div", {}, params.row.status === -9 ? "--" : ("￥" + params.row.price));
                        }
                    },
                    {
                        title: "操作",
                        align: "center",
                        render: (h, params) => {
                            return h("div", [
                                params.row.status === -9 ? "" : h(
                                    "a",
                                    {
                                        class: {
                                            "table-operation": true
                                        },
                                        on: {
                                            click: () => {
                                                this.$router.push({
                                                    name: "productDetail",
                                                    query: {
                                                        id: params.row.id
                                                    }
                                                });
                                            }
                                        }
                                    },
                                    "查看详情"
                                ),
                                h(
                                    "a",
                                    {
                                        class: {
                                            "table-operation": true
                                        },
                                        style: {
                                            marginLeft: "14px"
                                        },
                                        on: {
                                            click: () => {
                                                this.productSelectData.splice(params.index, 1);
                                            }
                                        }
                                    },
                                    "删除"
                                )
                            ]);
                        }
                    }
                ]
            };
        },
        computed: {
            productIds() {
                return this.productSelectData.map(item => item.id);
            },
            panelShow() {
                let showItem = {};
                this.dataItem.forEach(item => {
                    if (conditionType.order[item.type]) {
                        item.typeName = conditionType.order[item.type].conditionName;
                        showItem.order = true;
                    } else if (conditionType.recharge[item.type]) {
                        showItem.recharge = true;
                        item.typeName = conditionType.recharge[item.type].conditionName;
                    }
                    // if (conditionType.person[item.type]) {
                    //     showItem.person = true;
                    // } else if (conditionType.order[item.type]) {
                    //     showItem.order = true;
                    // } else if (conditionType.recharge[item.type]) {
                    //     showItem.recharge = true;
                    // }else{
                    //     showItem.product = true;
                    // }
                });
                return showItem;
            },
            levelShowDataTeam() {
                return type => {
                    // 拿到需要选中的id
                    let selectID =
                        this.dataItem.filter(item => item.type === type)[0].value
                            .distribution_level_id || "";
                    let selectArray = selectID
                        .split(",")
                        .filter(n => n)
                        .map(n => parseInt(n));
                    return this.distributorLevel.length
                        ? [
                            {
                                title: "全部等级",
                                children: this.distributorLevel.map(item => {
                                    return {
                                        title: item.name,
                                        isDisabled: !item.status,
                                        data: {
                                            id: item.id,
                                            class_name: item.name
                                        },
                                        checked: selectArray.includes(item.id)
                                    };
                                }),
                                expand: true,
                                data: {
                                    id: -1,
                                    class_name: "全部等级"
                                }
                            }
                        ]
                        : [];
                };
            },
            /**
             * 检测是否有设置与商品相关的值
             */
            productSetEaxit() {
                return this.dataItem.find(item => conditionType.product[item.type]);
            }
        },
        methods: {
            onAddProductClick() {
                this.modalStatus = true;
            },
            onGetProductInfo(val) {
                this.productTipShow = false;
                this.productSelectData.unshift(...val);
            },
            /**
             * 改变数据的时候保存id到需要上传的数据中并触发computed更新
             */
            onSelectDataChange(item, key, ref) {
                let selectList = this.$refs[ref][0].getCheckedNodes();
                let val = selectList
                    .map(item => item.data.id)
                    .filter(n => n !== -1)
                    .join(",");
                this.$set(item, key, val);
                if (key === "distribution_level_id") {
                    this.$set(this.distributorError, ref, false);
                }
            },
            /**
             * 检测数据
             */
            checkData() {
                let status = true; // 判断是否有没符合要求的（不符合要求为false）
                if(!this.dataItem.length) return status; //没有设置条件时，直接返回
                // 检测是否有值的
                this.productTipShow = false;
                // let prosuctStatus = this.productSelectData.length;
                let status1 =
                    this.dataItem.length &&
                    this.dataItem.filter(item => {
                        // 如果选了购买任意商品
                        // if (conditionType.product[item.type]) {
                        //     status = status && prosuctStatus;
                        //     this.productTipShow = !prosuctStatus;
                        // }
                        // 如果是有分销商等级选择的
                        // if (
                        //     conditionType.person[item.type] &&
                        //     conditionType.person.extra[item.type]
                        // ) {
                        //     this.$set(
                        //         this.distributorError,
                        //         "levelTeam" + item.type,
                        //         !item.value.distribution_level_id
                        //     );
                        //     this.$set(
                        //         this.distributorError,
                        //         item.type,
                        //         !item.value.member_count
                        //     );
                        //     return item.value.distribution_level_id && item.value.member_count;
                        // }
                        this.$set(this.distributorError, item.type, !item.value);
                        return item.value;
                    }).length === this.dataItem.length;
                this.notInputStatus = !status1;
                return status && status1;
            }
        }
    };
</script>
<style lang="less" scoped>
    @inputMarginRight: 5px;
    .distributor-level-detail-condition {
        /deep/.class-tree-select {
            .ivu-select-dropdown {
                width: 220px;
            }
        }
        /deep/.ivu-collapse {
            border: none;
            .ivu-collapse-item {
                padding-bottom: 3px;
                border: none;
                background-color: #f5f6f7;
                & ~ .ivu-collapse-item {
                    margin-top: 10px;
                }
                /*&:nth-child(1) {*/
                    /*.distributor-level-detail-condition-item > span:first-child {*/
                        /*width: 96px;*/
                    /*}*/
                /*}*/
                // 头部
                .ivu-collapse-header {
                    width: 90px;
                    height: 48px;
                    line-height: 51px;
                    padding-left: 8px;
                    border-bottom: none;
                    color: #464c5b;
                    & > div {
                        font-size: 0;
                        i {
                            display: inline-block;
                            width: 32px;
                            height: 34px;
                            text-align: center;
                            line-height: 34px;
                            vertical-align: middle;
                            transition: transform 0.2s ease-in-out;
                            &.distributor-level-detail-transform {
                                transform: rotate(90deg);
                            }
                        }
                        span {
                            font-size: 14px;
                            font-weight: bold;
                            vertical-align: middle;
                        }
                    }
                }
                // 内容区
                .ivu-collapse-content {
                    padding-left: 74px;
                    background-color: #f5f6f7;
                    .ivu-radio-wrapper {
                        margin-right: 20px;
                    }
                    .ivu-collapse-content-box {
                        padding-bottom: 1px;
                        .distributor-level-detail-condition-item {
                            position: relative;
                            font-size: 0;
                            padding-bottom: 20px;
                            .distributor-level-detail-condition-input {
                                width: 156px;
                            }
                            &.distributor-level-detail-condition-item-product {
                                padding-left: 24px;
                                /deep/.add-more-btn {
                                    .btn-add {
                                        margin-bottom: 0;
                                    }
                                }
                            }
                            & > span {
                                font-size: 12px;
                                vertical-align: middle;
                                &:first-child {
                                    display: inline-block;
                                    text-align: right;
                                    margin-right: 5px;
                                }
                            }
                            // 单位处理
                            .common-input-text-120 {
                                margin-right: @inputMarginRight;
                            }
                            .distributor-level-detail-condition-classifier {
                                margin-right: 5px;
                            }
                            .distributor-level-detail-condition-desc {
                                color: #9ea7b4;
                            }
                            // 额外的多个输入框的
                            &.distributor-level-detail-condition-item-extra {
                                & > span {
                                    &:first-child {
                                        width: auto;
                                    }
                                }
                                .distributor-level-detail-condition-input {
                                    margin-right: 5px;
                                    & ~ span {
                                        margin-right: 5px;
                                    }
                                    & ~ .distributor-level-detail-condition-input {
                                        margin-right: @inputMarginRight;
                                    }
                                    .ivu-select-dropdown {
                                        width: 210px;
                                    }
                                }
                            }
                        }
                        .distributor-level-detail-condition-product-tip {
                            position: absolute;
                            left: 262px;
                            top: 0px;
                            color: #f73610;
                            font-size: 12px !important;
                        }
                    }
                }
            }
        }
    }
</style>
