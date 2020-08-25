export default {
  classList: [],
  sortedClassList: [],
  treeClassList: [],
  /**
   * 新建实例
   * @param 原始的分类列表 clsList 
   */
  newIntance(clsList) {
    this.classList = clsList;
    return this;
  },
  /**返回经过父级与子级排序的列表 */
  getSortedList() {
    this.sortedClassList = [];
    if (this.classList && this.classList.length) {
      this.classList.forEach(item => {
        if (item.parent_id == 0) {
          item.space = 1;
          this.sortedClassList.push(item);
          var sub = this.getClassByParent(item.id);
          sub.forEach(sitem => {
            sitem.space = 2;
            this.sortedClassList.push(sitem);
          });
        }
      });
    }
    return this.sortedClassList;
  },
  /**返回树形结构的分类 */
  getTreeList() {
    //生成树形结构
    this.treeClassList = [];
    if (this.classList && this.classList.length) {
      this.classList.forEach(item => {
        if (item.parent_id == 0) {
          var newItem = Object.assign({}, item);
          newItem.children = [];
          var sub = this.getClassByParent(item.id);
          sub.forEach(sitem => {
            newItem.children.push(sitem);
          });
          this.treeClassList.push(newItem);
        }
      });
    }
    return this.treeClassList;
  },
  /**
   * 返回某个分类的子分类
   * @param pid 父分类ID
   */
  getClassByParent(pid) {
    var arr = [];
    if (this.classList && this.classList.length) {
      this.classList.forEach(item => {
        if (item.parent_id == pid) {
          arr.push(item);
        }
      });
    }
    return arr;
  },
  /**
   * 获取某个分类的父分类
   * @param id 分类ID
   */
  getParentClass(id) {
    var arr = [];
    if (this.classList && this.classList.length) {
      var pid = 0;
      this.classList.forEach(item => {
        if (item.id == id) {
          pid = item.parent_id;
        }
      });

      this.classList.forEach(item => {
        if (item.id == pid) {
          arr.push(item);
        }
      });
    }
    return arr;
  }
};