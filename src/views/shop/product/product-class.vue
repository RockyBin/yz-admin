<template>
  <div>
    <div class="product-class">
      <!-- 商品分类列表 -->
      <!-- <common-tabs></common-tabs> -->
      <Spin fix v-if="isLoading" size="large"></Spin>
      <div style="padding:0 24px;">
        <add-first-class :firstClass="productClassList" @addFirstClass="addFirstClass"></add-first-class>
        <collapse
          ref="collapse"
          :firstClass="productClassList"
          :firstClassStatus="firstClassStatus"
        ></collapse>

        <Modal
          :width="360"
          :ok-text="'确认' + confirmText"
          v-model="oparateClass"
          title="注意"
          @on-ok="onOparateDataConfirm"
        >
          <p style="line-height: 2;" v-html="modalContentText"></p>
        </Modal>
        <Modal
          :width="360"
          ok-text="重新编辑"
          v-model="showClassError"
          title="提交失败"
          @on-ok="onShowErrorConfirm"
        >
          <p style="text-align:center;">每一个一级分类下，必须至少添加一个二级分类。</p>
        </Modal>
      </div>
    </div>
    <div class="save-btn-box">
      <Button
        type="primary"
        shape="circle"
        class="save-btn"
        @click="onSaveClick"
        :loading="loading"
        perm="product.class.operate"
      >保存</Button>
    </div>
    <!--<foot-button :loading="loading" @onSaveClick="onSaveClick"></foot-button>-->
  </div>
</template>

<script>
import specificationsPoper from "./components/product-detail-sku-specifications-poper.vue";
import simpleImageSelect from "@/views/shop/components/image-select/simple-image-select.vue";
import footButton from "@/views/shop/components/button/foot-button.vue";
import addFirstClass from "@/views/shop/product/components/product-class-add-firstmenu.vue";
import collapse from "@/views/shop/product/components/product-class-collapse.vue";
import commonTabs from "./components/common-tabs.vue";

export default {
  data() {
    let itemData = {
      id: 0,
      parent_id: 0,
      status: 1,
      image: ""
    };
    return {
      isLoading: false,
      loading: false,
      minWidth: 1092,
      oparateClass: false, // 删除分类提示窗
      confirmText: "删除", // 确认按钮文字
      modalContentText: "", // 弹窗显示文字
      oparateData: {}, // 操作的数据
      showClassError: false, // 提交错误提醒显示
      productClassList: [],
      firstClassStatus: null,
      status: true
    };
  },
  components: {
    addFirstClass,
    collapse,
    commonTabs,
      footButton
  },
  created() {
    this.isLoading = true;
    this.getClassList(this.status);
  },
  methods: {
    /**
     * 获取一级分类是否只有一个二级分类
     */
    getFirstClassIDStatus(params) {
      if (params.row.secondMenu) {
        // 如果该二级有同级启用的分类
        if (
          (this.productClassList[params.index - 1].secondMenu &&
            this.productClassList[params.index - 1].status) ||
          (this.productClassList[params.index + 1] &&
            this.productClassList[params.index + 1].secondMenu &&
            this.productClassList[params.index + 1].status)
        ) {
          return params;
        }
        // 否则返回上级
        params.row = Object.assign({}, this.productClassList[params.index - 1]);
        params.index = params.index - 1;
        return params;
      } else {
        return params;
      }
    },
    /**
     * 获取数据和数据整理
     */
    getClassList(status) {
      this.$httpGet("/shop/admin/product/class/list", null, res => {
        // 拿到数据
        let data = res.data || [];
        let firstClass = [];
        let classArray = [];
        let firstClassStatus = {};
        let secondClassObject = {};

        // 筛选分类数据
        data.forEach(el => {
          if (el.parent_id > 0) {
            el.secondMenu = true;
            if (secondClassObject[el.parent_id]) {
              secondClassObject[el.parent_id].push(el);
            } else {
              secondClassObject[el.parent_id] = [el];
            }
          } else {
            firstClassStatus["coll-" + el.id] = false;
            firstClass.push(el);
          }
        });

        if (status) {
          this.firstClassStatus = firstClassStatus;
          this.status = false;
        }
        // 重新整合数据
        firstClass.forEach(el => {
          let temp = el;
          if (secondClassObject[el.id])
            temp["childClass"] = secondClassObject[el.id];
          else temp["childClass"] = [];
          classArray.push(temp);
        });
        // 赋值数据渲染
        this.productClassList = classArray;

        this.isLoading = false;
      });
    },
    /**
     * 数据检测和数据提交
     */
    async onSaveClick() {
      const tempFirstList = this.$refs.collapse.$refs.first.list;
      const tempSecondList = this.$refs.collapse.$refs.first.$refs.second;

      for (let index = 0; index < tempFirstList.length; index++) {
        tempFirstList[index]["order"] = index;
      }

      for (let index = 0; index < tempSecondList.length; index++) {
        for (let k = 0; k < tempSecondList[index].secondData.length; k++) {
          tempSecondList[index].secondData[k].order = k;
        }
      }

      // 检查数据是否有空值
      let statusArray = this.productClassList.filter(el => {
        if (!el.class_name.toString().trim()) {
          return true;
        } else {
          let subStatus = false;
          el.childClass.forEach(item => {
            if (!subStatus) subStatus = !item.class_name.toString().trim();
          });
          return subStatus;
        }
      });

      if (statusArray.length) {
        this.$Message.error("分类名称不能为空");
        return;
      }
      this.loading = true;
      // 上传处理图片
      let promiseArray = [];
      let classArray = [];

      this.productClassList.forEach((el, index) => {
        classArray.push(el);

        if (el.childClass.length > 0) {
          el.childClass.forEach(child => {
            classArray.push(child);
          });
        }
      });
      promiseArray = classArray.map(el => {
        if (el.file && typeof el.file === "object") {
          return new Promise(resolve => {
            let formDataFile = new FormData();
            formDataFile.append("class_image", el.file);
            if (el.id > 0) {
              formDataFile.append("class_id", el.id);
            }
            this.$httpUpload(
              "/shop/admin/product/class/image/upload",
              formDataFile,
              res => {
                el.image = res.data.image;
                resolve();
              }
            );
          });
        }
      });
      await Promise.all(promiseArray);
      // 获取需要提交的数据格式
      let productClassList = [];
      this.productClassList.forEach(el => {
        let itemData = {
          id: el.id,
          class_name: el.class_name,
          image: el.image,
          status: el.status,
          parent_id: el.parent_id,
          order: el.order,
          childClass: []
        };
        el.childClass.forEach((item, index) => {
          itemData.childClass.push({
            id: item.id,
            class_name: item.class_name,
            image: item.image,
            status: item.status,
            order: item.order
          });
        });
        productClassList.push(itemData);
      });
      this.http({
        url: "/shop/admin/product/class/save",
        method: "POST",
        data: {
          classList: productClassList
        }
      })
        .then(() => {
          this.$Message.success(this.$store.state.SUCCESS_MSG);
          this.getClassList();
        })
        .finally(() => {
          this.loading = false;
        });
    },
    /**
     * 提交错误弹窗回调
     */
    onShowErrorConfirm() {},
    /**
     * 操作分类（删除和禁用）
     */
    onOparateDataConfirm() {
      if (this.oparateData.type === "0") {
        if (this.oparateData.row.id > 0) {
          this.$httpGet(
            "/shop/admin/product/class/delete/" + this.oparateData.row.id,
            null,
            () => {
              this.$Message.success("删除成功");
              this.deleteClassData();
            }
          );
        } else {
          this.$Message.success("删除成功");
          this.deleteClassData();
        }
      } else {
        let status = this.oparateData.row.status > 0 ? 0 : 1;
        if (this.oparateData.row.id > 0) {
          this.$httpGet(
            "/shop/admin/product/class/status/" + this.oparateData.row.id,
            {
              status
            },
            () => {
              this.$Message.success("设置成功");
              this.setMenuStatus(status);
            }
          );
        } else {
          this.$Message.success("设置成功");
          this.setMenuStatus(status);
        }
      }
    },
    /**
     * 修改本地状态
     */
    setMenuStatus(status) {
      // 如果是二级，只改变自身
      if (this.oparateData.row.secondMenu) {
        this.$set(
          this.productClassList[this.oparateData.index],
          "status",
          status
        );
        return;
      }
      // 修改当前状态并改变下级状态
      for (
        let i = this.oparateData.index;
        i < this.productClassList.length;
        i++
      ) {
        if (this.productClassList[i].add) {
          break;
        }
        this.$set(this.productClassList[i], "status", status);
      }
    },
    /**
     * 删除分类数据
     */
    deleteClassData() {
      // 删除二级
      if (this.oparateData.row.secondMenu) {
        this.productClassList.splice(this.oparateData.index, 1);
        return;
      }

      // 删除一级
      let status = false;
      this.productClassList = this.productClassList.filter((el, index) => {
        // 不需要删除的
        if (index < this.oparateData.index || status) {
          return true;
        }
        // 本身和子级一起删除
        if (index === this.oparateData.index || el.secondMenu) {
          return false;
        } else {
          status = true;
          // 遇到该级的二级分类添加按钮的时候也需要删除
          return false;
        }
      });
    },
    /**
     * 返回操作提醒文字
     * productNum 当前下的商品数
     * oparate 操作类型
     */
    getModalShowText(productNum, oparate) {
      let modalContentText = `当前分类下，关联了<span style="color:red;">${productNum}</span>个商品。如继续进行${oparate}操作，该分类下的所有商品将清空商品分类数据，同时将无法通过商品分类功能进行搜索，是否确认继续${oparate}？`;
      return modalContentText;
    },
    /**
     * 增加一级分类数据
     */
    addFirstClass(data) {
      this.productClassList.unshift(data);
    }
  }
};
</script>

<style lang="less" scoped>
.product-class {
  position: relative;
  text-align: left;
  width: 100% !important;
  height: calc(100% - 70px);
}
.common-loading {
  animation: ani-demo-spin 1s linear infinite;
}
@keyframes ani-demo-spin {
  from {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(180deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.save-btn-box {
  position: fixed;
  bottom: 10px;
  height: 50px;
  background-color: #f00;
  line-height: 50px;
  width: calc(100% - 160px);
  background: #fff;
  text-align: center;
  border-top: 1px solid #e8eaec;
  text-align:center;
  border-radius: 0 0 3px 3px;
  .save-btn {
    width: 70px;
    height: 32px;
    background: #4a6af5;
    border-color: #4a6af5;
    color: #fff;
  }
}
</style>
