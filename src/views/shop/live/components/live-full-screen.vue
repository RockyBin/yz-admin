<template>
    <div>
        <Form
            ref="formValidate"
            :model="formValidate"
            :rules="ruleValidate"
            :label-width="100"
            class="mall-add">
            <FormItem label="直播间封面：" prop="cover_of_studio" class="margin-bottom-form">
                <div class="product-detail-item">
                    <show-big-img-upload
                        imgSize="80px"
                        :class="{'has-error': coverError}"
                        :InitImgURLs="coverStudioURL"
                        v-model="formValidate.cover_of_studio"
                    ></show-big-img-upload>
                    <span style="color: #999;line-height: 18px;position: absolute;bottom: 0;">建议上传比例为1:1的图片</span>
                </div>
            </FormItem>
            <Tabs type="card" :animated="false">
                <TabPane
                    label="按钮导航"
                    tab="condition"
                >
                    <FormItem label="按钮显示：" style="margin-bottom: 10px !important;margin-top: 20px !important;" class="un-start">
                        <div class="product-detail-tags">
                            <Tag :checkable="true" v-for="item in bottonName" :name="item.id" :key="item.id" @on-change="getCheckedTags" :checked="item.checked">{{item.name}}
                                <i class="iconfont ivu-icon-checkmark"></i>
                            </Tag>
                        </div>
                    </FormItem>
                    <div class="level-news">
                        <CheckboxGroup v-model="formValidate.button_display">
                            <div class="switch-titlebar"
                                 style="margin-left: 100px;"
                                 v-for="item in bottonName"
                                 :key="item.id"
                            >
                                <div class="switch-titlebar-head">
                                    <span class="switch-titlebar-head-text" style="margin-right: 13px;font-weight: bold;">按钮</span>
                                    <Checkbox label="item.label">是</Checkbox>
                                </div>
                                <div class="news-container">
                                    <FormItem label="item.name：" prop="navigation_name" class="margin-bottom-form">
                                        <Input
                                            v-model="item.name"
                                            class="common-input-text-310"
                                            placeholder="请输入名称"
                                            :maxlength="item.name=='关注'?2:20"
                                        >
                                            <span slot="suffix" style="line-height: 32px;">{{item.name?item.name.length:0}}/item.name=='关注'?2:20</span>
                                        </Input>
                                    </FormItem>
                                    <FormItem label="类型：" v-if="item.id==8">
                                        <div class="dealer-setting-base-itme dealer-seting-base-ts">
                                            <RadioGroup v-model="formValidate.navigation_styles">
                                                <Radio :label="0">图片</Radio>
                                                <Radio :label="1">文本</Radio>
                                            </RadioGroup>
                                        </div>
                                    </FormItem>
                                    <FormItem label="图片：" prop="navigation_images" class="margin-bottom-form" v-show="!formValidate.navigation_styles">
                                        <div class="product-detail-item">
                                            <show-big-img-upload
                                                imgSize="80px"
                                                :class="{'has-error': navigationImagesError}"
                                                :InitImgURLs="navigationImagesURL"
                                                v-model="formValidate.navigation_images"
                                            ></show-big-img-upload>
                                        </div>
                                    </FormItem>
                                    <FormItem
                                        label="文本："
                                        prop="navigation_text"
                                        class="live-full-navigation-text"
                                        v-show="formValidate.navigation_styles === 1"
                                    >
                                        <div class="product-detail-item">
                                            <div class="product-detail-editor">
                                                <ue-editor
                                                    v-model="formValidate.navigation_text"
                                                    :setting="ueSetting"
                                                    :hideImageSelector="true"
                                                    ref="editor"
                                                ></ue-editor>
                                            </div>
                                        </div>
                                    </FormItem>
                                </div>
                            </div>
                        </CheckboxGroup>
                    </div>
                </TabPane>
            </Tabs>
        </Form>
    </div>
</template>

<script>
    import showBigImgUpload from "COMPONENTS/image-select/show-big-img-upload.vue";
    import ueEditor from "COMPONENTS/editor/editor.vue";
    const fullButtonText = ["按钮导航"];
    export default {
        components: {
            showBigImgUpload,
            ueEditor
        },
        data(){
            return{
                coverError:false,
                navigationImagesError:false,
                coverStudioURL:"",
                navigationImagesURL:"",
                fullButtonText,
                bottonName:[
                    {
                        id:0,
                        name:"关注",
                        label:"LiveNavLinkType_Follow",
                        checked:true
                    },
                    {
                        id:1,
                        name:"更多直播",
                        label:"LiveNavLinkType_MoreLive",
                        checked:false
                    },
                    {
                        id:2,
                        name:"商城主页",
                        label:"LiveNavLinkType_Home",
                        checked:false
                    },
                    {
                        id:3,
                        name:"评论",
                        label:"LiveNavLinkType_Cmment",
                        checked:false
                    },
                    {
                        id:4,
                        name:"商品",
                        label:"LiveNavLinkType_Product",
                        checked:false
                    },
                    {
                        id:5,
                        name:"优惠券",
                        label:"LiveNavLinkType_Coupon",
                        checked:false
                    },
                    {
                        id:6,
                        name:"点赞",
                        label:"LiveNavLinkType_Like",
                        checked:false
                    },
                    {
                        id:7,
                        name:"分享",
                        label:"LiveNavLinkType_Share",
                        checked:false
                    },
                    {
                        id:8,
                        name:"自定义",
                        label:"LiveNavLinkType_Interactive",
                        checked:false
                    }
                ],
                formValidate:{
                    cover_of_studio:"",
                    tabSelect: 0,
                    navigation_styles:0,
                    navigation_images:"",
                    navigation_name:"",
                    navigation_text:"",
                    button_display: ["LiveNavLinkType_MoreLive", "LiveNavLinkType_Home","LiveNavLinkType_Cmment","LiveNavLinkType_Product","LiveNavLinkType_Coupon","LiveNavLinkType_Like","LiveNavLinkType_Share"], // 线上应用入口
                },
                ruleValidate: {
                    navigation_name:[
                        {
                            required: true,
                            message: "请输入名称",
                            trigger: "change"
                        }
                    ],
                    cover_of_studio: [
                        {
                            required: true,
                            trigger: "change",
                            validator: (rule, formValidate, callback) => {
                                if (formValidate.length) {
                                    this.coverError = false;
                                    return callback();
                                }
                                this.coverError = true;
                                return callback(new Error("请上传直播间封面图"));
                            }
                        }
                    ],
                    navigation_images: [
                        {
                            required: true,
                            validator: (rule, formValidate, callback) => {
                                if (!this.formValidate.navigation_styles) {
                                    if (formValidate.length) {
                                        this.navigationImagesError = false;
                                        return callback();
                                    }
                                    this.navigationImagesError = true;
                                    return callback(new Error("请上传图片"));
                                }
                            }
                        }
                    ],
                    navigation_text:[
                        {
                            required: true,
                            validator: (rule, value, callback) => {
                                if (this.formValidate.navigation_styles) {
                                    if (value){
                                        return callback();
                                    } else{
                                        return callback(new Error("请输入文本内容"));
                                    }
                                }
                            }
                        }
                    ]
                },
                ueSetting: {
                    toolbars: [
                        [
                            "source",
                            "|",
                            "undo",
                            "redo",
                            "|",
                            "bold",
                            "italic",
                            "underline",
                            "forecolor",
                            "backcolor",
                            "fontborder",
                            "strikethrough",
                            "superscript",
                            "subscript",
                            "removeformat",
                            "formatmatch",
                            "autotypeset",
                            "blockquote",
                            "pasteplain",
                            "|",
                            "insertorderedlist",
                            "insertunorderedlist",
                            "selectall",
                            "cleardoc",
                            "|",
                            "rowspacingtop",
                            "rowspacingbottom",
                            "lineheight",
                            "|",
                            "customstyle",
                            "paragraph",
                            "fontfamily",
                            "fontsize",
                            "|",
                            "directionalityltr",
                            "directionalityrtl",
                            "indent",
                            "|",
                            "justifyleft",
                            "justifycenter",
                            "justifyright",
                            "justifyjustify",
                            "|",
                            "touppercase",
                            "tolowercase",
                            "|",
                            "horizontal",
                            "|",
                            "deletetable",
                            "insertparagraphbeforetable",
                            "insertrow",
                            "deleterow",
                            "insertcol",
                            "deletecol",
                            "mergecells",
                            "mergeright",
                            "mergedown",
                            "splittocells",
                            "splittorows",
                            "splittocols"
                        ]
                    ]
                },
            }
        },
        created(){

        },
        methods:{
            getCheckedTags(checked,name){
                if (checked){
                    this.bottonName.filter(item=>{
                        if (item.id == name){
                            item.checked=true
                        }else{
                            item.checked=false
                        }
                    });
                } else{
                    this.bottonName.filter(item=>{
                        if (item.id == name){
                            item.checked=false
                        }
                    });
                }
            },
        }
    }
</script>

<style lang="less" scoped>
    .product-detail-tags{
        .ivu-tag{
            width: 92px;
            height: 32px;
            background-color: #fff !important;
            border: 1px solid #DCDEE2 !important;
            line-height: 28px;
            text-align: center;
            margin: 0 14px 10px 0;
            /deep/.ivu-tag-text{
                font-size: 12px !important;
            }
        }
        .ivu-tag-checked{
            border-color: #4A6AF5 !important;
            /deep/.ivu-tag-text{
                color: #4A6AF5 !important;
            }
        }
    }
    .level-news{
        .switch-titlebar{
            width: 680px;
            margin-bottom: unset;
            border: 1px solid #DCDEE2;
            border-radius: 5px;
        }
        .switch-titlebar-head{
            background-color: #FAFBFD;
            padding: 12px 14px;
            margin-bottom: 10px;
            justify-content: space-between;
            display: flex;
            /deep/.ivu-checkbox-wrapper{
                .ivu-checkbox{
                    margin-right: 5px;
                }
            }
        }
        .dealer-setting-base-itme{
            /deep/.ivu-radio-wrapper{
                margin-right: 20px;
            }
        }
    }
    .product-detail-item{
        .show-big-img-upload{
            display: inline-block;
        }
        .ivu-checkbox-group{
            .ivu-checkbox-wrapper{
                margin-right: 20px;
                /deep/.ivu-checkbox{
                    margin-right: 5px;
                }
            }
        }
        .product-detail-editor{
            width: 550px;
            height: 420px;
            /deep/.edui-editor-iframeholder{
                height: 300px !important;
            }
        }
    }
</style>