<template>
    <div class="live-setting-base">
        <div class="container">
            <Form
                ref="formValidate"
                :model="value"
                :label-width="90"
                class="mall-add"
            >
                <div class="level-news">
                    <div class="news-container">
                        <FormItem label="直播间公告：">
                            <div class="product-detail-item">
                                <Input
                                    v-model="value.notice"
                                    type="textarea"
                                    :maxlength="150"
                                    placeholder="直播间滚动公告，不填则不显示"
                                />
                                <span class="textarea-num">{{value.notice?value.notice.length:0}}/150</span>
                            </div>
                        </FormItem>
                        <FormItem label="公告链接：" v-if="value.notice">
                            <LinkButton
                                class="link-btn common-input-text-310"
                                :context="industryList"
                                :text="industryList.link_desc"
                                @onSelectLink="onLinkSelected"
                            ></LinkButton>
                            <more-message text=" 不选择链接则不跳转"></more-message>
                        </FormItem>
                    </div>
                </div>
            </Form>
        </div>
    </div>
</template>
<script>
    import moreMessage from "COMPONENTS/more-message/more-message";
    let defaultImg = require("../../images/head-portrait.png");
    import LinkButton from "./link-select-button";
    export default {
        components: {
            moreMessage,
            LinkButton
        },
        props: {
            value: {
                required: true,
                type: Object
            },
        },
        data() {
            return {
                industryList: {
                    link_url:"",
                    link_desc:"",
                    link_type:"",
                    link_data:null,
                },
            };
        },
        methods: {
            onLinkSelected(linkInfo, item) {
                this.$set(item, "link_desc", linkInfo.desc);
                this.$set(item, "link_type", linkInfo.type);
                this.$set(item, "link_data", linkInfo.data);
                this.$set(item, "link_url", linkInfo.url);
                this.$set(this.value,"notice_link",JSON.stringify(item))
            },
        },
    };
</script>
<style lang="less" scoped>
    .live-setting-base {
        /*position: absolute;*/
        width: 100%;
        background: #f2f4fd;
        display: flex;
        .container {
            height: 100%;
            flex: 1;
            .margin-select-bottom-form {
                margin-bottom: 14px;
            }
        }
    }
    .container {
        background: #fff;
        .mall-add {
            /*padding: 24px;*/
            /*padding-bottom: 74px;*/
            text-align: left;
            overflow-y: auto;
            overflow-x: hidden;
            background: white;
            width: 100%;
            /*height: calc(100vh - 120px);*/
            .level-news {
                .news-container {
                    .link-btn{
                        display: inline-block;
                        margin-right: 10px;
                    }
                    .product-detail-item {
                        margin-top: 8px;
                        .show-big-img-upload{
                            display: inline-block;
                        }
                        /deep/.ivu-input-wrapper {
                            width: 310px;
                        }
                        span.textarea-num {
                            font-size: 12px;
                            color: #999999;
                            vertical-align: bottom;
                            position: relative;
                        }
                    }
                    /deep/.ivu-form-item-label {
                        width: 120px;
                    }
                    .dealer-setting-base-itme{
                        /deep/.ivu-radio-wrapper{
                            margin-right: 20px;
                        }
                    }
                }
            }
        }
        /deep/.ivu-input-wrapper textarea.ivu-input {
            width: 350px;
            height: 80px;
            resize: none;
        }
        /*/deep/.ivu-select-dropdown {*/
        /*max-height: 150px;*/
        /*}*/
    }
    // 图标
    .common-icon {
        vertical-align: middle;
        font-size: 18px;
        margin-left: 10px;
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
    /*.footer{*/
    /*height: 50px;*/
    /*line-height: 50px;*/
    /*text-align: center;*/
    /*border-top: 1px solid #eee;*/
    /*background: white;*/
    /*button{*/
    /*width: 100px;*/
    /*}*/
    /*}*/
</style>
