export default {
  Menu: {},
  Routers: {},
  SUCCESS: `ok`, // 成功后台返回代码
  SUCCESS_MSG: `保存成功`, // 保存成功提示
  FAIL_MSG: `保存失败`, // 保存失败提示
  SITE_ID: `site_id`, // 站点Id字段
  UNBLANK_MSG: `不能为空！`, // 不能为空消息验证
  NUM_CHECK_MSG: `输入非零整数，值不能为空`, // 数字认证
  TODOFORM_MSG: `验证不通过！`, // 验证不通过！
  COMMON_loading: false, // 通用Loading
  siteComdataPath: "", // 网站公共图片路径
  hasHomePage: false, // 是否存在首页
  storeInfo: {}, //当前店铺信息（店铺名称，logo，描述）
  userInfo: {}, //当前登陆的用户信息（用户名，角色ID，权限）
  LicensePerm: [], //版本权限
  wsConfig: {}, // websocket配置
  isBoundWX: true,
  templateData: {}, //模板数据
  wxAppInfo: {} //小程序信息
};
