<template>
  <div>
    <Modal v-model="isShow"
           title="审核"
           :width="600"
           class="areagent-verify-modal"
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
        <div class="title">申请区域代理的审核情况</div>
        <div class="flex">
          <div class="user">
            <img :src="padImgPath(info.headurl)||'images/head-portrait.png'" alt="">
            <div>
              <div style="display: inline-block;text-align: left;max-width: 100%;">
                <member-infor
                    :id="info.member_id"
                    :nickname="info.nickname"
                    :mobile="info.member_mobile||'--'"
                    :name="info.name || '--'"
                ></member-infor>
              </div>
            </div>
          </div>
          <div class="info">
            <div class="item">
              <div class="key">申请级别：<span style="color: #FE3737;">{{info.apply_area_type==10?"省代":info.apply_area_type==9?"市代":info.apply_area_type==8?"区代":""}}</span></div>
            </div>
            <div class="item">
              <div class="key">申请区域：{{info.apply_prov_text}}{{info.apply_city_text?"-"+info.apply_city_text:""}}{{info.apply_district_text?"-"+info.apply_district_text:""}}</div>
            </div>
            <div class="item">
              <div class="key">申请区代时间：{{info.created_at}}</div>
            </div>
            <div class="item">
              <div class="key" v-if="info.apply_type">申请条件：无条件</div>
              <div class="key" v-if="!info.apply_type&&applyEaxist">
                <span>申请条件：</span>
                <span style="max-width: calc(100% - 84px);display: inline-block;vertical-align: top;">
                    <span v-if="info.apply_condition.apply_setting.become_desc.or.length">【</span>
                    <template v-for="(item, index) in info.apply_condition.apply_setting.become_desc.or">
                      <span
                          v-if="index !== 0"
                          :key="'ort' + index"
                          style="margin: 0 9px;color: #4A6AF5;"
                      >或</span>
                      <span :key="'or' + index">{{item}}</span>
                    </template>
                    <span v-if="info.apply_condition.apply_setting.become_desc.or.length">】</span>
                    <template v-for="(item, index) in info.apply_condition.apply_setting.become_desc.and">
                      <span
                          :key="'andt' + index"
                          v-if="index !== 0 || info.apply_condition.apply_setting.become_desc.or.length"
                          style="margin: 0 9px;color: #4A6AF5;"
                      >与</span>
                      <span :key="'and' + index">【{{item}}】</span>
                    </template>
                  </span>
              </div>
            </div>
            <div class="item" v-if="!info.apply_type">
              <div class="key">申请表单：提交申请资料</div>
            </div>
            <div class="item" v-if="!info.apply_type">
              <div class="key">提交资料：类型-{{info.business_type ? "企业" : "个人"}}</div>
            </div>
            <div class="item" v-for="(item,index) in applyData">
              <div class="key" :key="index" v-if="applyShowParams(index)">
                <span>{{item}}：</span>
                <span
                    class="agent-verify-audit-modal-info-apply-img"
                    v-if="['idcard_file', 'business_license_file'].includes(index)"
                    @click="(imageViewSrc = info[index]) && (imageViewStatus = true)"
                >
                    &nbsp;
                    <img :src="getHeadImg(info[index])" />
                    <span>
                      <i data-v-4e63a2bc class="ivu-icon ivu-icon-ios-eye-outline"></i>
                    </span>
                  </span>
                <!-- 性别 -->
                <span v-else-if="index === 'sex'">{{["保密", "男", "女"][info[index]]}}</span>
                <!-- 地址 -->
                <template v-else-if="index === 'address'">
                    <span
                        style="max-width: calc(100% - 72px);display: inline-block;"
                    >{{info.contact_prov_text}}{{info.contact_city_text}}{{info.contact_area_text}}</span>
                  <div style="margin-top: 15px;">
                    <span>详细地址：</span>
                    <span>{{info[index]}}</span>
                  </div>
                </template>
                <!-- 其他 -->
                <span v-else>{{info[index]}}</span>
              </div>
            </div>
            <div class="item" v-if="info.extend_fields">
              <div v-for="(item,index) in info.extend_fields">
                <p class="key" :key="index" v-if="item.value">
                  <span>{{item.name}}：{{item.value}}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div slot="footer" style="text-align:right">
        <Button type="text" @click="isShow=false">取消</Button>
        <Button type="primary" @click="verifyDistributor">确定</Button>
      </div>
    </Modal>
    <Modal fullscreen v-model="imageViewStatus" footer-hide>
      <img
          style="display: block;position: absolute;top: 0;left: 0;right: 0;bottom: 0;margin: auto;max-width: calc(100vw - 48px);max-height: calc(100vh - 48px);"
          :src="getHeadImg(imageViewSrc)"
          v-if="imageViewSrc"
          alt
      />
    </Modal>
  </div>
</template>
<script>
  import memberInfor from "@/views/shop/components/table/member-infor.vue";
  const applyData = {
    company: "公司名称",
    business_license: "营业执照号",
    business_license_file: "上传营业执照",
    idcard: "身份证号",
    idcard_file: "上传身份证",
    applicant: "申请人",
    mobile: "手机号码",
    sex: "性别",
    address: "地址信息",
    remark: "备注"
  };
  export default {
    props:["value","info"],
    components: {
      memberInfor
    },
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
        applyData,
        imageViewSrc:'',
        imageViewStatus: false,
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
    computed:{
      /**
       * 申请部分需要显示的字段
       */
      applyShowParams() {
        return key => {
          return (
            this.info &&
            (this.info.business_type ||
              !["company", "business_license", "business_license_file"].includes(
                key
              )) &&
            this.info[key]
          );
        };
      },
      applyEaxist() {
        if (this.info.apply_condition&&this.info.apply_condition.apply_setting.become_desc) {
          return this.info.apply_condition.apply_setting.become_desc.or.length||this.info.apply_condition.apply_setting.become_desc.and.length;
        }else{
          return false;
        }
      }
    },
    methods:{
      getHeadImg(url) {
        if (!/^(http)/i.test(url)) {
          url = this.$store.state.siteComdataPath + url;
        }
        return url;
      },
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
              apply_id: [this.info.apply_id],
              status: this.formFields.verifyPass
            };
            if (this.formFields.verifyPass === -1) {
              data.reject_reason = this.formFields.reason;
            }
            this.$httpGet(
              "/shop/admin/area/agent/apply/verify",
              data,
              res => {
                if (res.code === 200) {
                  this.isShow = false;
                  this.$Message.success("审核成功！");
                  this.$parent.getAreagentList();
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
  .areagent-verify-modal{
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
    /deep/.wrapper{
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
        padding:20px 0;
        .user{
          width:200px;
          text-align:center;
          padding: 0 15px 0 20px;
          img{
            width:48px;
            height:48px;
            object-fit:cover;
            border-radius:5px;
            margin-bottom:8px;
          }
          &>div{
            text-align: left;
          }
          // p:not(:last-child){
          //   margin-bottom:5px;
          // }
        }
        .info{
          flex:1;
          margin-right: 20px;
          .item{
            /*margin-top: 15px;*/
            .key{
              margin-top: 15px;
              .agent-verify-audit-modal-info-apply-img {
                position: relative;
                img {
                  position: absolute;
                  top: 50%;
                  left: 0;
                  transform: translateY(-50%);
                  width: 42px;
                  height: 26px;
                  cursor: pointer;
                }
                span {
                  max-width: initial;
                  position: absolute;
                  width: 42px;
                  height: 26px;
                  top: 50%;
                  left: 0;
                  transform: translateY(-50%);
                  display: none;
                  text-align: center;
                  cursor: pointer;
                  background-color: rgba(0, 0, 0, 0.5);
                  i {
                    position: absolute;
                    left: 0;
                    right: 0;
                    top: 0;
                    bottom: 0;
                    margin: auto;
                    width: 20px;
                    height: 20px;
                    font-size: 20px;
                    color: #fff;
                  }
                }
                &:hover {
                  span {
                    display: block;
                  }
                }
              }
            }
          }
          &>div:first-child{
            .key{
              margin-top: 0;
            }
          }
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