<template>
    <div>
        <Modal v-model="isShow" :width="468" :title="title" class="finance-sales-award-verify-modal">
            <Form ref="form" :labelWidth="86" :model="formFields" :rules="rules">
                <FormItem
                    v-if="verifyInfo.status == 1 && verifyInfo.pay_member_id == 0"
                    label="审核："
                >
                    <RadioGroup v-model="formFields.status">
                        <Radio :label="1">通过</Radio>
                        <Radio :label="0">拒绝</Radio>
                    </RadioGroup>
                </FormItem>
                <div
                    v-if="[2,3].includes(verifyInfo.status) || verifyInfo.status == 1 && verifyInfo.pay_member_id || verifyInfo.status == 1 && formFields.status"
                    class="custom-form-item"
                >
                    <span class="label">业绩奖金：</span>
                    <span class="content"><span style="color:#ed4014;">¥{{verifyInfo.reward_money}}</span>（{{!verifyInfo.pay_member_id ? "公司支付" : "上级支付"}}）</span>
                </div>
                <div
                    v-if="verifyInfo.status ==2 || verifyInfo.status == 1 && verifyInfo.pay_member_id || verifyInfo.status == 1 && formFields.status"
                    class="custom-form-item"
                >
                    <span class="label">发放至：</span>
                    <span class="content">经销商资金账户</span>
                </div>
                <FormItem
                    v-if="verifyInfo.status == 1 && !verifyInfo.pay_member_id && !formFields.status"
                    label="拒绝原因：" prop="reason"
                >
                    <div class="input-wrapper">
                        <Input v-model="formFields.reason" :maxlength="20" type="textarea"/>
                        <span class="suffix">{{formFields.reason ? formFields.reason.length : 0}}/20</span>
                    </div>
                </FormItem>
            </Form>
            <div class="flex-block">
                <verify-progress :progressList="progressList"></verify-progress>
                <div class="related-member">
                    <div v-if="verifyInfo.pay_member_id">
                        <div class="title">支付奖金人信息</div>
                        <div style="margin-bottom: 16px;">
                            <img :src="formatURL(verifyInfo.pay_member_headurl) || require('../../images/head-portrait.png')" alt="">
                            <member-infor
                                :id="verifyInfo.pay_member_id"
                                :name="verifyInfo.pay_member_name || '--'"
                                :nickname="verifyInfo.pay_member_nickname"
                                :mobile="verifyInfo.pay_member_mobile"
                            />
                        </div>
                    </div>
                    <div>
                        <div class="title">得奖经销商信息</div>
                        <div>
                            <img :src="formatURL(verifyInfo.member_headurl) || require('../../images/head-portrait.png')" alt="">
                            <member-infor
                                :id="verifyInfo.member_id"
                                :name="verifyInfo.member_name || '--'"
                                :nickname="verifyInfo.member_nickname"
                                :mobile="verifyInfo.member_mobile"
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div slot="footer" class="footer">
                <Button v-if="verifyInfo.status == 1 && !verifyInfo.pay_member_id" type="text" @click="isShow = false">取消</Button>
                <Button type="primary" @click="confirm">确定</Button>
            </div>
        </Modal>
    </div>
</template>
<script>
    import verifyProgress from "./verify-progress.vue"
    import memberInfor from "@/views/shop/components/table/member-infor";
    export default {
        components: {
            verifyProgress,
            memberInfor
        },
        props: {
            value: Boolean,
            verifyInfo: {
                type: Object,
                default() {
                    return {}
                }
            }
        },
        data() {
            const validateReason = (rule, value, callback) => {
                if(this.formFields.status || value) {
                    callback()
                } else {
                    callback("请确输入拒绝原因")
                }
            };
            return {
                isShow: false,
                formFields: {
                    status: 1,
                    reason: ""
                },
                rules: {
                    reason: [{validator: validateReason, trigger: "blur", required: true}],
                }
            }
        },
        computed: {
            title() {
                if(this.verifyInfo.status == 1) {
                    if(!this.verifyInfo.pay_member_id) {
                        return "待公司审核"
                    } else {
                        return "待上级审核"
                    }
                }
                if(this.verifyInfo.status == 2) {
                    return "通过记录"
                }
                if(this.verifyInfo.status == 3) {
                    return "拒绝记录"
                }
            },
            progressList() {
                var list =[{
                    type: "success",
                    title: "提交兑换申请",
                    time: this.verifyInfo.created_at
                }]
                if(this.verifyInfo.status == 1) {
                    list.push({
                        type: "wait",
                        title: "上级审核中",
                        content: `审核人：${this.verifyInfo.pay_member_id ? this.verifyInfo.pay_member_nickname : "公司"}`
                    })
                    list.push({
                        type: "wait",
                        title: "兑换成功"
                    })
                } else if(this.verifyInfo.status == 2) {
                    list.push({
                        type: "success",
                        title: "上级审核通过",
                        content: `审核人：${this.verifyInfo.pay_member_id ? this.verifyInfo.pay_member_nickname : "公司"}`,
                        time: this.verifyInfo.verify_at
                    })
                    list.push({
                        type: "success",
                        title: "兑换成功",
                        time: this.verifyInfo.verify_at
                    })
                } else {
                    list.push({
                        type: "error",
                        title: "上级审核不通过",
                        content: `审核人：${this.verifyInfo.pay_member_id ? this.verifyInfo.pay_member_nickname : "公司"}`,
                        extra: this.verifyInfo.reason,
                        time: this.verifyInfo.verify_at
                    })
                }
                return list;
            }
        },
        watch: {
            value(val) {
                this.isShow = val;
            },
            isShow(val) {
                this.$emit("input", val)
            }
        },
        methods: {
            formatURL(url){
                return !url || /^http/.test(url) ? url : this.$store.state.siteComdataPath + url
            },
            confirm() {
                if(this.verifyInfo.status == 1 && !this.verifyInfo.pay_member_id) {
                    this.http.post("/shop/admin/dealer/reward/verify", {
                        id: this.verifyInfo.id,
                        status: this.formFields.status,
                        reason: this.formFields.reason
                    }).then(res => {
                        if(res.code == 200) {
                            this.$Message.success("审核成功")
                            this.$parent.getDataList();
                            this.isShow = false;
                        } else {
                            this.$Message.error(res.msg);
                        }
                    }).catch(err => {
                        this.$Message.error(err);
                    })
                } else {
                    this.isShow = false;
                }
            }
        }
    }
</script>
<style lang='less' scoped>
    .finance-sales-award-verify-modal {
        .ivu-form {
            .custom-form-item {
                margin-bottom: 20px;
                .label {
                    display: inline-block;
                    width: 86px;
                    line-height: 16px;
                    text-align: right;
                    padding-right: 14px;
                }
                .content {
                    line-height: 16px;
                }
                &:last-child {
                    margin-bottom: 24px;
                }
            }
            .input-wrapper {
                position: relative;
                width: 250px;
                margin-bottom: 20px;
                /deep/ textarea {
                    width: 250px;
                    height: 50px;
                    resize: none;
                }
                .suffix {
                    position: absolute;
                    right: 10px;
                    bottom: 7px;
                    line-height: 1;
                }
            }
        }
        .flex-block {
            display: flex;
            background: #f5f6f7;
            padding: 20px;
            .verify-progress {
                width: 55%;
            }
            .related-member {
                width: 45%;
                padding-left: 16px;
                .title {
                    position: relative;
                    font-size: 13px;
                    font-weight: bold;
                    line-height: 1;
                    margin-bottom: 20px;
                    &::before {
                        content: "";
                        position: absolute;
                        left: -10px;
                        width: 3px;
                        height: 16px;
                        background: #4A6AF5
                    }
                }
                img {
                    display: block;
                    width: 48px;
                    height: 48px;
                    border-radius: 5px;
                    margin-bottom: 2px;
                }
            }

        }
    }
</style>