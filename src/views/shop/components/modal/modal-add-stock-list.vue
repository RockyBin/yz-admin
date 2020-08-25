<template>
    <div class="distributor-setting-list">
        <Modal
            class="distributor-setting-list-modal height-model"
            v-model="modalStatus"
            :width="630"
            :transition-names="['false']"
            :mask-closable="false"
            :title="text"
            @on-visible-change="clearInputNumber"
        >
            <div
                class="distributor-setting-list-table"
            >
                <common-table
                    :class="{'distributor-setting-list-table-height':listData.length>5}"
                    style="width: 582px;"
                    :columnsData="columnsData"
                    :listData="listData"
                    :loading="tableLoading"
                    :hasBorder="true"
                    border="1"
                ></common-table>
            </div>
            <div slot="footer">
                <Button type="text" @click="onCancelClick">取消</Button>
                <Button type="primary" @click="onComfrimClick">确定</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
import commonTable from "@/views/shop/components/table/common-table.vue";
export default {
    components: {
        commonTable
    },
    props: {
        value: {
            type: Boolean,
            required: false
        },
        text: {
            default: "新增库存",
            type: String
        },
        listData:{
            type:Array
        }
    },
    data() {
        return {
            modalStatus: false,
            tableLoading: false,
            setAllNumber:null,
            firstLoad:false,
            columnsData: [
                {
                    title: "商品信息",
                    align: "left",
                    minWidth: 382,
                    render: (h, params) => {
                        // let classObj = {};
                        // params.row.product_class.forEach(item => {
                        //     classObj[item.id] = true;
                        // });
                        // let text = params.row.product_skus
                        // .map(item => item.sku_name)
                        // .join(",");
                        return h(
                            "div",
                            {
                                style: {
                                    display: "flex",
                                    "align-items": "center"
                                }
                            },
                            [
                                h("img", {
                                    props: {
                                        type: "primary",
                                        size: "small"
                                    },
                                    attrs: {
                                        src: params.row.small_images &&
                                        params.row.small_images.split(",").length
                                            ? this.$store.state.siteComdataPath +
                                            params.row.small_images.split(",")[0]
                                            : ""
                                    },
                                    style: {
                                        width: "40px",
                                        height: "40px",
                                        objectFit: "contain",
                                        marginRight: "14px"
                                    }
                                }),
                                h(
                                    "div",
                                    {
                                        style: {
                                            width: "calc(100% - 56px)",
                                            "min-height": "44px"
                                        }
                                    },
                                    [
                                        h("div", {
                                            style: {
                                                overflow: "hidden",
                                                "text-overflow": "ellipsis",
                                                display: "-webkit-box",
                                                "-webkit-line-clamp": 2,
                                                "-webkit-box-orient": "vertical",
                                                "line-height": "initial"
                                            }
                                        }, params.row.product_name),
                                        h("div", {
                                            style: {
                                                color: "#9EA7B4",
                                                "margin-top": "5px",
                                                overflow: "hidden",
                                                "text-overflow": "ellipsis",
                                                display: "-webkit-box",
                                                "-webkit-line-clamp": 1,
                                                "-webkit-box-orient": "vertical",
                                                "line-height": "initial"
                                            }
                                        }, this.yzArrayToString(params.row.sku_name))
                                    ]
                                )
                            ]
                        );
                    }
                },
                {
                    title:"新增库存",
                    width:128,
                    align: "center",
                    render: (h, params) => {
                        return h("InputNumber", {
                            style: {
                                width: "90px"
                            },
                            props: {
                                min: 0,
                                max: 9999999,
                                precision: 0,
                                value:params.row.product_quantity?params.row.product_quantity:null,
                            },
                            attrs:{
                                placeholder:"请输入库存"
                            },
                            on:{
                                "on-change":e => {
                                    this.batchSetInventory(e,params.row)
                                },
                            }
                        });
                    },
                    renderHeader: (h, params) => {
                        return h(
                            "div",
                            {
                                style: {
                                    display: "inline-block",
                                    "margin": "8px 0"
                                }
                            },
                            [
                                h("span", "新增库存"),
                                h('InputNumber', {
                                    props: {
                                        size: "small",
                                        min: 1,
                                        max: 9999999,
                                        precision: 0,
                                        value:this.setAllNumber,
                                    },
                                    attrs:{
                                        placeholder:"批量设置"
                                    },
                                    style: {
                                        "margin-top": "5px",
                                        width:"90px"
                                    },
                                    on: {
                                        "on-blur": () => {
                                            this.setAllNumber = null;
                                        },
                                        "on-change": val => {
                                            this.setAllNumber = val;
                                            this.batchSetInventory(val)
                                        }
                                    }
                                })
                            ]
                        );
                    }
                }
            ],
            goodsArray:[]
        };
    },
    watch: {
        value(val) {
            if (val !== this.modalStatus) {
                this.modalStatus = val;
            }
        },
        modalStatus(val) {
            if (val !== this.value) {
                this.$emit("input", val);
            }
            if (val){
                this.setAllNumber = null;
                this.goodsArray = [];
            }
        },
    },
    methods: {
        /**
         * 取消的时候还原数据
         */
        onCancelClick() {
            this.firstLoad = true;
            this.modalStatus = false;
        },
        showModal(){
            this.modalStatus = true;
        },
        clearInputNumber(status){
            if (status){
                this.listData.map(item => {
                    this.$set(item, "product_quantity", null);
                });
            }
        },
        //批量设置库存
        batchSetInventory(num,val){
            let goodsArray1 = [];
            this.listData.map(item => {
                if (val){
                    if (item.sku_id === val.sku_id){
                        item.product_quantity = num;
                    }
                } else{
                    this.$set(item, "product_quantity", num);
                    // item.product_quantity = num;
                }
                if (item.product_quantity){
                    goodsArray1.push(item)
                }
            });
            this.goodsArray = goodsArray1;
        },
        /**
         * 增加库存
         */
        onComfrimClick() {
            this.modalStatus = false;
            if (this.goodsArray.length){
                this.$emit("onGetAddStockInfo", this.goodsArray);
            } else{
                this.$emit("onGetAddStockInfo");
            }
        }
    }
};
</script>

<style lang="less" scoped>
.distributor-setting-list-modal {
    /deep/.ivu-input-group-prepend,
    /deep/.ivu-input-group-append,
    /deep/.ivu-table-header th {
        background: #f8f9fd;
    }
    /deep/.ivu-modal-wrap {
        .ivu-modal-body {
            padding: 0 0;
            /*height: 471px;*/
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
            .distributor-setting-list-table-height{
                /* 列表滚动条 */
                /deep/.ivu-table-body {
                    overflow-y: auto;
                    height: 382px;
                    overflow-x: hidden;
                }
            }
            /* 列表滚动条 */
            /deep/.ivu-table-body {
                .ivu-table-tbody{
                    .ivu-table-cell{
                        .ivu-input-number{
                            .ivu-input-number-input{
                                text-align: center;
                            }
                            .ivu-input-number-handler-wrap{
                                display: none;
                            }
                        }
                    }
                }
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
        margin: 24px;
        /deep/.ivu-table-wrapper {
            min-height: 100%;
            .ivu-table-header{
                .ivu-table-cell{
                    .ivu-input-number{
                        .ivu-input-number-input{
                            text-align: center;
                        }
                        .ivu-input-number-handler-wrap{
                            display: none;
                        }
                    }
                }
            }
            .ivu-table-column-left{
                border-right: 1px solid #E8EAEC;
            }
        }
    }
    /*.distributor-setting-list-table-width {*/
        /*width: calc(100% - 60px);*/
    /*}*/
}
</style>
