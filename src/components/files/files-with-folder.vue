<!--此为带文件夹功能的资源管理器备份，后面可能会扩展出文件夹功能，先保留下代码供后面参考-->
<template>
  <Modal v-model="modalStatus" :title="title" :width="1000" @on-ok="onSubmit">
    <div class="container">
      <div class="folder-container">
        <a class="btn-new-folder" href="#" @click="newFolderModalStatus = true">
          <Icon type="md-add" size="20" />
          <span>新建文件夹</span>
        </a>
        <div class="folder-list">
          <a class="folder-item" href="#" @click="onFolderClick('', '')">
            <div class="folder-icon">
              <Icon v-if="0 != folderId" type="md-folder"></Icon>
              <Icon v-if="0 == folderId" type="md-folder-open"></Icon>
            </div>
            <span class="folder-name">所有文件</span>
          </a>
          <div
            style="display:flex"
            v-for="(item, index) in folderList"
            :key="index"
          >
            <a
              class="folder-item"
              style="padding-left:10px"
              href="#"
              @click="onFolderClick(item.id, item.name)"
            >
              <div class="folder-icon">
                <Icon v-if="item.id != folderId" type="md-folder"></Icon>
                <Icon v-if="item.id == folderId" type="md-folder-open"></Icon>
              </div>
              <span class="folder-name">{{ item.name }}</span>
            </a>
            <div class="btn-del-folder">
              <Icon type="ios-trash" @click="delFolder(item.id)" />
            </div>
          </div>
        </div>
      </div>
      <div class="file-container">
        <div class="file-addrbar" style="display:flex">
          <div class="curpath" style="flex:1">
            当前路径：
            <a
              href="#"
              @click="onFolderClick('', '')"
              style="line-height: 30px;"
              >所有文件</a
            >
            <span v-if="folderId != 0">
              <Icon
                type="md-arrow-dropright"
                size="20"
                style="margin-top:-4px;"
              />
              <a
                href="#"
                @click="onFolderClick(folderId, curFolder)"
                style="line-height: 30px;"
                >{{ curFolder }}</a
              >
            </span>
          </div>
          <div class="searchbar" style="width:270px;">
            <Input
              v-model="fileKeyword"
              :maxlength="30"
              style="width:100px"
              placeholder="请输入关键词"
              clearable
            />
            <Button
              type="primary"
              @click="onSearchFile"
              size="small"
              style="margin-left:10px"
              >搜索</Button
            >
            <Upload
              :before-upload="onUploadFile"
              action="/core/siteadmin/resourcemanage/file/upload"
              style="display:inline-block;margin-left: 10px"
            >
              <Button
                icon="ios-cloud-upload-outline"
                size="small"
                type="success"
                >上传新文件</Button
              >
            </Upload>
          </div>
        </div>
        <div class="file-list">
          <div class="list1">
            <div v-if="totalFiles == 0" class="nofile">当前条件下没有文件</div>
            <div style="overflow: auto; flex: 1">
              <div
                v-for="(item, index) in fileList"
                :key="index"
                class="file-item"
                href="#"
                @click="onFileClick(item)"
              >
                <div
                  class="file-img"
                  @mouseenter="fileHover(item.id)"
                  @mouseleave="fileLeave()"
                >
                  <div
                    v-if="isImage(item.path)"
                    class="img"
                    :style="
                      'background-image:url(' +
                        getFileFullPath(item.path) +
                        ');'
                    "
                  ></div>
                  <div v-else class="document">{{ item.type }} 文档</div>
                  <div class="toolbar" v-if="curHoveFileId == item.id">
                    <div class="btn-del">
                      <Icon
                        type="ios-trash-outline"
                        @click="delFile(item.id)"
                      />
                    </div>
                  </div>
                </div>
                <div class="file-name">{{ item.name }}</div>
              </div>
            </div>
            <div class="pages">
              <Page
                style="text-align: right;margin-top: 20px;"
                :total="totalFiles"
                size="small"
                :page-size="pageSize"
                :current="currentFilePage"
                @on-change="onFilePageChange"
                show-elevator
              />
            </div>
            <Spin fix v-if="uploading">
              <Icon
                type="ios-loading"
                size="50"
                class="demo-spin-icon-load"
              ></Icon>
              <div>上传中，请稍候</div>
            </Spin>
          </div>
          <div class="list2">
            <div
              v-if="selectedFiles.length > 0"
              class="selected-files"
              style="flex: 1;overflow: auto;text-align:center;"
            >
              <div
                v-for="(item, index) in selectedFiles"
                :key="index"
                class="file-item"
                href="#"
                @click="unSelectFile(item)"
                title="点击取消选择"
              >
                <div class="file-img">
                  <div
                    v-if="isImage(item.path)"
                    class="img"
                    :style="
                      'background-image:url(' +
                        getFileFullPath(item.path) +
                        ');'
                    "
                  ></div>
                  <div v-else class="document">{{ item.type }} 文档</div>
                </div>
              </div>
            </div>
            <div v-else style="text-align:center;color: #666;padding:30px 0">
              当前没有选中文件
            </div>
            <div
              v-if="selectedFiles.length > 0"
              style="height: 30px;line-height: 30px;text-align:center;color: #666"
            >
              已选择 <b>{{ selectedFiles.length }}</b> 个文件
            </div>
          </div>
        </div>
      </div>
    </div>
    <Modal v-model="newFolderModalStatus" :title="'新建文件夹'" :width="200">
      <Form>
        <Input
          v-model="newFolderName"
          :maxlength="30"
          placeholder="请输入文件夹名称"
        />
      </Form>
      <div slot="footer">
        <Button type="primary" @click="onNewFolderSubmit">确定</Button>
      </div>
    </Modal>
  </Modal>
</template>
<script type="text/ecmascript-6">
export default {
  props: {
    value: {
      type: Boolean,
      default: false
    },
    /**
     * 对话框标题
     */
    title: {
      type: String,
      default: "资源管理器"
    },
    /** 最多可以选多少个文件 */
    max: {
      type: Number,
      default: 1
    },
    /** fileTypes */
    fileTypes: {
      type: String,
      default: "image"
    },
    /**
     * 要显示的tab有哪些
     */
    tabs: {
      type: Array,
      default: function() {
        return ["files", "icons"];
      }
    }
  },
  data() {
    return {
      modalStatus: false,
      fileKeyword: "",
      fileList: [],
      currentFilePage: 1,
      pageSize: 36,
      curHoveFileId: 0,
      totalFiles: 0,
      folderList: [],
      folderId: "",
      selectedFiles: [],
      newFolderModalStatus: false,
      newFolderName: "",
      curPath: "/",
      curFolder: "",
      uploading: false
    };
  },
  mounted() {
    this.getFolderList();
    this.getFileList();
  },
  watch: {
    // 弹窗显示
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
  methods: {
    /**
     * 点击确定
     */
    onSubmit() {
      var ret = [];
      this.selectedFiles.forEach(element => {
        ret.push(this.$store.state.siteComdataPath + element.path);
      });
      this.$emit("onSelected", ret);
      this.modalStatus = false;
      this.selectedFiles = [];
    },
    /**
     * 选中文件夹
     */
    onFolderClick(id, name) {
      if (this.folderId != id) {
        this.curFolder = name;
        this.folderId = id;
        this.fileKeyword = "";
        this.currentFilePage = 1;
        this.getFileList();
      }
    },
    /**
     * 选中文件
     */
    onFileClick(file) {
      if (this.max == 1) this.selectedFiles = []; //当只能选一个文件时，先清空已选文件列表，以便让新选的文件替换原来的文件
      if (this.max == this.selectedFiles.length) {
        this.$Message.error({
          content: "最多只能选择" + this.max + "个文件",
          duration: 2
        });
        return;
      }
      var found = false;
      this.selectedFiles.forEach(element => {
        if (element.path == file.path) {
          found = true;
        }
      });
      if (!found) this.selectedFiles.push(file);
    },
    /**
     * 取消选中文件
     */
    unSelectFile(file) {
      var gindex = -1;
      this.selectedFiles.forEach((element, index) => {
        if (element.path == file.path) {
          gindex = index;
        }
      });
      if (gindex > -1) {
        this.selectedFiles.splice(gindex, 1);
      }
    },
    /**
     * 删除文件夹
     */
    delFolder(id) {
      this.$Modal.confirm({
        title: "删除确认",
        content:
          "删除文件夹将同步删除此文件夹下的所有文件，并不能恢复，确认吗？",
        okText: "删除",
        cancelText: "取消",
        loading: true,
        onOk: () => {
          let data = { id: id };
          this.$httpPost(
            "/core/siteadmin/resourcemanage/folder/delete",
            data,
            res => {
              if (res.code != 200) {
                this.$Message.error({
                  content: res.msg,
                  duration: 2
                });
                return;
              }
              this.$Modal.remove();
              this.getFolderList();
              if (id == this.folderId) {
                this.folderId = "";
                this.fileKeyword = "";
                this.currentFilePage = 0;
                this.getFileList();
              }
            }
          );
        }
      });
    },
    /**
     * 新建文件夹
     */
    onNewFolderSubmit() {
      this.newFolderName.replace(/^\s+|\s+$/, "");
      if (this.newFolderName.length == 0) {
        this.$Message.error({
          content: "请输入文件夹名称",
          duration: 2
        });
        setTimeout(() => {
          this.newFolderModalStatus = true;
        }, 10);
      } else {
        let data = { name: this.newFolderName };
        this.$httpPost(
          "/core/siteadmin/resourcemanage/folder/add",
          data,
          res => {
            if (res.code != 200) {
              this.$Message.error({
                content: res.msg,
                duration: 2
              });
              return;
            }
            this.newFolderModalStatus = false;
            this.newFolderName = "";
            this.getFolderList();
          }
        );
      }
    },
    /**
     * 获取文件夹列表
     */
    getFolderList() {
      let data = {};
      this.$httpGet("/core/siteadmin/resourcemanage/folder/list", data, res => {
        this.folderList = res.data.list || [];
      });
    },
    /**
     * 获取文件列表
     */
    getFileList() {
      let data = {
        page: this.currentFilePage,
        page_size: this.pageSize,
        keyword: this.fileKeyword,
        folder_id: this.folderId,
        type: this.fileTypes,
        sort_key: "id",
        sort_direction: "desc"
      };
      this.$httpGet("/core/siteadmin/resourcemanage/file/list", data, res => {
        this.currentFilePage = Number(res.data.current);
        this.totalFiles = res.data.total;
        this.fileList = res.data.list || [];
      });
    },
    /**
     * 分页切换
     */
    onFilePageChange(index) {
      this.currentFilePage = index;
      this.getFileList();
    },
    /**
     * 搜索文件
     */
    onSearchFile() {
      this.fileKeyword.replace(/^\s+|\s+$/, "");
      this.currentFilePage = 1;
      this.getFileList();
    },
    /**
     * 清除所有查询条件
     */
    resetFileQueryParams() {
      this.folderId = "";
      this.fileKeyword = "";
      this.currentFilePage = 1;
      this.curFolder = "";
    },
    /**
     * 上传文件
     */
    onUploadFile(file) {
      let fileData = new FormData();
      this.uploading = true;
      fileData.append("file", file);
      fileData.append("folder_id", this.folderId);
      this.$httpUpload(
        "/core/siteadmin/resourcemanage/file/upload",
        fileData,
        res => {
          if (res.code != 200) {
            this.$Message.error({
              content: res.msg,
              duration: 2
            });
            this.uploading = false;
            return;
          }
          this.fileKeyword = "";
          this.currentFilePage = 1;
          this.uploading = false;
          this.getFileList();
        }
      );
      return false;
    },
    /**
     * 获取用户上传文件的完整路径
     */
    getFileFullPath(path) {
      return this.$store.state.siteComdataPath + path;
    },
    /**
     * 获取文件是否为图片
     */
    isImage(path) {
      return /\.(gif|jpg|png|jpeg)$/i.test(path);
    },
    /**
     * 删除文件
     */
    delFile(id) {
      this.$Modal.confirm({
        title: "删除确认",
        content: "删除文件后不能恢复，确认吗？",
        okText: "删除",
        cancelText: "取消",
        loading: true,
        onOk: () => {
          let data = { id: id };
          this.$httpPost(
            "/core/siteadmin/resourcemanage/file/delete",
            data,
            res => {
              if (res.code != 200) {
                this.$Message.error({
                  content: res.msg,
                  duration: 2
                });
                return;
              }
              this.$Modal.remove();
              this.getFileList();
            }
          );
        }
      });
    },
    fileHover(id) {
      if (window["timeout_file"]) clearTimeout(window["timeout_file"]);
      this.curHoveFileId = id;
    },
    fileLeave() {
      window["timeout_file"] = setTimeout(() => {
        this.curHoveFileId = 0;
      }, 100);
    }
  }
};
</script>
<style lang="less" scoped>
/deep/.ivu-modal-body {
  padding: 0px 16px;
}
/*定义滚动条高宽及背景 高宽分别对应横竖滚动条的尺寸*/
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
  background-color: #f5f5f5;
}
/*定义滚动条轨道 内阴影+圆角*/
::-webkit-scrollbar-track {
  box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  background-color: #f5f5f5;
}
/*定义滑块 内阴影+圆角*/
::-webkit-scrollbar-thumb {
  border-radius: 10px;
  box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
  background-color: #999;
}
.container {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  height: 500px;

  .folder-container {
    width: 150px;
    border-right: 1px solid #ddd;

    .btn-new-folder {
      display: block;

      .ivu-icon {
        margin-top: -3px;
      }

      > span {
        display: inline-block;
        margin-left: 10px;
        margin-top: 2px;
        line-height: 25px;
        height: 25px;
      }
    }
    .folder-list {
      overflow: auto;
      height: 475px;
    }
    .folder-item {
      flex: 1;
      display: inline-block;

      .folder-icon {
        display: inline-block;
        line-height: 25px;
        height: 25px;
        font-size: 20px;
      }

      .folder-name {
        display: inline-block;
        margin-left: 10px;
        line-height: 25px;
        height: 25px;
      }
    }
    .btn-del-folder {
      width: 25px;
      display: inline-block;
      margin-left: 10px;
      line-height: 25px;
      height: 25px;
      color: #666;
      font-size: 20px;
      cursor: pointer;
    }
    .btn-del-folder:hover {
      color: #333;
    }
  }
  .file-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 0 10px;

    .file-addrbar {
      height: 50px;
      line-height: 50px;
    }
    .pages {
      width: 100%;
      height: 50px;
      padding-right: 20px;
    }
    .file-list {
      flex: 1;
      position: relative;
      display: flex;

      .list1 {
        flex: 1;
        display: flex;
        flex-direction: column;
        position: relative;
      }
      .list2 {
        width: 130px;
        display: flex;
        flex-direction: column;
        border-left: 1px solid #ddd;
        margin-left: -3px;
      }
    }
    .file-item {
      position: relative;
      display: inline-block;
      margin: 5px;
      overflow: hidden;
      width: 100px;

      .file-img {
        width: 100px;
        height: 100px;
        border: 1px solid #ccc;
        position: relative;

        .img {
          width: 100%;
          height: 98px;
          position: relative;
          background-position: center;
          background-repeat: no-repeat;
          background-size: contain;
        }
        .document {
          position: absolute;
          width: 100%;
          height: 100%;
          line-height: 100%;
          text-align: center;
        }
        .toolbar {
          position: absolute;
          bottom: 5px;
          text-align: center;
          width: 100%;

          .btn-del {
            background: #333;
            width: 25px;
            height: 25px;
            border-radius: 12px;
            cursor: pointer;
            display: inline-block;

            i {
              font-size: 20px;
              color: white;
              margin-left: 1px;
              margin-top: 2px;
            }
          }
        }
      }
      .file-img:hover {
        border: 1px solid #0066cc;
      }
      .file-name {
        text-align: center;
        overflow: hidden;
      }
    }
    .nofile {
      height: 300;
      line-height: 300px;
      width: 100%;
      font-size: 14px;
      text-align: center;
    }
  }
}
</style>
