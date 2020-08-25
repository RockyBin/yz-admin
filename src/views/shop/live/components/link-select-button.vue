<template>
    <div>
        <div v-if="layout == 1" class="layout-1">
            <div :style="btnStyle" class="layout-1-container" @mouseenter="hover()" @mouseleave="leave()"  @click="showLinkSelector">
                <div class="link-show-container">
                    <slot name="link-show">
                        <div class="link-show" :class="{'not-empty':text}" :style="'height:' + this.height + ';line-height:' + this.height"><i class="iconfont icon-ios-link" style="font-size:12px;margin-right:8px;"></i>{{getText()}}</div>
                    </slot>
                </div>
                <div v-if="context.link_url&&context.link_type!='none'||context.url" class="clear-button-container" @click.stop="onClear" title="清除链接">
                    <slot name="clear-button">
                        <div class="clear-button" :style="'height:' + this.height + ';line-height:' + this.height">
                            <Icon class="clear-icon" type="md-close-circle" />
                        </div>
                    </slot>
                </div>
            </div>
            <!-- <span class="select-button-container" @click="showLinkSelector">
              <slot name="select-button">
                <Button class="select-button" type="primary">选择</Button>
              </slot>
            </span> -->
        </div>
        <div v-if="layout == 2" class="layout-2" :style="{width: this.width}">
            <div :style="btnStyle" @mouseenter="hover()" @mouseleave="leave()"  @click="showLinkSelector">
                <div class="link-show-container">
                    <slot name="link-show">
                        <div class="link-show" :class="{'not-empty':text}" :style="'height:' + this.height + ';line-height:' + this.height"><i class="iconfont icon-ios-link" style="font-size:12px;margin-right:8px;"></i>{{getText()}}</div>
                    </slot>
                </div>
                <div v-if="context.link_url&&context.link_type!='none'||context.url" class="clear-button-container" @click.stop="onClear" title="清除链接">
                    <slot name="clear-button">
                        <div class="clear-button" :style="'height:' + this.height + ';line-height:' + this.height">
                            <Icon class="clear-icon" type="md-close-circle" />
                        </div>
                    </slot>
                </div>
            </div>
            <!-- <span class="select-button-container" @click="showLinkSelector">
              <slot name="select-button">
                <Button class="select-button" type="primary">选择</Button>
              </slot>
            </span> -->
        </div>
        <LinkSelector v-model="modalState" @onSelected="onSelect"></LinkSelector>
    </div>
</template>
<script type="text/ecmascript-6">
    import LinkSelector from "@/views/shop/components/links/links"
    export default {
        components: { LinkSelector },
        props: {
            context: {
                type: Object,
                default: function() {
                    return {};
                }
            },
            layout: {
                type: Number,
                default: 1
            },
            text: {
                type: String,
                default: "请选择链接"
            },
            width: {
                type: String,
                default: "100%"
            },
            height: {
                type: String,
                default: "33px"
            },
            border: {
                type: String,
                default: "1px solid"
            },
            borderWidth: {
                type: Number,
                default: 1
            },
            borderColor: {
                type: String,
                default: "#ddd"
            },
            tagsIndex:{
                type: Number,
                default: null
            }
        },
        data() {
            return {
                linkInfo: {
                    name: "",
                    type: "none",
                    data: "",
                    url: "",
                    desc: ""
                },
                modalState: false,
                showClearButton: false
            };
        },
        computed: {
            btnStyle: function() {
                return {
                    width: this.width,
                    height: this.height,
                    border: this.border,
                    "border-width": this.borderWidth + "px",
                    "border-color": this.borderColor,
                    "border-radius": "5px",
                    position: "relative",
                    overflow:"hidden"
                };
            }
        },
        methods: {
            getText() {
                //return this.text ? this.text : (this.linkInfo.desc ? this.linkInfo.desc : "请选择链接");
                return this.text ? this.text : "请选择链接";
            },
            showLinkSelector() {
                this.modalState = true;
            },
            onSelect(link) {
                this.linkInfo = link;
                if (this.tagsIndex){
                    this.$emit("onSelectLink", this.linkInfo, this.context,this.tagsIndex);
                } else{
                    this.$emit("onSelectLink", this.linkInfo, this.context);
                }
            },
            onClear() {
                this.linkInfo = {
                    name: "",
                    type: "none",
                    data: "",
                    url: "",
                    desc: ""
                };
                if (this.tagsIndex){
                  this.$emit("onSelectLink", this.linkInfo, this.context,this.tagsIndex);
                } else{
                  this.$emit("onSelectLink", this.linkInfo, this.context);
                }
            },
            hover() {
                if(this.context.link_url&&this.context.link_type!="none"){
                    this.showClearButton = true;
                }else{
                    this.showClearButton = false;
                }
            },
            leave() {
                this.showClearButton = false;
            }
        }
    };
</script>
<style lang="less" scoped>
    .link-show-container {
        position: relative;
        line-height: 100%;
        cursor: pointer;
        background-color: #f9fbfd;
        color: #9ea4b1;
    }
    .link-show {
        position: absolute;
        width: 100%;
        height: 100%;
        line-height: 100%;
        white-space:nowrap;
        overflow: hidden;
        text-overflow:ellipsis;
        word-break: break-all;
        padding-left: 8px;
        color:#9ea4b1;
        padding-right:30px;
        &.not-empty{
            color:#333;
        }
    }
    .clear-button-container {
        position: absolute;
        top: 0;
        right: 6px;
    }
    .clear-button {
        cursor: pointer;
        display: flex;
        align-items: center;
    }
    .clear-icon {
        font-size: 16px;
        margin-top: -2px;
        color: #666;
    }
    .clear-icon:hover {
        color: #333;
    }
    .select-button-container {
        display: inline-block;
    }
    .layout-1 {
        .link-show-container {
            width: 100%;
            height: 100%;
        }
        .select-button {
            margin-top: 10px;
            width: 50px;
            padding: 4px 0px;
        }
    }

    .layout-2 {
        display: flex;
        .link-show-container {
            width: 100%;
            height: 100%;
        }
        .select-button {
            margin-left: 15px;
            width: 50px;
            padding: 4px 0px;
        }
    }
</style>
