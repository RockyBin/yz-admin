<template>
    <div class="live-setting-products">
        <div class="container-nobtn">
            <div class="member">
              <div style="position: relative;">
                <add-more :text="'选择商品'" @onAddMoreClick="onAddMoreClick" perm="live.operate"></add-more>
                <span style="color: #666;font-size: 12px;margin-left: 14px;position: absolute;margin-top: 8px;">(最多选择50个商品)</span>
              </div>
                <div class="wrapper">
                    <Table
                        width="610"
                        border
                        :columns="deliveryColumns"
                        :data="listData"
                        align="center"
                        class="delivery-table"
                    ></Table>
                </div>
                <!-- 分页组件 -->
            </div>
        </div>
        <modal-select-list
            v-model="modalProductSelect"
            :selectInfo="showProductDialogState ? product_ids : selectInfo"
            text="从商品库选择"
            :cloud="true"
            :url="showProductDialogState ? '/shop/admin/group/buying/product/list' : '/shop/admin/common/product/list'"
            :options="showProductDialogState ?
                {
                    group_buying_setting_id: selectData.id,
                    product_status: 1
                } :
                {
                    status: 1,
                    show_sku: 1,
                    order_by: {
                        column: 'sell_at',
                        order: 'desc'
                    }
            }"
            @onGetProductInfo="onGetProductInfo"
        ></modal-select-list>
        <modal-list
            v-model="modalActivityStatus"
            title="选择活动"
            selectKey="title"
            headList="多人拼团"
            :width="620"
            :headName="''"
            ref="modalList"
            :searchData="searchData"
            placeholder="请输入活动名称"
            :columns="activityColumns"
            :tableData="tableData"
            :tableLoading="tableLoading"
            :lastColumnWidth="94"
            :selectData="selectData"
            @onGetSelectData="onGetSelectData"
            @getList="getActivityData"
        ></modal-list>
        <modal
            v-model="selectModalStatus"
            :width="412"
            title="选择商品类型"
            @on-ok="onSelectTypeConfirmClick"
        >
            <RadioGroup v-model="productType" style="padding: 7px 0;height: 35px;">
                <Radio :label="0" style="margin-right: 20px;">
                    <span style="margin: 0;">普通商品</span>
                </Radio>
                <Radio :label="1">
                    <span style="margin: 0;">活动商品</span>
                </Radio>
            </RadioGroup>
        </modal>
    </div>
</template>

<script>
    import addMore from "COMPONENTS/button/add-more.vue";
    import modalSelectList from "COMPONENTS/modal/modal-product-select-list";
    import modalList from "@/views/shop/components/modal/modal-select-list";
    export default {
        components: { addMore,modalSelectList, modalList },
        props:{
            value: {
                required: true,
                type: Array
            },
            product_list:{
                type:Array,
                default() {
                    return [];
                }
            }
        },
        data() {
            return {
                page: 1,
                loading: false,
                selectModalStatus: false,
                productType: 0,
                modalProductSelect: false, // 新增运费模板
                deliveryList:[],
                selectInfo: [],
                isChecked:[],
                listData:[],
                // 活动弹窗列表
                modalActivityStatus: false,
                searchData: {
                    total: 0,
                    searchName: "",
                    currentPage: 1,
                    pageSize: 20
                },
                activityColumns: [
                    {
                    width: 180,
                    title: "活动名称",
                    render: (h, params) => {
                        return h("div", params.row.title);
                    }
                    },
                    {
                    width: 170,
                    align: "center",
                    title: "活动时间",
                    render: (h, params) => {
                        return h("div", [
                        h("div", params.row.start_time),
                        h("div", params.row.end_time)
                        ]);
                    }
                    },
                    {
                    width: 120,
                    align: "center",
                    title: "状态",
                    render: (h, params) => {
                        return h("div", {
                        class: ["table-warning", "table-success", "table-end"][[0, 1, -1].findIndex(n => n === params.row.status)]
                        }, ["未开始", "进行中", "已结束"][[0, 1, -1].findIndex(n => n === params.row.status)]);
                    }
                    }
                ],
                tableData: [],
                tableLoading: false,
                selectData: {
                    id: 0,
                    title: ""
                },
                showProductDialogState: false,
                deliveryColumns: [
                    {
                        title: "商品信息",
                        key: "template_name",
                        align: "left",
                        width: 270,
                        render: (h, params) => {
                            return h("div", {
                                style: {
                                    display: "flex",
                                }
                            }, [
                                h(
                                    "div",
                                    {
                                        style: {
                                            position: "relative",
                                            width:"40px",
                                            height:"40px",
                                        }
                                    },
                                    [
                                        h("img", {
                                            attrs: {
                                                src: params.row.small_images
                                                    ? this.$store.state.siteComdataPath +
                                                    params.row.small_images.split(",")[0]
                                                    : ""
                                            },
                                            style: { height: "40px", width: "40px", display: "block", objectFit: "contain"}
                                        }),
                                        params.row.type ?
                                            h("div", {
                                                attrs: {
                                                    class: "live-setting-products-icon"
                                                }
                                            })
                                            : ""
                                    ]
                                ),
                                h(
                                    "Tooltip",
                                    {
                                        style: {
                                            textAlign: "left",
                                        },
                                        props: {
                                            content: params.row.name,
                                            maxWidth: 300,
                                            transfer: true,
                                            placement: "top"
                                        }
                                    },
                                    [h("div", params.row.name)]
                                ),
                                params.row.status==0?h("span",{
                                    class:"table-error",
                                    style:{"margin-left":"8px"}
                                },"已下架"):params.row.status==-9?h("span",{
                                    class:"table-error",
                                  style:{"margin-left":"8px"}
                                },"已删除"):''
                            ]);
                        }
                    },
                    {
                        title: "售卖价",
                        key: "delivery_type",
                        align: "center",
                        width: 200,
                        render: (h, params) => {
                            return h("div", {}, params.row.status==-9?"--":"￥" + params.row.price);
                        }
                    },
                    {
                        title: "操作",
                        key: "operation",
                        align: "center",
                        width: 140,
                        render: (h, params) => {
                            return h("div", [
                                params.row.status==-9?"":h(
                                    "span",
                                    {
                                        props: {
                                            type: "error",
                                            size: "small",
                                        },
                                        attrs: {
                                            perm: "product.view"
                                        },
                                        class: {
                                            "table-operation": true
                                        },
                                        style: {
                                            cursor: "pointer"
                                        },
                                        on: {
                                            click: () => {
                                                this.$router.push({
                                                    name: "productDetail",
                                                    query: {
                                                        id: params.row.type ? (params.row.master_product_id) : (params.row.foreign_product_id || params.row.id),
                                                        tab: this.tabNameSelectIndex
                                                        // extraTitle: "编辑商品"
                                                    }
                                                });
                                            }
                                        }
                                    },
                                    "查看详情"
                                ),
                                params.row.status==-9?"":h(
                                    "span",
                                    {
                                        class: {
                                            "table-operation": true
                                        },
                                        style: {
                                            marginLeft: "10px"
                                        }
                                    },
                                    "|"
                                ),
                                h(
                                    "span",
                                    {
                                        props: {
                                            type: "error",
                                            size: "small"
                                        },
                                        class: {
                                            "primary-font-color": true
                                        },
                                        style: {
                                            cursor: "pointer",
                                            marginLeft: "10px"
                                        },
                                        attrs: {
                                            perm: "live.operate"
                                        },
                                        on: {
                                            click: () => {
                                                this.listData.splice(params.index, 1);
                                                this.selectInfo = this.listData.map(item=>item.id);
                                                this.product_list.some((item, i)=>{
                                                    if(item.product_id==params.row.id){
                                                        this.product_list.splice(i, 1)
                                                        //在数组的some方法中，如果return true，就会立即终止这个数组的后续循环
                                                        return true
                                                    }
                                                })
                                            }
                                        }
                                    },
                                    "删除"
                                )
                            ]);
                        }
                    }
                ],
                // 分页
                total: 0,
                current: 0,
                size: 0
            };
        },
        watch:{
            value(val) {
                if (val) {
                    if (!this.listData.length){
                        val.forEach(item=>{
                            item.product && this.listData.push(item.product)
                        })
                        this.selectInfo = this.listData.map(item=>item.id);
                    }
                }
            }
        },
        computed: {
            product_ids() {
                return this.listData.map(n => n.id);
            }
        },
        methods: {
            onSelectTypeConfirmClick() {
                this.showProductDialogState = false;
                if (this.productType === 0) {
                    this.modalProductSelect = true;
                } else {
                    this.modalActivityStatus = true;
                    this.selectData = {
                        id: 0,
                        title: ""
                    };
                    this.$refs["modalList"].resetData();
                }
            },
            getActivityData(searchData) {
                this.tableLoading = true;
                this.$httpPost("/shop/admin/group/buying/setting/list", {
                    page: searchData.currentPage,
                    "page_size": searchData.pageSize,
                    status: 2,
                    keyword: searchData.searchName
                }, res => {
                    this.tableLoading = false;
                    if (res.code === 200) {
                    this.searchData = Object.assign({}, this.searchData, {total: res.data.total});
                    this.tableData = res.data.list;
                    } else {
                    this.$Message.error(res.msg);
                    }
                })
            },
            onGetSelectData(val) {
                if (val) {
                    this.$set(this.selectData, "id", val.id);
                    this.$set(this.selectData, "title", val.title);
                    this.modalActivityStatus = false;
                    this.$nextTick(() => {
                        this.showProductDialogState = true;
                        this.modalProductSelect = true;
                    });
                }
            },
            checkInsertNum(value, index, key) {
                const reg = /^\d+(\.\d{1,2})?$/;
                if (!reg.test(value)) {
                    this.$set(this.delivery_area[index], key, true);
                    return false;
                } else {
                    this.$set(this.delivery_area[index], key, false);
                }
            },
            onPageSizeChange(num) {
                this.onRefushList(this.page, num);
            },
            removeListData(id, index) {
                this.$httpGet("/shop/admin/freighttemplate/delete", { id }, res => {
                    if (res.code) {
                        this.deliveryList.splice(index, 1);
                        if (this.deliveryList.length === 1 && this.page > 1) {
                            this.page - 1;
                        }
                        this.$Message.success("删除成功");
                        this.onRefushList(this.page);
                        this.$Modal.remove();
                        this.$Message.success("删除成功");
                    } else {
                        this.$Message.error(res.msg);
                        this.$Modal.remove();
                    }
                });
            },
            onChangePage(page) {
                this.page = page;
                this.onRefushList(page);
            },
            // 因为是特殊列表必须刷新
            onRefushList(page = 1, page_size = 10) {
                this.$httpGet(
                    "/shop/admin/freighttemplate/list",
                    { page, page_size },
                    res => {
                        // 成功
                        if (res.msg === this.$store.state.SUCCESS) {
                            this.deliveryList = [];
                            this.$nextTick(() => {
                                this.deliveryList = res.data.list;
                                this.total = res.data.total;
                                this.current = res.data.current;
                                this.size = res.data.page_size;
                            });
                        }
                    }
                );
            },
            onAddMoreClick() {
                if (this.listData.length>=50){
                    this.$Message.error("最多选择50个商品");
                    return;
                }
                this.selectModalStatus = true;
                this.productType = 0;

            },
            //获取选择的商品
            onGetProductInfo(val) {
                let serlecProduct = this.listData.length+ (val ? val.length : 0);
                if (serlecProduct>50){
                    this.$Message.error("最多选择50个商品");
                    return;
                }
                this.modalProductSelect = false;
                if (val){
                    // 拼团活动商品显示活动价
                    if (this.productType === 1) {
                        val.forEach(n => {
                            n.price = n.min_price;
                        })
                    }
                    if (this.listData.length&&this.listData.length<50){
                        this.listData = val.concat(this.listData);
                    } else{
                        this.listData = val;
                    }
                    this.selectInfo = this.listData.map(item=>item.id);
                    val.filter(item=>{
                        item.type = this.showProductDialogState ? 1 : 0;
                        this.product_list.unshift({
                            product_id:item.id,
                            type: item.type
                        })
                    })
                }
            },
            /* 取消 */
            cancel() {
                this.showModal = false;
            }
        }
    };
</script>

<style lang="less" scoped>
    @border-line: #e8eaec;

    .live-setting-products {
        position: absolute;
        width: 100%;
        height: 100%;
        padding-bottom: 74px;
        background: #f2f4fd;
        display: flex;
        .container-nobtn {
            flex: 1;
            // width: 100%;
        }
    }
    .code-row-bg {
        /deep/.ivu-col-span-24 {
            text-align: right;
            margin: 20px 0;
        }
    }

    /deep/.ivu-table-wrapper {
        overflow: initial !important;
    }

    .modal-wrap {
        /deep/.ivu-modal-body {
            height: 450px;
        }
        /deep/.ivu-modal-body {
            height: 450px;
            overflow: auto;
            overflow-x: hidden;
        }
        /deep/.ivu-btn-loading {
            span {
                display: inline;
            }
        }
        /deep/.ivu-input-suffix {
            width: 40px;
            line-height: 32px;
        }
        /deep/.ivu-input-with-suffix {
            padding-right: 40px;
        }
        /deep/th:not(:first-child) {
            .ivu-table-cell:before {
                content: "*";
                display: inline-block;
                margin-right: 4px;
                line-height: 1;
                font-family: SimSun;
                font-size: 13px;
                color: #ed4014;
                font-weight: normal;
            }
        }
    }
    /deep/.ivu-table-cell{
        font-size: 12px;
        padding: 10px 14px;
        .live-setting-products-icon {
            position: absolute;
            top: -9px;
            height: 24px;
            left: -5px;
            overflow: hidden;
            z-index: 1;
            &::before {
                content: "";
                position: absolute;
                top: 0px;
                left: -19px;
                display: block;
                border-width: 12px;
                border-style: solid;
                border-color: #f8a9ba #f8a9ba transparent transparent;
            }
            &::after {
                content: "拼团";
                position: relative;
                display: block;
                width: 38px;
                height: 19px;
                line-height: 20px;
                font-size: 12px;
                text-align: center;
                border-radius: 0 19px 19px 0;
                color: #fff;
                background: linear-gradient(#fd6b8a, #ff645a);
            }
        }
    }
    .delivery-table {
        /deep/table {
            table-layout: auto;
            width: 100% !important;
            th {
                background: #f8f9fd;
            }
            td {
                color: #657180;
            }
        }
        /deep/.ivu-tooltip {
            .ivu-tooltip-rel {
                text-overflow: ellipsis;
                display: -webkit-box;
                -webkit-line-clamp: 3;
                overflow: hidden;
                -webkit-box-orient: vertical;
                width: 100%;
            }
            .ivu-tooltip-inner {
                white-space: pre-wrap;
            }
        }
        /deep/.ivu-tooltip {
            padding-left: 14px;
        }
        /deep/.ivu-tooltip:last-child {
            border-bottom: none;
        }
        /deep/.table-area-shape {
            border-bottom: 1px solid @border-line;
            margin: 0 -18px;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 1;
            overflow: hidden;
        }
        /deep/.table-area-shape:last-child {
            border-bottom: 0;
        }
        /deep/.full-height {
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
        }
        /deep/.flex-box {
            height: 100%;
            width: 100%;
            height: 48px;
            line-height: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-bottom: 1px solid @border-line;
        }
        /deep/.flex-box:last-child {
            border-bottom: 0;
        }
    }
    .member {
        padding: 0 0 74px;
        background: white;
        height: 100%;
        overflow: auto;
        text-align: left;
        // .add-more-btn {
        //   margin-bottom: 24px;
        // }
        // .wrapper {
        //   min-height: calc(100vh - 240px);
        // }
    }
    .footer {
        position: fixed;
        bottom: 10px;
        height: 50px;
        line-height: 50px;
        width: 100%;
        background-color: #fff;
        text-align: center;
        border-top: 1px solid #eee;
        button {
            width: 70px;
            height: 32px;
        }
    }
</style>