<template>
    <div class="distributor-setting-list">
        <Modal
            class="distributor-setting-list-modal height-model"
            v-model="modalStatus"
            :width="630"
            :transition-names="['false']"
            :mask-closable="false"
            :title="text"
            ref="modal"
        >
            <div class="search-coupon">
                <search-list ref="searchList" :searchParams="searchParams" :search-data="searchData" />
            </div>
            <div
                class="distributor-setting-list-table"
                :class="{'distributor-setting-list-table-width': listData.length <= 4}"
            >
                <common-table
                    style="width: 570px;"
                    :columnsData="productColumnsData"
                    :listData="listData"
                    :loading="tableLoading"
                    :hasBorder="true"
                    border="1"
                ></common-table>
            </div>
            <div class="mglr">
                <Page
                    style="text-align: right;margin-top: 16px;"
                    :total="total"
                    size="small"
                    :page-size="20"
                    :current="currentPage"
                    @on-change="onPageChange"
                    show-elevator
                />
            </div>
            <div slot="footer">
                <Button type="text" @click="onCancelClick">取消</Button>
                <Button type="primary" @click="onComfrimClick">确定</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import commonTable from "@/views/shop/components/table/common-table.vue"
    import searchList from "@/views/shop/components/search/search-list.vue";
    import jQuery from "jquery";
    const searchData = {
        title:"",
        coupon_type: -1,
        terminal_type: -1,
        status: 1,
    };
    export default {
        components: {
            commonTable,
            searchList
        },
        props: {
            value: {
                type: Boolean,
                required: true
            },
            cloud: {
                type: Boolean,
                default: false
            },
            selectInfo: {
                type: Array
            },
            text: {
                default: "选择优惠券",
                type: String
            },
            multipleSelect:{
                type:Boolean,
                default:true
            },
        },
        data() {
            return {
                screenHeight: document.body.clientHeight,
                selectCcacheInfo: {
                    selectDesignatedProductID: 0,
                    selectDesignatedProductName: ""
                },
                hasSelectedAll: false,
                checkAllDisable: false,
                allClassSelectStatus: true,
                modalStatus: false,
                currentPage: 1,
                total: 0,
                searchParams: [
                    {
                        type: 1,
                        prefixIcon: "ios-search",
                        key: "title",
                        placeholder: "优惠券名称"
                    },
                ].filter(item => item),
                searchData: Object.assign({}, searchData),
                classList: [],
                sortedClass: [],
                tableLoading: false,
                productName: "",
                productNameCopy: "",
                productSelectClass: [-1],
                productSelectClassCopy: [-1],
                selectTableData:[],
                productColumnsData: [
                    {
                        width: 40,
                        align: 'center',
                        renderHeader: h => {
                            let checkBoxOption = {
                                on: {
                                    "on-change": value => {
                                        this.hasSelectedAll = value;
                                        let modalElm = jQuery(this.$refs["modal"].$el);
                                        if (!value) {
                                            modalElm.find(".cb-item .ivu-checkbox-input:checked").click();
                                        } else {
                                            modalElm.find(
                                                ".cb-item .ivu-checkbox-input:not(:checked)"
                                            ).click();
                                        }
                                    }
                                },
                                props: {
                                    value: this.hasSelectedAll ,
                                    disabled:!this.multipleSelect || this.checkAllDisable
                                }
                            };
                            return h("div", {}, [h("Checkbox", checkBoxOption, "")]);
                        },
                        render: (h, params) => {
                            let checkBoxOption = {
                                on: {
                                    "on-change": value => {
                                        if(this.multipleSelect){
                                            if (!value) this.hasSelectedAll = false;
                                            if (value) this.selectTableData.push(params.row);
                                            else
                                                this.selectTableData.splice(
                                                    this.selectTableData.findIndex((item)=>{return item.id==params.row.id}),
                                                    1
                                                );
                                        }else{
                                            this.selectTableData=[];
                                            this.selectTableData.push(params.row);
                                        }
                                    }
                                },
                                key:params.row.id,
                                props: {
                                    value: this.selectInfo.indexOf(params.row.id) > -1||this.selectTableData.findIndex((item)=>{return item.id==params.row.id})>-1,
                                    disabled: this.selectInfo.indexOf(params.row.id) > -1
                                },
                                class: "cb-item"
                            };
                            return h("div", {}, [h("Checkbox", checkBoxOption, "")]);
                        }
                    },
                    {
                        title: "优惠券标题",
                        minWidth: 180,
                        render: (h, params) => {
                            return h("div", {}, [
                                h(
                                    "div",
                                    {
                                        style: {
                                            width: "166px",
                                            overflow: "hidden",
                                            "text-overflow": "ellipsis",
                                            verticalAlign: "middle",
                                            textAlign: "left",
                                            display: "-webkit-inline-box",
                                            "-webkit-line-clamp": 2,
                                            "-webkit-box-orient": "vertical"
                                        }
                                    },
                                    [
                                        h(
                                            "Tooltip",
                                            {
                                                props: {
                                                    content: params.row.title,
                                                    transfer: true,
                                                    placement: "top",
                                                    maxWidth: "300px"
                                                }
                                            },
                                            params.row.title
                                        )
                                    ]
                                )
                            ]);
                        }
                    },
                    {
                        title: "门槛/面值/类型",
                        minWidth: 130,
                        align: "center",
                        render: (h, params) => {
                            var arr = [];
                            if (params.row.doorsill_type == 1) {
                                arr.push(`满${params.row.doorsill_full_money}元可用`);
                            } else {
                                arr.push("无门槛使用");
                            }
                            if (params.row.coupon_type == 1) {
                                arr.push(`${parseFloat(params.row.coupon_money)}折`);
                            } else {
                                arr.push(`${params.row.coupon_money}元`);
                            }
                            if (params.row.coupon_type == 1) {
                                arr.push("折扣券");
                            } else {
                                arr.push("现金券");
                            }
                            return h("span", [arr[0], h("br"), arr[1], h("br"), arr[2]]);
                        }
                    },
                    {
                        title: "可用商品",
                        minWidth: 108,
                        align: "center",
                        render: (h, params) => {
                            if (params.row.product_info === "全场商品") {
                                return h("div", params.row.product_info? params.row.product_info:"--");
                            } else {
                                return h(
                                    "div",
                                    ((render, params) => {
                                        const rows = [];
                                        rows.push(
                                            h(
                                                "Tooltip",
                                                {
                                                    props: {
                                                        content: params.row.product_info,
                                                        placement: "top-start",
                                                        "max-width": 400,
                                                        disabled: params.row.product_info === "全场商品"
                                                    }
                                                },
                                                [
                                                    h(
                                                        "div",
                                                        { class: "table-area-shape" },
                                                        params.row.product_info? params.row.product_info:"--"
                                                    )
                                                ]
                                            )
                                        );
                                        return rows;
                                    })(h, params)
                                );
                            }
                        }
                    },
                    {
                        title: "可领取",
                        minWidth: 108,
                        align: "center",
                        render: (h, params) => {
                            return h(
                                "span",
                                params.row.can_received === -1 ? "无限" : params.row.can_received
                            );
                        }
                    }
                ],
                listData: [],
                productInfo: null
            };
        },
        watch: {
            value(val) {
                if (val !== this.modalStatus) {
                    this.modalStatus = val;
                }
                if (val) {
                    this.productInfo = null
                    this.changeCheckboxStatus()
                }
            },
            modalStatus(val) {
                if (val !== this.value) {
                    this.$emit("input", val);
                }
                if (val){
                    this.selectTableData = [];
                    this.getProductList();
                }
            },
            selectInfo(val) {
                this.selectCcacheInfo = Object.assign({}, val);
            },
            searchData: {
                handler() {
                    this.currentPage = 1;
                    this.getProductList();
                },
                deep: true
            }
        },
        mounted() {
            const that = this;
            window.onresize = () => {
                return (() => {
                    window.screenHeight = document.body.clientHeight;
                    that.screenHeight = window.screenHeight;
                })();
            };
            this.getProductList();
        },
        methods: {
            /**
             * 修改全选按钮的选中和禁用状态
             */
            changeCheckboxStatus() {
                this.$nextTick(() => {
                    let modalElm = jQuery(this.$refs["modal"].$el);
                    // 全选按钮的选中状态
                    if (this.listData.length && modalElm.find(".cb-item .ivu-checkbox-input:checked").length === this.listData.length) {
                        this.hasSelectedAll = true;
                    } else {
                        this.hasSelectedAll = false;
                    }
                    // 全选按钮的禁用状态
                    this.checkAllDisable = !this.listData.length || (modalElm.find(".cb-item .ivu-checkbox-input:disabled").length === this.listData.length);
                });
            },
            /**
             * 取消的时候还原数据
             */
            onCancelClick() {
                this.modalStatus = false;
                this.selectTableData = [];
                this.selectCcacheInfo = Object.assign({}, this.selectInfo);
            },
            /**
             * 提交到上级组件
             */
            onComfrimClick() {
                this.$emit("onGetProductInfo", this.selectTableData);
            },
            /**
             * table选择变化时触发
             */
            // onSelectionChange(selectData) {
            //     this.selectTableData = selectData;
            // },
            /**
             * 获取优惠券列表
             */
            getProductList() {
                this.tableLoading = true;
                this.searchData.page_size = 20;
                this.searchData.page = this.currentPage;
                this.$httpPost("/shop/admin/coupon/list",
                    this.searchData,
                    res => {
                    this.tableLoading = false;
                    if (res.code === 200) {
                        this.currentPage = Number(res.data.current);
                        this.total = res.data.total;
                        this.listData =
                            (res.data.list) || [];
                        this.changeCheckboxStatus()
                    } else {
                        this.$Message.error(res.msg);
                    }
                });
            },
            /**
             * 分页切换
             */
            onPageChange(index) {
                this.currentPage = index;
                this.getProductList();
            },
        }
    };
</script>

<style lang="less" scoped>
    .distributor-setting-list-modal {
        .search-coupon{
            .data-list-search{
                padding: 20px 0 0 30px;
            }
        }
        /deep/.ivu-input-group-prepend,
        /deep/.ivu-input-group-append,
        /deep/.ivu-table-header th {
            background: #f8f9fd;
        }
        /deep/.ivu-modal-wrap {
            .ivu-modal-body {
                padding: 0 0;
                height: 485px;
                box-sizing: border-box;

                .distributor-setting-list-show-select {
                    position: absolute;
                    bottom: 21px;
                    width: 454px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .ivu-table-tip table {
                    min-height: 312px;
                }

                .mglr {
                    margin-left: 30px;
                    margin-right: 30px;
                    .ivu-input-group-prepend {
                        .ivu-select {
                            width: 99px;
                            .ivu-select-dropdown {
                                width: 260px;
                                text-align: left;
                                .ivu-select-item {
                                    text-overflow: ellipsis;
                                    overflow: hidden;
                                }
                                .ivu-select-dropdown-list>.ivu-select-item:first-child {
                                    display: none;
                                }
                            }
                        }
                    }
                }

                /* 列表滚动条 */
                /deep/.ivu-table-body {
                    overflow-y: auto;
                    height: 312px;
                    overflow-x: hidden;
                }

                table {
                    .ivu-table-row {
                        button {
                            display: none;

                            span {
                                display: block;
                            }
                        }

                        &.ivu-table-row-hover,
                        .distributor-setting-list-select {
                            button {
                                display: block;
                            }
                        }
                    }
                    .ivu-tooltip-rel {
                        overflow: hidden;
                        text-overflow: ellipsis;
                        display: -webkit-inline-box;
                        -webkit-line-clamp: 2;
                        -webkit-box-orient: vertical;
                        vertical-align: middle;
                    }
                }
            }
        }

        .distributor-setting-list-table {
            // height: 324px;
            // padding: 0 30px;
            // overflow-y: auto;
            margin: 0 30px;
            /deep/.ivu-table-wrapper {
                min-height: 100%;
            }
        }
        .distributor-setting-list-table-width {
            width: calc(100% - 60px);
        }
    }
</style>
