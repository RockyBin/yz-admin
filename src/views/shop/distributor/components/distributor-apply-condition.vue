<template>
<div>
  <Modal v-model="isShow" title="成为分销商详情" :width="600" class="distributor-apply-condition">
    <div class="wrapper" v-if="info">
      <div class="title">申请分销商的审核情况</div>
      <div class="flex">
        <div class="user">
          <img :src="info.member_info.headurl||'images/head-portrait.png'" alt=""><br>
          <div style="display: inline-block;text-align: left;max-width: 100%;">
            <member-infor 
              :id="info.member_info.id"
              :nickname="info.member_info.nickname"
              :mobile="info.member_info.mobile"
              :name="info.member_info.name ||'--'"
            ></member-infor>
          </div>
        </div>
        <div class="info">
          <distributorVerifyConditionUpgrade v-if="info.auto_upgrade_data" :info="info"></distributorVerifyConditionUpgrade>
          <distributorVerifyCondition0 v-if="!info.auto_upgrade_data && !info.condition" :info="info"></distributorVerifyCondition0>
          <distributorVerifyCondition1 v-if="!info.auto_upgrade_data && info.condition==1" :info="info"></distributorVerifyCondition1>
          <distributorVerifyCondition2 v-if="!info.auto_upgrade_data && info.condition==2" :info="info"></distributorVerifyCondition2>
          <distributorVerifyCondition3 v-if="!info.auto_upgrade_data && info.condition==3" :info="info"></distributorVerifyCondition3>
          <distributorVerifyCondition4 v-if="!info.auto_upgrade_data && info.condition==4" :info="info"></distributorVerifyCondition4>
          <distributorVerifyCondition5 v-if="!info.auto_upgrade_data && info.condition==5" :info="info"></distributorVerifyCondition5>
        </div>
      </div>
    </div>
  </Modal>
</div>
</template>
<script>
import distributorVerifyCondition0 from './distributor-verify-condition0'
import distributorVerifyCondition1 from './distributor-verify-condition1'
import distributorVerifyCondition2 from './distributor-verify-condition2'
import distributorVerifyCondition3 from './distributor-verify-condition3'
import distributorVerifyCondition5 from './distributor-verify-condition5'
import distributorVerifyCondition4 from './distributor-verify-condition4'
import distributorVerifyConditionUpgrade from './distributor-verify-condition-upgrade'
import memberInfor from "@/views/shop/components/table/member-infor.vue";
export default {
  components:{
    distributorVerifyCondition0,
    distributorVerifyCondition1,
    distributorVerifyCondition2,
    distributorVerifyCondition3,
    distributorVerifyCondition4,
    distributorVerifyCondition5,
    distributorVerifyConditionUpgrade,
    memberInfor
  },
  props:["value","info"],
  data(){
    return {
      isShow:false,
    }
  },
  watch:{
    value(val){
      this.isShow=val;
    },
    isShow(val){
      this.$emit('input',val)
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
  }
}
</script>
<style lang="less" scoped>
  .distributor-apply-condition{
    /deep/.ivu-modal-body{
      padding:24px;
      max-height:490px;
      overflow:auto;
    }
    /deep/.ivu-modal-footer{
      .ivu-btn-text{
        display:none;
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
        padding:16px;
        .user{
          width:40%;
          text-align:center;
          margin-right: 16px;
          img{
            width:48px;
            height:48px;
            object-fit:cover;
            border-radius:5px;
            margin-bottom:16px;
          }
          p {
            text-align: left;
            padding-left: 50px;
          }
        }
        .info{
          flex:1
        }
      }
    }
  }
</style>