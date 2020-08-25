<template>
<div>
  <div class="item"><div class="key">申请分销商时间：</div><div class="value">{{info.created_at}}</div></div>
  <div class="item"><div class="key">申请条件：</div><div class="value">提交申请资料</div></div>
  <div class="item"><div class="key">提交资料如下：</div><div class="value"></div></div>
  <div class="item"><div class="key">类型：</div><div class="value">{{["个人","企业"][info.business_type]}}</div></div>
  <div class="item" v-if="info.company"><div class="key">公司名称：</div><div class="value">{{info.company}}</div></div>
  <div class="item" v-if="info.business_license"><div class="key">营业执照号：</div><div class="value">{{info.business_license}}</div></div>
  <div class="item" v-if="info.business_license_file">
    <div class="key">营业执照：</div>
    <div class="value license">
      <div class="mask" @click="showBigImg(info.business_license_file)">
        <Icon type="ios-eye-outline" color="white" size="20"></Icon>
      </div>
      <img :src="$store.state.siteComdataPath+info.business_license_file" alt="">
    </div>
  </div>
  <div class="item" v-if="info.idcard"><div class="key">身份证号：</div><div class="value">{{info.idcard}}</div></div>
  <div class="item" v-if="info.idcard_file">
    <div class="key">身份证：</div>
    <div class="value idcard">
      <div class="mask" @click="showBigImg(info.idcard_file)">
        <Icon type="ios-eye-outline" color="white" size="20"></Icon>
      </div>
      <img :src="$store.state.siteComdataPath+info.idcard_file" alt="">
    </div>
  </div>
  <div class="item" v-if="info.applicant"><div class="key">申请人：</div><div class="value">{{info.applicant}}</div></div>
  <div class="item" v-if="info.mobile"><div class="key">手机号：</div><div class="value">{{info.mobile}}</div></div>
  <div class="item" v-if="info.sex>-1"><div class="key">性别：</div><div class="value">{{["保密","男","女"][info.sex]}}</div></div>
  <div class="item" v-if="info.prov||info.city||info.area"><div class="key">地址信息：</div><div class="value">{{info.prov}},{{info.city}},{{info.area}}</div></div>
  <div class="item address" v-if="info.address"><div class="key">详细地址：</div><div class="value">{{info.address}}</div></div>
  <div class="item" v-if="info.remark"><div class="key">备注：</div><div class="value">{{info.remark}}</div></div>
  <div class="item" v-for="field in info.extend_fields" :key="field.name"><div class="key">{{field.name}}：</div><div class="value">{{field.value}}</div></div>
  <Modal class="big-img-modal" v-model="isShowBigImg" fullscreen footer-hide>
    <img v-if="currentImage" :src="$store.state.siteComdataPath+currentImage" alt/>
  </Modal>
</div>
</template>
<script>
export default {
  props:["info"],
  data(){
    return{
      isShowBigImg:false,
      currentImage:""
    }
  },
  methods:{
    showBigImg(image){
      this.currentImage=image;
      this.isShowBigImg=true;
    }
  }
}
</script>
<style lang="less" scoped>
  .item{
    display:flex;
    .key{
      flex-shrink:0;
    }
    .value{
      line-height:1.5;
    }
    .license{
      position:absolute;
      margin-top:-5px;
      margin-left:60px;
      .mask{
        cursor:pointer;
        display:none;
        position:absolute;
        width:44px;
        height:31px;
        line-height:30px;
        text-align:center;
        background:rgba(0,0,0,0.5)
      }
      &:hover{
        .mask{
          display:block;
        }
      }
      img{
        width:44px;
        height:31px;
        object-fit:contain;
      }
    }
    .idcard{
      position:absolute;
      margin-top:-3px;
      margin-left:48px;
      .mask{
        cursor:pointer;
        display:none;
        position:absolute;
        width:42px;
        height:26px;
        line-height:20px;
        text-align:center;
        background:rgba(0,0,0,0.5)
      }
      &:hover{
        .mask{
          display:block;
        }
      }
      img{
        width:42px;
        height:26px;
        object-fit:contain;
      }
    }
    
    &:not(:last-child){
      margin-bottom:15px;
    }
  }
</style>
<style lang="less">
.big-img-modal {
  .ivu-modal-content {
    background: black;
    .ivu-modal-body {
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
  .ivu-icon-ios-close:hover {
    color: white;
  }
}
</style>