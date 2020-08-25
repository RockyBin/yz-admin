<template>
  <div class="weixin">
    <third-menu :list="thirdMenu" />
    <div class="main-content">
      <blank v-if="!isBound" msg="绑定公众号后，即可使用自动回复功能" />
      <div v-else class="main-board">
        <div class="wrapper">
          <verticalLineTitlebar class="title" :title="title" />
          <Form ref="form" :model="formFields" :rules="rules" :label-width="90">
            <FormItem label="规则名称：" prop="name">
              <Input v-model="formFields.name" :maxlength="20" placeholder="请输入规则名称">
                <span slot="suffix">{{formFields.name.length}}/20</span>
              </Input>
            </FormItem>
            <template v-if="$route.query.type==2">
              <FormItem
                class="keyword"
                v-for="(keyword,index) in formFields.keyword"
                :key="keyword.key"
                :label="index==0?'关键词：':''"
                :prop="'keyword.'+index"
                :rules="[{required:true,validator:validateKeyword,trigger:'blur'}]"
              >
                <Input v-model="keyword.value" :maxlength="20" placeholder="请输入关键词">
                  <Select v-model="keyword.type" slot="prepend">
                    <Option :value="0">精确匹配</Option>
                    <Option :value="1">模糊匹配</Option>
                  </Select>
                  <span slot="suffix">{{keyword.value.length}}/20</span>
                </Input>
                <a
                  href="javascipt:void(0)"
                  v-if="formFields.keyword.length>1"
                  @click="formFields.keyword.splice(index,1)"
                >删除</a>
              </FormItem>
              <FormItem
                v-if="formFields.keyword.length<10"
                :label="formFields.keyword.length==0?'关键词：':''"
                required
              >
                <!--<Button-->
                  <!--class="btn-add"-->
                  <!--type="primary"-->
                  <!--shape="circle"-->
                  <!--icon="md-add"-->
                  <!--@click="addKeyword"-->
                <!--&gt;新增关键词</Button>-->
                <add-more text="新增关键词" @onAddMoreClick="addKeyword"></add-more>
              </FormItem>
            </template>
            <FormItem label="回复内容：" class="special">
              <div class="reply-select">
                <FunctionSelect
                  :currentItem="currentItem"
                  :showPoster="true"
                  @setCallbackType="setCallbackType"
                  @setCallbackPaperId="setCallbackPaperId"
                  @clearPaperId="clearPaperId"
                  :menu="0"
                />
                <triangle class="arrow" :width="20" :height="10" :border-width="1" />
              </div>
            </FormItem>
          </Form>
        </div>
        <!--<foot-button  @onSaveClick="submit"></foot-button>-->
        <div class="footer">
          <Button
            class="save-btn"
            type="primary"
            shape="circle"
            @click="submit"
            perm="mp.reply.operate"
          >保存</Button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import triangle from "../../store/design/components/triangle.vue";
import footButton from "@/views/shop/components/button/foot-button.vue";
import addMore from "@/views/shop/components/button/add-more.vue";
import verticalLineTitlebar from "COMPONENTS/titlebar/vertical-line-titlebar";
import FunctionSelect from "./function-select.vue";
import thirdMenu from "@/views/shop/menu/third-menu.vue";
import blank from "./blank.vue";
import axios from "axios";
let index = 0;
export default {
  components: {
    verticalLineTitlebar,
    FunctionSelect,
    thirdMenu,
    blank,
    triangle,
      addMore,
      footButton
  },
  data() {
    return {
      isBound: true,
      //type:this.$route.query.type,//回复类型(被关注回复0，收到信息回复1，关键字回复2)
      currentItem: {
        type: 0, //回复类型(文本0，图文素材1，图片2,海报3)
        data: {
          //回复内容(content,image,news_item_id)
          content: "", //文本内容
          image: "", //图片URL
          news_item_id: "", //图文素材ID(子ID)
          news_item_title: "", //图文素材标题
          news_item_image: "", //图文素材图片
        },
        callback_type: 0,
        paper_image: "",
        paper_name: "",
        paper_id: 0, //选择template的id
      },
      formFields: {
        name: "",
        keyword: [
          {
            key: index++,
            type: 0,
            value: ""
          }
        ]
      },
      rules: {
        name: [{ required: true, message: "请输入规则名称", trigger: "change" }]
      },
      thirdMenu: [
        {
          title: "自定义菜单",
          target: "/channel/weixin/custom-menu"
        },
        {
          title: "自动回复",
          target: "/channel/weixin/auto-reply?type=2"
        },
        {
          title: "素材管理",
          target: "/channel/weixin/material-management"
        },
        {
          title: "公众号管理",
          target: "/channel/weixin/public-management"
        }
      ]
    };
  },
  computed: {
    title() {
      if (this.$route.query.type == 0) {
        return "被关注回复";
      } else if (this.$route.query.type == 1) {
        return "收到消息回复";
      } else {
        return "关键词回复";
      }
    }
  },
  created() {
    
    this.$httpGet("/shop/admin/wx/config/info", {}, res => {
      if (res.code != 200) {
        this.isBound = false;
        this.$Message.error(res.msg);
      }
    });
    if (this.$route.query.id) {
      axios
        .post("/shop/admin/wx/reply/info", {
          id: this.$route.query.id
        })
        .then(res => {
          if (res.code == 200) {
            this.formFields.name = res.data.name;
            this.formFields.keyword = res.data.data.keyword;
            this.currentItem = {
              type: res.data.reply_type,
              data: res.data.reply_data || {
                content: "", //文本内容
                image: "", //图片URL
                news_item_id: "", //图文素材ID(子ID)
                news_item_title: "", //图文素材标题
                news_item_image: "" //图文素材图片
              },
              callback_type: res.data.callback_type,
              paper_image: res.data.paper_image,
              paper_name: res.data.paper_name,
              paper_id: res.data.paper_id,
            };
          } else {
            this.$Message.error(res.msg);
          }
        })
        .catch(err => {
          this.$Message.error(err);
        });
    }
  },
  methods: {
    addKeyword() {
      this.formFields.keyword.push({
        key: index++,
        type: 0,
        value: ""
      });
    },
    checkReply() {
      return (
        (this.currentItem.type == 0 && this.currentItem.data.content) ||
        (this.currentItem.type == 1 && this.currentItem.data.news_item_id != "") ||
        (this.currentItem.type == 2 && this.currentItem.data.image)
      );
    },
    submit() {
      if (this.currentItem.type == 0 && !this.currentItem.data.content) {
        return this.$Modal.error({
          title: "保存失败",
          content: "回复消息文本不能为空！"
        });
      }
      if (this.currentItem.type == 1 && !this.currentItem.data.news_item_id) {
        return this.$Modal.error({
          title: "保存失败",
          content: "回复图文消息不能为空！"
        });
      }
      if (this.currentItem.type == 2 && !this.currentItem.data.image) {
        return this.$Modal.error({
          title: "保存失败",
          content: "回复图片不能为空！"
        });
      }
      if (this.currentItem.type == 99 && !this.currentItem.paper_id) {
        return this.$Modal.error({
          title: "保存失败",
          content: "分享海报不能为空！"
        });
      }
      if (this.$route.query.type == 2 && this.formFields.keyword.length == 0) {
        return this.$Modal.error({
          title: "保存失败",
          content: "必须至少添加一个关键词！"
        });
      }
      this.$refs.form.validate(valid => {
        if (valid) {
          this.$Spin.show();
          axios
            .post("/shop/admin/wx/reply/save", {
              type: this.$route.query.type,
              name: this.formFields.name,
              reply_type: this.currentItem.type,
              // "reply_data":this.currentItem.data,
              content: this.currentItem.data.content,
              image: this.currentItem.data.image,
              news_item_id: this.currentItem.data.news_item_id,
              keyword: this.formFields.keyword,
              id: this.$route.query.id,
              callback_type: this.currentItem.callback_type,
              paper_id: this.currentItem.paper_id
            })
            .then(res => {
              this.$Spin.hide();
              if (res.code == 200) {
                this.$Message.success("保存成功");
                if (!this.$route.query.id) {
                  this.$refs.form.resetFields();
                  this.formFields.keyword = [
                    {
                      key: index++,
                      type: 0,
                      value: ""
                    }
                  ];
                  this.$set(this.currentItem, "type", 0);
                  this.$set(this.currentItem, "data", {
                    content: "",
                    image: "",
                    news_item_id: "",
                    news_item_title: "", //图文素材标题
                    news_item_image: "" //图文素材图片
                  });
                }
                this.$router.replace({
                  name: "autoReply",
                  query: {
                    type: this.$route.query.type
                  }
                });
              } else {
                this.$Message.error(res.msg);
              }
            })
            .catch(err => {
              this.$Spin.hide();
              this.$Message.error(err);
            });
        } else {
          this.$Message.error("有未填写的表单字段！");
        }
      });
    },
    setCallbackType(type) {
      this.$set(this.currentItem, "callback_type", type);
    },
    setCallbackPaperId(paper) {
      this.$set(this.currentItem, "paper_id", paper.id);
      this.$set(this.currentItem, "paper_name", paper.name);
    },
    clearPaperId(){
      this.$set(this.currentItem, "paper_id", 0);
    },
    validateKeyword(rule, keyword, callback) {
      let count = 0;
      this.formFields.keyword.forEach(item => {
        if (item.value == keyword.value) {
          count++;
        }
      });
      if (!keyword.value) {
        callback(new Error("关键词不能为空！"));
      } else if (count > 1) {
        callback(new Error("已存在相同关键词！"));
      } else {
        callback();
      }
    }
  }
};
</script>
<style lang="less" scoped>
.weixin {
  width: 100%;
  height: calc(100vh - 70px);
  background: #f2f4fd;
  display: flex;
  .main-content {
    width: 100%;
    height: 100%;
  }
}
.main-board {
  width: 100%;
  height: 100%;
  background: white;
  .wrapper {
    width: 100%;
    padding: 24px;
    height: calc(100% - 50px);
    overflow: auto;
    .title {
      margin-bottom: 30px;
    }
    .reply-select {
      width: 626px;
      padding: 20px;
      background: #f9fbfd;
      border: 1px solid #e5e5e5;
      .arrow {
        position: absolute;
        left: -14px;
        top: 23px;
        transform: rotate(-90deg);
      }
    }
    .special {
      margin-bottom: 0 !important;
      /deep/.ivu-form-item-label {
        margin-top: 12px;
        &:before {
          content: "*";
          display: inline-block;
          margin-right: 4px;
          line-height: 1;
          font-family: SimSun;
          font-size: 13px;
          color: #ed4014;
        }
      }
    }
    /deep/.edui-editor {
      width: 542px !important;
      .edui-editor-iframeholder {
        width: 542px !important;
      }
    }
    /deep/.ivu-form-item {
      margin-bottom: 30px;
      .add-more-btn{
        /deep/.ivu-btn-primary{
          width: 100px;
        }
      }
    }
    /deep/.ivu-input-wrapper {
      width: 300px;
    }
    /deep/.ivu-select-arrow {
      color: #808695 !important;
    }
    /deep/.ivu-select-dropdown {
      width: 99px !important;
      left: 2px !important;
    }
    /deep/.ivu-input-group {
      width: 400px;
    }
    /deep/.ivu-input-group-prepend {
      width: 100px;
    }
    /deep/.ivu-input-suffix {
      line-height: 33px;
      margin-right: 5px;
      z-index: 3;
    }
    /deep/.ivu-input-with-suffix {
      padding-right: 45px;
    }
    /deep/.ivu-form-item-content {
      & > a {
        position: absolute;
        top: 2px;
        left: 417px;
      }
    }
  }
}

.footer {
  height: 50px;
  line-height: 50px;
  text-align: center;
  border-top: 1px solid #e9e9e9;
  .save-btn {
    width: 70px;
    height: 32px;
    // background: #4570ea;
  }
}
</style>
