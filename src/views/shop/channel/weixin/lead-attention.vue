<template>
  <div class="weixin">
    <third-menu :list="thirdMenu" />
    <div class="main-content">
      <blank v-show="loaded" v-if="!isBound" msg="绑定公众号后，即可使用自定义菜单功能" />
      <Form
          ref="formValidateBase"
          :model="formValidate"
          :label-width="140"
          v-if="isBound"
          class="form-full-wrapper"
      >
        <div class="attention">
          <switch-titlebar
              style="margin-bottom: 20px;"
              :true-value="1"
              :false-value="0"
              v-model="formValidate.home_page_bar"
              hasBorder
              title="【首页】展示推荐人信息+关注公众号"
              @on-change="changeOpenWxOnlinePay"
          >
            <div class="attention-content">
              <span>* 开启后，当检测到用户还没有关注公众号时，首页将显示推荐人信息，提醒对方关注公众号</span>
              <a href="#" @click="showModalClick(0)">示例</a>
            </div>
          </switch-titlebar>
        </div>
        <div class="attention">
          <switch-titlebar
              style="margin-bottom: 20px;"
              :true-value="1"
              :false-value="0"
              v-model="formValidate.home_page_button"
              hasBorder
              title="【首页】展示关注公众号按钮"
              @on-change="changeOpenWxOnlinePay"
          >
            <FormItem label="按钮默认展示位置：" class="form-height">
              <div class="distributor-setting-item">
                <RadioGroup v-model.trim="formValidate.home_page_button_pos">
                  <Radio :label="0">页面左下方</Radio>
                  <Radio :label="1">页面右下方</Radio>
                </RadioGroup>
              </div>
            </FormItem>
            <div class="attention-content">
              <span>* 开启后，当检测到用户还没有关注公众号时，首页将出现关注公众号按钮，提示对方关注公众号</span>
              <a href="#" @click="showModalClick(1)">示例</a>
            </div>
          </switch-titlebar>
        </div>
        <div class="attention">
          <switch-titlebar
              style="margin-bottom: 20px;"
              :true-value="1"
              :false-value="0"
              v-model="formValidate.member_center"
              hasBorder
              title="【个人中心】展示关注公众号订阅信息"
              @on-change="changeOpenWxOnlinePay"
          >
            <div class="attention-content">
              <span>* 开启后，个人中心页面将出现订阅公众号提示和按钮，提示对方关注公众号</span>
              <a href="#" @click="showModalClick(3)">示例</a>
            </div>
          </switch-titlebar>
        </div>
        <div class="attention">
          <switch-titlebar
              style="margin-bottom: 20px;"
              :true-value="1"
              :false-value="0"
              v-model="formValidate.pay_success"
              hasBorder
              title="【下单成功】展示关注公众号弹窗"
              @on-change="changeOpenWxOnlinePay"
          >
            <div class="attention-content">
              <span>* 开启后，当检测到用户还没有关注公众号时，下单付款完成后，页面出现关注公众号弹窗，提示对方关注公众号</span>
              <a href="#" @click="showModalClick(4)">示例</a>
            </div>
          </switch-titlebar>
        </div>
      </Form>
      <div class="footer" v-if="isBound">
        <Button
            shape="circle"
            class="save"
            type="primary"
            @click="saveMenu"
            :loading="loading"
            perm="pay.config.operate"
        >保存</Button>
      </div>
    </div>
    <Modal
        v-model="modalVerifyStatus"
        title="展示示例"
        :width="examplesImages1&&examplesImages2?650:414"
    >
      <div class="ivu-modal-wrap-images">
        <div v-if="examplesImages1">
          <div v-if="examplesImages1&&examplesImages2">首页左下方</div>
          <img :src="examplesImages1"/>
        </div>
        <div v-if="examplesImages2" style="margin-left: 56px;">
          <div>首页右下方</div>
          <img :src="examplesImages2"/>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script>
  import thirdMenu from "@/views/shop/menu/third-menu.vue";
  import thirdMenuData from "../components/third-menu-for-channel-weixin";
  import switchTitlebar from "COMPONENTS/titlebar/switch-titlebar";
  import axios from "axios";
  import blank from "./blank.vue";
  export default {
    components: {
      thirdMenu,
      blank,
      switchTitlebar
    },
    data(){
      return{
        thirdMenu: [],
        isBound: false,
        loaded: false,
        isOpenWxOnlinePay:true,
        modalVerifyStatus:false,
        loading: false,
        formValidate:{
          home_page_button_pos:0,
          home_page_bar:0,
          home_page_button:0,
          member_center:0,
          pay_success:0,
        },
        examplesImages1:"",
        examplesImages2:"",
        examplesImg:[
          "images/lead-attention/referrer-example.png",
          "images/lead-attention/home-bottom left.png",
          "images/lead-attention/bottom-right.png",
          "images/lead-attention/subscription-information.png",
          "images/lead-attention/public-number-popup.png"
        ]
      }
    },
    created() {
      this.thirdMenu = thirdMenuData.getThirdMenu();
      this.$store.state.COMMON_loading = true;
      Promise.all([this.getConfigFull()]).then(() => {
        axios
          .get("/shop/admin/wx/subscribe/setting/info")
          .then(res => {
            if (res.code == 200) {
              if (res.data){
                this.formValidate = res.data;
              }
            } else {
              this.$Message.error(res.msg);
            }
          })
          .catch(err => {
            this.$Message.error(err);
          })
          .finally(() => {
            this.loaded = true;
            this.$store.state.COMMON_loading = false;
          });
      });
    },
    methods:{
      changeOpenWxOnlinePay(status) {
        this.isOpenWxOnlinePay = status;
      },
      showModalClick(item){
        if (item==1){
          this.examplesImages1 = this.examplesImg[1];
          this.examplesImages2 = this.examplesImg[2];
        } else{
          this.examplesImages2 = "";
          this.examplesImages1 = this.examplesImg[item];
        }
        this.modalVerifyStatus = true;
      },
      //获取公众号设置
      getConfigFull() {
        return new Promise(resolve => {
          this.$httpGet("/shop/admin/wx/menu/list", {}, res => {
            if (res.code === 200) {
              this.isBound = res.data.config_full;
              resolve();
            } else {
              this.$store.state.COMMON_loading = false;
              this.$Message.error(res.msg);
            }
          });
        });
      },
      saveMenu() {
        // this.$Spin.show();
        this.loading = true;
        axios
          .post("/shop/admin/wx/subscribe/setting/edit", this.formValidate)
          .then(res => {
            // this.$Spin.hide();
            this.loading = false;
            if (res.code == 200) {
              this.$Message.success("保存成功");
            } else {
              this.$Message.error(res.msg);
            }
          })
          .catch(err => {
            this.loading = false;
            // this.$Spin.hide();
            this.$Message.error(err);
          });
      }
    }
  }
</script>

<style lang="less" scoped>
  .weixin {
    width: 100%;
    /*height: calc(100vh - 84px);*/
    background: #fff;
    display: flex;
    height: 100%;
    /*padding-bottom: 50px !important;*/
    .main-content {
      width: 100%;
      height: 100%;
      padding-bottom: 50px !important;
      .attention{
        .form-height{
          height: 32px;
          /deep/.distributor-setting-item{
            .ivu-radio-wrapper{
              margin-right: 20px;
              color: #464C5B;
            }
          }
        }
        .attention-content{
          padding: 0 16px;
          font-size: 12px;
          color: #9EA7B4;
          height: 32px;
          line-height: 32px;
          a{
            color: #3352D9;
            margin-left: 20px;
          }
        }
      }
    }
  }
  /deep/.ivu-modal{
      .ivu-modal-body{
        padding: 50px 0;
        margin: 0 auto;
        .ivu-modal-wrap-images{
          display: flex;
          justify-content: center;
          &>div{
            width: 180px;
            /*height: 320px;*/
            &>div{
              text-align: center;
              margin-bottom: 20px;
              font-size: 12px;
              color: #464C5B;
            }
            &>img{
              width: 100%;
              height: 320px;
            }
          }
        }
      }
    .ivu-modal-footer{
      display: none;
    }
  }
  .footer {
    position: fixed;
    bottom: 10px;
    height: 50px;
    line-height: 50px;
    width: calc(100% - 260px);
    background-color: #fff;
    text-align: center;
    border-top: 1px solid #eee;
    z-index: 100;
    button {
      width: 70px;
      height: 32px;
    }
  }
</style>