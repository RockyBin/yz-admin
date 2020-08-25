<template>
  <div class="comments-add">
    <Modal
      class="comments-add-modal"
      v-model="showCommentModal"
      title="新增评价"
      width="490"
      :mask-closable="false"
     >
      <Form ref="form" :model="formFields" :rules="rules" :label-width="90">
        <FormItem label="选择商品 ：" prop="product_id">
          <div v-if="product" class="product-info">
            <img :src="$store.state.siteComdataPath+product.small_images.split(',')[0]" alt="">
            <p>{{product.name}}</p>
          </div>
          <Button type="primary" @click="showProductModal=true">{{product?"重新选择":"选择商品"}}</Button>
        </FormItem>
        <FormItem label="是否匿名 ：">
          <RadioGroup v-model="formFields.is_anonymous">
            <Radio :label="0">否</Radio>
            <Radio :label="1">是</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem label="上传头像 ：">
          <image-dragable
            v-model="formFields.headurl"
            :pictureNumber="1"
          ></image-dragable>
        </FormItem>
        <FormItem label="会员昵称 ：" prop="nickname">
          <Input class="nickname" v-model="formFields.nickname" :maxlength="16" placeholder="请输入会员昵称">
            <span slot="suffix">{{formFields.nickname.length}}/16</span>
          </Input>
        </FormItem>
        <FormItem label="评价等级 ：" prop="star">
          <Select v-model="formFields.star" placeholder="请选择星级">
            <Option v-for="item in 5" :value="item" :key="item">{{item}}星</Option>
          </Select>
        </FormItem>
        <FormItem label="评价内容 ：" prop="content">
          <div class="textarea-wrapper">
            <Input type="textarea" v-model="formFields.content" :maxlength="100" placeholder="请输入评价内容"/>
            <span class="suffix">{{formFields.content.length}}/100</span>
          </div>
        </FormItem>
        <FormItem label="添加图片 ：">
          <more-message text="最多上传4张图片，建议尺寸800×800"></more-message>
          <image-dragable
            v-model="formFields.images"
            :pictureNumber="4"
          ></image-dragable>
        </FormItem>
        <FormItem label="回复评价 ：" prop="admin_reply">
          <div class="textarea-wrapper">
            <Input type="textarea" v-model="formFields.admin_reply" :maxlength="100" placeholder="请输入回复内容"/>
            <span class="suffix">{{formFields.admin_reply.length}}/100</span>
          </div>
        </FormItem>
      </Form>
      <div slot="header">
        <span class="ivu-modal-header-inner">新增评价</span>
        <moreMessage text="请注意销售数量与评价数量之间的比例"></moreMessage>
      </div>
      <div slot="footer">
        <Button type="text" @click="showCommentModal=false">取消</Button>
        <Button type="primary" @click="addComment" perm="product.comment.operate">保存</Button>
      </div>
    </Modal>
    <list-modal
      v-model="showProductModal"
      :selectInfo="selectDesignatedInfo"
      @onGetProductInfo="onGetProductInfo"
    ></list-modal>
    <!-- <ProductDialog
      v-model="showProductModal"
      :multipleSelect="false"
      :productIds="[]"
      @onGetProductInfo="onGetProductInfo"
    ></ProductDialog> -->
    
  </div>
</template>
<script>
import axios from "axios";
// import ProductDialog from "@/views/shop/store/design/components/product-list.vue";
import listModal from "@/views/shop/components/modal/modal-product-select-list.vue";
import imageDragable from "@/views/shop/components/image-select/image-select-dragable.vue";
import moreMessage from "@/views/shop/components/more-message/more-message.vue";
export default {
  props:["value"],
  components:{
    // ProductDialog,
    listModal,
    imageDragable,
    moreMessage
  },
  watch:{
    value(show){
      this.showCommentModal=show;
    },
    showCommentModal(value){
      this.$emit("input",value)
      this.resetFields();
    },
    "formFields.product_id":function(){
      this.$refs.form.validateField("product_id")
    }
  },
  data(){
    return{
      isSaving:false,
      showCommentModal:false,
      showProductModal:false,
      selectDesignatedInfo:{
        selectDesignatedProductID: 0,
        selectDesignatedProductName: ""
      },
      product:null,
      formFields:{
        product_id:NaN,
        is_anonymous:0,
        headurl:[],
        nickname:"",
        star:5,
        content:"",
        admin_reply:"",
        images:[]
      },
      rules:{
        product_id:[{required:true,type:"number",message:"请选择商品",trigger:"change"}],
        nickname:[{required:true,message:"会员昵称不能为空",trigger:"change"}],
        star:[{required:true,type:"number",message:"请选择评价星级",trigger:"change"}],
        content:[{required:true,message:"评价内容不能为空",trigger:"change"}]
      }
    }
  },
  mounted(){
    window.form=this.$refs.form
  },
  methods:{
    addComment(){
      this.$refs.form.validate(valid=>{
        if(valid){
          let formData=new FormData();
          if(this.formFields.headurl.length>0){
            formData.append("headurl_data",this.formFields.headurl[0]);
          }
          if(this.formFields.images.length>0){
            this.formFields.images.forEach((file,index)=>{
              formData.append("image_data_"+(index+1),file)
            })
          }
          for(let key in this.formFields){
            if(key!="headurl"&&key!="images"){
              formData.append(key,this.formFields[key])
            }
          }
          if(this.isSaving){
            return
          }
          this.isSaving=true
          axios.post("/shop/admin/product/comment/add",formData).then(res=>{
            this.isSaving=false
            if(res.code==200){
              this.$Message.success(res.msg)
              this.showCommentModal=false;
              this.$emit("success")
            }else{
              this.$Message.error(res.msg)
            }
          }).catch(err=>{
            this.$Message.error(err)
          })
        }else{
          this.$Message.error("添加失败，有未填写的表单字段")
        }
      })
      
    },  
    resetFields(){
      this.$refs.form.resetFields();
      this.product=null;
      this.formFields.images=[]
      this.formFields.headurl=[]
      this.$nextTick(()=>{
        this.$refs.form.fields[0].validateState=""
      })
      this.selectDesignatedInfo = {
        selectDesignatedProductID: 0,
        selectDesignatedProductName: ""
      };
      document.querySelector(".comments-add-modal .ivu-modal-body").scrollTo(0,0);
    },
    onGetProductInfo(products) {
      if(products.length>0){
        this.product=products[0];
        this.formFields.product_id=this.product.id
      }
    },
  }
}
</script>
<style lang="less" scoped>
  .comments-add-modal{
    /deep/.ivu-modal-content{
      height:600px;
      .ivu-modal-header{
        .ivu-modal-header-inner {
          display: inline-block;
          width: auto;
        }
        .more-message{
          height: 20px;
          line-height: 18px;
          margin-left:10px;
          vertical-align:top;
        }
      }
      .ivu-modal-body{
        padding:30px 24px;
      }
      .ivu-form{
        .product-info{
          display:flex;
          align-items:center;
          padding:8px;
          width:240px;
          border-radius:5px;
          border:1px solid #dcdee2;
          margin-bottom:10px;
          line-height:normal;
          img{
            width:40px;
            height:40px;
            // object-fit:cover;
            margin-right:8px;
            border:1px solid #eee;
            border-radius:2px;
          }
          
        }
        .ivu-form-item{
          margin-bottom:28px;
          &:last-child{
            margin-bottom:0;
          }
        }
        .ivu-form-item-label{
          padding-right:5px;
        }
        .ivu-select{
          width:158px;
        }
        .nickname{
          width:260px;
          .ivu-input-suffix{
            width:40px;
            line-height:32px;
          }
          .ivu-input-with-suffix{
            padding-right:40px;
          }
        }
        .textarea-wrapper{
          position:relative;
          textarea{
            height:84px;
            resize:none
          }
          .suffix{
            position:absolute;
            right:0px;
            bottom:-16px;
            color:#999;
            line-height:1;
            font-size:12px;
          }
        }
      }
    }
  }
</style>