<template>
  <div class="mall-container">
    <thirdMenu :list="thirdMenu" />
    <div class="container">
      <div class="roll-padding-wrapper">
        <alert-warning title="商城滚屏消息通知：" style="margin-bottom:24px;">
          <p>1. 开启后，【商城主页】、【商品详情页】、【个人中心】出现随机的滚屏通知。<a href="javasript:;" @click="exampleStatus = true">示例</a></p>
          <p>2. 当商城还没有运营数据时，可适当添加数据以提高销量；当已经有运营数据后，将会读取商城的真实数据进行滚屏显示。</p>
        </alert-warning>
        <!-- 最近访客通知 -->
         <switch-titlebar
            style="margin-bottom: 20px;"
            v-model="userNoticeStatus"
            :true-value="true"
            :false-value="false"
            hasBorder
            title="最近访客通知"
          >
           <div class="notice">
                <div :style="{paddingBottom: userNoticeList.length ? '' : '10px'}">
                    <Checkbox v-model="shopOrderDefault">商城真实订单</Checkbox>
                    <Checkbox v-model="shopOrderCustom" style="margin-left:10px">自定义数据</Checkbox>
                </div>
                <div class="user-notice-list">
                      <div class="user-notice-item" v-for="(item,index) in userNoticeList" :key="item.id">
                        <div class="user-img">
                            <img :src="item.image" alt="">
                        </div>
                        <div class="user-name">
                            <div>
                               {{item.name}}
                            </div>
                            <i class="iconfont icon-md-close-circle delete-user-item" @click="deleteData(index,1)"></i>
                        </div>
                    </div>
                </div>
                <div class="user-notice" :style="{marginTop: userNoticeList.length ? '24px' : '0'}" v-show="!(userNoticeList.length === 15)">
                     <addMore :text="'添加记录'" @onAddMoreClick="handleReset(1)"></addMore>
                     <moreMessage :text="'最多只能添加15个访客通知记录'" style="line-height:32px"></moreMessage>
                </div>
           </div>
          </switch-titlebar>
        <!-- 最近下单购物通知 -->
         <switch-titlebar
            style="margin-bottom: 20px;"
            v-model="shoppingStatus"
            :true-value="true"
            :false-value="false"
             hasBorder
            :disabled="false"
            title="最近下单购物通知"
          >
            <div class="notice">
                  <div :style="{paddingBottom: ShoppingNoticeList.length ? '' : '10px'}">
                    <Checkbox v-model="visitorDefault">真实访客</Checkbox>
                    <Checkbox v-model="visitorCustom" style="margin-left:10px">自定义数据</Checkbox>
                  </div>
                  <div class="user-notice-list">
                    <div class="user-notice-item" v-for="(item,index) in ShoppingNoticeList" :key="item.id">
                        <div class="user-img">
                            <img :src="item.image" alt="">
                        </div>
                        <div class="user-name">
                            <div>
                               {{item.name}}
                            </div>
                            <i class="iconfont icon-md-close-circle delete-user-item" @click="deleteData(index,2)"></i>
                        </div>
                    </div>
                  </div>
                  <div class="user-notice" :style="{marginTop: ShoppingNoticeList.length ? '24px' : '0'}" v-show="!(ShoppingNoticeList.length === 15)">
                      <addMore :text="'添加记录'" @onAddMoreClick="handleReset(2)"></addMore>
                      <moreMessage :text="'最多只能添加15个访客通知记录'" style="line-height:32px"></moreMessage>
                  </div>
            </div>
          </switch-titlebar>
      </div>
      <!-- 弹框记录添加 -->
      <Modal :value="showModal" transfer title="添加记录" :width="380" class-name="vertical-center-modal" >
          <Form ref="form" :model="addRecordDate" :label-width="60" :rules="rules">
             <FormItem label="头像：" prop="userImg">
                  <div>
                      <show-big-img-upload 
                        ref="UpdateImg"
                        imgSize="40px"
                        :InitImgURLs="logoURL"
                        v-model="addRecordDate.userImg"
                      ></show-big-img-upload>
                  </div>
             </FormItem>
             <FormItem label="昵称：" prop="userName">
                    <div>
                      <i-Input placeholder="请输入昵称" style="width:260px" v-model="addRecordDate.userName" :maxlength="16">
                          <span slot="suffix">{{addRecordDate.userName?addRecordDate.userName.length:0}}/16</span>
                      </i-Input>
                    </div>
             </FormItem>
          </Form>
          <div slot="close" @click="showModal = false">
              <Icon type="ios-close" />
          </div>
          <div slot="footer">
                <span @click="showModal = false" class="record-cancel">取消</span>
                <Button  @click="addRecord" :loading="modelBtnStatus" type="primary" class="sure-submit">确定</Button>
          </div>
      </Modal>
      <!-- 示例展示弹框 -->
      <Modal
        v-model="exampleStatus"
        title="示例图" :footer-hide="false" transfer width="650px" class-name="example">
            <div class="example-main" slot>
                <div class="example-item">
                    <div class="example-title">首页</div>
                    <div class="example-img">
                       <img src="../images/setting-roll-example1.png" alt="">
                    </div>
                </div>
                <div class="example-item">
                    <div class="example-title">会员中心</div>
                    <div class="example-img">
                       <img src="../images/setting-roll-example2.png" alt="">
                    </div>
                </div>
            </div>
            <div slot="footer"></div>
      </Modal>
      <div class="footer">
        <Button
          shape="circle"
          class="save-btn"
          type="primary"
          @click="onHandleSubmit"
          :loading="loading"
          perm="withdraw.config.operate"
        >保存</Button>
      </div>
    </div>
  </div>
</template>
<script>
import moreMessage from "COMPONENTS/more-message/more-message";
import alertWarning from "@/views/shop/components/alert/alert-warning.vue"
import switchTitlebar from "COMPONENTS/titlebar/switch-titlebar";
import thirdMenu from "@/views/shop/menu/third-menu.vue";
import thirdMenuData from "./components/third-menu-for-setting-mall";
import addMore from '@/views/shop/components/button/add-more'
import showBigImgUpload from "COMPONENTS/image-select/show-big-img-upload.vue"
export default {
  components: {
    thirdMenu,
    moreMessage,
    alertWarning,
    switchTitlebar,
    showBigImgUpload,
    addMore
  },
  data() {
    return {
      loading: false,//提交按钮状态
      showModal: false,//弹框状态
      exampleStatus: false,//示例弹框状态
      modelBtnStatus: false,//添加记录按钮状态
      shopOrderDefault: true,
      shopOrderCustom: true,
      visitorDefault: true,
      visitorCustom:true,
      addRecordDate:{
        userImg:"",
        userName:""
      },
      logoURL: [],
      rules: {
        userImg:[
          { required: true, trigger: "blur", validator: (rule, value, callback) => {
              if(value.length) {
                callback()
              }else {
                callback(new Error("请上传头像"))
              }
          }}
        ],
        userName:[
           { required: true, trigger: "blur", validator: (rule, value, callback) => {
              if(value) {
                callback()
              }else {
                callback( new Error("请输入昵称"))
              }
          }}
        ]
      },
      shoppingStatus: true, //购物通知
      userNoticeStatus: true, // 访客通知
      userNoticeList: [
           { 
          id: 1,
          name:"开心阳光的向日葵",
          image: "../images/head-portrait.png"
        },
         { 
          id: 2,
          name:"开心阳光的向日葵",
          image: "../images/head-portrait.png"
        },
         { 
          id: 3,
          name:"开心阳光的向日葵",
          image: "../images/head-portrait.png"
        },
         { 
          id: 4,
          name:"开心阳光的向日葵",
          image: "../images/head-portrait.png"
        },
         { 
          id: 5,
          name:"开心阳光的向日葵",
          image: "../images/head-portrait.png"
        },
         { 
          id: 6,
          name:"开心阳光的向日葵",
          image: "../images/head-portrait.png"
        },
         { 
          id: 7,
          name:"开心阳光的向日葵",
          image: "../images/head-portrait.png"
        },
         { 
          id: 8,
          name:"开心阳光的向日葵",
          image: "../images/head-portrait.png"
        }
      ],//用户通知列表
      ShoppingNoticeList: [
         { 
          id: 1,
          name:"开心阳光的向日葵",
          image: "../images/head-portrait.png"
        },
         { 
          id: 2,
          name:"开心阳光的向日葵",
          image: "../images/head-portrait.png"
        },
         { 
          id: 3,
          name:"开心阳光的向日葵",
          image: "../images/head-portrait.png"
        },
         { 
          id: 4,
          name:"开心阳光的向日葵",
          image: "../images/head-portrait.png"
        },
         { 
          id: 5,
          name:"开心阳光的向日葵",
          image: "../images/head-portrait.png"
        }
      ],//购物通知列表
      noticeType: 1,
      thirdMenu: [],
    };
  },
  mounted() {
    this.thirdMenu = thirdMenuData.getThirdMenu();
    this.getInfo();
  },
  methods: {
    // 提交
    onHandleSubmit(name) {
     
    },
    // 初始化数据
    getInfo() {
     
    },
    deleteData(index,type) {
        if(type === 1){
          this.userNoticeList.splice(index,1)
        }else{
          this.ShoppingNoticeList.splice(index,1)
        }
    },
    // 重置
    handleReset(type) {
      this.$nextTick(() => {
        this.$refs.UpdateImg.deleteImg(0)
      })
      this.showModal = true
      this.$refs.form.resetFields();
      type > 1 ? this.noticeType = type : ''
    },
    add() {
      this.showModal = false
    },

    addRecord() {
      this.modelBtnStatus = true
      this.$refs.form.validate(valid => {
          if(valid) {
              let id = new Date().getMilliseconds()
              let formData = new FormData();
              formData.append("logo", this.addRecordDate.userImg[0]);
              console.log(this.addRecordDate.userImg[0])
              this.$httpUpload("/shop/admin/shopconfig/edit", formData, res => {
                this.modelBtnStatus = false
                if (res.code === 200) {
                  this.noticeType === 1 ?
                  this.userNoticeList.unshift({id,image: this.addRecordDate.userImg[0].name,name: this.addRecordDate.userName})
                  : this.ShoppingNoticeList.unshift({id,image: this.addRecordDate.userImg[0].name,name: this.addRecordDate.userName})
                  this.$Message.success("添加成功")
                  this.showModal = false
                } else {
                  this.$Message.error("保存失败");
                }
              });
          }else {
            this.modelBtnStatus = false
            this.$Message.error("添加失败")
          }
        })
    }
  }
};
</script>
<style lang="less" scoped>
@import "../css/_spaceing.less";
@labelmr: 10px;
@checkboxmr: 5px;
@checkwrapmr: 16px;
@unitml: 10px;

.mall-container {
  position: absolute;
  width: 100%;
  height: calc(100vh - 132px);
  background: #f2f4fd;
  display: flex;
  .container {
    height: 100%;
    flex: 1;
    background: #fff;
  }
}
.roll-padding-wrapper {
  /*height: calc(100vh - 120px);*/
  padding: 24px;
  padding-bottom: 74px;
  overflow: auto;
  background: white;
   /deep/.switch-titlebar-content{
        padding: 10px 0px !important;
    }
    .notice{
        padding: 0 16px;
        .user-notice{
          /deep/.btn-add{
              margin-bottom: 0px;
              margin-right: 12px;
          }
        }
        .user-notice-list{
          display: flex;
          width: 100%;
          flex-wrap: wrap;
          .user-notice-item{
            position: relative;
            display: flex;
            width: 240px;
            align-items: center;
            box-sizing: border-box;
            padding: 15px 41px 15px 13px;
            margin: 14px 16px 10px 0;
            background: #f5f6f7;
            border-radius: 3px;
              &:hover{
                box-shadow: 0px 3px 6px 0px rgba(74,106,245,0.18);
                .delete-user-item{
                  display: block !important;
                }
              }
              
            .user-img{
              width: 40px;
              height: 40px;
              margin-right: 14px;
              & > img {
                display: block;
                width: 100%;
                height: 100%;
                object-fit: contain;
              }
            }
            .user-name{
              display: flex;; 
              font-size: 12px;
              & > div {
                display: inline-block;
                max-width: 132px;
                word-break: break-all;
                overflow : hidden;
                text-overflow: ellipsis;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical; 
                color: #657180;
                line-height: 16px;
              }
              .delete-user-item{
                position: absolute;
                display: none;
                top: 5px;
                right: 5px;
                font-size: 16px;
                &:hover{
                  cursor: pointer;
                }
              }
            }
          }
        }
    }
}
/deep/.vertical-center-modal {
  display: flex;
  align-items: center;
  justify-content: center;
   .ivu-modal{
      top: 0;
    }
    /deep/.ivu-input-suffix{
      width: 50px;
      line-height: 32px;
    }
    .record-cancel,.sure-submit{
      margin-left: 27px;
      &:hover{
        cursor: pointer;
      }
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
div {
 /deep/&.ivu-tooltip-popper{
  top: 238px !important;
}
/deep/.example{
  .example-main{
    display: flex;
    padding: 26px 0 26px 93px;
    font-size: 12px;
      .example-item{
        &:first-child{
            margin-right: 56px;
        }
        .example-title{
          text-align: center;
          padding-bottom: 20px;
        }
        .example-img{
          width: 180px;
          height: 319px;
          
          & > img{
            display: block;
            width: 100%;
            height: 100%;
          }
        }
      }
  }
  /deep/.ivu-modal-footer{
    padding: 0 !important;
  }
}
}

</style>
