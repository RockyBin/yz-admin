<template>
  <div>
    <thirdMenu :list="thirdMenu"/>
    <div class="wrapper">
      <div class="content">
        <Form ref="form" :model="formField" :label-width="100">
          <switch-titlebar style="margin-bottom: 20px;margin-top: 20px;"
               v-model="formField.copyright_status"
              title="店铺底部版权信息展示"
              hasBorder
              :switchShow="hasLicensePerm('ENABLE_CUSTOM_COPYRIGHT')"
              :true-value="1"
              :false-value="0"
              @on-change="changeOpenWxOnlinePay"
          >
            <div class="left">
              <div class="left-top">
                <div class="left-top-header">
                  <div style="font-size: 12px;color: #464C5B;">
                    <i class="iconfont icon-weibiaoti-" style="margin-right: 5px;"></i>
                    <i class="iconfont icon-xinhao"></i>
                  </div>
                  <div style="font-size: 12px;color: #464C5B;">
                    9:41 AM
                  </div>
                  <div>
                    <span style="display:inline-block;-webkit-transform-origin-x: 0;-webkit-transform: scale(0.9);font-size: 11px;vertical-align: text-bottom;color: #464C5B;">100%</span><i class="iconfont icon-dianchi"></i>
                  </div>
                </div>
                <!--<div class="left-top-header" :style="`background-image: url(${require('../../../../public/images/setting/titletop.png')});`"></div>-->
                <div class="left-top-title">店铺主页</div>
              </div>
              <div class="pagecontainer">
                <div class="copyright-demo">
                  <div v-if="formField.copyright_style == 1" class="style1">
                    <div class="nav">店铺主页&nbsp;&nbsp;|&nbsp;&nbsp;商品列表&nbsp;&nbsp;|&nbsp;&nbsp;购物车&nbsp;&nbsp;|&nbsp;&nbsp;个人中心</div>
                    <div class="logo">
                      <img v-if="logo.length > 0 && logo[0]" :src="getLogoUrl()">
                      <img v-else src="images/zhiying_logo.png"/>
                    </div>
                      <!--<span>智应</span>-->
                    <div class="text" v-if="formField.copyright_text">
                      {{formField.copyright_text}}
                    </div>
                  </div>
                  <div v-if="formField.copyright_style == 2" class="style2">
                    <div class="nav">店铺主页&nbsp;&nbsp;|&nbsp;&nbsp;商品列表&nbsp;&nbsp;|&nbsp;&nbsp;购物车&nbsp;&nbsp;|&nbsp;&nbsp;个人中心</div>
                    <div class="foot">
                      <div class="logo">
                        <img v-if="logo.length > 0 && logo[0]" :src="getLogoUrl()">
                        <img v-else src="images/zhiying_logo.png"/>
                      </div>
                      <!--<span>智应</span>-->
                      <div class="text" v-if="formField.copyright_text">
                        {{formField.copyright_text}}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="right">
              <div class="form-styleselect">
                <div class="form-styleselect-title">样式选择</div>
                <div
                    @click="formField.copyright_style = item.layout"
                    :class="['layout-item', formField.copyright_style == item.layout ? 'active' : '']"
                    v-for="(item, index) in layouts"
                    :key="index"
                >
                  <div class="img">
                    <img :src="item.image" />
                  </div>
                  <div class="text">{{ item.name }}</div>
                </div>
              </div>
              <div class="form-styleselect" v-if="hasLicensePerm('ENABLE_CUSTOM_COPYRIGHT')">
                <div class="form-styleselect-title">版权内容</div>
                <Input
                    v-model="formField.copyright_text"
                    class="common-input-text-310"
                    placeholder="请输入版权内容"
                    :maxlength="20"
                >
                <span slot="suffix"
                >{{ formField.copyright_text ? formField.copyright_text.length : 0 }}/20</span
                >
                </Input>
              </div>
              <div class="form-styleselect">
                <div class="form-styleselect-title">Logo</div>
                <show-big-img-upload
                    ref="show-big-img-upload"
                    imgSize="80px"
                    :InitImgURLs="formField.copyright_logo"
                    v-model="logo"
                ></show-big-img-upload>
                <div class="form-styleselect-tip">*建议上传大小为：180*48，png格式！</div>
              </div>
            </div>
          </switch-titlebar>
        </Form>
      </div>
      <div class="footer">
        <Button
            shape="circle"
            class="save"
            type="primary"
            @click="submit"
            :loading="loading"
            perm="copyright.config.operate"
        >保存
        </Button>
      </div>
    </div>
  </div>
</template>
<script>
import footButton from "COMPONENTS/button/foot-button.vue";
import switchTitlebar from "COMPONENTS/titlebar/switch-titlebar";
import thirdMenu from "@/views/shop/menu/third-menu.vue";
import thirdMenuData from "./components/third-menu-for-setting-mall";
import alertWarning from "@/views/shop/components/alert/alert-warning.vue"
import showBigImgUpload from "COMPONENTS/image-select/show-big-img-upload.vue";
export default {
  components:{
    switchTitlebar,
    thirdMenu,
	alertWarning,
    footButton,
	showBigImgUpload
  },
  data(){
    return{
      thirdMenu:[],
      loading: false,
      formField:{
        copyright_status: 0,
        copyright_style: 1,
        copyright_logo: "",
		    copyright_text: "智应提供技术支持"
      },
      layouts: [
        { layout: 1, name: "样式一", image: "images/setting/card.png" },
        { layout: 2, name: "样式二", image: "images/setting/list.png" }
      ],
	    logo: [],
      rules:{
		//copyright_text:[{required:true,type:"string",message:"版权内容不能为空",trigger:"blur"}],
        //copyright_logo:[{required:true,type:"string",message:"logo不能为空",trigger:"blur"}]
      }
    }
  },
  created(){
    this.thirdMenu = thirdMenuData.getThirdMenu();
    this.$httpGet("/shop/admin/config/info", null, res => {
      if (res.code == 200) {
        let data = res.data;
        this.formField.copyright_status = data.copyright.status;
        this.formField.copyright_style = data.copyright.style;
        this.formField.copyright_logo = data.copyright.logo;
        if (this.formField.copyright_logo == "null") {
          this.formField.copyright_logo = "";
        }
        this.formField.copyright_text = data.copyright.text?data.copyright.text!="null"?data.copyright.text:"":"";
        this.logo = this.formField.copyright_logo ? [this.formField.copyright_logo] : [];
      } else {
        this.$Message.error(res.msg)
      }
    });
  },
  methods:{
	  getLogoUrl(){
		  if(typeof this.logo[0] == "object")
			return URL.createObjectURL(this.logo[0]);
			else return this.logo[0];
	  },
    changeOpenWxOnlinePay(status) {
      this.formField.copyright_status = status;
    },
    submit(){
      this.saveSetting();
      // if(this.formField.copyright_status){
      //   this.$refs.form.validate(valid=>{
      //     if(valid){
      //       this.saveSetting();
      //     }else{
      //       this.$Message.error("保存失败")
      //     }
      //   })
      // }else{
      //   this.saveSetting();
      // }
    },
    saveSetting(){
      this.loading = true;
      let formData = new FormData();
      for (let key in this.formField) {
        if (key.indexOf("logo") > -1) {
          formData.append(key, this.logo[0]);
        } else {
          formData.append(key, this.formField[key]);
        }
      }
      this.$httpUpload("/shop/admin/config/save", formData, res => {
        this.loading = false;
        if (res.code == 200) {
          this.$Message.success("保存成功");
        } else {
          this.$Message.error(res.msg);
        }
      });
    }
  }
}
</script>
<style lang="less" scoped>
.content{
  height:calc(100vh - 120px);
  overflow:auto;
  padding:24px;
  /deep/.ivu-form-item{
    margin-bottom:20px;
  }
  /deep/.vertical-line-titlebar-wrapper{
    margin-bottom:24px;
  }
  /deep/.ivu-input-number{
    margin-right:7px;
  }
  /deep/.more-message{
    margin-left:5px;
    vertical-align: 1px;
  }
	/deep/.switch-titlebar-content{
		border-left: unset !important;
		border-right: unset !important;
		border-bottom: unset !important;
    padding-top: 20px !important;
		.ivu-form-item{
			color: #464C5B !important;
			.ivu-form-item-content{
				div>label{
					margin-right: 20px;
					&>span{
						margin-right: 5px;
					}
				}
			}
		}
	}
	/deep/.switch-titlebar-content{
		display: flex;
		.left {
			width: 373px;
      margin-right: 31px;
      border: 1px solid #DCDEE2;
      .left-top{
        .left-top-header{
          width: 100%;
          height: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 3px;
        }
        .left-top-title{
          color: #464C5B;
          font-size: 15px;
          text-align: center;
          height: 52px;
          line-height: 52px;
        }
      }
			.pagecontainer {
				/*width: 373px;*/
				height: 505px;
				background: #F9F9F9;
				position: relative;
				.copyright-demo {
					width: 100%;
					position: absolute;
					bottom: 0;
					color: #666;
					text-align:center;
          /*height: 136px;*/
          padding: 20px 0;
					.style1 {
						width: 100%;
            line-height: normal;
						.nav {
							width: 100%;
              font-size: 12px;
              color: #C5C5C5;
              margin-bottom: 25px;
						}
						.logo {
							width: 100%;
							margin: 0 auto 4px;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 24px;
              img {
                height: 24px;
              }
              span{
                font-size: 16px;
                color: #CCCCCC;
                font-weight: Bold;
              }
						}
						.text {
							width: 100%;
              font-size: 12px;
              color: #C5C5C5;
						}
					}
					.style2 {
            .nav {
              width: 100%;
              font-size: 12px;
              color: #C5C5C5;
            }
            .foot{
              width: 100%;
              display: flex;
              justify-content: center;
              align-items: center;
              margin-top: 25px;
              .logo {
                display: flex;
                align-items: center;
                height: 24px;
                img {
                  height: 24px;
                }
                span{
                  font-size: 16px;
                  color: #CCCCCC;
                  font-weight: Bold;
                }
              }
              .text {
                padding: 0 10px;
                font-size: 12px;
                color: #C5C5C5;
              }
            }
					}
				}
			}
		}
		.right {
      width: 490px;
      background-color: #F9FBFD;
      border: 1px solid #E5E5E5;
      padding: 20px 18px;
      /*display: table-footer-group;*/
      margin-left: 10px;
      position: relative;
      height: 545px;
      &:after{
        content:"";
        position: absolute;
        left: -6px;
        bottom: 20px;
        padding: 5px;
        background-color: #F9FBFD;
        border-left: 1px solid #E5E5E5;
        border-top: 1px solid #E5E5E5;
        transform: rotate(315deg);
      }
      .form-styleselect{
        margin-bottom: 30px;
        .form-styleselect-title{
          font-size: 13px;
          color: #657180;
          margin-bottom: 20px;
        }
        .ivu-input-wrapper{
          .ivu-input-suffix{
            color: #CCCCCC;
            line-height: 32px;
          }
        }
        .form-styleselect-tip{
          font-size: 12px;
          color: #9EA4B1;
          margin-top: 10px;
        }
        .layout-item {
          cursor: pointer;
          width: 147px;
          height: 100px;
          display: inline-block;
          position: relative;
          background-color: #fff;
          &:nth-child(2n + 1) {
            margin-left: 6px;
          }
          &.active {
            border: solid 1px #fd8b26;
            &::after {
              content: "";
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background-image: url(../../../../public/images/xuanzhong.png);
              background-position: top right;
              background-repeat: no-repeat;
              z-index: 99;
            }
            .text {
              color: #FD8A29;
            }
          }
          .img {
            position: relative;
            padding: 5px 10px;
            height: 68px;
            img {
              width: 100%;
              height: 100%;
            }
          }
          .text {
            text-align: center;
            font-size: 13px;
            color: #464C5B;
          }
        }
      }
		}
	}
}
.footer{
  height: 50px;
  line-height: 50px;
  text-align: center;
  border-top: 1px solid #eee;
  background: white;
  /deep/.ivu-btn-primary{
    width:70px;
    height:32px;
  }
}
</style>
