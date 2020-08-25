<template>
  <div class="list">
    <Modal
      class="modal"
      v-model="modalStatus"
      :styles="{top: '50px'}"
      :width="620"
      title="选择商品分类"
      @on-cancel="onCancelClick"
      @on-ok="onComfrimClick"
    >
      <div class="container">
        <div class="table">
          <div class="title">商品分类</div>
          <div class="list">
            <div class="row" v-for="(item,index) in sortedClass" :key="index">
              <div class="item" v-if="!item.hide">
                <div class="name" @click="toggleSub(item)">
                  <span v-for="(s,i) in item.space" :key="i" class="space">
                    <span v-if="s == 'icon'" class="icon" :class="{isHaveSub:isShow(item)}">
                      <Icon v-if="item.hidesub" type="md-arrow-dropright"/>
                      <Icon v-else type="md-arrow-dropdown"/>
                    </span>
                    <span v-else>{{s}}</span>
                  </span>
                  <span>{{item.class_name}}</span>
                </div>
                <div class="op">
                  <Button
                    v-if="classIds.indexOf(item.id) == -1"
                    :size="'small'"
                    type="primary"
                    @click="select(item)"
                  >选择</Button>
                  <Button
                    v-if="classIds.indexOf(item.id) > -1"
                    :size="'small'"
                    type="primary"
                    ghost
                  >已选</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        v-show="selectedClassInfo.id > 0"
        class="list-show-select mglr"
      >已选：{{selectedClassInfo.name}}</div>
    </Modal>
  </div>
</template>
<script>
import "@/assets/scrollbar.less";
export default {
  components: {},
  props: {
    value: {
      type: Boolean,
      required: true
    },
    classIds: {
      type: Array
    }
  },
  data() {
    return {
      selectedClassInfo: {
        id: 0,
        name: ""
      },
      modalStatus: false,
      classList: [],
      sortedClass: []
    };
  },
  watch: {
    value(val) {
      if (val !== this.modalStatus) {
        this.modalStatus = val;
      }
    },
    modalStatus(val) {
      if (val !== this.value) {
        this.$emit("input", val);
      }
    }
  },
  mounted() {
    this.getClassList();
  },
  methods: {
    /**
     * 没有二级分类的时候隐藏按钮
     */
    isShow(item) {
      if(!item.hasSub){
        return true;
      }
      return false;
    },
    /**
     * 取消的时候
     */
    onCancelClick() {},
    /**
     * 提交到上级组件
     */
    onComfrimClick() {
      // 选择了分类才去传值
      if (this.selectedClassInfo && this.selectedClassInfo.id > 0) {
        this.$emit("onGetClassInfo", [this.selectedClassInfo]);
      }
    },
    /**
     * 获取产品分类列表
     */
    getClassList() {
      this.$httpGet("/shop/admin/product/class/list", {}, res => {
        this.classList = res.data || [];
        this.classList.forEach(item => {
          if (this.classIds.indexOf(item.id) > -1) {
            this.select(item);
          }
        });
        //生成树形结构
        this.sortedClass = [];
        this.classList.forEach(item => {
          if (item.parent_id == 0) {
            item.space = ["　", "icon", "　"];
            //item.hide = false;
            //item.hidesub = false;
            this.$set(item, "hide", false);
            this.$set(item, "hidesub", false);
            this.sortedClass.push(item);
            var sub = this.getClassByParent(item.id);
            if (sub.length > 0) {
              item.hasSub = true;
            }
            sub.forEach(sitem => {
              sitem.space = ["　", "　", "　", "　", "　", "　"];
              //sitem.hide = false;
              //sitem.hidesub = false;
              this.$set(sitem, "hide", false);
              this.$set(sitem, "hidesub", false);
              this.sortedClass.push(sitem);
            });
          }
        });
      });
    },
    getClassByParent(pid) {
      var arr = [];
      this.classList.forEach(item => {
        if (item.parent_id == pid) {
          arr.push(item);
        }
      });
      return arr;
    },
    select(classInfo) {
      this.selectedClassInfo.id = classInfo.id;
      this.selectedClassInfo.name = classInfo.class_name;
      this.classIds.splice(0, this.classIds.length);
      this.classIds.push(classInfo.id); //暂时只支持单选
    },
    toggleSub(cls) {
      if (cls.parent_id == 0) {
        //cls.hidesub = !cls.hidesub;
        this.$set(cls, "hidesub", !cls.hidesub);
        this.sortedClass.forEach(sitem => {
          if (sitem.parent_id == cls.id) {
            //sitem.hide = cls.hidesub;
            this.$set(sitem, "hide", cls.hidesub);
          }
        });
      }
    }
  }
};
</script>
<style lang="less" scoped>
.modal {
  /deep/.ivu-modal-wrap {
    .ivu-modal-body {
      padding: 20px;
      height: 420px;
      box-sizing: border-box;
      .list-show-select {
        position: absolute;
        bottom: 21px;
      }
      .mglr {
        margin-left: 30px;
        margin-right: 30px;
      }
      .table {
        border: 1px solid #ddd;
        .title {
          padding-left: 40px;
          height: 40px;
          line-height: 40px;
          background: #f8f9fd;
          color: #333;
          font-weight: bold;
        }
        .list {
          height: 338px;
          overflow: auto;
        }
        .item {
          display: flex;
          cursor: default !important;
          height: 40px;
          line-height: 40px;
          border-bottom: 1px solid #f8f8f8;
          .name {
            flex: 1;
            height: 40px;
            line-height: 40px;

            .space {
              height: 40px;
              line-height: 40px;
            }
            .ivu-icon {
              font-size: 20px;
              margin-top: -3px;
            }
          }
          .op {
            height: 35px;
            line-height: 35px;
            width: 60px;
            .ivu-btn {
              width: 50px;
              height: 24px;
              padding: 0;
              // background-color: #4a6af5;
              border-radius: 5px;
              // border: solid 1px #4a6af5;
              > span {
                line-height: 24px;
              }
            }
          }
          &:hover {
            background: #fcfcfe;
            /deep/.ivu-btn {
              display: inline-block;
            }
          }
          /deep/.ivu-btn {
            display: none;
          }
          /deep/.ivu-btn-ghost {
            display: inline-block;
          }
        }
      }
    }
  }

  .isHaveSub {
    display: none;
  }
}
</style>
