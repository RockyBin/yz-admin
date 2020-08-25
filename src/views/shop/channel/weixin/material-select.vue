<template>
  <Modal class="modal" :value="value" title="选择图文消息" width="620" @on-cancel="$emit('input',false)">
    <Input v-model="searchText" placeholder="请输入图文标题" @on-enter="getNewsList">
      <span slot="prepend">图文标题</span>
      <Icon class="search" slot="append" type="ios-search" size="16" @click="getNewsList(true)"/>
    </Input>
    <Table class="table" height="371" :columns="columns" :data="tableData"></Table>
    <div style="height:24px">
      <Page
        v-if="pager.total"
        style="float:right;"
        :total="pager.total"
        placement="top"
        @on-change="pageChange"
        @on-page-size-change="sizeChange"
        size="small"
        show-sizer
        show-elevator
      />
    </div>
    <div class="footer" slot="footer">
      <span class="text">{{tip}}</span>
      <Button type="text" @click="$emit('input',false)">取消</Button>
      <Button type="primary" @click="confirm">确定</Button>
    </div>
  </Modal>
</template>
<script>
import axios from "axios";
export default {
  props: ["value", "isGroup"],
  data() {
    const renderAction = (h, p) => {
      return h(
        "Button",
        {
          style: {
            width: "50px",
            height: "24px",
            padding: "0",
            "font-size": "12px"
          },
          props: {
            type: "primary",
            size: "small",
            ghost: this.material == p.row
          },
          on: {
            click: () => {
              this.material = p.row;
              this.tip = "已选：" + p.row.title;
            }
          }
        },
        this.material == p.row ? "已选择" : "选择"
      );
    };
    const renderImage = (h, p) => {
      return h("img", {
        style: {
          "vertical-align": "top"
        },
        attrs: {
          src: this.$store.state.siteComdataPath + p.row.image
        }
      });
    };
    return {
      material: null, //图文ID
      tip: "请选择图文消息",
      searchText: "",
      tableData: [],
      columns: [
        {
          title: "图文封面图",
          key: "image",
          width: 100,
          render: renderImage
        },
        {
          title: "图文标题",
          key: "title"
        },
        {
          title: "更新时间",
          key: "updated_at",
          align: "center"
        },
        {
          title: "操作",
          key: "action",
          align: "center",
          width: 100,
          render: renderAction
        }
      ],
      pager: {
        total: 100,
        page: 1,
        size: 10
      }
    };
  },
  watch: {
    value: function(newVal) {
      if (newVal) {
        this.getNewsList();
      }
    }
  },
  computed: {
    // 根据需要 是否返回图文组
    getUrl () {
      if (this.isGroup) {
        return "/shop/admin/wx/news/list";
      } else {
        return "/shop/admin/wx/news/item/list"
      }
    }
  },
  methods: {
    confirm() {
      this.$emit("onSelected", this.material);
      this.$emit("input", false);
    },
    pageChange(page) {
      this.pager.page = page;
      this.getNewsList();
    },
    sizeChange(size) {
      this.pager.size = size;
      this.getNewsList();
    },
    getNewsList(search) {
      if (search) {
        this.pager.page = 1;
      }
      axios
        .post(this.getUrl, {
          page: this.pager.page,
          page_size: this.pager.size,
          keyword: this.searchText
        })
        .then(res => {
          if (res.code == 200) {
            this.tableData = res.data.list;
            this.pager.total = res.data.total;
          } else {
            this.$Message.error(res.msg);
          }
        })
        .catch(err => {
          this.$Message.error(err);
        });
    }
  }
};
</script>
<style lang="less" scoped>
.modal {
  .search {
    cursor: pointer;
  }
  /deep/.ivu-input-group-prepend,
  /deep/.ivu-input-group-append {
    background-color: #f9fbfd;
  }
  .table {
    margin: 16px 0;
  }
  /deep/.ivu-table-tbody {
    font-size: 12px;
  }
   /deep/.ivu-select .ivu-select-dropdown{
    top:-144px !important;
  }
  /deep/.ivu-table-row {
    height: 70px;
    .ivu-btn {
      display: none;
    }
    .ivu-btn-ghost,
    &:hover .ivu-btn {
      display: inline-block;
    }
  }
  /deep/.ivu-table-cell img {
    width: 80px;
    height: 44px;
    object-fit: cover;
  }
  .footer {
    text-align: right;
    .text {
      float: left;
      line-height: 34px;
    }
  }
}
</style>