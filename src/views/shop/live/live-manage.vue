<template>
  <div class="finance-agent">
    <div class="finance-agent-content">
      <div class="member-list-right">
        <add-more text="创建直播间" @onAddMoreClick="onAddmember" perm="live.operate"></add-more>
      </div>
      <search-list
        :searchParams="searchParams"
        :search-data="searchData"
        :onLine="true"
      >
      </search-list>
      <btn-group :data="tableTabsArray" v-model="tableTabsStatus"></btn-group>
      <!-- <Tabs type="card" v-model="tableTabsStatus">
        <TabPane v-for="(item, index) in tableTabs" :key="index" :label="item" />
      </Tabs>-->
      <common-table
        :minWidth="1093"
        :loading="tableLoading"
        :columnsData="columnsData"
        :listData="recommedList"
        @selectData="onSelectionChange"
      ></common-table>
      <div class="bar-pager">
        <Page
          :total="total"
          v-if="recommedList.length"
          :page-size="pageSize"
          show-sizer
          :current="currentPage"
          @on-change="onPageChange"
          @on-page-size-change="onPageSizeChange"
          show-elevator
          :transfer="true"
        />
      </div>
    </div>
    <export-modal
      :tableListExportStatus="tableListExportStatus"
      @exportList="exportModalConfrimClick"
      @cancelExportList="tableListExportStatus = false"
    ></export-modal>
  </div>
</template>
<script>
    import btnGroup from "@/views/shop/components/button/btn-group.vue";
    import addMore from "@/views/shop/components/button/add-more.vue";
    import searchList from "@/views/shop/components/search/search-list.vue";
    import commonTable from "@/views/shop/components/table/common-table.vue";
    import exportModal from "@/views/shop/components/export/export-modal.vue";
    import commonFunction from "@/views/shop/components/common-function.js";
    import moreMessage from "@/views/shop/components/more-message/more-message.vue";
    import QRCode from "qrcode";
    // 生成搜索列表显示内容
    const searchParams = [
        {
            type: 1,
            prefixIcon: "ios-search",
            key: "keyword",
            placeholder: "直播间名称",
        },
    ];

    const tableTabsArray = ["全部", "未开始", "直播中", "已结束"];

    // 创建搜索数据（必须在data里面创建）
    const searchData = {
        keyword: "",
        keyword_type: 1,
        level: -1,
        level_type: 1,
        payer: -1
    };
    export default {
        components: {
            btnGroup,
            searchList,
            commonTable,
            exportModal,
            addMore,
            QRCode
        },
        inject: ["yunzhiHome"],
        data() {
            const columnsData = [
                {
                    title: "排序",
                    minWidth: 100,
                    key:"sort",
                    align: "center",
                    // render: (h, params) => {
                    //     return h("div", params.row.member_dealer_level);
                    // }
                },
                {
                    title: "直播间名称",
                    key: "name",
                    align: "left",
                    minWidth: 235,
                    render: (h, params) => {
                        return h(
                            "div",
                            {

                            },
                            [
                                h(
                                    "div",
                                    {
                                        style: {
                                            "text-overflow": "ellipsis",
                                            display: "-webkit-box",
                                            "-webkit-line-clamp": 1,
                                            "-webkit-box-orient": "vertical",
                                          overflow:"hidden"
                                        }
                                    },
                                    params.row.title
                                ),
                                params.row.open_vod
                                    ? h(
                                    "div",
                                    {
                                        class: "table-back",
                                        style:{
                                            "margin-top":"6px"
                                        }
                                    },
                                    "可回放"
                                    )
                                    : ""
                            ]
                        );
                    }
                },
                {
                    title: "开播时间-结束时间",
                    align: "left",
                    minWidth: 176,
                    render: (h, params) => {
                        return h("div", [
                            params.row.real_live_start_time?h("div", params.row.real_live_start_time):h("div", params.row.expected_live_time),
                            params.row.status==2?h("div", params.row.live_end_time):''
                        ]);
                    }
                },
                {
                    title: "时长",
                    align: "left",
                    minWidth: 147,
                    render: (h, params) => {
                        return h("div", params.row.time_length?(params.row.time_length.hour+"小时"+params.row.time_length.minute+"分"+params.row.time_length.second+"秒"):'--');
                    }
                },
                {
                    title: "数据",
                    align: "left",
                    minWidth: 200,
                    render: (h, params) => {
                        return h("div", [
                            h("div", "观看："+(params.row.base_hits?params.row.base_hits:0)+"+"+(params.row.hits?params.row.hits:0)),
                            params.row.chat_count?h("div", "评论："+params.row.chat_count):h("div", "评论：0"),
                            h("div", "点赞："+params.row.like_num)
                        ]);
                    },
                    renderHeader: (h, index) => {
                        return h(
                            "div",
                            {
                                style: {
                                    display: "inline-block",
                                    "line-height": "32px"
                                }
                            },
                            [
                                h("span", "数据"),
                                h(moreMessage, {
                                    props: {
                                        text:
                                            "观看数量是指在线人数基数+实际观看过的人数。"
                                    },
                                    style:{
                                        "font-weight":"lighter",
                                        "margin-left":"5px",
                                        "margin-top":"-2px"
                                    }
                                })
                            ]
                        );
                    }
                },
                {
                    title: "状态",
                    align: "center",
                    minWidth: 80,
                    render: (h, params) => {
                        return h(
                            "div", {
                                class:
                                    params.row.status === 0
                                        ? "table-warning"
                                        : params.row.status === 2
                                        ? "table-end"
                                        : "table-success"
                            },
                            params.row.status === 0
                                ? "未开始"
                                : params.row.status === 1
                                ? "直播中"
                                : params.row.status === 2
                                    ? "已结束"
                                    : ""
                        );
                    }
                },
                {
                    title: "操作",
                    align: "left",
                    minWidth: 220,
                    render: (h, params) => {
                        let homeButton = h(
                            "a",
                            {
                                attrs: {
                                    href: "javascript:void(0);",
                                    perm: "live.operate",
                                },
                                style: {
                                    "margin-right":"10px",
                                    color:"#4570ea"
                                },
                                on: {
                                    click: () => {
                                        this.$router.push({
                                            name: "liveDesk",
                                            query: {
                                                live_id: params.row.id
                                            }
                                        });
                                    }
                                }
                            },
                            "工作台"
                        );
                        let editButton = h(
                            "a",
                            {
                                attrs: {
                                    href: "javascript:void(0);",
                                    perm: "live.view"
                                },
                                style: {
                                    "margin-right":"10px",
                                    color:"#4570ea"
                                },
                                on: {
                                    click: () => {
                                        this.$router.push({
                                            name: "liveEdit",
                                            query: {
                                                live_id: params.row.id
                                            }
                                        });
                                    }
                                }
                            },
                            "编辑"
                        );
                        let line = h(
                            "a",
                            {
                                attrs: {
                                    href: "javascript:void(0);",
                                    perm: "live.operate"
                                },
                                style: {
                                    "margin-right":"10px",
                                    color:"#4570ea"
                                },
                            },
                            "|"
                        );
                        let deleteButton = h(
                            "a",
                            {
                                attrs: {
                                    perm: "live.operate"
                                },
                                style: {
                                    "margin-right":"10px",
                                    color:"#4570ea"
                                },
                                on: {
                                    click: () => {
                                        this.onDeletePageClick(params.row.id,params.row.title,params.row.status);
                                    }
                                }
                            },
                            "删除"
                        );
                        let extendButton = h(
                            "a",
                            {
                                attrs: {
                                    href: "javascript:void(0);",
                                    perm: "live.view"
                                },
                                style: {
                                    "margin-right":"10px",
                                    color:"#4570ea"
                                },
                            },
                            "推广"
                        );
                        let poperInput = h("Input", {
                            props: {
                                value: params.row.populariz_url,
                                readonly: true
                            },
                            style: { width: "244px" }
                        });

                        let poperContent = h(
                            "div",
                            {
                                slot: "content",
                                style: { textAlign: "left", marginTop: "28px" }
                            },
                            [
                                h("div", { style: { marginBottom: "20px" } }, "推广链接"),
                                h("Icon", {
                                    props: {
                                        type: "md-close"
                                    },
                                    style: {
                                        position: "absolute",
                                        top: "20px",
                                        right: "10px",
                                        fontSize: "20px",
                                        cursor: "pointer"
                                    },
                                    on: {
                                        click: () => {
                                            poper.child.handleClose();
                                        }
                                    }
                                }),
                                h("div", { style: { marginBottom: "30px" } }, [
                                    poperInput,
                                    h(
                                        "Button",
                                        {
                                            props: { type: "primary" },
                                            style: { height: "32px", marginLeft: "5px" },
                                            on: {
                                                click: () => {
                                                    this.copyLinkUrl(
                                                        poperInput.componentInstance.$refs["input"].value
                                                    );
                                                }
                                            }
                                        },
                                        "复制"
                                    )
                                ]),
                                h("div", { style: { marginBottom: "20px" } }, "推广二维码"),
                                h("div", {}, [
                                    h("canvas", {
                                        attrs:{
                                            ref:"canvas"
                                        },
                                        style: {
                                            width: "110px",
                                            height: "110px"
                                        }
                                    })
                                ])
                            ]
                        );

                        let poper = h(
                            "Poptip",
                            {
                                "word-wrap": true,
                                props: {
                                    placement: "bottom-end",
                                    padding: "15px 22px",
                                    transfer: true
                                },
                                on: {
                                    "on-popper-show": () => {
                                        this.onShowPoptip(poperContent, params.row.populariz_url);
                                    }
                                }
                            },
                            [extendButton, poperContent]
                        );
                        let content;
                        if (params.row.status == 1) {
                            content = [
                                homeButton,
                                line,
                                editButton,
                                line,
                                poper
                            ];
                        } else {
                            content = [
                                homeButton,
                                line,
                                editButton,
                                line,
                                poper,
                                line,
                                deleteButton
                            ];
                        }
                        return h("div", content);
                    }
                }
            ];
            return {
                columnsData: columnsData,
                searchParams: searchParams,
                tableTabsStatus: 0,
                tableTabsArray,
                searchData: JSON.parse(JSON.stringify(searchData)),
                tableLoading: false,
                recommedList: [],
                total: 0,
                pageSize: 10,
                currentPage: 1,
                // 弹窗数据
                tableListExportStatus: false
            };
        },
        watch: {
            tableTabsStatus() {
                this.recommedList = [];
                this.currentPage = 1;
                this.total = 0;
                this.getDataList();
            },
            searchData: {
                handler() {
                    this.currentPage = 1;
                    this.getDataList();
                },
                deep: true
            }
        },
        created() {
            this.getDataList();
        },
        methods: {
            padImgUrl(url) {
                if (!url) {
                    return;
                }
                if (/^http/i.test(url)) {
                    return url;
                } else {
                    return this.$store.state.siteComdataPath + url;
                }
            },
            /**
             * 下拉框点击
             */
            onShowPoptip(poperContent, populariz_url) {
                QRCode.toCanvas(poperContent.elm.querySelector("canvas"), populariz_url, { margin: 1 }, function(error) {
                    if (error) console.error(error);
                });
            },
            /**
             * 复制页面链接
             */
            copyLinkUrl(url) {
                var oInput = document.createElement("input");
                oInput.value = url;
                document.body.appendChild(oInput);
                oInput.select(); // 选择对象
                document.execCommand("Copy"); // 执行浏览器复制命令
                oInput.style.display = "none";
                document.body.removeChild(oInput);
                this.$Message.success("复制成功");
            },
            //创建直播间
            onAddmember(){
                this.$router.push({
                    name: "liveAdd",
                });
            },
            onPageChange(val) {
                this.currentPage = val;
                this.recommedList = [];
                this.getDataList();
            },
            onPageSizeChange(size) {
                this.currentPage = 1;
                this.pageSize = size;
                this.recommedList = [];
                this.getDataList();
            },
            /**
             * 单个删除
             */
            onDeletePageClick(id,title,status) {
                let tips;
                if (status == 0){
                    tips = "尚未开始"
                } else{
                    tips = "已结束"
                }
                this.$Modal.confirm({
                    title: "提示",
                    content: "该直播【"+title+"】"+tips+"，是否确定删除？",
                    okText: "删除",
                    cancelText: "取消",
                    loading: true,
                    onOk: () => {
                        this.onDeletePage(id);
                    }
                });
            },
            /**
             * 删除直播
             */
            onDeletePage(list) {
                this.http({
                    url: "/shop/admin/live/delete",
                    method: "POST",
                    data: {
                        id: list
                    }
                })
                    .then(res => {
                        if (res.code === 200) {
                            this.$Message.success("删除成功");
                            this.currentPage = 1;
                            this.getDataList();
                        } else {
                            this.$Message.error(res.msg);
                          this.currentPage = 1;
                          this.getDataList();
                        }
                    })
                    .finally(() => {
                        this.$Modal.remove();
                    });
            },
            /**
             * 获取列表数据
             */
            getDataList() {
                this.tableLoading = true;
                this.getRewardDataList();
            },
            getSearchData() {
                if (this.tableTabsStatus == 0){
                    return {
                        keyword: this.searchData.keyword,
                        page: this.currentPage,
                        page_size: this.pageSize
                    };
                } else{
                    return {
                        status: [-1, 0, 1, 2][this.tableTabsStatus],
                        keyword: this.searchData.keyword,
                        page: this.currentPage,
                        page_size: this.pageSize
                    };
                }
            },
            getRewardDataList() {
                this.$httpPost(
                    "/shop/admin/live/list",
                    this.getSearchData(),
                    res => {
                        this.tableLoading = false;
                        if (res.code === 200) {
                            this.selectTableData = [];
                            this.recommedList = res.data.list || [];
                            this.currentPage = res.data.current;
                            this.total = res.data.total;
                            this.successCallBack();
                        } else {
                            this.$Message.error(res.msg);
                        }
                    }
                );
            },
            /**
             * 返回头部
             */
            successCallBack() {
                this.$el && this.yunzhiHome.scrollToTop();
            },
            onSelectionChange(selectData) {
                this.selectTableData = selectData;
            },
            /**
             *  导出数据
             * params val: 0为当前页，1为所有
             */
            exportModalConfrimClick(val) {
                this.tableListExportStatus = false;
                let data = this.getSearchData();
                data.is_all = val;
                this.exprotData(data);
            },
            onExportListDataClick() {
                if (this.selectTableData.length === 0) {
                    this.$Message.error("请选择要导出的内容");
                    return;
                }
                if (this.recommedList.length > this.selectTableData.length) {
                    let data = { ids: this.selectTableData.map(item => item.id) };
                    this.exprotData(data);
                } else {
                    this.tableListExportStatus = true;
                }
            },
            exprotData(data) {
                commonFunction.exportTable(
                    data,
                    this.http,
                    "/shop/admin/dealer/recommend/reward/export"
                );
            },
            /**
             * 状态改变还原验证
             */
            onVerifyModalChange(status) {
                if (status) {
                    this.$refs["modalValidate"].resetFields();
                }
            },
            onModalRadioChange() {
                this.$refs["modalValidate"].fields.forEach(el => {
                    el.validateState = "";
                });
            },
        }
    };
</script>
<style lang="less" scoped>
  .finance-agent {
    .finance-agent-content {
      padding: 24px 24px 0;
    }
  }
</style>
