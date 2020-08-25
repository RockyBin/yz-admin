<template>
  <div class="product-params-add">
    <div class="wrapper">
      <div class="title"><verticalLineTitlebar :title="$route.name=='productParamsEdit'?'编辑参数模板':'新增参数模板'"/></div>
      <div class="content">
        <Form ref="form" :model="formFields" :rules="rules" :label-width="112">
          <FormItem label="参数模板名称：" prop="templateName">
            <Input class="template-name" type="text" v-model="formFields.templateName" :maxlength="10" placeholder="请输入模版名称">
              <span slot="suffix">{{formFields.templateName?formFields.templateName.length:0}}/10</span>
            </Input>
          </FormItem>
          <Table v-if="!sorting" class="params-list" :columns="columns" :data="formFields.paramsList"></Table>
          <add-more :text="texts" v-if="formFields.paramsList.length<30" @onAddMoreClick="addParams" perm="product.param.operate"></add-more>
          <!--<Button v-if="formFields.paramsList.length<30" type="primary" shape="circle" icon="md-add" perm="product.param.operate" @click="addParams">添加新参数</Button>-->
          <!-- <more-message text="一个模板最多添加30个参数，拖拽可以排序。"></more-message> -->
        </Form>
      </div>
    </div>
    <!--<foot-button  @onSaveClick="saveParams"></foot-button>-->
    <div class="footer"><Button type="primary" shape="circle" perm="product.param.operate" @click="saveParams">保存</Button></div>
  </div>
</template>
<script>
import verticalLineTitlebar from "COMPONENTS/titlebar/vertical-line-titlebar";
import addMore from "COMPONENTS/button/add-more.vue";
import footButton from "@/views/shop/components/button/foot-button.vue";
import moreMessage from "@/views/shop/components/more-message/more-message.vue";
import Sortable from "sortablejs"
import axios from "axios";
let counter=0;
export default {
  components:{
    verticalLineTitlebar,
    moreMessage,
      addMore,
      footButton
  },
  data(){
    return{
      showForm:true,
      sorting:false,
        texts:'添加新参数',
      formFields:{
        templateName:"",
        paramsList:[{
          key:counter++,
          paramsName:"",
          paramsDescription:""
        }]
      },
      rules:{
        templateName:[{required:true,message:"参数模板名称不能为空",trigger:"blur"}]
      },
      columns:[
        {
          title:"参数名称",
          key:"paramsName",
          width:164,
          renderHeader:(h,params)=>{
            return h("span",["参数名称",h(moreMessage,{
              style:{
                height:"auto",
                fontWeight:"normal",
                verticalAlign:"1px"
              },
              props:{
                text:"一个模板最多添加30个参数，拖拽可以排序。"
              }
            })])
          },
          render:(h,params)=>{
            return h("FormItem",
            {
              props:{
                // label:"参数名称",
                prop:`paramsList.${params.index}.paramsName`,
                rules:[{
                  required:true,
                  trigger:"blur",
                  message:"参数名称不能为空"
                }]
              }
            },
            [
              h("Input",
              {
                props:{
                  type:"textarea",
                  placeholder:"请输入参数名称",
                  maxlength:8,
                  value:this.formFields.paramsList[params.index].paramsName
                },
                on:{
                  "input":(value)=>{
                    this.formFields.paramsList[params.index].paramsName=value
                  }
                }
              }),
              h("span",
              {
                class:"textarea-suffix"
              },
              `${params.row.paramsName.length}/8`
              )
            ])
            
          }
        },
        {
          title:"参数描述",
          key:"paramsDescription",
          render:(h,params)=>{
            return h("FormItem",
            {
              props:{
                // label:"参数描述",
                prop:`paramsList.${params.index}.paramsDescription`,
                rules:[{
                  required:true,
                  trigger:"blur",
                  message:"参数描述不能为空"
                }]
              }
            },
            [
              h("Input",
              {
                props:{
                  type:"textarea",
                  placeholder:"请输入参数描述",
                  maxlength:80,
                  value:this.formFields.paramsList[params.index].paramsDescription
                },
                on:{
                  "input":(value)=>{
                    this.formFields.paramsList[params.index].paramsDescription=value
                  }
                },
              }),
              h("span",
              {
                class:"textarea-suffix"
              },
              `${params.row.paramsDescription.length}/80`
              )
            ])
          }
        },
        {
          title:"操作",
          align:"center",
          width:170,
          render:(h,params)=>{
            return h("a",{
              attrs:{
                href:"javascript:void(0)",
                perm:"product.param.operate"
              },
              class:"table-operation",
              on:{
                click:()=>{
                  this.deleteParams(params.index);
                }
              }
            },"删除")
          }
        }
      ]
    }
  },
  created(){
    if(this.$route.name=="productParamsEdit"&&this.$route.query.id){
      axios.get("/shop/admin/product/param/info",{
        params:{
          id:this.$route.query.id
        }
      }).then(res=>{
        this.formFields.templateName=res.data.name;
        this.formFields.paramsList=res.data.params;
        // this.formFields.paramsList=Object.keys(res.data.params).map(key=>{
        //   return {
        //     paramsName:key,
        //     paramsDescription:res.data.params[key]
        //   }
        // })
      }).catch(err=>{
        this.$Message.error(err)
      })
    }
  },
  mounted(){
    this.initSort();
  },
  methods:{
    addParams(){
      //解决resetFields不能清空字段的bug
      let temp,empty=[];
      for(let i=0;i<=this.formFields.paramsList.length;i++){
        empty.push({
          paramsName:"",
          paramsDescription:""
        })
      }
      this.formFields.paramsList.push({
        paramsName:"",
        paramsDescription:""
      })
      temp=this.formFields.paramsList;
      this.formFields.paramsList=empty;
      this.$nextTick(()=>{
        this.formFields.paramsList=temp;
      })
    },
    deleteParams(index){
      this.formFields.paramsList.splice(index,1)
    },
    saveParams(){
      this.$refs.form.validate(valid=>{
        if(valid){
          let data={};
          data.name=this.formFields.templateName;
          data.params=this.formFields.paramsList;
          // this.formFields.paramsList.forEach(pair=>{
          //   data.params[pair.paramsName]=pair.paramsDescription
          // })
          if(this.$route.name=="productParamsEdit"&&this.$route.query.id){
            data.id=this.$route.query.id
          }
          if(this.formFields.paramsList.length==0){
            return this.$Message.error("保存失败")
          }
          axios.post("/shop/admin/product/param/save",data)
          .then(res=>{
            if(res.code==200){
              this.$Message.success(res.msg)
              if(this.$route.name=="productParamsAdd"){
                this.$refs.form.resetFields();
              }
              this.$router.replace("/product/setting/params")
              // this.formFields.paramsList=[{
              //   paramsName:"",
              //   paramsDescription:""
              // }]
            }else{
              this.$Message.error(res.msg)
            }
          }).catch(err=>{
            this.$Message.error(err)
          })
          
        }else{
          this.$Message.error("保存失败")
        }
      })
    },
    initSort(){
      var el=document.querySelector(".params-list .ivu-table-tbody")
      this.sortable=Sortable.create(el,{
        filter:".ivu-form-item",
        draggable:".ivu-table-row",
        direction: "vertical",
        preventOnFilter:false,
        disabled:false,
        animation: 150,
        onEnd:(event)=>{
          console.log(event.newIndex,event.oldIndex)
          var newIndex=event.newIndex;
          var oldIndex=event.oldIndex;
          var [item]=this.formFields.paramsList.splice(oldIndex,1);
          this.formFields.paramsList.splice(newIndex,0,item)

          //强制重新渲染
          // this.tableKey=Math.random();
          // this.$nextTick(()=>{
          //   this.initSort()
          // })

          this.sorting=true;
          this.$nextTick(()=>{
            this.sorting=false
            this.$nextTick(()=>{
              this.initSort()
            })
          })
        }
      });
    }
  }
}
</script>
<style lang="less" scoped>
.product-params-add{
  .wrapper{
    height:calc(100vh - 121px);
    overflow:auto;
    padding-bottom:30px;
  }
  .footer{
    height:50px;
    line-height:50px;
    text-align:center;
    border-top:1px solid #eee;
    button{
      width:70px;
      height:32px;
    }
  }
  .title{
    padding:24px;
    font-size:14px;
  }
  .content{
    padding-left:44px;
    padding-right:30px;
    .add-more-btn{
      /deep/.ivu-btn-primary{
        width: 100px;
      }
    }
    .template-name{
      width:260px;
      /deep/.ivu-input-suffix{
        width:40px;
        line-height:32px;
      }
      /deep/input{
        padding-right:40px;
      }
    }
    /deep/.ivu-form-item{
      margin-bottom:30px;
    }
    /deep/.ivu-form-item-label{
      padding-right:6px;
    }
    /deep/.more-message{
      margin-left:10px;
      vertical-align:unset;
    }
    /deep/.ivu-table-wrapper{
      width:800px;
      margin-bottom:16px;
      th{
        background:#f8f9fd;
      }
      td{
        .ivu-table-cell{
          padding:9px 0 9px 14px;
          cursor:move;
        }
        &:last-child .ivu-table-cell{
          padding:0 14px;
        }
        .ivu-form-item{
          margin-bottom:0;
        }
        .ivu-form-item-content{
          position:relative;
          margin-left:0 !important;
        }
        .ivu-form-item-error-tip{
          display:none;
        }
        .textarea-suffix{
          position:absolute;
          bottom:8px;
          right:8px;
          line-height:1;
          font-size:12px;
          color:#999;
        }
        textarea{
          height:52px;
          resize:none;
        }
        &:first-child{
          textarea{
            width:150px;
          }
        }
      }
    }
  }
}

</style>
<style>
  .ghost-item{
        cursor:grabbing;
        background: red;
      }
</style>