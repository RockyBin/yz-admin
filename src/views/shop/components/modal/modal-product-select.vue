<template>
    <div>
        <Modal
            :width="selectProductData.length?687:587||selectEditProduct.length?604:587"
            :title="title"
            class="common-product-select"
            :mask-closable="false"
            v-model="modalStatus"
        >
            <Form ref="formCustom" :label-width="74" :model="validateData" :rules="ruleValidate">
                <FormItem label="修改库存：" v-if="selectEditProduct.length">
                    <div class="common-product-select-itme common-product-select-ts">
                        <RadioGroup v-model="ecitStock">
                            <Radio :label="1">增加</Radio>
                            <Radio :label="2">减少</Radio>
                        </RadioGroup>
                        <div style="line-height: 20px;color:#9EA7B4;font-size:12px;" v-if="ecitStock==2">*减少云仓商品库存，是直接扣减经销商的云仓库存</div>
                    </div>
                </FormItem>
                <FormItem label="扣减云仓：" v-if="ecitStock==1">
                    <div class="common-product-select-itme common-product-select-ts">
                        <RadioGroup v-model="deduction_cloud">
                            <more-message
                                text="扣减云仓库存是指，为该经销商新增商品云仓库存时，可以选择扣除的公司总仓的库存或是该经销商的的上级的库存。"
                                style="margin-right: 14px;"
                            ></more-message>
                            <Radio :label="0">公司总仓</Radio>
                            <Radio :label="1">上级云仓</Radio>
                        </RadioGroup>
                        <div style="line-height: 20px;color:#9EA7B4;" v-if="deduction_cloud">【上级：{{userInfo.dealer_parent_nickname}}】</div>
                    </div>
                </FormItem>
                <FormItem style="margin-bottom: 0px !important;" label="商品：" prop="validValue" v-if="!selectEditProduct.length">
                    <add-more
                        text="添加商品"
                        @onAddMoreClick="onAddNewAgentClick"
                        perm="dealer.operate"
                    ></add-more>
                </FormItem>
                <FormItem style="margin-top: 20px !important;" prop="validValue" v-if="selectProductData.length||selectEditProduct.length">
                    <common-table
                        :class="{'common-product-select-table':selectProductData.length>3}"
                        :columnsData="columnsData"
                        :listData="selectEditProduct.length?selectEditProduct:selectProductData"
                        :loading="tableLoading"
                        :hasBorder="true"
                        border="1"
                    ></common-table>
                </FormItem>
            </Form>
            <div slot="footer">
                <Button type="text" @click="onModalCancelClick">取消</Button>
                <Button type="primary" @click="onModalComfrimClick">确定</Button>
            </div>
        </Modal>
        <Modal
            v-model="seePartsModalState"
            title="提示"
            class="common-product-select-point"
            :mask-closable="false"
            :closable="false"
            width="587"
        >
            <div slot="header">
                <Icon type="ios-help-circle" size="34" color="#ED4014" /><div class="ivu-modal-confirm-head-title">提示</div>
            </div>
            <div v-if="!deduction_cloud" style="font-size: 13px;color: #464C5B;margin-bottom: 20px;">【公司总仓】以下部分商品库存不足，无法添加到云仓库存。</div>
            <div v-if="deduction_cloud" style="font-size: 13px;color: #464C5B;margin-bottom: 20px;">【上级云仓】以下部分商品库存不足，无法添加到云仓库存。</div>
            <Table :columns="columnsData4" :show-header="false" :class="{'common-product-select-table-height':invalidProductList.length>3}" :width="513" :data="invalidProductList"></Table>
            <div slot="footer">
                <Button @click="seePartsCancelEvent">确定</Button>
            </div>
        </Modal>
        <modal-select-list
            v-model="modalProductSelect"
            :selectInfo="selectInfo"
            text="从商品库选择"
            :cloud="true"
            :options="{
                show_sku: 1,
                order_by: {
                    column: 'sell_at',
                    order: 'desc'
                }
            }"
            @onGetProductInfo="onGetProductInfo"
        ></modal-select-list>
        <modal-add-list
            v-model="modalAddStock"
            :listData="listData"
            @onGetAddStockInfo="onGetAddStockInfo"
        ></modal-add-list>
    </div>
</template>

<script>
import moreMessage from "@/views/shop/components/more-message/more-message.vue";
import modalSelectList from "COMPONENTS/modal/modal-product-select-list";
import modalAddList from "COMPONENTS/modal/modal-add-stock-list";
import addMore from "COMPONENTS/button/add-more.vue";
import commonTable from "@/views/shop/components/table/common-table.vue";
export default {
    components: {
        moreMessage,
        addMore,
        modalSelectList,
        modalAddList,
        commonTable
    },
    props: {
        value: {
            type: Boolean,
            default: false
        },
        title: {
            type: String,
            default: ""
        },
        levelTitle: {
            type: String,
            default: ""
        },
        userInfo: {
            type: Object,
            default() {
                return null;
            }
        },
        selectEditProduct:{//点击修改库存传的值
            type: Array,
            default() {
                return [];
            }
        }
    },

    data() {
        return {
            deduction_cloud:0,//扣减云仓类型
            ecitStock:1,//修改库存类型
            modalStatus: false,
            modalProductSelect:false,//是否弹出从商品库选择窗口
            seePartsModalState:false,//是否弹出库存不足提示
            modalAddStock:false,//是否弹出新增库存窗口
            modalLoading: true,
            showData: [],
            tableLoading: false,
            setNumber:null,//点击修改库存进入时输入的库存值
            setProductNumber:null,//批量设置库存
            selectProductData:[],//选中产品已输入库存,新增库存传过来的数据
            listData:[],//从商品库选择页面选中的产品
            invalidProductList:[],//库存不足的商品
            validateData: {
                // 表单验证，数据没用的
                validValue: false
            },
            ruleValidate: {
                validValue: [
                    {
                        required: true
                    }
                ]
            },
            columnsData1: [
                {
                    title: "商品信息",
                    width: 240,
                    render: (h, params) => {
                        // let classObj = {};
                        // let text;
                        let images;
                        if (params.row.product_image){
                            // text = this.yzArrayToString(params.row.sku_name);
                            images = params.row.product_image
                        } else{
                            // params.row.product_skus.forEach(item => {
                            //     classObj[item.id] = true;
                            // });
                            // text = params.row.product_skus.map(item => item.sku_name).join(",");
                            images = params.row.small_images &&
                            params.row.small_images.split(",").length
                                ? this.$store.state.siteComdataPath +
                                params.row.small_images.split(",")[0]
                                : ""
                        }
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
                                        src: images
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
                                        }, params.row.name?params.row.name:params.row.product_name),
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
                    width: 110,
                    align: "center",
                    renderHeader: (h, index) => {
                        if (this.ecitStock===1){
                            return h(
                                "div",
                                {
                                    style: {
                                        "line-height": "initial",
                                    }
                                },
                                [
                                    h("div","扣减仓库"),
                                    h('div', "现有库存")
                                ]
                            );
                        }else{
                            return h(
                                "div",
                                {
                                    style: {
                                        "line-height": "initial",
                                    }
                                },
                                [
                                    h("p", "【我】的"),
                                    h('p', "现有库存")
                                ]
                            );
                        }
                    },
                    render: (h, params) => {
                        if (params.row.status==1){
                            return h("div",params.row.my_inventory)
                        }else{
                            return h("div",{
                                style: {
                                    color: "#ED4014",
                                    "font-size": "12px"
                                }
                            },"已删除/已下架")
                        }
                        // return h(
                        //     "div",{},params.row.inventory);
                    }
                }
            ],
            columnsData2:[
                {
                    title:"新增库存",
                    width:128,
                    align: "center",
                    render: (h, params) => {
                        return h("InputNumber", {
                            style: {
                                width: "90px",
                            },
                            props: {
                                min: 1,
                                max: 9999999,
                                precision: 0,
                                value:params.row.product_quantity,
                            },
                            attrs:{
                                placeholder:"请输入库存",
                                class:params.row.not_enough|| params.row.error?"ivu-input-number ivu-input-number-default common-product-select-table-input":"ivu-input-number ivu-input-number-default",
                            },
                            on:{
                                "on-change":e => {
                                    this.batchSetInventory(e,params.row)
                                },
                            }
                        });
                    },
                    renderHeader: (h, index) => {
                        return h(
                            "div",
                            {
                                style: {
                                    display: "inline-block"
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
                                        value:this.setProductNumber,
                                    },
                                    attrs:{
                                        placeholder:"批量设置"
                                    },
                                    style: {
                                        "margin-top": "-15px",
                                        width:"90px"
                                    },
                                    on:{
                                        "on-blur": () => {
                                            this.setProductNumber = null;
                                        },
                                        "on-change":e => {
                                            this.setProductNumber = e
                                            this.batchSetInventory(e)
                                        },
                                    }
                                })
                            ]
                        );
                    }
                },
                {
                    title: "操作",
                    width: 85,
                    align: "center",
                    render: (h, params) => {
                        return h(
                            "div",
                            {
                                style: {
                                    color:"#4A6AF5",
                                    "font-size":"12px",
                                    cursor:"pointer"
                                },
                                on: {
                                    click: () => {
                                        var deleteList = [];
                                         this.selectProductData.forEach(item => {
                                            if(item.sku_id !== params.row.sku_id){
                                                deleteList.push(item)
                                            }
                                        });
                                        this.selectProductData = deleteList
                                    }
                                }
                            },"删除");
                    }
                }
            ],
            columnsData3:{
                title: "增加",
                width: 128,
                align: "center",
                render: (h, params) => {
                    return h("InputNumber", {
                        style: {
                            width: "90px"
                        },
                        props: {
                            min: 1,
                            max: this.ecitStock==1?9999999:params.row.my_inventory>9999999?9999999:params.row.my_inventory,
                            precision: 0,
                            value:this.setNumber,
                            // formatter: function (value) {
                            //   return value.toString().replace(/^[0-9]*[1-9][0-9]*$/g)
                            // },
                            // parser: function (value) {
                            //   return value.toString().replace(/$s?|(,*)/g, '')
                            // }
                            // formatter: value => `${value}`.replace(/^[0-9]*[1-9][0-9]*$/g, ''),
                            // parser: value => `${value}`.replace(/$s?|(,*)/g, '')
                        },
                        attrs:{
                            placeholder:"请输入库存",
                            class:params.row.not_enough || params.row.error?"ivu-input-number ivu-input-number-default common-product-select-table-input":"ivu-input-number ivu-input-number-default",
                        },
                        on:{
                            "on-change":e => {
                                this.setNumber = e
                            },
                        }
                    });
                },
                renderHeader: (h, index) => {
                    let tableTitle;
                    if (this.ecitStock===1){
                        tableTitle = "增加";
                    }else{
                        tableTitle = "减少";
                    }
                    return h("div", {},tableTitle);
                }
            },
            columnsData4: [
                {
                    width: 389,
                    render: (h, params) => {
                        // let classObj = {};
                        // let text;
                        let images;
                        if (params.row.product_image){
                            // text = this.yzArrayToString(params.row.sku_name);
                            images = params.row.product_image
                        } else{
                            // params.row.product_class.forEach(item => {
                            //     classObj[item.id] = true;
                            // });
                            // text = params.row.product_skus.map(item => item.sku_name).join(",");
                            images = params.row.small_images &&
                            params.row.small_images.split(",").length
                                ? this.$store.state.siteComdataPath +
                                params.row.small_images.split(",")[0]
                                : ""
                        }
                        return h(
                            "div",
                            {
                                attrs: {
                                    class: "modal-product-select-table"
                                },
                                style: {
                                    display: "flex",
                                    "align-items": "center",
                                    "padding-top":"9px",
                                    "padding-bottom":"9px"
                                }
                            },
                            [
                                h("img", {
                                    props: {
                                        type: "primary",
                                        size: "small"
                                    },
                                    attrs: {
                                        src: images
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
                                        }, params.row.name?params.row.name:params.row.product_name),
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
                    width: 122,
                    align: "center",
                    render: (h, params) => {
                        if (params.row.status==1){
                            return h("div","缺货："+params.row.not_enough+"件")
                        }else{
                            return h("div",{
                                style: {
                                    color: "#ED4014",
                                    "font-size": "12px"
                                }
                            },"已删除/已下架")
                        }
                    }
                }
            ],
            selectInfo: [],
        };
    },
    computed: {
        columnsData() {
            if(this.selectEditProduct.length){
                return this.columnsData1.concat(this.columnsData3)
            } else {
                return this.columnsData1.concat(this.columnsData2)
            }
        }
    },
    watch: {
        value(val) {
            if (val !== this.modalStatus) {
                this.modalStatus = val;
            }
        },
        modalStatus(val){
            this.$emit("input", val)
            if(val) {
                // this.$refs.form.resetFields()
                this.deduction_cloud=0;//扣减云仓类型
                this.ecitStock=1;//修改库存类型
                this.setNumber=null;//点击修改库存进入时输入的库存值
                this.selectProductData = [];
                this.getInventory();
            }
        },
        ecitStock(val){
            this.getInventory();
        },
        deduction_cloud(){
            this.getInventory();
        }
    },
    methods: {
        getHeadImg(url) {
            if (!/^(http)/i.test(url)) {
                url = this.$store.state.siteComdataPath + url;
            }
            return url;
        },
        /**
         * 新增商品
         */
        onAddNewAgentClick() {
            if (!this.selectProductData.length){
                this.selectInfo = [];
            }
            this.modalProductSelect = true;
        },
        //获取选择的商品
        onGetProductInfo(val) {
            if (val){
                let goodArray = [];
                val.forEach(pro=>{
                    pro.product_skus.filter(item=>{
                        goodArray.push({
                            small_images:pro.small_images,
                            sku_name:item.sku_name,
                            product_id:pro.id,
                            sku_id:item.id,
                            product_name:pro.name,
                            inventory:item.inventory,
                            status:pro.status
                        })
                    })
                })
                // this.listData = goodArray;
                this.listData = goodArray;
                this.modalAddStock = true;
            }
        },
        //增加的库存数
        onGetAddStockInfo(val){
            if (val){
                this.selectProductData = val.concat(this.selectProductData);;
                this.getInventory();
                let goodArray1 = [];
                this.selectProductData.filter(item=>{
                    goodArray1.push(item.product_id);
                })
                this.selectInfo = goodArray1;
            }
        },
        //批量设置库存
        batchSetInventory(num,val){
            this.selectProductData = this.selectProductData.map(item => {
                if (val){
                    if (item.sku_id === val.sku_id){
                        item.product_quantity = num;
                    }
                } else{
                    item.product_quantity = num;
                }
                let obj = JSON.parse(JSON.stringify(item));
                return obj;
            });
        },
        seePartsCancelEvent(){
            //库存不足提示关闭弹窗
            this.seePartsModalState = false;
        },
        onModalCancelClick(){
            //取消关闭弹窗还原数据
            this.modalStatus = false
            // this.$refs.form.resetFields()
            this.selectProductData = [];
        },
        /**
         * 添加会员
         */
        onModalComfrimClick() {
            //库存不足弹框
            this.modalLoading = false;
            let products = [];
            if (this.selectProductData.length){
                this.selectProductData.forEach(pro => {
                    pro.num = pro.product_quantity
                    products.push(pro)
                });
            } else if (this.selectEditProduct[0]) {
                if (!this.setNumber){
                    this.$set(this.selectEditProduct[0], "error", true);
                    return false;
                }
                this.selectEditProduct[0].num = this.setNumber
                products.push(this.selectEditProduct[0])
            }else{
                if (!this.selectProductData.length){
                    this.$Message.error("至少选择一个商品");
                    return;
                }
            }
            if (products.length > products.filter(item=>item.num).length){
                if (this.selectProductData.length){
                    this.selectProductData.filter(item => {
                        if (!item.num){
                            this.$set(item, "error", true);
                        }
                    });
                }
                return false;
            }
            this.$httpPost(
                "/shop/admin/cloudstock/sku/edit",
                {
                    member_id: this.userInfo.member_id,
                    decrease_type: this.deduction_cloud,
                    change_type: this.ecitStock,
                    product_list: products,
                },
                res => {
                    // this.$store.state.COMMON_loading = false;
                    if (res.code === 200) {
                        this.$Message.success("操作成功");
                        this.modalStatus = false
                        this.$parent.getStockDetail()
                        this.$parent.getLoadingList()
                        // this.$Message.success("操作成功");
                    } else if (res.code === 502) {
                        this.resetData(res.data);
                        this.seePartsModalState = true;
                        // this.$Message.error(res.msg);
                    }
                }
            );
        },
        /**
         * 获取商品库存
         */
        getInventory(){
            let products = [];
            if (this.selectProductData.length){
                this.selectProductData.forEach(pro => {
                    products.push(pro)
                });
            } else{
                products.push(this.selectEditProduct[0])
            }
            this.$httpPost(
                "/shop/admin/cloudstock/sku/edit/list",
                {
                    member_id: this.userInfo.member_id,
                    decrease_type: this.deduction_cloud,
                    change_type: this.ecitStock,
                    product_list: products,
                },
                res => {
                    if (res.code === 200) {
                        res.data.forEach(pro=>{
                            if (this.selectProductData.length){
                                this.selectProductData.map(item => {
                                    if (item.sku_id == pro.sku_id){
                                        this.$set(item, "my_inventory", pro.inventory);
                                        this.$set(item, "status", pro.status);
                                    }
                                });
                            } else{
                                this.$set(this.selectEditProduct[0], "my_inventory", pro.inventory);
                                this.$set(this.selectEditProduct[0], "status", pro.status);
                                this.setNumber = null;
                            }
                        })
                    }
                }
            );
        },
        // 触发重置数据
        resetData(arrays) {
            let dataArray1 = []
            arrays.forEach(pro=>{
                if (this.selectProductData.length){
                    this.selectProductData.map(item => {
                        if (item.sku_id == pro.sku_id){
                            // this.$set(item, "inventory", pro.inventory);
                            this.$set(item, "not_enough", pro.not_enough);
                            this.$set(item, "status", pro.status);
                            // item.not_enough = pro.not_enough;
                            // item.status = pro.status
                            dataArray1.push(item);
                        }
                    });
                } else{
                    this.$set(this.selectEditProduct[0], "not_enough", pro.not_enough);
                    this.$set(this.selectEditProduct[0], "status", pro.status);
                    dataArray1.push(this.selectEditProduct[0]);
                }
            })
            this.invalidProductList = dataArray1;
        }
    }
};
</script>

<style lang="less" scoped>
.common-product-select {
    /deep/.ivu-modal-body {
        padding: 24px;
        .common-product-select-itme{
            .ivu-radio-group{
                .ivu-radio-wrapper{
                    margin-right: 20px;
                    .ivu-radio{
                        margin-right: 5px;
                    }
                }
            }
        }
        .ivu-table{
            .common-product-select-table-input{
                border-color: #ED4014;
                .ivu-input-number-input{
                    color: #ED4014;
                }
            }
            tr>td,tr>th{
                border-right: 1px solid #E8EAEC;
                .ivu-input-number-handler-wrap{
                    display: none;
                }
                .ivu-input-number-input{
                    text-align: center;
                }
            }
            tr>td:last-child,tr>th:last-child{
                border-right: unset;
            }
        }
        .add-more-btn{
            .btn-add{
                margin-bottom: 0;
            }
        }
        .common-product-select-table{
            /* 列表滚动条 */
            /deep/.ivu-table-body {
                overflow-y: auto;
                height: 199px;
                overflow-x: hidden;
            }
        }
    }
}
.common-product-select-point{
    /deep/.ivu-modal-header{
        padding: 25px 16px 2px !important;
        border-bottom: 0 !important;
        &>div{
            font-size: 16px;
            font-weight: bold;
            color: #464C5B;
        }
    }
    /deep/.ivu-modal-body{
        padding: 0 24px 20px 50px;
        .common-product-select-table-height{
            /deep/.ivu-table-body{
                overflow-y: auto;
                height: 199px;
                overflow-x: hidden;
            }
        }
        /deep/.ivu-table-body{
            .ivu-table-tbody{
                .ivu-table-row{
                    td{
                        border-right: 1px solid #E8EAEC;
                    }
                }
            }
        }
    }
    /deep/.ivu-modal-footer{
        border-top: 0;
        padding: 0 24px 14px 0;
        .ivu-btn{
            background-color: #4A6AF5;
            color: #fff;
            border-color: #4A6AF5;
        }
    }
}
</style>
