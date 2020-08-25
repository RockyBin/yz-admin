<template>
<div>
  <Modal v-model="isShow"
    title="审核"
    :width="600"
    class="distributor-verify-modal"
  >
    <Form ref="form" :model="formFields" :rules="rules" :label-width="88" style="margin-bottom: 24px;">
      <FormItem label="审核：">
        <RadioGroup v-model="formFields.verifyPass" >
          <Radio :label="1">通过</Radio>
          <Radio :label="-1">拒绝</Radio>
        </RadioGroup>
      </FormItem>
      <FormItem v-show="formFields.verifyPass==-1" prop="reason" label="拒绝原因：">
        <div class="relative">
          <Input type="textarea" v-model="formFields.reason" :maxlength="20" placeholder="请输入拒绝原因"/>
          <span class="suffix">{{formFields.reason.length}}/20</span>
        </div>
      </FormItem>
    </Form>
    <div class="wrapper" v-if="info">
      <div class="title">申请分销商的审核情况</div>
      <div class="flex">
        <div class="user">
          <img :src="info.member_info.headurl||'images/head-portrait.png'" alt="">
          <div>
            <div style="display: inline-block;text-align: left;max-width: 100%;">
              <member-infor
                :id="info.member_info.id"
                :nickname="info.member_info.nickname"
                :mobile="info.member_info.mobile"
                :name="info.member_info.name ||'--'"
              ></member-infor>
            </div>
          </div>
        </div>
        <div class="info">
          <distributorVerifyCondition0 v-if="!info.condition" :info="info"></distributorVerifyCondition0>
          <distributorVerifyCondition1 v-if="info.condition==1" :info="info"></distributorVerifyCondition1>
          <distributorVerifyCondition2 v-if="info.condition==2" :info="info"></distributorVerifyCondition2>
          <distributorVerifyCondition3 v-if="info.condition==3" :info="info"></distributorVerifyCondition3>
          <distributorVerifyCondition4 v-if="info.condition==4" :info="info"></distributorVerifyCondition4>
          <distributorVerifyCondition5 v-if="info.condition==5" :info="info"></distributorVerifyCondition5>
        </div>
      </div>
    </div>
    <div slot="footer" style="text-align:right">
      <Button type="text" @click="isShow=false">取消</Button>
      <Button type="primary" @click="verifyDistributor">确定</Button>
    </div>
  </Modal>
</div>
</template>
<script>
import distributorVerifyCondition0 from './distributor-verify-condition0'
import distributorVerifyCondition1 from './distributor-verify-condition1'
import distributorVerifyCondition2 from './distributor-verify-condition2'
import distributorVerifyCondition3 from './distributor-verify-condition3'
import distributorVerifyCondition4 from './distributor-verify-condition4'
import distributorVerifyCondition5 from './distributor-verify-condition5'
import memberInfor from "@/views/shop/components/table/member-infor.vue";
export default {
  components:{
    distributorVerifyCondition0,
    distributorVerifyCondition1,
    distributorVerifyCondition2,
    distributorVerifyCondition3,
    distributorVerifyCondition4,
    distributorVerifyCondition5,
    memberInfor
  },
  props:["value","info"],
  data(){
    const validator=(rule,value,callback)=>{
      if(this.formFields.verifyPass==-1&&value.trim()==""){
        callback("请输入拒绝原因")
      }else{
        callback();
        
      }
    }
    return {
      isShow:false,
      formFields:{
        verifyPass:1,//1代表通过，-1代表不通过
        reason:""
      },
      rules:{
        reason:[{required:true,validator,trigger:"blur"}]
      },
    }
  },
  watch:{
    value(val){
      this.isShow=val;
    },
    isShow(val){
      this.$emit('input',val);
      this.$refs.form.resetFields();
      this.formFields.verifyPass=1;
      this.formFields.reason='';
    }
  },
  methods:{
    padImgPath(url) {
      if(!url){
        return 'images/head-portrait.png';
      }
      if (!/^(http)/i.test(url)) {
        return this.$store.state.siteComdataPath + url;
      }
      return url;
    },
    /**
     * 审核数据操作
     */
    verifyDistributor() {
      this.$refs.form.validate(valid=>{
        if(valid){
          let data = {
            ids: [this.info.member_info.id],
            status: this.formFields.verifyPass
          };
          if (this.formFields.verifyPass === -1) {
            data.reject_reason = this.formFields.reason;
          }
          this.$httpGet(
            "/shop/admin/distribution/distributor/review",
            data,
            res => {
              if (res.code === 200) {
                this.isShow = false;
                this.$Message.success("审核成功！");
                this.$parent.getDistributorList();
              } else {
                this.$Message.error(res.msg);
              }
            }
          );
        }else{
          this.$Message.error("审核失败")
        }
      })
      
    }
  }
}
</script>
<style lang="less" scoped>
  .distributor-verify-modal{
    /deep/.ivu-radio-group {
      vertical-align: baseline;
      .ivu-radio-wrapper{
        margin-right:20px;
        vertical-align: baseline;
      }
    }
    
    .relative{
      position:relative;
      display:inline-block;
      .suffix{
        position:absolute;
        bottom:10px;
        right:10px;
        font-size:12px;
        line-height:1;
        color:#9ea4b1;
      }
    }
    .wrapper{
      position:relative;
      font-size:12px;
      border-radius:5px;
      background:#F5F6F7;
      .title{
        position:relative;
        font-size:13px;
        font-weight:bold;
        height:44px;
        line-height:44px;
        padding-left:23px;
        border-bottom:1px solid #E5E5E5;
        &::before{
          position:absolute;
          content:"";
          left:12px;
          top:14px;
          width:3px;
          height:16px;
          background:#4A6AF5;
        }
      }
      .flex{
        display:flex;
        line-height:1.5;
        padding:20px 14px;
        .user{
          width:200px;
          text-align:center;
          img{
            width:48px;
            height:48px;
            object-fit:cover;
            border-radius:5px;
            margin-bottom:16px;
          }
          // p:not(:last-child){
          //   margin-bottom:5px;
          // }
        }
        .info{
          flex:1;
          margin-left:14px;
        }
      }
    }
    /deep/.ivu-modal-body{
      padding:20px 24px 30px;
      max-height:490px;
      overflow:auto;
    }
    /deep/.ivu-input-wrapper{
      width:250px;
      height:50px;
      textarea{
        height: 100%;
        resize:none;
      }
    }
  }
</style>