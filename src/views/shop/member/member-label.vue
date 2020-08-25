<template>
  <div class="member-label">
    <div class="member-label-header">
      <add-more text="新增标签组" @onAddMoreClick="onAddNewRoleClick" perm="member.label.operate"></add-more>
      <more-message
        style="line-height: 30px;margin-left: 12px;"
        :text="'公用标签由后台统一配置，配置后，可以\n对会员打上用户画像标签'"
      />
    </div>
    <div class="member-label-content">
      <label-table
        :loading="tableLoading"
        :data="listData"
        @edit="onEditClick"
        @del="onDeleteLabelClick"
        @sort="onTableSort"
      ></label-table>
    </div>
    <modal-add v-model="modalStatus" :editData="editData" @on-ok="onSaveDataClick"></modal-add>
  </div>
</template>
<script>
import addMore from "@/views/shop/components/button/add-more.vue";
import moreMessage from "@/views/shop/components/more-message/more-message.vue";
import labelTable from "./components/member-label-table.vue";
import modalAdd from "./components/member-label-modal-add";
let editData = {
  id: 0,
  name: "",
  children: []
};
export default {
  components: {
    addMore,
    moreMessage,
    labelTable,
    modalAdd
  },
  data() {
    return {
      modalStatus: false,
      tableLoading: false,
      dragOptions: {
        sort: this.hasPerm("member.label.operate"),
        draggable: ".ivu-table-tbody tr",
        cursor: "move"
      },
      editData: JSON.parse(JSON.stringify(editData)),
      listData: []
    };
  },
  created() {
    this.loadData();
  },
  methods: {
    onTableSort(oldIndex, newIndex) {
      this.tableLoading = true;
      this.$httpPost(
        "/shop/admin/member/label/sort",
        {
          label: this.listData.map((n, index) => ({
            id: n.id,
            sort: this.listData.length - index
          }))
        },
        res => {
          this.tableLoading = false;
          if (res.code !== 200) {
            // 还原原来的位置
            let list = this.listData.concat();
            let lowIndex = Math.min(oldIndex, newIndex);
            let hightIndex = Math.max(oldIndex, newIndex);
            let hightItem = list.splice(hightIndex, 1);
            list.splice(lowIndex, 0, hightItem);
            this.listData = list;
            this.$Message.error(res.msg);
          } else {
            this.$Message.success("保存成功");
          }
        }
      );
    },
    onEditClick(item) {
      this.editData = JSON.parse(JSON.stringify(item));
      this.modalStatus = true;
    },
    /**
     * 保存新建/编辑的数据
     */
    onSaveDataClick(item, callback) {
      // 保存数据操作
      this.saveListData(
        Object.assign({}, item, {
          children: item.children.map((n, index) => {
            let data = Object.assign({}, n, {
              id: /new_/.test(n.id) ? 0 : n.id
            });
            data.sort = index + 1;
            return data;
          })
        })
      )
        .then(() => {
          callback(true);
        })
        .catch(() => {
          callback(false);
        });
    },
    /**
     * 保存数据
     */
    saveListData(data) {
      return new Promise((resolve, reject) => {
        this.$httpPost("/shop/admin/member/label/edit", data, res => {
          if (res.code === 200) {
            resolve();
            this.loadData();
          } else {
            reject();
            this.$Message.error(res.msg);
          }
        });
      });
    },
    /**
     * 新建标签组
     */
    onAddNewRoleClick() {
      this.modalStatus = true;
      this.editData = JSON.parse(JSON.stringify(editData));
    },
    /**
     * 删除标签组
     */
    onDeleteLabelClick(item) {
      this.$httpPost("/shop/admin/member/label/check", { id: item.id }, res => {
        if (res.code === 200) {
          this.$Modal.confirm({
            title: "提示",
            loading: true,
            render: h => {
              return h("div", [
                h("span", `该标签组【${item.name}】下有`),
                h(
                  "span",
                  {
                    style: {
                      color: "#F5222D"
                    }
                  },
                  item.children.length
                ),
                h("span", "个具体标签，共绑定了"),
                h(
                  "span",
                  {
                    style: {
                      color: "#F5222D"
                    }
                  },
                  res.data
                ),
                h("span", "个会员，是否确定删除？")
              ]);
            },
            onOk: () => {
              this.deleteLabel(item);
            }
          });
        } else {
          this.$Message.error(res.msg);
        }
      });
    },
    deleteLabel(item) {
      this.$httpPost(
        "/shop/admin/member/label/delete",
        { id: item.id },
        res => {
          this.$Modal.remove();
          if (res.code === 200) {
            this.$Message.success("删除成功");
            this.loadData();
          } else {
            this.$Message.error(res.msg);
          }
        }
      );
    },
    /**
     * 加载数据
     */
    loadData() {
      this.tableLoading = true;
      this.$httpPost("/shop/admin/member/label/list", null, res => {
        this.tableLoading = false;
        if (res.code === 200) {
          this.listData = res.data.list;
        } else {
          this.$Message.error(res.msg);
        }
      });
    }
  }
};
</script>
<style lang="less" scoped>
.member-label {
  padding: 24px;
  .member-label-content {
    padding-bottom: 60px;
  }
}
</style>
