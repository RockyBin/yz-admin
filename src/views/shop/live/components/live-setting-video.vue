<template>
    <div class="live-setting-base">
        <div class="container">
            <Form
                    ref="formValidateVideo"
                    :model="value"
                    :rules="ruleValidateVideo"
                    :label-width="120"
                    class="mall-add"
            >
                <div class="level-news">
                    <div class="news-container">
                        <FormItem
                            label="第三方直播平台："
                            prop="live_platform"
                        >
                            <Select
                                v-model="value.live_platform"
                                class="common-input-text-310"
                                :disabled="liveInfo.status == 1"
                                placeholder="请选择直播平台"
                            >
                                <Option :value="1">NOW直播</Option>
                                <Option :value="2">快手</Option>
                                <Option :value="3">抖音</Option>
                                <!-- <Option :value="4">映客</Option> -->
                                <Option :value="5">一直播</Option>
                                <Option :value="6">斗鱼</Option>
                                <Option :value="7">花椒</Option>
                                <!-- <Option :value="8">虎牙</Option> -->
                                <Option :value="9">YY</Option>
                                <Option :value="99">其他</Option>
                            </Select>
                        </FormItem>
                        <FormItem label="第三方直播地址：" prop="live_src">
                          <span class="spvideo">
                            <Input
                                    v-model="value.live_src"
                                    @on-blur="loadVideoSrc"
                                    type="textarea"
                                    style="width:290px;height:62px"
                                    placeholder="请于第三方平台开播后，到第三放平台获取完整的链接地址"
                                    :disabled="liveInfo.status == 1"
                            />
                              <a href="http://help.wfenxian.com/NewsDetail/1798496.html" target="_blank" style="position: absolute;bottom: 0;color: #4A6AF5;line-height: 18px;">获取链接地址教程</a>

                          </span>
                        </FormItem>
                        <FormItem label="是否开启回放：">
                            <div class="dealer-setting-base-itme">
                                <more-message style="margin-right: 10px;" text="开启直播回放后，则当该直播间直播结束后，进入到回放状态"></more-message>
                                <RadioGroup v-model="value.open_vod">
                                    <Radio :label="1">是</Radio>
                                    <Radio :label="0">否</Radio>
                                </RadioGroup>
                            </div>
                        </FormItem>
                        <FormItem label="回放链接地址：" v-if="value.open_vod" prop="vod_src">
                            <div class="product-detail-item">
                                <Input
                                    v-model="value.vod_src"
									@on-blur="loadVodSrc"
                                    type="textarea"
                                    placeholder="请输入完整的回放链接地址"
                                />
                            </div>
                        </FormItem>
                    </div>
                </div>
            </Form>
        </div>
        <Modal
                width="341"
                class="loading-dialog"
                :closable="false"
                :footer-hide="true"
                v-model="loadingVideo"
        >
            <Icon type="ios-loading" size="32" class="demo-spin-icon-load"></Icon>
            <div style="margin-top:20px;">
                系统正在帮您自动提取视频地址，大约需要10秒，
            </div>
            <div>请稍后...</div>
        </Modal>
    </div>
</template>
<script>
    import moreMessage from "COMPONENTS/more-message/more-message";
    let defaultImg = require("../../images/head-portrait.png");
    export default {
        components: {
            moreMessage
        },
        props: {
            value: {
                required: true,
                type: Object
            },
            liveInfo: {
                required: false,
                type: Object
            }
        },
        data() {
            return {
                thirdMenu: [],
                loadingVideo: false, //是否正在获取视频地址
                ruleValidateVideo: {
                    live_platform:[
                        {
                            required: true,
                            trigger: "change",
                            validator: (rule, value, bankback) => {
                                if (!value){
                                    return bankback(new Error("请上传第三方直播平台"));
                                }else{
                                  return bankback();
                                }
                            }
                        }
                    ],
                    vod_src: [
                        {
                            required: true,
                            trigger: "change",
                            validator: (rule, value, bankback) => {
                                if (this.value.open_vod && !value) {
                                  return bankback(new Error("请输入链接地址"));
                                } else {
                                  return bankback();
                                }
                            }
                        }
                    ]
                },
                industryList: [],
            };
        },
        methods: {
            onSelectChange() {
                if (
                    this.formValidate.industry_id !== 0 &&
                    (this.formValidate.industry_name === "" ||
                        this.formValidate.industry_name === null)
                ) {
                    this.formValidate.industry_name = "";
                }
            },
            /**
             * 需要通过世界时的毫秒数才能与86400000区域，否则0时转成东八区会不整除
             */
            disableStartDate(date) {
                if (this.formValidate.startTime) {
                    let time = this.getFullTime(
                        new Date(this.formValidate.startTime)
                    );
                    return date && this.getFullTime(date) >= time - (time % 86400000);
                }
            },
            /**
             * 获取世界时的毫秒数
             */
            getFullTime(date) {
                let year = date.getFullYear();
                let month = date.getMonth();
                let day = date.getDate();
                let hour = date.getHours();
                let minu = date.getMinutes();
                let second = date.getSeconds();
                return Date.UTC(year, month, day, hour, minu, second);
            },
            /**
             * 获取正确的直播视频流地址
             */
            loadVideoSrc() {
                this.getHlsSrc(
		                this.value.live_platform,
                    this.value.live_src,
                    res => {
                        this.value.live_src = res;
                        this.loadingVideo = false;
                        if (!this.value.live_src) {
                            this.$Message.error("无法自动获取到正确的直播地址");
                            return;
                        }
                    },
                    () => {
                        this.loadingVideo = true;
                    }
                );
            },
			/**
             * 获取正确的回播视频流地址
             */
            loadVodSrc() {
                this.getVideoSrc(
                    this.value.vod_src,
                    res => {
                        this.value.vod_src = res;
                        this.loadingVideo = false;
                        if (!this.value.vod_src) {
                            this.$Message.error("无法自动获取到正确的直播地址");
                            return;
                        }
                    },
                    () => {
                        this.loadingVideo = true;
                    }
                );
            },
        },
    };
</script>
<style lang="less" scoped>
    .live-setting-base {
        position: absolute;
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
            height: calc(100vh - 120px);
            .level-news {
                .news-container {
                    & > div:nth-child(2) {
                        margin: 30px 0;
                    }
                    /deep/.ivu-input-wrapper {
                        margin-right: 10px;
                        width: 210px;
                    }
                    /deep/.ivu-input-suffix {
                        right: 5px;
                        line-height: 32px;
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
                            bottom: -5px;
                            right: 60px;
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
            .upgrade-conditions {
                .conditions-container {
                    & > div:nth-child(2) {
                        margin: 30px 0;
                    }
                    /deep/.ivu-form-item-label {
                        width: 120px;
                    }
                }
                /deep/.ivu-radio {
                    margin-right: 8px;
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
    .loading-dialog {
        /deep/.ivu-modal-content {
            color: #4a6af5;
            width: 341px;
            height: 157px;
            text-align: center;
            .ivu-modal-body {
                height: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                .ivu-icon {
                    animation: ani-demo-spin 1s linear infinite;
                }
            }
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
