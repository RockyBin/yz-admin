<template>
  <div class="function-select" v-if="currentItem">
    <!--跳网页-->
	<div
      v-if="menu==1"
      class="block block1"
      :style="{'max-height':currentItem.type==0?'115px':'40px'}"
    >
      <h3>
        <Radio :value="currentItem.type==0" @click.native="$set(currentItem, 'type',0)">跳转到页面</Radio>
      </h3>
      <div class="content">
        <span>链接：</span>
        <LinkButton
          style="display:inline-block;margin-left:10px;"
          :context="currentItem.data"
          :text="currentItem.data.url_name"
          @onSelectLink="onLinkSelected"
        ></LinkButton>
      </div>
    </div>
	<!--跳小程序-->
	<div
      class="block block6"
      :style="{'max-height':currentItem.type==4?'155px':'40px'}"
    >
      <h3>
        <Radio :value="currentItem.type==4" @click.native="$set(currentItem, 'type',4)">跳转到小程序</Radio>
      </h3>
      <div class="content">
        <div>
			<span style="width: 105px;display: inline-block;text-align:right;">小程序AppId：</span>
			<Input v-model="currentItem.data.appid" style="width: 300px" placeholder="请输入小程序AppID" />
		</div>
		<div style="margin-top: 10px">
			<span style="width: 105px;display: inline-block;text-align:right;">小程序页面路径：</span>
			<Input v-model="currentItem.data.page" style="width: 300px" placeholder="请输入小程序页面路径" />
		</div>
      </div>
    </div>
    <!-- 回复消息文本 -->
    <div class="block block2" :style="{'max-height':currentItem.type-menu==0?'383px':'40px'}">
      <h3>
        <Radio
          :value="currentItem.type-menu==0"
          @click.native="$set(currentItem, 'type',menu)"
        >回复消息文本</Radio>
      </h3>
      <div class="content">
        <ue-editor
          class="rich-editor"
          :hideImageSelector="true"
          v-model="currentItem.data.content"
          :setting="editorSetting"
        ></ue-editor>
      </div>
    </div>
    <!-- 回复图文消息 -->
    <div class="block block3" :style="{'max-height':currentItem.type-menu==1?'129px':'40px'}">
      <h3>
        <Radio
          :value="currentItem.type-menu==1"
          @click.native="$set(currentItem, 'type',menu+1)"
        >回复图文消息</Radio>
      </h3>
      <div class="content">
        <div v-if="currentItem.data.news_item_id || currentItem.data.news_id" class="material">
          <img
            :src="currentItem.data.news_item_image&&$store.state.siteComdataPath+currentItem.data.news_item_image"
            alt
          />
          <p>{{currentItem.data.news_item_title}}</p>
          <Icon type="md-close-circle" size="20" @click="deleteMaterial" />
        </div>
        <div v-else>
          <Button type="primary" @click="showMaterialSelect=true">选择图文</Button>
          <Button
            v-if="materialGroup"
            type="primary"
            @click="showMaterialGroupSelect=true"
            style="margin-left:10px;"
          >选择图文组</Button>
        </div>
      </div>
    </div>
    <!-- 回复图片 -->
    <div class="block block4" :style="{'max-height':currentItem.type-menu==2?'128px':'40px'}">
      <h3>
        <Radio
          :value="currentItem.type-menu==2"
          @click.native="$set(currentItem, 'type',menu+2)"
        >回复图片</Radio>
      </h3>
      <div class="content">
        <Button class="btn" type="dashed" @click="onShowFilesSelector">
          <Icon
            v-if="currentItem.data.image"
            type="md-close-circle"
            size="16"
            @click.stop="$set(currentItem.data,'image','')"
          />
          <Icon v-if="!currentItem.data.image" type="md-add" size="12" color="#c4c6cc" />
          <img
            v-if="currentItem.data.image"
            :src="$store.state.siteComdataPath+currentItem.data.image"
          />
        </Button>
      </div>
    </div>
    <!-- 分享海报 -->
    <div
      class="block block5"
      :style="{'max-height':currentItem.type==99 && callbackType==1?'128px':'40px'}"
      v-if="showPoster"
    >
      <h3>
        <Radio :value="currentItem.type==99 && callbackType==1" @click.native="setCallback(1)">分享海报</Radio>
      </h3>
      <div class="content">
        <Button class="btn" type="dashed" @click="onShowPosterSelector">
          <Icon
            v-if="currentItem.paper_id"
            type="md-close-circle"
            size="16"
            @click.stop="clearImgUrl"
          />
          <Icon v-if="!currentItem.paper_id" type="md-add" size="12" color="#c4c6cc" />
          <img v-if="currentItem.paper_id" :src="baseUrl + currentItem.paper_image" />
        </Button>
      </div>
    </div>
    <FilesSelector v-model="showFilesSelector" @onSelected="onFilesSelected"></FilesSelector>
    <PosterChooseModal
      v-model="showPosterSelector"
      :currentItem="posterItem"
      @onOk="onChooseTemplate"
    ></PosterChooseModal>
    <MaterialSelect v-model="showMaterialSelect" @onSelected="onMaterialSelected"></MaterialSelect>
    <MaterialSelect
      v-model="showMaterialGroupSelect"
      :isGroup="materialGroup"
      @onSelected="onMaterialSelected"
    ></MaterialSelect>
  </div>
</template>
<script>
import ueEditor from "@/views/shop/components/editor/editor.vue";
import LinkButton from "@/views/shop/store/design/components/link-select-button";
import FilesSelector from "@/components/files/files";
import MaterialSelect from "./material-select.vue";
import PosterChooseModal from "@/views/shop/store/components/poster-choose-modal.vue";
import axios from "axios";

export default {
  props: ["menu", "currentItem", "showPoster", "materialGroup"], //menu==1为菜单功能选择，menu==0为自动回复类型选择
  components: {
    LinkButton,
    ueEditor,
    FilesSelector,
    PosterChooseModal,
    MaterialSelect
  },
  data() {
    return {
      // material: null, //素材对象
      link_desc: "请选择链接",
      showFilesSelector: false,
      showPosterSelector: false,
      showMaterialSelect: false,
      showMaterialGroupSelect: false,
      editorSetting: {
        enterTag: "br",
        initialFrameHeight: "223",
        autoHeightEnabled: true,
        initialFrameWidth: "550",
        topOffset: 48,
        // wordCount: true,
        maximumWords: 300,
        wordCountMsg: "{#count}/300",
        wordOverFlowMsg: "<span style='color:red;'>最多输入300个字符！</span>",
        toolbars: [["undo", "redo", "link", "unlink"]]
      },
      templatePaperId: 0, // 选择的模板id
      baseUrl: ""
    };
  },
  computed: {
    posterItem() {
      return this.currentItem && this.currentItem.paper_id
        ? {
            id: this.currentItem.paper_id,
            name: this.currentItem.paper_name
          }
        : null;
    },
    callbackType() {
      return this.currentItem && this.currentItem.callback_type;
    }
  },
  created() {
    this.baseUrl = this.http.defaults.baseURL + "/";
  },
  watch: {
	"currentItem.type": function(val){
		if(val == 4 && !this.currentItem.data.page) {
			this.currentItem.data.page = "pages/index";
		}
	}
  },
  methods: {
    clearImgUrl() {
      this.$emit("clearPaperId");
    },
    onLinkSelected(linkInfo, item) {
      this.$set(this.currentItem.data, "url", linkInfo.url);
      this.$set(this.currentItem.data, "url_name", linkInfo.desc);
    },
    onShowFilesSelector(item) {
      this.showFilesSelector = true;
    },
    onShowPosterSelector() {
      this.showPosterSelector = true;
    },
    onFilesSelected(files) {
      if (files.length > 0) {
        this.$set(
          this.currentItem.data,
          "image",
          files[0].replace(this.$store.state.siteComdataPath, "")
        );
      }
    },
    // 选择模板
    onChooseTemplate(tmpObj) {
      this.$set(this.currentItem, "paper_image", tmpObj.preview_image);
      this.$set(this.currentItem, "paper_name", tmpObj.name);
      if (tmpObj.id) {
        this.$emit("setCallbackPaperId", tmpObj);
      }
    },
    deleteMaterial() {
      this.$set(this.currentItem.data, "news_item_id", "");
      this.$set(this.currentItem.data, "news_id", "");
      this.$set(this.currentItem.data, "media_id", "");
      this.$set(this.currentItem.data, "news_item_image", "");
      this.$set(this.currentItem.data, "news_item_title", "");
    },
    onMaterialSelected(material) {
      if (this.showMaterialGroupSelect) {
        this.$set(this.currentItem.data, "news_id", material.id);
        this.$set(this.currentItem.data, "media_id", material.media_id);
      } else {
        this.$set(this.currentItem.data, "news_item_id", material.id);
      }
      this.$set(this.currentItem.data, "news_item_image", material.image);
      this.$set(this.currentItem.data, "news_item_title", material.title);
    },
    // 当类型为自定义回复时 调用 当前只有分享海报
    setCallback(type) {
      this.$set(this.currentItem, "type", 99);
      this.$emit("setCallbackType", type);
    }
  }
};
</script>
<style lang="less" scoped>
.function-select {
  /deep/.rich-editor {
    .edui-editor-iframeholder {
      width: 410px !important;
    }
  }
  .block {
    background: white;
    border-radius: 5px;
    border: solid 1px #dcdee2;
    margin-bottom: 16px;
    color: #464c5b;
    overflow: hidden;
    transition: max-height 0.3s;
    h3 {
      font-weight: normal;
      padding-left: 10px;
      height: 40px;
      line-height: 40px;
    }
    .content {
      padding: 20px;
      border-top: 1px solid #dcdee2;
    }
    /deep/.ivu-radio{
      margin-right: 5px !important;
    }
  }
  .block1/deep/.layout-1 {
    & > div {
      display: inline-block;
      vertical-align: middle;
      width: 300px !important;
      margin-right: 10px;
    }
    /deep/.select-button {
      margin: 0;
    }
  }

  .block2/deep/.edui-editor {
    line-height: normal;
  }

  .block3 .btn {
    width: 80px;
    height: 32px;
  }
  .material {
    position: relative;
    img {
      width: 80px;
      height: 44px;
      object-fit: cover;
      float: left;
      margin-right: 16px;
    }
    /deep/.ivu-icon-md-close-circle {
      display: none;
      position: absolute;
      right: -10px;
      top: -10px;
      cursor: pointer;
      background: white;
    }
    &:hover {
      outline: 1px solid #4570ea;
      /deep/.ivu-icon-md-close-circle {
        display: inline-block;
      }
    }
    &:after {
      content: "";
      display: table;
      clear: both;
    }
  }

  .block4 .btn,
  .block5 .btn {
    position: relative;
    width: 44px;
    height: 44px;
    padding: 0;
    margin-right: 10px;
    vertical-align: text-bottom;
    cursor: pointer;
    /deep/.ivu-icon-md-close-circle {
      display: none;
      position: absolute;
      top: -8px;
      right: -8px;
      color: rgb(100, 100, 100) !important;
      background: #fff;
      border-radius: 50%;
      &:hover {
        color: rgb(130, 130, 130) !important;
      }
    }
    &:hover {
      /deep/.ivu-icon-md-close-circle {
        display: inline-block;
      }
    }
    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }
}
</style>