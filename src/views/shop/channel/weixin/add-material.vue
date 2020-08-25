<template>
  <div class="weixin">
    <third-menu :list="thirdMenu"/>
    <div class="main-content">
      <blank v-if="!isBound" msg="绑定公众号后，即可使用素材管理功能"/>
      <div v-else class="main-board">
        <verticalLineTitlebar class="title" title="新增图文素材"/>
        <div class="flex-wrapper">
          <div class="show-panel">
            <div>
              <div
                v-for="(item,index) in items"
                :key="index"
                :class="[index?'news-item':'cover',item==currentItem&&'selected']"
                @click="selectItem(item)"
              >
                <div class="material-title">
                  <p>{{item.title||'图文标题'}}</p>
                </div>
                <img
                  :src="item.image?$store.state.siteComdataPath+item.image:'images/sample/placeholder.png'"
                >
                <Icon v-if="index&&!$route.query.id" @click.stop="deleteItem(index)" type="ios-close-circle" size="18"/>
              </div>
            </div>
            <div v-if="items.length<8&&!$route.query.id" class="news-item add-item" @click="addItem">
              <Icon type="md-add" size="12"/>
            </div>
          </div>
          <div class="form">
            <triangle class="arrow" :width="20" :height="10" :border-width="1"/>
            <Form ref="form" v-if="showForm" :model="currentItem" :rules="rules" :label-width="100">
              <FormItem label="标题：" prop="title">
                <Input class="input-wrapper" v-model="currentItem.title" :maxlength="64" placeholder="请输入图文标题">
                  <span slot="suffix">{{currentItem.title.length}}/64</span>
                </Input>
              </FormItem>
              <FormItem label="作者：" prop="author">
                <Input class="input-wrapper" v-model="currentItem.author" :maxlength="8" placeholder="请输入作者姓名">
                  <span slot="suffix">{{currentItem.author?currentItem.author.length:0}}/8</span>
                </Input>
              </FormItem>
              <FormItem class="cover-field" label="封面：" prop="image">
                <Button :type="currentItem.image?'default':'dashed'" :class="['img-btn',items.indexOf(currentItem)==0&&'cover']" @click="showFilesSelector=true">
                  <Icon
                    v-if="currentItem.image"
                    type="md-close-circle"
                    size="20"
                    @click.stop="deleteImage()"
                  />
                  <Icon v-if="!currentItem.image" type="md-add" size="20" color="#dcdedc"/>
                  <img v-if="currentItem.image" :src="$store.state.siteComdataPath+currentItem.image">
                </Button>
                <span class="tip">{{items.indexOf(currentItem)==0?'( 建议图片尺寸：900像素 * 500像素 )':'( 建议图片尺寸：300像素 * 300像素 )'}}</span>
              </FormItem>
              <FormItem label="摘要：" prop="digest">
                <Input
                  v-model="currentItem.digest"
                  type="textarea"
                  :autosize="{minRows:3,maxRows:3}"
                  :maxlength="120"
                  placeholder="请输入描述内容"
                ></Input>
                <span class="suffix">{{currentItem.digest?currentItem.digest.length:0}}/120</span>
              </FormItem>
              <FormItem label="正文：" prop="content">
                <ue-editor
                  class="rich-editor"
                  ref="detailEditor"
                  v-model="currentItem.content"
                  :setting="editorSetting"
                ></ue-editor>
              </FormItem>
              <FormItem label="原文链接：" prop="url">
                <Input class="input-wrapper" v-model="currentItem.url" placeholder="请输入原文链接"></Input>
              </FormItem>
              <!-- <FormItem label="留言：">
                <RadioGroup v-model="currentItem.comment_only_fans">
                  <Radio :disabled="!!$route.query.id" :label="0">所有人均可留言</Radio>&nbsp;&nbsp;&nbsp;
                  <Radio :disabled="!!$route.query.id" :label="1">仅关注后可留言</Radio>
                </RadioGroup>
              </FormItem> -->
            </Form>
          </div>
        </div>
      </div>
      <!--<foot-button  @onSaveClick="submit"></foot-button>-->
      <div class="footer">
        <Button class="save-btn" type="primary" shape="circle" @click="submit" perm="mp.media.operate">保存</Button>
      </div>
    </div>
    <FilesSelector v-model="showFilesSelector" @onSelected="onFilesSelected"></FilesSelector>
  </div>
</template>
<script>
import axios from 'axios';
import footButton from "@/views/shop/components/button/foot-button.vue";
import thirdMenu from "@/views/shop/menu/third-menu.vue";
import blank from "./blank.vue";
import ueEditor from "@/views/shop/components/editor/editor.vue";
import FilesSelector from "@/components/files/files";
import verticalLineTitlebar from "COMPONENTS/titlebar/vertical-line-titlebar";
import triangle from "../../store/design/components/triangle.vue";
export default {
  components: {
    thirdMenu,
    blank,
    ueEditor,
    FilesSelector,
    verticalLineTitlebar,
    triangle,
      footButton
  },
  data() {
    const item={
      title: "",
      author: "",
      image: "",
      digest: "",
      content: "",
      url: "",
      comment_only_fans: 0
    };
    // const validate=(rule,value,callback)=>{

    // }
    return {
      isBound: true,
      showForm:true,
      showFilesSelector: false,
      items: [item],
      currentItem:item,
      thirdMenu:[{
        title:'自定义菜单',
        target:'/channel/weixin/custom-menu'
      },{
        title:'自动回复',
        target: "/channel/weixin/auto-reply?type=2"
      },{
        title:'素材管理',
        target:'/channel/weixin/material-management'
      },{
        title:'公众号管理',
        target:'/channel/weixin/public-management'
      }],
      rules:{
        title:[{required:true,message:'请输入图文标题',trigger:'blur'}],
        // author:[{required:true,message:'必须填写作者姓名',trigger:'change'}],
        image:[{required:true,message:'请上传封面图片',trigger:'change'}],
        // digest:[{required:true,message:'必须填写描述摘要',trigger:'change'}],
        content:[{required:true,message:'请输入正文内容',trigger:'change'}],
        // url:[{required:true,message:'必须填写原文链接',trigger:'change'}]
      },
      editorSetting: {
        initialFrameHeight: "300",
        autoHeightEnabled: false,
        initialFrameWidth: "100%",
        topOffset: 48,
        // wordCount: true,
        maximumWords: 300,
        wordCountMsg: "{#count}/300",
        wordOverFlowMsg: "<span style='color:red;'>最多输入300个字符！</span>",
        toolbars: [
          [
            "undo",
            "redo",
            "|",
            "bold",
            "italic",
            "underline",
            "forecolor",
            "backcolor",
            "removeformat",
            "insertorderedlist",
            "insertunorderedlist",
            "lineheight",
            "inserttable",
            "horizontal",
            "fontfamily",
            "fontsize",
            "justifyleft",
            "justifycenter",
            "justifyright",
            "justifyjustify",
            "link",
            "unlink",
            "insertvideo",
            "map"
          ]
        ]
      }
    };
  },
  created() {
    this.$httpGet("/shop/admin/wx/config/info", {}, res => {
      if(res.code!=200){
        this.isBound=false;
        this.$Message.error(res.msg);
      }
    });
    if(this.$route.query.id){
      axios.post('/shop/admin/wx/news/info',{
        id:this.$route.query.id
      }).then(res=>{
        if(res.code==200){
          this.items=res.data.items;
          this.selectItem(this.items[0])
        }else{
          this.$Message.error(res.msg);
        }
      }).catch(err=>{
        this.$Message.error(err)
      })
    }
  },
  watch:{
    "currentItem":{
      handler(newItem,oldItem){
        // if(newItem!=oldItem){
        //   this.$nextTick(()=>{
        //     this.$refs.form.fields.forEach(field=>{
        //       field.validateState=""
        //     })
        //   })
        //   return
        // }
        this.$nextTick(()=>{
          if(newItem==oldItem){
            if(this.prevItem.image!=newItem.image){
              this.$refs.form.validateField('image');
            }
            if(this.prevItem.content!=newItem.content){
              this.$refs.form.validateField('content');
            }
          }
          this.prevItem=Object.assign({},newItem)
        })
      },
      immediate:true,
      deep:true
    }
    // 'currentItem.image':function(n,o){
    //   this.$nextTick(()=>{
    //     console.log(this.currentItem.image)
    //     this.$refs.form.validateField('image');
    //   })
    // },
    // 'currentItem.content':function(n,o){
    //   this.$nextTick(()=>{
    //     console.log(this.currentItem.content)
    //     this.$refs.form.validateField('content');
    //   })
    // }
  },
  methods: {
    selectItem(item){
      // this.showForm=false;
      this.currentItem=item;
      // this.$nextTick(()=>{
      //   this.showForm=true;
      // })
      this.$nextTick(()=>{
        this.$refs.form.fields.forEach(field=>{
          field.validateState=""
        })
      })
    },
    addItem(){
      this.items.push({
        "title": "",
        "author": "",
        "content": "",
        "digest": "",
        "image": "",
        "url": "",
        "comment_only_fans": 0
      });
    },
    deleteItem(index){
      if(this.items.splice(index,1)[0]==this.currentItem){
        this.currentItem=this.items[index-1];
      }
    },
    deleteImage() {
      this.currentItem.image="";
    },
    onFilesSelected(files) {
      if (files.length > 0) {
        this.currentItem.image = files[0].replace(this.$store.state.siteComdataPath,'');
      }
    },
    validate(callback,index=0){
      this.currentItem=this.items[index];
      this.$nextTick(()=>{
        this.$refs.form.validate(valid=>{
          if(valid){
            if(index<this.items.length-1){
              this.validate(callback,index+1)
            }else{
              callback(true)
            }
          }else{
            callback(false)
          }
        })
      })
    },
    submit() {
      this.validate((valid)=>{
        if(valid){
          this.$Spin.show();
          axios
          .post("/shop/admin/wx/news/save", {
            id: this.$route.query.id,
            items: this.items
          })
          .then(res => {
            this.$Spin.hide();
            if(res.code==200){
              if(!this.$route.query.id){
                this.currentItem={
                  title: "",
                  author: "",
                  image: "",
                  digest: "",
                  content: "",
                  url: "",
                  comment_only_fans: 0
                }
                this.items=[this.currentItem]
                this.$nextTick(()=>{
                  this.$refs.form.resetFields();
                })
              }
              this.$Message.success(res.msg)
              this.$router.push({name:"materialManagement"}); 
            }else{
              this.$Message.error(res.msg)
            }
          })
          .catch(err => {
            this.$Spin.hide();
            this.$Message.error(err)
          });
        }else{
          this.$Message.error('保存失败')
        }
      })
    }
  }
};
</script>
<style lang="less" scoped>
.weixin {
  width: 100%;
  height: 100%;
  background: #f2f4fd;
  display: flex;
  .main-content {
    width: 100%;
    height: 100%;
  }
}
.main-board {
  height: calc(100vh - 120px);
  background: white;
  overflow:auto;
  .title {
    height: 60px;
    line-height: 60px;
    padding-left: 24px;
  }
  .flex-wrapper {
    display: flex;
    align-items: flex-start;
    .show-panel {
      width: 300px;
      margin-left: 42px;
      padding: 14px 14px 10px;
      border-radius: 5px;
      box-shadow: 2px 2px 7px rgba(0, 0, 0, 0.3);
      .cover {
        position: relative;
        border-radius: 5px;
        // overflow: hidden;
        margin-bottom:10px;
        border:1px solid transparent;
        cursor:pointer;
        img {
          width: 100%;
          height: 151px;
          object-fit: cover;
          vertical-align: bottom;
          border-radius:5px;
          overflow:hidden;
        }
        .material-title {
          position: absolute;
          left: 0;
          bottom: 0;
          width: 100%;
          padding: 12px;
          color: white;
          font-size:14px;
          background: rgba(0, 0, 0, 0.35);
          border-bottom-left-radius:5px;
          border-bottom-right-radius:5px;
          word-break:break-all;
          p {
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            overflow: hidden;
            -webkit-box-orient: vertical;
          }
        }
        &:hover {
          border: 1px solid #4570ea;
        }
      }
      .news-item {
        display: flex;
        padding: 7px 0;
        height: 65px;
        justify-content: center;
        align-items: center;
        position: relative;
        border:1px solid transparent;
        margin-bottom:-1px;
        cursor:pointer;
        p {
          flex: 1;
          font-size:13px;
          color:#464c5b;
          text-overflow: ellipsis;
          overflow: hidden;
          width: 220px;
          padding-left: 12px;
          padding-right: 5px;
        }
        img {
          width: 50px;
          height: 50px;
          object-fit: cover;
          vertical-align:bottom;
        }
        &:hover {
          border: 1px solid #4570ea;
          /deep/.ivu-icon-ios-close-circle{
            display:block;
          }
        }
        &:not(:last-child):before {
          content: "";
          position: absolute;
          left: 0;
          bottom: 0;
          width: 212px;
          height: 1px;
          background: #e9e9e9;
        }
      }
      /deep/.ivu-icon-ios-close-circle {
        display:none;
        position: absolute;
        right: -9px;
        top: -9px;
        background:white;
        border-radius:18px;
      }
      .selected {
        border: 1px solid #4570ea;
      }
      .add-item {
        margin-top:10px;
        border: 1px dashed #e6e6e6;
      }
    }
    .form {
      position:relative;
      font-size: 13px;
      color: #464c5b;
      width: 645px;
      height: 636px;
      margin-left: 42px;
      padding: 30px 0;
      background: #f9fbfd;
      border: solid 1px #e5e5e5;
      .arrow{
        position:absolute;
        left:-15px;
        top:20px;
        transform:rotate(-90deg);
      }
      /deep/.ivu-form-item {
        margin-bottom: 30px;
      }
      .cover-field/deep/.ivu-form-item-content{
        line-height:1;
      }
      .input-wrapper {
        width: 300px;
        height: 32px;
      }
      /deep/textarea {
        width: 470px;
        height: 85px;
        padding-bottom:18px;
      }
      .suffix{
        position:absolute;
        bottom:5px;
        right:85px;
        color:#9ea4b1;
        font-size:13px;
      }
      /deep/.ivu-input-with-suffix{
        padding-right:46px;
      }
      /deep/.ivu-input-suffix{
        line-height:32px;
        padding-right:10px;
        color:#9ea4b1;
        font-size:12px;
        width:50px;
        text-align:right;
      }
      /deep/.edui-editor {
        width: 469px !important;
        height: 190px !important;
        line-height: normal;
        .edui-editor-iframeholder {
          height: 133px !important;
        }
      }
      .tip {
        font-size: 12px;
        color: #9ea4b1;
      }
      .img-btn {
        position: relative;
        width: 56px;
        height: 56px;
        padding: 0;
        margin-right: 10px;
        vertical-align: text-bottom;
        cursor: pointer;
        &.cover{
          width:100px;
        }
        /deep/.ivu-icon-md-close-circle{
          display:none;
          position: absolute;
          top: -10px;
          right: -10px;
          background:white;
          border-radius:50%;
          color: rgb(100, 100, 100) !important;
          &:hover {
            color: rgb(130, 130, 130) !important;
          }
        }
        &:hover{
          /deep/.ivu-icon-md-close-circle{
            display:inline-block;
          }
        }
        img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
      }
      /deep/.ivu-form-item-error{
        .img-btn{
          border-color:#ed4014;
        }
        .rich-editor .edui-editor{
          border-color:#ed4014;
        }
      }
    }
  }
}
.footer {
  height: 50px;
  line-height: 50px;
  text-align: center;
  background: white;
  border-top: 1px solid #e9e9e9;
  .save-btn {
    width: 70px;
    height: 32px;
    // background: #4570ea;
  }
}
</style>