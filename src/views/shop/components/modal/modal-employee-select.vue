<template>
    <Modal
            v-model="modalStatus"
            :title="title"
            @on-cancel="onModalCancel"
            @on-ok="onListMemberComfirmClick"
            :width="width"
            :loading="modalLoading"
            :transition-names="['false']"
            :mask-closable="false"
            class="modal-list-select-modal height-model"
    >
        <div class="row" style="margin: 20px 24px;">
            <Input
                    class="input-role"
                    v-model="keyword"
                    prefix="ios-search"
                    placeholder="姓名/账号/手机"
                    @on-enter="(currentPage = 1) && searchTaffData()"
            />
            <span class="label">部门：</span>
            <singleSelect
                    class="select-role"
                    v-model="departmentID"
                    :levelList="departmentList"
            />
            <Button
                    type="primary"
                    style="width:58px;height:32px;margin-right:15px;"
                    @click="searchTaffData"
            >查询</Button
            >
        </div>
        <div
                style="padding: 0 24px;overflow-y: auto; height: 340px;"
                :style="{maxHeight: maxHeight + 'px'}"
        >
            <Table
                    @on-row-click="selectIDCopy=$event"
                    v-if="modalStatus"
                    :loading="tableLoading"
                    :height="340"
                    :style="{width: 'calc(' + width + 'px - 48px)'}"
                    :columns="columnsData"
                    :data="tableMemberData"
            ></Table>
        </div>
        <div style="padding: 0 24px;">
            <Page
                    style="text-align: right;"
                    :total="total"
                    size="small"
                    :page-size="pageSize"
                    :current="currentPage"
                    @on-change="getPageChange"
                    @on-page-size-change="onPageSizeChange"
                    show-elevator
            />
        </div>
        <div
                v-if="selectIDCopy && selectIDCopy[selectKey]"
                class="modal-list-select-modal-fixed"
        >已选：{{selectIDCopy[selectKey]}}</div>
    </Modal>
</template>
<script>
    import axios from "axios";
    import singleSelect from "@/views/shop/components/selector/single-tree-select.vue";
    const defalutSelectObject = null;
    export default {
        components: { singleSelect },
        props: {
            value: {
                type: Boolean,
                default: false
            },
            loading: {
                type: Boolean,
                default: false
            },
            title: {
                type: String,
                default: ""
            },
            width: {
                type: Number
            },
            // 左下角显示选中的列表key
            selectKey: {
                default: "nickname"
            },
            tip: {
                type: String,
                default: ""
            },
            selectData: {
                type: Object,
                default() {
                    return defalutSelectObject;
                }
            },
            headList: {
                type: Array,
                default() {
                    return [];
                }
            },
            headName: {
                type: String,
                required: true
            },
            maxHeight: {
                type: Number,
                default: 340
            },
        },
        data() {
            return {
                modalStatus: false,
                selectIDCopy: defalutSelectObject,
                modalLoading: true,
                tableLoading: false,
                columnsData: [],
                total: 0,
                pageSize: 20,
                currentPage: 1,
                departmentID: -1,
                keyword: "",
                departmentObj: {},
                staffSearchData: null,
                departmentList: [{ id: -1, name: "全部" }],
                tableMemberData: [],
                columns: [
                    {
                        title: "员工信息",
                        minWidth: 227,
                        render: (h, params) => {
                            return h(
                                "div",
                                {
                                    style: {
                                        display: "flex",
                                        alignItems: "center"
                                    }
                                },
                                [
                                    h("img", {
                                        style: {
                                            width: "40px",
                                            height: "40px",
                                            borderRadius: "4px",
                                            marginRight: "14px"
                                        },
                                        attrs: {
                                            src: params.row.headurl
                                                ? this.getHeadImg(params.row.headurl)
                                                : "images/head-portrait.png"
                                        }
                                    }),
                                    h(
                                        "div",
                                        {
                                            style: {
                                                width: "calc(100% - 50px)",
                                                "padding":"8px 0"
                                            }
                                        },
                                        [
                                            h(
                                                "div",
                                                {
                                                    style: {
                                                        overflow: "hidden",
                                                        "text-overflow": "ellipsis",
                                                        "white-space": "nowrap",
                                                        color: "#657180",
                                                        fontSize: "12px"
                                                    }
                                                },
                                                "姓名："+params.row.name
                                            ),
                                            h(
                                                "div",
                                                {
                                                    style: {
                                                        overflow: "hidden",
                                                        "text-overflow": "ellipsis",
                                                        "white-space": "nowrap",
                                                        color: "#657180",
                                                        fontSize: "12px"
                                                    }
                                                },
                                                params.row.position?"职位："+params.row.position:""
                                            ),
                                            h(
                                                "div",
                                                {
                                                    style: {
                                                        color: "#657180",
                                                        fontSize: "12px"
                                                    }
                                                },
                                                params.row.mobile?"手机：" + params.row.mobile:""
                                            ),
                                        ]
                                    )
                                ]
                            );
                        }
                    },
                    {
                        title: "账号",
                        width: 142,
                        key: "username",
                        align: "center",
                        render: (h, params) => {
                            return h(
                                "div",
                                params.row.username
                            );
                        }
                    },
                    {
                        title: "部门",
                        width: 142,
                        key: "username",
                        align: "center",
                        render: (h, params) => {
                            let department = this.departmentObj[params.row.department_id];
                            return h(
                                "div",
                                {
                                    style: {
                                        display: "inline-block",
                                        "text-align": "left",
                                        color: "#657180",
                                        fontSize: "12px"
                                    }
                                },
                                department
                                    ? [
                                        h(
                                            "div",
                                            department.parent_id
                                                ? department.parent_name
                                                : department.name
                                        ),
                                        department.parent_id
                                            ? h(
                                            "div",
                                            {
                                                class: "table-second-level"
                                            },
                                            department.name
                                            )
                                            : ""
                                    ]
                                    : "--"
                            );
                        }
                    }
                ],
            };
        },
        watch: {
            // 弹窗显示
            value(val) {
                if (val !== this.modalStatus) {
                    this.modalStatus = val;
                    // 弹窗再次显示还原原来的选择
                    if (val) {
                        this.total = 0;
                        this.currentPage = 1;
                        this.selectIDCopy = this.selectData;
                        this.searchTaffData();
                    }
                }
            },
            modalStatus(val) {
                if (val !== this.value) {
                    this.$emit("input", val);
                }
            },
            selectData(val) {
                this.selectIDCopy = val;
            },
            loading(val) {
                this.modalLoading = val;
            },
            columns: {
                handler(val) {
                    let columns = val.concat();
                    columns.push({
                        width: 74,
                        renderHeader: h => {
                            return h("div");
                        },
                        render: (h, params) => {
                            return h("div", [
                                h(
                                    "Button",
                                    {
                                        props: { type: "primary" },
                                        style: {
                                            display:
                                                this.selectIDCopy && this.selectIDCopy.id == params.row.id
                                                    ? "none"
                                                    : ""
                                        },
                                        on: {
                                            click: () => {
                                                this.selectIDCopy = params.row;
                                            }
                                        }
                                    },
                                    "选择"
                                ),
                                h(
                                    "Button",
                                    {
                                        class: { "primary-color-border": true },
                                        style: {
                                            display:
                                                this.selectIDCopy && this.selectIDCopy.id == params.row.id
                                                    ? "inline-block"
                                                    : "none"
                                        }
                                    },
                                    "已选择"
                                )
                            ]);
                        }
                    });
                    this.columnsData = columns;
                },
                immediate: true
            }
        },
        methods: {
            getHeadImg(url) {
                if (!/^(http)/i.test(url)) {
                    url = this.$store.state.siteComdataPath + url;
                }
                return url;
            },
            // 重置弹窗数据
            clearDatas() {
                this.keyword = "";
                this.departmentID = -1;
                this.currentPage = 1;
                this.$emit("onGetSelectData", null);
            },
            onModalCancel() {
                this.$emit("onModalCancel");
            },
            /**
             * 修改搜索条件并加载数据
             */
            searchTaffData() {
                this.staffSearchData = {
                    status: 1,
                    role_id: -1,
                    department_id: this.departmentID === -1 ? "" : this.departmentID,
                    keyword: this.keyword
                };
                this.onGetMemberList();
            },
            /**
             * 选择确定
             */
            onListMemberComfirmClick() {
                // 如果没有传loading=true进来
                if (!this.loading || !this.selectIDCopy) {
                    this.modalLoading = false;
                    this.$nextTick(() => {
                        this.modalLoading = true;
                    });
                }
                if (!this.selectIDCopy) {
                    this.$Message.error(this.tip ? this.tip : ("请" + this.title));
                    return;
                }
                if(this.selectIDCopy.status == 0) {
                    return this.$Message.error("该会员已被封号，请重新选择");
                }
                this.$emit("onGetSelectData", this.selectIDCopy);
            },
            getPageChange(val) {
                this.currentPage = val;
                this.onGetMemberList();
            },
            onPageSizeChange(size) {
                this.currentPage = 1;
                this.pageSize = size;
                this.onGetMemberList();
            },
            /**
             * 获取员工列表
             */
            onGetMemberList() {
                this.tableLoading = true;
                axios.get("/shop/admin/staff/list", {
                    params: Object.assign(
                        {
                            page: this.currentPage,
                            page_size: this.pageSize,
                            exclude_admin_id:1,
                            show_department_list: 1,
                        },
                        this.staffSearchData
                    )
                })
                    .then(res => {
                        this.tableLoading = false;
                        if (res.code === 200) {
                            this.tableMemberData = res.data.list || [];
                            this.currentPage = Number(res.data.current);
                            this.pageSize = Number(res.data.page_size);
                            this.total = Number(res.data.total);
                            this.$el.querySelector(".ivu-table-overflowY") &&
                            this.$el.querySelector(".ivu-table-overflowY").scrollTo(0, 0);
                            let departmentObj = {};
                            let departmentList = [{ id: -1, name: "全部" }];
                            res.data.department_list.forEach(m => {
                                departmentList.push(m);
                                departmentObj[m.id] = m;
                                m.sub_list.forEach(n => {
                                    departmentList.push(n);
                                    departmentObj[n.id] = Object.assign({}, n, {
                                        parent_name: m.name
                                    });
                                });
                            });
                            this.departmentList = departmentList;
                            this.departmentObj = departmentObj;
                        } else {
                            this.$Message.error(res.msg);
                        }
                    })
                    .catch(err => {
                        this.tableLoading = false;
                        this.$Message.error(err);
                    });
            },
        }
    };
</script>
<style lang="less" scoped>
    .modal-list-select-modal {
        .select-role {
            width: 210px;
            height: 32px;
            margin-right: 15px;
        }
        .input-role {
            width: 211px;
            height: 32px;
            margin-right: 15px;
        }
        .select-status {
            width: 210px;
            height: 32px;
            margin-right: 15px;
        }
        /deep/.ivu-modal-header {
            height: 44px;
        }
        /deep/.ivu-modal-body {
            padding: 0;
            .mglr {
                padding: 20px 24px 16px;
            }
            .ivu-page {
                height: 54px;
                line-height: 54px;
            }
            .modal-list-select-modal-fixed {
                position: absolute;
                bottom: 14px;
                left: 18px;
                width: calc(100% - 172px);
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            .ivu-select {
                .ivu-select-selection {
                    box-shadow: none;
                }
                .ivu-select-dropdown {
                    text-align: left;
                    width: 180px;
                }
            }
        }
        /deep/.ivu-modal-footer {
            border-top: 1px solid #e8eaec;
            padding: 0 18px;
            height: 50px;
            line-height: 50px;
        }

        /deep/.ivu-input-group-prepend,
        /deep/.ivu-input-group-append,
        /deep/.ivu-table-header th {
            background: #dcdee2;
        }
        /deep/.ivu-input-group-append button {
            height: 32px;
            line-height: 1.5;
        }
        /deep/.ivu-table-overflowX {
            overflow: hidden;
        }
        /deep/.ivu-table-overflowY {
            overflow: auto;
        }
        /deep/table {
            font-size: 12px;
            .ivu-table-cell {
                padding-left: unset;
                padding-right: unset;
                // width: 220px;
            }
            thead tr{
                th:first-child{
                    padding-left: 10px;
                }
                th:nth-child(2){
                    text-align: unset;
                    padding-left: 5px;
                }
            }
            th {
                font-size: 13px;
            }
            tbody tr {
                color: #657180;
                height: 70px;
                &:hover td:last-child button {
                    display: inline-block;
                }
                td:first-child{
                    padding-left: 14px;
                }
                td:nth-child(2){
                    padding-left: 14px;
                    text-align: unset;
                }
                td:last-child {
                    padding: 0 10px;
                    .ivu-table-cell {
                        text-align: right;
                    }
                    .ivu-btn-default{
                        margin-left: 4px;
                    }
                    button {
                        width: 50px;
                        height: 24px;
                        padding: 0;
                        line-height: 0;
                        display: none;
                        span {
                            display: block;
                        }
                    }
                }
            }
        }
        /deep/.table-second-level {
            padding-left: 14px;
            position: relative;
            margin-top: 4px;
            &:before,
            &:after {
                content: "";
                display: block;
                position: absolute;
                left: 0;
                top: 8px;
                background-color: #ccc;
            }
            &:before {
                top: -2px;
                width: 1px;
                height: 10px;
            }
            &:after {
                width: 10px;
                height: 1px;
            }
        }
    }
</style>
