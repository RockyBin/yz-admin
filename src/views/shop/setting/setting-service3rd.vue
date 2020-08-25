<template>
  <div>
    <thirdMenu :list="thirdMenu"/>
    <div class="wrapper">
      <div class="content">
        <Form ref="form" :model="formField" :rules="rules" :label-width="100">
		    <alert-warning>
              <p>把从第三方获取到的整段【客服】代码完整粘贴在下方代码框，保存后系统自动完成代码接入，具体的操作可结合第三方客服完成。<a href='http://help.wfenxian.com/NewsDetail/1892548.html' target="_blank">【操作指引】</a> </p>
			  <p>例如【腾讯云智服】，可到腾讯云智服官网获取代码并设置相关的前台展示页面。</p>
			  <p style="color: #ED4014">目前仅支持接入【腾讯云智服】，<a href='https://yzf.qq.com/' target="_blank">点击这里浏览腾讯云智服官网</a></p>
            </alert-warning>
          <switch-titlebar style="margin-bottom: 20px;margin-top: 20px;" v-model="formField.service3rd_status" title="是否开启第三方客服功能" hasBorder >
			<FormItem label="第三方代码：" prop="service3rd_code" class="form-code">
			  <Input
                  v-model="formField.service3rd_code"
                  type="textarea"
				  class="code"
                  :maxlength="4000"
				  :rows=10
                  placeholder="请输入第三方客服代码"
                />
			</FormItem>
			<FormItem label="选择接入页面：">
			  <CheckboxGroup v-model="formField.service3rd_pages">
				<Checkbox label="index">首页</Checkbox>
				<Checkbox label="productDetail">商品详情</Checkbox>
				<Checkbox label="memberCenter">会员中心</Checkbox>
			  </CheckboxGroup>
			</FormItem>
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
			  perm="site.config.operate"
		  >保存</Button>
	  </div>
    </div>
  </div>
</template>
<script>
import axios from "axios";
import footButton from "COMPONENTS/button/foot-button.vue";
import switchTitlebar from "COMPONENTS/titlebar/switch-titlebar";
import thirdMenu from "@/views/shop/menu/third-menu.vue";
import thirdMenuData from "./components/third-menu-for-setting-mall";
import alertWarning from "@/views/shop/components/alert/alert-warning.vue"
export default {
  components:{
    switchTitlebar,
    thirdMenu,
	alertWarning,
      footButton
  },
  data(){
    return{
      thirdMenu:[],
      loading: false,
      formField:{
        service3rd_status:0,
        service3rd_code:"",
        service3rd_pages:['index','productDetail','memberCenter']
      },
      rules:{
        service3rd_code:[{required:true,type:"string",message:"第三方客服代码不能为空",trigger:"blur"}]
      }
    }
  },
  created(){
    this.thirdMenu = thirdMenuData.getThirdMenu();
    this.$httpGet("/shop/admin/config/info", null, res => {
      if(res.code==200){
        let data = res.data;
        this.formField.service3rd_status = data.service3rd_status;
        this.formField.service3rd_code = data.service3rd_code;
		this.formField.service3rd_pages = data.service3rd_pages ? JSON.parse(data.service3rd_pages) : ['index','productDetail','memberCenter'];
      }else{
        this.$Message.error(res.msg)
      }
    });
  },
  methods:{
    submit(){
      if(this.formField.service3rd_status){
        this.$refs.form.validate(valid=>{
          if(valid){
            this.saveSetting();
          }else{
            this.$Message.error("保存失败")
          }
        })
      }else{
        this.saveSetting();
      }
    },
    saveSetting(){
      this.loading = true;
      axios.post("/shop/admin/config/save",{
        service3rd_status:this.formField.service3rd_status,
        service3rd_code:this.formField.service3rd_code,
        service3rd_pages: JSON.stringify(this.formField.service3rd_pages)
      }).then(res=>{
        this.loading = false;
        if(res.code === 200){
          this.$Message.success(res.msg)
        }else{
          this.$Message.error(res.msg)
        }
      }).catch(err=>{
        this.$Message.error(err)
      })
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
  /deep/.ivu-form-item-error-tip{
	left: 0px;
  }
	/deep/.switch-titlebar-content{
		border-left: unset !important;
		border-right: unset !important;
		border-bottom: unset !important;
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
  /deep/.form-code {
	  .ivu-form-item-label{
		  width: 98px !important;
	  }
	  .ivu-form-item-content{
		  margin-left: 98px !important;
		  .code>textarea{
			  width: 490px;
			  height: 120px;
		  }
	  }
	.ivu-form-item-error-tip{
		position: static;
		margin-top: 5px;
	  }
	  .code {
		width: 600px;
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
