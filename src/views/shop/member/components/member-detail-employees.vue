<template>
    <Modal
            v-model="showModal"
            :title="title"
            class="member-detail-modal-invite"
            width="648"
            :mask-closable="false"
            :footer-hide="true"
            :loading="loading"
    >
        <div class="member-detail-modal-invite-head">
            <div>
                <verticalLineTitlebar :title="'会员信息'"/>
                <div class="member-detail-base-head-info">
                    <div
                            class="member-detail-base-avator"
                            :style="`background-image: url(${getHeadImg(dataInfo.headurl)});`"
                    ></div>
                    <div class="member-detail-base-head-msg">
                        <div>昵称：{{dataInfo.nickname|| '--'}}</div>
                        <div>姓名：{{dataInfo.name || '--'}}</div>
                        <div>手机：{{dataInfo.mobile|| '--'}}</div>
                        <div>ID：{{dataInfo.id}}</div>
                    </div>
                </div>
            </div>
            <div style="margin-left: 20px;padding-left: 13px;">
                <verticalLineTitlebar :title="'原所属员工'"/>
                <div class="member-detail-base-head-info" v-if="dataInfo.admin_id">
                    <div
                            class="member-detail-base-avator"
                            :style="`background-image: url(${getHeadImg(dataInfo.admin_headurl)});`"
                    ></div>
                    <div class="member-detail-base-head-msg">
                        <div>姓名：{{dataInfo.admin_name|| '--'}}</div>
                        <div>职位：{{dataInfo.position || '--'}}</div>
                        <div>手机：{{dataInfo.admin_mobile|| '--'}}</div>
                    </div>
                </div>
                <div class="member-detail-base-head-info" v-else>--</div>
            </div>
            <div class="member-detail-modal-invite-btn" v-if="dataInfo.admin_id" @click="onSetInviteClick(dataInfo,2)">解除绑定员工</div>
        </div>
        <div class="row" style="margin-bottom:20px;margin-top: 20px;">
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
        <common-table
                :hasBorder="true"
                :loading="tableLoading"
                :columnsData="columnsData"
                :listData="listData"
                :height="300"
        ></common-table>
        <Page
                style="text-align: right;margin: 20px 10px -4px 0;"
                :total="total"
                size="small"
                :page-size="pageSize"
                :current="currentPage"
                @on-change="getPageChange"
                @on-page-size-change="onPageSizeChange"
                show-elevator
        />
    </Modal>
</template>
<script>
    import axios from "axios";
    import commonTable from "@/views/shop/components/table/common-table.vue";
    import verticalLineTitlebar from "COMPONENTS/titlebar/vertical-line-titlebar";
    import singleSelect from "@/views/shop/components/selector/single-tree-select.vue";
    export default {
        components: {
            commonTable,
            verticalLineTitlebar,
            singleSelect
        },
        inject: ["target"],
        props: {
            value: {
                type: Boolean,
                default: false
            },
            dataInfo: {
                type: Object,
                default() {
                    return null;
                }
            },
            title:{
                type:String,
                default:"修改所属员工"
            }
        },
        data() {
            return {
                showModal: false,
                loading: true,
                departmentID: -1,
                keyword: "",
                defaultImg: require("../../images/head-portrait.png"),
                tableLoading: false,
                total: 0,
                pageSize: 20,
                currentPage: 1,
                staffSearchData: null,
                departmentObj: {},
                columnsData: [
                    {
                        title: "员工信息",
                        minWidth: 210,
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
                                                        color: "#657180"
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
                        width: 124,
                        key: "username",
                        align: "center",
                        render: (h, params) => {
                            return h(
                                "div",
                                {
                                    style: {
                                        color: "#657180",
                                        fontSize: "12px"
                                    }
                                },
                                params.row.username
                            );
                        }
                    },
                    {
                        title: "部门",
                        align: "center",
                        width: 134,
                        render: (h, params) => {
                            if (params.row.department_id){
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
                            } else{
                                return h('div','--');
                            }

                        }
                    },
                    {
                        title: "",
                        align: "left",
                        width: 118,
                        renderHeader: h => {
                            return h("div");
                        },
                        render: (h, params) => {
                            return h("div", [
                                h(
                                    "Button",
                                    {
                                        props: {
                                            type: "primary",
                                            size: "small",
                                            ghost: true
                                        },
                                        style: {
                                            fontSize: "12px"
                                        },
                                        on: {
                                            click: () => {
                                                this.onSetInviteClick(params.row,1);
                                            }
                                        }
                                    },
                                    "设为所属员工"
                                )
                            ]);
                        }
                    }
                ],
                listData: [],
                departmentList: [{ id: -1, name: "全部" }],
            };
        },
        watch: {
            value(val) {
                this.showModal = val;
                if (val) {
                    this.total = 0;
                    this.currentPage = 1;
                    this.listData = [];
                    this.searchTaffData();
                }
            },
            showModal(val) {
                this.$emit("input", val);
            },
        },
        methods: {
            getPageChange(val) {
                this.currentPage = val;
                this.getList();
            },
            onPageSizeChange(val) {
                this.currentPage = 1;
                this.pageSize = val;
                this.getList();
            },
            /**
             * 获取头像
             */
            getHeadImg(url) {
                if (url) {
                    if (!/^(http)/i.test(url)) {
                        url = this.$store.state.siteComdataPath + url;
                    }
                    return url;
                }
                return this.defaultImg;
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
                this.getList();
            },
            onSetInviteClick(val,type) {
                let message;
                if (type==1){
                    message = '是否确定将【'+val.name+'】绑定为【'+this.dataInfo.nickname+'】的所属员工？';
                } else{
                    message = '是否确定解绑所属员工【'+val.admin_name+'】？';
                }
                this.$Modal.confirm({
                    title: "提示",
                    loading: true,
                    content: message,
                    onOk: () => {
                        this.editData(val);
                    }
                });
            },
            getList() {
                this.tableLoading = true;
                axios.get("/shop/admin/staff/list", {
                        params: Object.assign(
                            {
                                page: this.currentPage,
                                page_size: this.pageSize,
                                exclude_admin_id:this.dataInfo.admin_id,
                                show_department_list: 1,
                            },
                            this.staffSearchData
                        )
                    })
                    .then(res => {
                        this.tableLoading = false;
                        if (res.code === 200) {
                            this.currentPage = res.data.current;
                            this.total = res.data.total;
                            this.listData = res.data.list;
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
            editData(val) {
                this.$httpPost(
                    "/shop/admin/member/edit",
                    {
                        id: this.$route.query.id,
                        admin_id: val.admin_id?'0':val.id
                    },
                    res => {
                        this.$Modal.remove();
                        if (res.code === 200) {
                            this.$Message.success("设置成功");
                            this.$Modal.remove();
                            this.showModal = false;
                            // this.target.distributorInfo = {};
                            this.$set(this.dataInfo, "invite1", val.id);
                            if (!val.admin_id){
                                this.$set(this.dataInfo, "admin_name", val.name);
                                this.$set(this.dataInfo, "admin_mobile", val.mobile);
                                this.$set(this.dataInfo, "admin_headurl", val.headurl);
                                this.$set(this.dataInfo, "position", val.position);
                                this.$set(this.dataInfo, "admin_id", val.id);
                            }else{
                                this.$set(this.dataInfo, "admin_id", null);
                            }
                        } else {
                            this.$Message.error(res.msg);
                        }
                    }
                );
            }
        }
    };
</script>
<style lang="less" scoped>
    .member-detail-modal-invite {
        /deep/.data-list-search {
            margin-top: 24px;
            .ivu-btn {
                margin-right: 0px;
            }
            .data-list-search-item .ivu-select {
                width: 140px;
            }
        }
        .member-detail-modal-invite-head {
            position: relative;
            display: flex;
            padding: 15px;
            border-radius: 5px;
            font-size: 13px;
            background-color: #f7f8fd;
            &>div:nth-child(2){
                position: relative;
                &::before{
                    content: '';
                    width: 1px;
                    height: 106px;
                    background-color: #DCDEE2;
                    position: absolute;
                    left: 0;
                    top: 15px;
                }
            }
            .member-detail-base-avator {
                width: 60px;
                height: 60px;
                border-radius: 5px;
                background-size: cover;
                background-repeat: no-repeat;
                background-position: center;
            }
            .member-detail-base-head-info {
                display: flex;
                /*align-items: flex-end;*/
                padding-left: 0;
                margin-top: 9px;
                .member-detail-base-head-msg {
                    margin-left: 13px;
                    font-size: 12px;
                    color: #657180;
                    width: calc(100% - 80px);
                    &>div{
                        line-height: 20px;
                    }
                    &>div:first-child,&>div:nth-child(1){
                        overflow: hidden;
                        white-space: nowrap;
                        text-overflow: ellipsis;
                        width: 150px;
                    }
                }
            }
            .member-detail-modal-invite-avator {
                width: 60px;
                height: 60px;
                border-radius: 5px;
                background-size: cover;
                background-repeat: no-repeat;
                background-position: center;
            }
            .member-detail-modal-invite-info {
                display: flex;
                flex-direction: column;
                justify-content: center;
                padding-left: 12px;
                & > div:first-child {
                    margin-bottom: 5px;
                }
                span:first-child {
                    font-weight: bold;
                }
            }
            .member-detail-modal-invite-btn {
                position: absolute;
                right: 22px;
                top: 30px;
                transform: translateY(-50%);
                width: 136px;
                height: 32px;
                line-height: 32px;
                border-radius: 5px;
                text-align: center;
                background-color: #ec8f1d;
                color: #fff;
                cursor: pointer;
            }
        }
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
