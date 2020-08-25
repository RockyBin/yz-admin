<template>
  <Modal
    :width="750"
    title="批量导入商品说明"
    footer-hide
    v-model="modalStatus"
    class="product-list-modal-batch-intro"
  >
    <div>
      <alert-warning title="操作流程说明：" style="margin-bottom:20px;">
        <p>
          第1步：提前在商城维护好<a style="color: #2D8CF0;cursor: default;"
            >商品分类</a
          >。
        </p>
        <p>
          第2步：<span style="display: inline-block;vertical-align: top;"
            >提前准备好<a style="color: #2D8CF0;cursor: default;">商品图片</a
            >，并图片名称必须与商品名称一致，命名的格式如：<br />商品名称-1
            商品名称-6；“1”代表主图，“1-6”代表图片的顺序，一个SPU最多只能上传前6张图片。</span
          >
        </p>
        <p>
          第3步：按【商品规格类型】下载对应的商品导入模板，<a
            style="color: #2D8CF0;cursor: default;"
            >按模板录入商品信息</a
          >。
        </p>
        <p>
          第4步：为了保证上传数据的完整性，<a
            style="color: #2D8CF0;cursor: default;"
            >请先上传【商品图片】文件，再上传【商品导入】表格文件</a
          >。
        </p>
      </alert-warning>
      <div class="product-list-modal-batch-content">
        <div class="product-list-modal-batch-item">
          <div>1.商品规格配置：</div>
          <div v-if="exampleData">
            <span>单规格商品</span>
            <Button type="primary" shape="circle" @click="getTemplate(0)"
              >下载模板</Button
            >
            <span>多规格商品</span>
            <Button type="primary" shape="circle" @click="getTemplate(1)"
              >下载模板</Button
            >
          </div>
        </div>
        <div class="product-list-modal-batch-item">
          <div>2.导入商品数据</div>
        </div>
        <div class="product-list-modal-batch-btn">
          <Button type="primary" @click="onUploadClick">去上传</Button>
          <div class="product-list-modal-batch-tip">
            1.【商品图片】文件：推荐上传尺寸800*800以上的图片，图片格式支持jpg、png，一次最多支持上传600张图片。<br />
            2.【商品导入】文件：支持xls格式文件，一次最多上传100个SPU商品
          </div>
        </div>
      </div>
    </div>
  </Modal>
</template>
<script>
import alertWarning from "@/views/shop/components/alert/alert-warning";
import commonFunction from "@/views/shop/components/common-function.js";
export default {
  components: {
    alertWarning
  },
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      modalStatus: false,
      exampleData: null
    };
  },
  watch: {
    value(val) {
      this.modalStatus = val;
      if (val && !this.exampleData) {
        this.getExampleUrl();
      }
    },
    modalStatus(val) {
      this.$emit("input", val);
    }
  },
  methods: {
    /**
     * 获取示例链接
     */
    getExampleUrl() {
      this.$httpGet("/shop/admin/product/import/examples", null, res => {
        if (res.code === 200) {
          this.exampleData = res.data;
        } else {
          this.$Message.error(res.msg);
        }
      });
    },
    /**
     * 去上传图片
     */
    onUploadClick() {
      this.modalStatus = false;
      this.$emit("onUpload");
    },
    /**
     * 下载模板
     */
    getTemplate(index) {
      commonFunction.exportTable(
        {},
        this.http,
        index ? this.exampleData.many : this.exampleData.single
      );
    }
  }
};
</script>
<style lang="less" scoped>
.product-list-modal-batch-intro {
  .product-list-modal-batch-content {
    .ivu-btn {
      width: 90px;
      height: 32px;
      line-height: 1;
      margin-right: 20px;
      vertical-align: top;
    }
    .product-list-modal-batch-item {
      display: flex;
      line-height: 32px;
      margin-bottom: 20px;
      & > div {
        &:nth-child(1) {
          margin-right: 14px;
        }
        &:nth-child(2) {
          span {
            margin-right: 10px;
            vertical-align: top;
          }
        }
      }
    }
  }
  .product-list-modal-batch-btn {
    padding-left: 10px;
    padding-bottom: 6px;
    margin-top: -10px;
    .product-list-modal-batch-tip {
      color: #9ea7b4;
      line-height: 16px;
      margin-top: 9px;
    }
    /deep/.ivu-btn {
      height: 32px;
      line-height: 1;
    }
  }
}
</style>
