<template>
  <div>
    <Modal class="main-modal" :title="title" :width="700" v-model="showModal" >
      <!-- 模板展示 -->
      <div class="template-choose-modal-content">
        <div class="template-choose-modal-list">
          <div class="template-choose-modal-list-content">
            <div
              class="template-choose-modal-list-flex"
              v-for="(item, index) in templateObjArr"
              :key="index"
            >
              <!-- 其余使用循环显示的海报 -->
              <div class="template-choose-modal-list-item">
                <div class="template-choose-modal-list-item-img">
                  <img :src="item.demoimg" />
                  <div
                    class="template-choose-modal-list-item-position"
                    :class="{'show-mask':item['status']}"
                  >
                    <Button
                      type="primary"
                      @click="selectTemplate(index,item.demoimg)"
                      :class="{'hide-button':item['status']}"
                      v-if="!item['status']"
                    >使用</Button>
                    <Button
                      v-else
                      :style="{'background':'rgb(252,138,40)','outline': 'none','border': 'none','color': '#fff','width': '84px','height': '32px'}"
                    >
                      <Icon type="md-checkmark" color="#fff" :size="22" />已选择
                    </Button>
                  </div>
                </div>
                <div class="template-choose-modal-list-item-name">{{item.name}}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div slot="footer">
        <Button type="text" @click="showModal=false">取消</Button>
        <Button type="primary" @click="save">确定</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import axios from "axios";

export default {
  props: ["value"],
  data() {
    return {
      showModal: false,
      selectTemplateId: 0,
      title: "选择证书模板",
      templateObjArr: null,
      modules: []
    };
  },
  watch: {
    value(val) {
      this.showModal = val;
    },
    showModal(val) {
      this.$emit("input", val);
      if(val && !this.templateObjArr) {
        this.loadTemplateData();
      }
    }
  },
  methods: {
    // 模板文件定义
    loadTemplateData() {
      axios.get("/shop/admin/dealer/authcert/template").then(res => {
        if (res.code == 200) {
          this.templateObjArr = res.data;
        } else {
          this.$Message.error(res.msg);
        }
      });
    },
    // 选择模板之后保存
    save() {
      if (!this.selectTemplateId) {
        this.$Message.error("请选择模板");
        return;
      }
      this.showModal =false;

      this.$router.push({
        path: "/dealer/dealer-authcert-design",
        query: this.selectTemplateId
      });
    },
    // 选择模板
    selectTemplate(index, url) {
      for (const key in this.templateObjArr) {
        this.$set(this.templateObjArr[key], "status", false);
      }

      this.$nextTick(() => {
        this.$set(this.templateObjArr[index], "status", true);
      });
      this.selectTemplateId = index + 1;
      this.templateObjArr[index]['template']=this.templateObjArr[index]['template_name'];
      for (const key in this.templateObjArr[index]) {
          window.localStorage.setItem(key, JSON.stringify(this.templateObjArr[index][key] || ""))
      }
    }
  }
};
</script>
<style lang="less" scoped>
.main-modal {
  /deep/.ivu-modal {
    .ivu-modal-body {
      padding: 0;
      height: 436px;
    }
  }
  // 循环显示模板
  .template-choose-modal-list-flex {
    float: left;
    margin-left: 50px;
    &:nth-child(3n+1) {
      margin-left: 60px;
    }
    &:last-child {
      .template-choose-modal-list-item {
        margin-bottom: 24px;
      }
    }
    .template-choose-modal-list-item {
      display: inline-block;
      margin-top: 24px;
      .template-choose-modal-list-item-img {
        position: relative;
        height: 285px;
        box-shadow: 0px 3px 10px -5px rgba(0, 0, 0, 0.5);
        img {
          width: 160px;
          height: 285px;
          border-radius: 4px;
        }
        .template-choose-modal-list-item-position {
          position: absolute;
          top: 0;
          left: 0;
          width: 160px;
          height: 285px;
          background: rgba(0, 0, 0, 0.5);
          border-radius: 4px;
          cursor: pointer;
          opacity: 0;

          &:hover {
            opacity: 1;
          }

          /deep/.ivu-btn-default,
          /deep/.ivu-btn-primary {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
          }

          /deep/.ivu-btn-default {
            span {
              height: 32px;
              line-height: 22px;
              vertical-align: baseline;
            }
            .ivu-icon {
              font-size: 20px !important;
              position: relative;
              top: -2px;
              left: -4px;
            }
          }

          /deep/.ivu-btn-primary {
            z-index: 2;
          }
          .hide-button {
            display: none;
          }
        }

        .show-mask {
          opacity: 1;
        }
      }

      .template-choose-modal-list-item-name {
        text-align: center;
        margin-top: 18px;
        color: #464c5b;
        font-size: 14px;
        font-weight: bold;
        line-height: 1;
      }
    }
  }
}
</style>