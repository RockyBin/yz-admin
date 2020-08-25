<template>
    <Modal
        v-model="showModal"
        title="选择标签"
        class="member-detail-modal-invite"
        width="648"
        :mask-closable="false"
        :loading="loading"
        @on-ok="editData"
    >
        <div v-if="finished">
            <div v-if="!listData.length">暂无标签</div>
            <div v-for="item in listData" :key="item.id">
                <verticalLineTitlebar :title="item.name"/>
                <div class="member-detail-modal-content">
                    <Tag :checkable="true" v-for="item1 in item.children" :name="item1.id" :key="item1.id" @on-change="getCheckedTags" :checked="item1.checked">{{item1.name}}</Tag>
                </div>
            </div>
        </div>
    </Modal>
</template>
<script>
    import verticalLineTitlebar from "COMPONENTS/titlebar/vertical-line-titlebar";
    export default {
        components: {
            verticalLineTitlebar
        },
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
        },
        data() {
            return {
                showModal: false,
                loading: true,
                tableLoading: false,
                total: 0,
                pageSize: 20,
                finished:false,
                currentPage: 1,
                listData: [],
                checkedData:[],
            };
        },
        watch: {
            value(val) {
                this.showModal = val;
                if (val) {
                    this.total = 0;
                    this.currentPage = 1;
                    this.listData = []
                    this.checkedData = [];
                }
            },
            showModal(val) {
                this.$emit("input", val);
                this.getList();
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
            getCheckedTags(checked,name){
                if (checked){
                    this.listData.filter(item=>item.children.filter(val=>{
                        if (val.id == name){
                            val.checked=true
                        }
                    }));
                    // this.checkedData.push(name);
                } else{
                    this.listData.filter(item=>item.children.filter(val=>{
                        if (val.id == name){
                            val.checked=false
                        }
                    }));
                    // this.checkedData.splice(this.checkedData.findIndex(item => item === name), 1)
                }
            },
            getList() {
                this.tableLoading = true;
                this.$httpPost(
                    "/shop/admin/member/label/list",
                    {
                        show_all:1
                    },
                    res => {
                        this.tableLoading = false;
                        if (res.code === 200) {
                            this.currentPage = res.data.current;
                            this.total = res.data.total;
                            res.data.list.filter(item=>item.children.filter(val=>{
                                if (this.dataInfo.label.includes(val.name)){
                                    val.checked = true;
                                }else{
                                    val.checked = false;
                                }
                            }))
                            this.listData = res.data.list;
                            this.finished = true;
                            this.$el.querySelector(".ivu-table-overflowY") &&
                            this.$el.querySelector(".ivu-table-overflowY").scrollTo(0, 0);
                        } else {
                            this.$Message.error(res.msg);
                        }
                    }
                );
            },
            editData() {
                this.listData.filter(item=>item.children.filter(val=>{
                    if (val.checked){
                        this.checkedData.push(val.id);
                    }
                }));
                this.$httpPost(
                    "/shop/admin/member/label/relation",
                    {
                        member_id: this.$route.query.id,
                        id: this.checkedData
                    },
                    res => {
                        this.$Modal.remove();
                        if (res.code === 200) {
                            this.$Message.success("设置成功");
                            this.$Modal.remove();
                            this.showModal = false;
                            let tagsLabel = [];
                            if (this.checkedData.length){
                                this.listData.forEach(item=>{
                                    item.children.filter(val=>{
                                        if (this.checkedData.includes(val.id)){
                                            tagsLabel.push(val.name);
                                        }
                                    })
                                })
                            }
                                this.$set(this.dataInfo, "label", tagsLabel);
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
        .member-detail-modal-content{
            margin: 10px 0 20px 15px;
            .ivu-tag{
                padding: 3px 10px;
                background: #fff;
                border: 1px solid #E3E5E8;
                border-radius: 3px;
                font-size: 12px;
                vertical-align: unset;
                height: unset;
                line-height: unset;
                margin: 0 10px 6px 0;
            }
            .ivu-tag-checked{
                background: #E7F6FF;
                border: 1px solid #ACDAF4;
                /deep/.ivu-tag-text{
                    color:#56A5E5 !important;
                }
            }
        }
    }
</style>
