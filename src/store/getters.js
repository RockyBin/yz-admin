export default {
  /**
   * 计算出需要显示的菜单列表
   */
  menuList(state) {
    let menuList = [];
    state.Menus.root.forEach(item => {
      if (item.type === "menu") {
        // 一级菜单
        let menuCopy = Object.assign({}, item);
        menuList.push(menuCopy);
        // 如果存在二级菜单
        if (menuCopy.name && state.Menus[menuCopy.name]) {
          // 二级菜单
          let secondMenu = state.Menus[menuCopy.name].map(secondMenu => {
            // 如果存在三级菜单
            if (secondMenu.name && state.Menus[secondMenu.name]) {
              // 三级菜单
              secondMenu.threeMenu = state.Menus[secondMenu.name].map(
                threeMenu => {
                  // 如果存在四级菜单
                  if (threeMenu.name && state.Menus[threeMenu.name]) {
                    // 四级菜单
                    threeMenu.fourthMenu = state.Menus[threeMenu.name].map(
                      fourthMenu => {
                        return Object.assign({}, fourthMenu);
                      }
                    );
                  }
                  return Object.assign({}, threeMenu);
                }
              );
            }
            return Object.assign({}, secondMenu);
          });
          menuCopy.secondMenu = secondMenu;
        }
      }
    });
    return menuList;
  }
};
