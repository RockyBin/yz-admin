export default {
  // root为一级菜单
  root: [
    // {
    //   name: "login",
    //   path: "/login",
    //   isHide: true,
    //   meta: {
    //     title: "登陆"
    //   },
    //   component: () => import("@/views/login.vue")
    // },
    {
      name: "home",
      path: "/",
      meta: {
        title: "商城概况",
        icon: "icon-logo-buffer"
      },
      component: () => import("@/views/Home.vue")
    },
    {
      name: "test",
      path: "/test",
      isHide: true,
      meta: {
        title: "测试"
      },
      component: () => import("@/views/test.vue")
    },
    {
      name: "about", // 路由的name 其二级菜单为 product: [{...},{...}]
      path: "/about", // 路由path
      meta: {
        title: "关于", // 菜单名称
        //AdminPerm: "ProductMenuAdm", // 需要的管理员权限
        //LicensePerm: "", // 需要的版本权限
        redir: "/about/contact", // 要跳转的path
        icon: "icon-chanpin"
      }
    },
    {
      name: "store",
      path: "/store",
      meta: {
        title: "店铺管理",
        redir: "/store/store-manage",
        icon: "icon-md-basket"
      }
    },
    {
      name: "bigscreen",
      path: "/bigscreen",
      meta: {
        title: "广告屏管理",
        redir: "/bigscreen/bigscreen-manage",
        icon: "icon-menchuang-",
		LicensePerm: "ENABLE_ADSCREEN"
      }
    },
    {
      name: "product",
      path: "/product",
      meta: {
        title: "商品管理",
        redir: "/product/manage",
        icon: "icon-md-cube"
      }
    },
    {
      name: "order",
      path: "/order",
      meta: {
        title: "订单管理",
        redir: "/order/order-shop",
        icon: "icon-md-list-box"
      }
    },
    {
      name: "member", // 路由的name 其二级菜单为 product: [{...},{...}]
      path: "/member", // 路由path
      meta: {
        title: "会员管理", // 菜单名称
        redir: "/member/list", // 要跳转的path
        icon: "icon-md-person"
      }
    },
    {
      name: "distributor", // 路由的name 其二级菜单为 product: [{...},{...}]
      path: "/distributor", // 路由path
      meta: {
        LicensePerm: "ENABLE_DISTRIBUTION",
        title: "分销管理", // 菜单名称
        redir: "/distributor/list", // 要跳转的path
        icon: "icon-md-contacts"
      }
    },
    {
      name: "agent",
      path: "/agent", // 路由path
      meta: {
        LicensePerm: "ENABLE_AGENT",
        title: "代理商管理", // 菜单名称
        redir: "/agent/list", // 要跳转的path
        icon: "icon-team-admin"
      }
    },
    {
      name: "areaagent",
      path: "/areaagent", // 路由path
      meta: {
        LicensePerm: "ENABLE_AREA_AGENT",
        title: "区域代理", // 菜单名称
        redir: "/areaagent/list", // 要跳转的path
        icon: "icon-quyudaili"
      }
    },
    {
      name: "dealer",
      path: "/dealer", // 路由path
      meta: {
        LicensePerm: "ENABLE_CLOUDSTOCK",
        // LicensePerm: "ENABLE_DEALER",
        title: "经销商云仓", // 菜单名称
        redir: "/dealer/list", // 要跳转的path
        icon: "icon-md-storehouse"
      }
    },
    {
      name: "supplier",
      path: "/supplier", // 路由path
      meta: {
        title: "供应商管理", // 菜单名称
        LicensePerm: "ENABLE_SUPPLIER",
        redir: "/supplier/list",
        icon: "icon-Supplier"
      }
    },
    {
      name: "security",
      path: "/security",
      meta: {
        LicensePerm: "ENABLE_SECURITY_CODE",
        title: "防伪管理",
        redir: "/security/batch",
        icon: "icon-security"
      }
    },
    {
      name: "finance",
      path: "/finance",
      meta: {
        title: "财务管理",
        redir: "/finance/finance-manage",
        icon: "icon-md-filing"
      }
    },
    {
      name: "marketing",
      path: "/marketing",
      meta: {
        title: "营销应用",
        icon: "#icon-yingyong2",
        AdminPerm:
          "group.buying.view,coupon.view,point.view,rechargebonus.view,security.view,express.view,free.shipping.view"
      },
      component: () => import("@/views/shop/marketing/marketing-index.vue")
    },
    {
      name: "live",
      path: "/live",
      meta: {
        LicensePerm: "ENABLE_LIVE",
        title: "直播互动",
        redir: "/live/live-manage",
        icon: "icon-zhibo"
      }
    },
    {
      name: "staff",
      path: "/staff",
      meta: {
        title: "员工CRM",
        redir: "/staff/staff-list",
        icon: "icon-yuangongguanli"
      }
    },
    {
      name: "channel",
      path: "/channel",
      meta: {
        title: "渠道管理",
        redir: "/channel/weixin",
        icon: "icon-qudaoguanli"
      }
    },
    {
      name: "setting",
      path: "/setting",
      meta: {
        title: "系统设置",
        redir: "/setting/mall",
        icon: "icon-md-settings"
      }
    }
  ],
  member: [{
      path: "/member/list",
      name: "memberList",
      meta: {
        title: "会员列表",
        parent: "member",
        AdminPerm: "member.view"
      },
      component: () => import("@/views/shop/member/member-list.vue")
    },
    {
      path: "/member/level",
      name: "memberLevel",
      meta: {
        title: "会员等级",
        parent: "member",
        AdminPerm: "member.level.view"
      },
      component: () => import("@/views/shop/member/member-level.vue")
    },
    {
      path: "/member/fans-list",
      name: "memberFansList",
      meta: {
        title: "粉丝列表",
        parent: "member",
        AdminPerm: "fans.view"
      },
      component: () => import("@/views/shop/member/member-fans-list.vue")
    },
    {
      path: "/member/label",
      name: "memberLabel",
      meta: {
        title: "会员标签",
        parent: "member",
        AdminPerm: "member.label.view"
      },
      component: () => import("@/views/shop/member/member-label.vue")
    }
  ],
  memberLevel: [{
      path: "/member/level/container",
      name: "memberLevelContainer",
      meta: {
        title: "新增会员等级",
        parent: "memberLevel",
        AdminPerm: "member.level.view"
      },
      component: () =>
        import("@/views/shop/member/components/member-level-container.vue")
    },
    {
      path: "/member/level/edit",
      name: "memberLevelEdit",
      meta: {
        title: "修改会员等级",
        parent: "memberLevel",
        AdminPerm: "member.level.view"
      },
      component: () =>
        import("@/views/shop/member/components/member-level-container.vue")
    }
  ],
  memberList: [{
    path: "/member/detail",
    name: "memberDetail",
    meta: {
      title: "会员详情",
      parent: "memberList",
      AdminPerm: "member.detail.view"
    },
    component: () => import("@/views/shop/member/member-detail.vue")
  }],
  distributor: [{
      path: "/distributor/list",
      name: "distributorList",
      meta: {
        title: "分销商列表",
        parent: "distributor",
        LicensePerm: "ENABLE_DISTRIBUTION",
        AdminPerm: "distributor.view"
      },
      component: () => import("@/views/shop/distributor/distributor-list.vue")
    },
    {
      path: "/distributor/verify",
      name: "distributorVerify",
      meta: {
        title: "分销商审核",
        parent: "distributor",
        LicensePerm: "ENABLE_DISTRIBUTION",
        AdminPerm: "distributor.review.view"
      },
      component: () => import("@/views/shop/distributor/distributor-verify.vue")
    },
    {
      path: "/distributor/setting",
      name: "distributorSetting",
      meta: {
        title: "分销商设置",
        parent: "distributor",
        hasChildren: true,
        LicensePerm: "ENABLE_DISTRIBUTION",
        AdminPerm: "distributor.config.view"
      },
      component: () =>
        import("@/views/shop/distributor/distributor-setting.vue")
    },
    {
      path: "/distributor/level",
      name: "distributorLevel",
      meta: {
        title: "分销商等级",
        parent: "distributor",
        LicensePerm: "ENABLE_DISTRIBUTION",
        AdminPerm: "distributor.level.view"
      },
      component: () => import("@/views/shop/distributor/distributor-level.vue")
    }
  ],
  distributorSetting: [{
      path: "/distributor/base/setting",
      name: "distributorSettingBase",
      meta: {
        title: "基础设置",
        parent: "distributorSetting",
        isChildren: true,
        AdminPerm: "distributor.config.view",
        LicensePerm: "ENABLE_DISTRIBUTION"
      },
      component: () =>
        import(
          "@/views/shop/distributor/components/distributor-base-setting.vue"
        )
    },
    {
      path: "/distributor/apply/setting",
      name: "distributorSettingApply",
      meta: {
        title: "申请设置",
        parent: "distributorSetting",
        isChildren: true,
        AdminPerm: "distributor.config.view",
        LicensePerm: "ENABLE_DISTRIBUTION"
      },
      component: () =>
        import(
          "@/views/shop/distributor/components/distributor-apply-setting.vue"
        )
    }
  ],
  agent: [{
      path: "/agent/list",
      name: "agentList",
      meta: {
        title: "代理列表",
        parent: "agent",
        AdminPerm: "agent.view",
        LicensePerm: "ENABLE_AGENT"
      },
      component: () => import("@/views/shop/agent/agent-list.vue")
    },
    {
      path: "/agent/statistics",
      name: "agentStatistics",
      meta: {
        title: "团队业绩",
        parent: "agent",
        AdminPerm: "agent.performance.view",
        LicensePerm: "ENABLE_AGENT"
      },
      component: () => import("@/views/shop/agent/agent-statistics.vue")
    },
    {
      path: "/agent/verify",
      name: "agentVerify",
      meta: {
        title: "代理审核",
        parent: "agent",
        AdminPerm: "agent.review.view",
        LicensePerm: "ENABLE_AGENT"
      },
      component: () => import("@/views/shop/agent/agent-verify.vue")
    },
    {
      path: "/agent/setting",
      name: "agentSetting",
      meta: {
        title: "代理设置",
        parent: "agent",
        hasChildren: true,
        // redir:"/agent/setting/base",
        AdminPerm: "agent.config.view",
        LicensePerm: "ENABLE_AGENT"
      },
      component: () => import("@/views/shop/agent/agent-setting.vue")
    }
    // {
    //   path: "/agent/reward",
    //   name: "agentReward",
    //   meta: {
    //     title: "代理奖励",
    //     parent: "agent",
    //     AdminPerm: "agent.reward.view",
    //     LicensePerm: "ENABLE_AGENT"
    //   },
    //   component: () => import("@/views/shop/agent/agent-reward.vue")
    // }
  ],
  agentSetting: [{
      path: "/agent/setting/base",
      name: "settingBase",
      meta: {
        title: "基础设置",
        parent: "agentSetting",
        isChildren: true,
        AdminPerm: "agent.config.view",
        LicensePerm: "ENABLE_AGENT"
      },
      component: () =>
        import("@/views/shop/agent/components/agent-setting-base.vue")
    },
    {
      path: "/agent/setting/joining",
      name: "settingJoining",
      meta: {
        title: "加盟设置",
        parent: "agentSetting",
        isChildren: true,
        AdminPerm: "agent.config.view",
        LicensePerm: "ENABLE_AGENT"
      },
      component: () =>
        import("@/views/shop/agent/components/agent-setting-joining.vue")
    },
    {
      path: "/agent/setting/update",
      name: "settingUpdate",
      meta: {
        title: "升级设置",
        parent: "agentSetting",
        isChildren: true,
        AdminPerm: "agent.config.view",
        LicensePerm: "ENABLE_AGENT"
      },
      component: () =>
        import("@/views/shop/agent/components/agent-setting-update.vue")
    },
    {
      path: "/agent/reward/sale",
      name: "rewardSale",
      meta: {
        title: "销售奖",
        parent: "agentSetting",
        isChildren: true,
        AdminPerm: "agent.config.view",
        LicensePerm: "ENABLE_AGENT"
      },
      component: () =>
        import("@/views/shop/agent/components/agent-reward-sale.vue")
    },
    {
      path: "/agent/reward/recommend",
      name: "rewardRecommend",
      meta: {
        title: "推荐奖",
        parent: "agentSetting",
        isChildren: true,
        AdminPerm: "agent.config.view",
        LicensePerm: "ENABLE_AGENT"
      },
      component: () =>
        import("@/views/shop/agent/components/agent-reward-recommend.vue")
    },
    {
      path: "/agent/reward/performance",
      name: "rewardPerformance",
      meta: {
        title: "业绩奖",
        parent: "agentSetting",
        isChildren: true,
        AdminPerm: "agent.config.view",
        LicensePerm: "ENABLE_AGENT"
      },
      component: () =>
        import("@/views/shop/agent/components/agent-reward-performance.vue")
    },
    {
      path: "/agent/reward/gratitude",
      name: "rewardGratitude",
      meta: {
        title: "基础设置",
        parent: "agentSetting",
        isChildren: true,
        AdminPerm: "agent.config.view",
        LicensePerm: "ENABLE_GRATITUDE_AWARD"
      },
      component: () =>
        import("@/views/shop/agent/components/agent-reward-gratitude.vue")
    }
  ],
  areaagent:[
    {
      path: "/areaagent/areaagent-list",
      name: "areaAgentList",
      meta: {
        title: "区代列表",
        parent: "areaagent",
        AdminPerm: "area.agent.view",
        LicensePerm: "ENABLE_AREA_AGENT"
      },
      component: () => import("@/views/shop/areaagent/areaagent-list.vue")
    },
    {
      path: "/areaagent/achievement",
      name: "areaAgentAchievement",
      meta: {
        title: "区代业绩",
        parent: "areaagent",
        AdminPerm: "area.agent.performance.view",
        LicensePerm: "ENABLE_AREA_AGENT"
      },
      component: () => import("@/views/shop/areaagent/areaagent-achievement.vue")
    },
    {
      path: "/areaagent/verify",
      name: "areaagentVerify",
      meta: {
        title: "区代审核",
        parent: "areaagent",
        AdminPerm: "area.agent.apply.view",
        LicensePerm: "ENABLE_AREA_AGENT"
      },
      component: () => import("@/views/shop/areaagent/areaagent-verify.vue")
    },
    {
      path: "/areaagent/level",
      name: "areaAgentLevel",
      meta: {
        title: "区代等级",
        parent: "areaagent",
        AdminPerm: "area.agent.level.view",
        LicensePerm: "ENABLE_AREA_AGENT"
      },
      component: () => import("@/views/shop/areaagent/areaagent-level.vue")
    },
    {
      path: "/areaagent/setting",
      name: "areaagentSetting",
      meta: {
        title: "区代设置",
        parent: "areaagent",
        hasChildren: true,
        AdminPerm: "area.agent.config.view",
        LicensePerm: "ENABLE_AREA_AGENT"
      },
      component: () => import("@/views/shop/areaagent/areaagent-setting.vue")
    }
  ],
  areaagentSetting:[
    {
      path: "/areaagent/base/setting",
      name: "baseSetting",
      meta: {
        title: "基础设置",
        parent: "areaagentSetting",
        isChildren: true,
        AdminPerm: "area.agent.config.view",
        LicensePerm: "ENABLE_AREA_AGENT"
      },
      component: () => import("@/views/shop/areaagent/components/areaagent-base-setting.vue")
    },
    {
      path: "/areaagent/setting/joining",
      name: "areaagentJoining",
      meta: {
        title: "加盟设置",
        parent: "areaagentSetting",
        isChildren: true,
        AdminPerm: "area.agent.config.view",
        LicensePerm: "ENABLE_AREA_AGENT"
      },
      component: () => import("@/views/shop/areaagent/components/areaagent-setting-joining.vue")
    },
  ],
  areaAgentLevel: [
    {
      path: "/areaagent/level/edit",
      name: "areaAgentLevelEdit",
      meta: {
        title: "修改等级",
        parent: "areaAgentLevel",
        AdminPerm: "area.agent.level.view",
        LicensePerm: "ENABLE_AREA_AGENT"
      },
      component: () => import("@/views/shop/areaagent/areaagent-level-edit.vue")
    }
  ],
  dealer: [{
      path: "/dealer/level",
      name: "dealerLevel",
      meta: {
        title: "经销商等级",
        parent: "dealer",
        hasChildren: true,
        AdminPerm: "dealer.level.view",
        LicensePerm: "ENABLE_CLOUDSTOCK"
      },
      component: () => import("@/views/shop/dealer/dealer-level.vue")
    },
    {
      path: "/cloudstock/setting",
      name: "cloudstockSetting",
      meta: {
        title: "经销商设置",
        parent: "dealer",
        hasChildren: true,
        AdminPerm: "dealer.config.view",
        LicensePerm: "ENABLE_CLOUDSTOCK"
      },
      component: () => import("@/views/shop/cloudstock/cloudstock-setting.vue")
    },
    {
      path: "/dealer/verify",
      name: "dealerVerify",
      meta: {
        title: "经销商审核",
        parent: "dealer",
        AdminPerm: "dealer.review.view",
        LicensePerm: "ENABLE_CLOUDSTOCK"
      },
      component: () => import("@/views/shop/dealer/dealer-verify.vue")
    },
    {
      path: "/dealer/list",
      name: "dealerList",
      meta: {
        title: "经销商列表",
        parent: "dealer",
        AdminPerm: "dealer.view",
        LicensePerm: "ENABLE_CLOUDSTOCK"
      },
      component: () => import("@/views/shop/dealer/dealer-list.vue")
    },
    {
      path: "/dealer/statistics",
      name: "dealerStatistics",
      meta: {
        title: "经销商业绩",
        parent: "cloudstock",
        AdminPerm: "dealer.performance.view",
        LicensePerm: "ENABLE_CLOUDSTOCK"
      },
      component: () => import("@/views/shop/dealer/dealer-statistics.vue")
    },

    // {
    //   path: "/cloudstock/list",
    //   name: "cloudstockList",
    //   meta: {
    //     title: "云仓列表",
    //     parent: "cloudstock",
    //     AdminPerm: "cloudstock.view",
    //     LicensePerm: "ENABLE_CLOUDSTOCK"
    //   },
    //   component: () => import("@/views/shop/cloudstock/cloudstock-list.vue")
    // },
    {
      path: "/cloudstock/order",
      name: "cloudstockOrder",
      meta: {
        title: "云仓订单",
        parent: "dealer",
        hasChildren: true,
        AdminPerm: "cloudstock.order.view",
        LicensePerm: "ENABLE_CLOUDSTOCK"
      },
      component: () => import("@/views/shop/cloudstock/cloudstock-order.vue")
    },
    {
      path: "/dealer/dealer-invite",
      name: "dealerInvite",
      meta: {
        title: "授权邀请",
        parent: "cloudstock",
        AdminPerm: "dealer.dealerinvite.view",
        LicensePerm: "ENABLE_CLOUDSTOCK",
        redir: "/dealer/dealer-inviteposter-design"
      }
      //component: () => import("@/views/shop/dealer/dealer-inviteposter-design.vue")
    },
    {
      path: "/dealer/dealer-authcert-manage",
      name: "dealerAuthCert",
      meta: {
        title: "授权证书",
        parent: "cloudstock",
        AdminPerm: "dealer.authcert.view",
        LicensePerm: "ENABLE_AUTHCERT"
      },
      component: () => import("@/views/shop/dealer/dealer-authcert-manage.vue")
    }
  ],
   // 供应商部分路由配置开始
  supplier:[
    {
      path: "/supplier/list",
      name: "supplierList",
      meta: {
        title: "供应商列表",
        parent: "supplier",
        AdminPerm: "supplier.list.view",
        LicensePerm: "ENABLE_SUPPLIER",
      },
      component: () => import("@/views/shop/supplier/supplier-list.vue")
    },
    {
      path: "/supplier/setting",
      name: "supplierSetting",
      meta: {
        title: "供应商设置",
        parent: "supplier",
        AdminPerm: "supplier.config.view",
        LicensePerm: "ENABLE_SUPPLIER",
        hasChildren: true
      },
      component: () => import("@/views/shop/supplier/supplier-setting.vue")
    },
    {
      path: "/supplier/product-verify",
      name: "supplierProductVerify",
      meta: {
        title: "待审核商品",
        parent: "supplier",
        AdminPerm: "product.view",
        LicensePerm: "ENABLE_SUPPLIER",
      },
      component: () =>
        import("@/views/shop/supplier/supplier-product-verify.vue")
    }
  ],
  supplierSetting:[
    {
      path: "/supplier/base/setting",
      name: "supplierBaseSetting",
      meta: {
        title: "基础设置",
        parent: "supplierSetting",
        AdminPerm: "supplier.config.view",
        LicensePerm: "ENABLE_SUPPLIER",
        isChildren: true
      },
      component: () => import("@/views/shop/supplier/components/supplier-base-setting.vue")
    },
    {
      path: "/supplier/setting/withdraw",
      name: "supplierSettingWithdraw",
      meta: {
        title: "提现设置",
        parent: "supplierSetting",
        isChildren: true,
        AdminPerm: "supplier.config.view",
        LicensePerm: "ENABLE_SUPPLIER"
      },
      component: () => import("@/views/shop/supplier/components/supplier-setting-withdraw.vue")
    }
  ],
  supplierProductVerify: [
    {
      path: "/supplier/product/detail",
      name: "supplierProductDetail",
      meta: {
        title: "编辑商品",
        parent: "supplierProductVerify",
        LicensePerm: "ENABLE_SUPPLIER"
      },
      component: () => import("@/views/shop/product/product-detail-edit.vue")
    }
  ],
  dealerList: [{
      path: "/dealer/stock/detail",
      name: "cloudstockStockDetail",
      meta: {
        title: "云仓库存详情",
        parent: "dealerList",
        AdminPerm: "dealer.view",
        LicensePerm: "ENABLE_CLOUDSTOCK"
      },
      component: () =>
        import("@/views/shop/cloudstock/cloudstock-stock-detail.vue")
    },
    {
      path: "/dealer/settlement/detail",
      name: "cloudstockSettlementDetail",
      meta: {
        title: "云仓结算详情",
        parent: "dealerList",
        AdminPerm: "dealer.view",
        LicensePerm: "ENABLE_CLOUDSTOCK"
      },
      component: () =>
        import("@/views/shop/cloudstock/cloudstock-settlement-detail.vue")
    }
  ],
  cloudstockStockDetail: [{
    path: "/dealer/storage/record",
    name: "cloudstockStorageRecord",
    meta: {
      title: "云仓出入库记录",
      parent: "cloudstockStockDetail",
      AdminPerm: "dealer.view",
      LicensePerm: "ENABLE_CLOUDSTOCK"
    },
    component: () =>
      import("@/views/shop/cloudstock/cloudstock-storage-record.vue")
  }],
  cloudstockSetting: [{
      path: "/dealer/setting/base",
      name: "dealerSettingBase",
      meta: {
        title: "基础设置",
        parent: "cloudstockSetting",
        isChildren: true,
        AdminPerm: "dealer.config.view",
        LicensePerm: "ENABLE_CLOUDSTOCK"
      },
      component: () => import("@/views/shop/dealer/dealer-setting-base.vue")
    },
    {
      path: "/dealer/setting/apply",
      name: "dealerSettingApply",
      meta: {
        title: "加盟设置",
        parent: "cloudstockSetting",
        isChildren: true,
        AdminPerm: "dealer.config.view",
        LicensePerm: "ENABLE_CLOUDSTOCK"
      },
      component: () => import("@/views/shop/dealer/dealer-setting-apply.vue")
    },
    {
      path: "/dealer/setting/withdraw",
      name: "cloudstockSettingWithdraw",
      meta: {
        title: "提现设置",
        parent: "cloudstockSetting",
        isChildren: true,
        AdminPerm: "dealer.config.view",
        LicensePerm: "ENABLE_CLOUDSTOCK"
      },
      component: () =>
        import(
          "@/views/shop/cloudstock/components/cloudstock-setting-withdraw.vue"
        )
    },
    {
      path: "/dealer/reward/performance",
      name: "dealerRewardPerformance",
      meta: {
        title: "业绩奖",
        parent: "cloudstockSetting",
        isChildren: true,
        AdminPerm: "dealer.config.view",
        LicensePerm: "ENABLE_CLOUDSTOCK"
      },
      component: () =>
        import("@/views/shop/dealer/components/dealer-reward-performance.vue")
    },
    {
      path: "/dealer/reward/recommend",
      name: "dealerRewardRecommend",
      meta: {
        title: "推荐奖",
        parent: "cloudstockSetting",
        isChildren: true,
        AdminPerm: "dealer.config.view",
        LicensePerm: "ENABLE_CLOUDSTOCK"
      },
      component: () =>
        import("@/views/shop/dealer/components/dealer-reward-recommend.vue")
    },
    {
      path: "/dealer/reward/sale",
      name: "dealerRewardSale",
      meta: {
        title: "销售奖",
        parent: "cloudstockSetting",
        isChildren: true,
        AdminPerm: "dealer.config.view",
        LicensePerm: "ENABLE_CLOUDSTOCK"
      },
      component: () =>
        import("@/views/shop/dealer/components/dealer-reward-sale.vue")
    },
    // {
    //   path: "/dealer/recurrentce/award",
    //   name: "dealerRecurrentceAward",
    //   meta: {
    //     title: "订货返现奖",
    //     parent: "cloudstockSetting",
    //     isChildren: true
    //     // AdminPerm: "dealer.config.view",
    //     // LicensePerm: "ENABLE_CLOUDSTOCK"
    //   },
    //   component: () =>
    //     import("@/views/shop/dealer/components/dealer-recurrentce-award.vue")
    // }
  ],
  cloudstockOrder: [{
      path: "/dealer/order-list/buy",
      name: "cloudstockOrderListBuy",
      meta: {
        title: "云仓进货单",
        parent: "cloudstockOrder",
        hideBreadCrum: true,
        isChildren: true,
        AdminPerm: "cloudstock.order.view",
        LicensePerm: "ENABLE_CLOUDSTOCK"
      },
      component: () =>
        import(
          "@/views/shop/cloudstock/components/cloudstock-order-list-buy.vue"
        )
    },
    {
      path: "/dealer/order-list/get",
      name: "cloudstockOrderListGet",
      meta: {
        title: "云仓提货单",
        parent: "cloudstockOrder",
        hideBreadCrum: true,
        isChildren: true,
        AdminPerm: "cloudstock.order.view",
        LicensePerm: "ENABLE_CLOUDSTOCK"
      },
      component: () =>
        import(
          "@/views/shop/cloudstock/components/cloudstock-order-list-get.vue"
        )
    }
  ],
  cloudstockOrderListBuy: [{
    path: "/dealer/order-detail/buy",
    name: "cloudstockOrderDetailBuy",
    meta: {
      title: "云仓进货单详情",
      parent: "cloudstockOrderListBuy",
      AdminPerm: "cloudstock.order.view",
      LicensePerm: "ENABLE_CLOUDSTOCK"
    },
    component: () =>
      import(
        "@/views/shop/cloudstock/components/cloudstock-order-detail-buy.vue"
      )
  }],
  cloudstockOrderListGet: [{
    path: "/dealer/order-detail/get",
    name: "cloudstockOrderDetailGet",
    meta: {
      title: "云仓提货单详情",
      parent: "cloudstockOrderListGet",
      AdminPerm: "cloudstock.order.view",
      LicensePerm: "ENABLE_CLOUDSTOCK"
    },
    component: () =>
      import(
        "@/views/shop/cloudstock/components/cloudstock-order-detail-get.vue"
      )
  },{
    path: "/dealer/order-detail/demolition-order",
    name: "cloudstockOrderDemolition",
    meta: {
      title: "云仓提货单详情",
      parent: "cloudstockOrderListGet",
      AdminPerm: "cloudstock.order.view",
      LicensePerm: "ENABLE_CLOUDSTOCK"
    },
    component: () =>
      import(
        "@/views/shop/cloudstock/components/cloud-order-demolition-order.vue"
      )
  }],
  dealerLevel: [{
      path: "/dealer/level/standard",
      name: "dealerLevelStandard",
      meta: {
        title: "经销商等级",
        parent: "dealerLevel",
        hideBreadCrum: true,
        isChildren: true,
        AdminPerm: "dealer.level.view",
        LicensePerm: "ENABLE_CLOUDSTOCK"
      },
      component: () => import("@/views/shop/dealer/dealer-level-standard.vue")
    },
    {
      path: "/dealer/level/hidden",
      name: "dealerLevelHidden",
      meta: {
        title: "隐藏等级",
        parent: "dealerLevel",
        hideBreadCrum: true,
        isChildren: true,
        AdminPerm: "dealer.level.view",
        LicensePerm: "ENABLE_CLOUDSTOCK"
      },
      component: () => import("@/views/shop/dealer/dealer-level-hidden.vue")
    },
    {
      path: "/dealer/level/standard/add",
      name: "dealerLevelStandardAdd",
      meta: {
        title: "新增经销商等级",
        parent: "dealerLevel",
        // hideBreadCrum: true,
        isChildren: true,
        AdminPerm: "dealer.level.operate",
        LicensePerm: "ENABLE_CLOUDSTOCK"
      },
      component: () =>
        import("@/views/shop/dealer/dealer-level-standard-setting.vue")
    },
    {
      path: "/dealer/level/standard/edit",
      name: "dealerLevelStandardEdit",
      meta: {
        title: "编辑经销商等级",
        parent: "dealerLevel",
        // hideBreadCrum: true,
        isChildren: true,
        AdminPerm: "dealer.level.view",
        LicensePerm: "ENABLE_CLOUDSTOCK"
      },
      component: () =>
        import("@/views/shop/dealer/dealer-level-standard-setting.vue")
    },
    {
      path: "/dealer/level/hidden/add",
      name: "dealerLevelHiddenAdd",
      meta: {
        title: "新增经销商隐藏等级",
        parent: "dealerLevel",
        // hideBreadCrum: true,
        isChildren: true,
        AdminPerm: "dealer.level.operate",
        LicensePerm: "ENABLE_CLOUDSTOCK"
      },
      component: () =>
        import("@/views/shop/dealer/dealer-level-hidden-setting.vue")
    },
    {
      path: "/dealer/level/hidden/edit",
      name: "dealerLevelHiddenEdit",
      meta: {
        title: "编辑经销商隐藏等级",
        parent: "dealerLevel",
        // hideBreadCrum: true,
        isChildren: true,
        AdminPerm: "dealer.level.view",
        LicensePerm: "ENABLE_CLOUDSTOCK"
      },
      component: () =>
        import("@/views/shop/dealer/dealer-level-hidden-setting.vue")
    }
  ],
  setting: [{
      path: "/setting/mall",
      name: "settingMall",
      meta: {
        title: "商城设置",
        parent: "setting",
        redir: "/setting/mall/mall"
      }
    },
    {
      path: "/setting/news",
      name: "settingNews",
      meta: {
        title: "消息管理",
        parent: "setting",
        redir: "/setting/news/notice"
      }
    }
  ],
  staff: [{
      path: "/staff/staff-list",
      name: "staffList",
      meta: {
        title: "员工管理",
        parent: "staff",
        AdminPerm: "staff.view"
      },
      component: () => import("@/views/shop/staff/staff-list.vue")
    },
    {
      path: "/staff/department-list",
      name: "departmentList",
      meta: {
        title: "部门管理",
        parent: "staff",
        AdminPerm: "department.view"
      },
      component: () => import("@/views/shop/staff/staff-department-list.vue")
    },
    {
      path: "/staff/flow-allocate",
      name: "flowAllocate",
      meta: {
        title: "流量分配",
        parent: "staff",
        AdminPerm: "staff.allocate.view"
      },
      component: () => import("@/views/shop/staff/staff-flow-allocate.vue")
    },
    {
      path: "/staff/role-list",
      name: "roleList",
      meta: {
        title: "角色权限",
        parent: "staff",
        AdminPerm: "role.view"
      },
      component: () => import("@/views/shop/staff/staff-role-list.vue")
    }
  ],
  staffList: [{
      path: "/staff/add-staff",
      name: "addStaff",
      meta: {
        title: "新增员工",
        parent: "staffList",
        AdminPerm: "staff.view"
      },
      component: () => import("@/views/shop/staff/staff-add-staff.vue")
    },
    {
      path: "/staff/edit-staff",
      name: "editStaff",
      meta: {
        title: "编辑员工",
        parent: "staffList",
        AdminPerm: "staff.view"
      },
      component: () => import("@/views/shop/staff/staff-add-staff.vue")
    }
  ],
  roleList: [{
      path: "/staff/add-role",
      name: "addRole",
      meta: {
        title: "新增角色",
        parent: "roleList",
        AdminPerm: "role.view"
      },
      component: () => import("@/views/shop/staff/staff-add-role.vue")
    },
    {
      path: "/staff/edit-role",
      name: "editRole",
      meta: {
        title: "编辑角色",
        parent: "roleList",
        AdminPerm: "role.view"
      },
      component: () => import("@/views/shop/staff/staff-add-role.vue")
    }
  ],
  settingMall: [{
      path: "/setting/mall/mall",
      name: "settingMallMall",
      meta: {
        title: "商城设置",
        parent: "settingMall",
        AdminPerm: "shop.config.view"
      },
      component: () => import("@/views/shop/setting/setting-mall.vue")
    },
    {
      path: "/setting/mall/pay",
      name: "settingPay",
      meta: {
        title: "支付设置",
        parent: "settingMall",
        hasChildren: true,
        AdminPerm: "pay.config.view,weixin.config.view,alipay.config.view,bankpay.config.view"
      },
      component: () => import("@/views/shop/setting/setting-pay.vue")
    },
    {
      path: "/setting/mall/order",
      name: "settingOrder",
      meta: {
        title: "订单设置",
        parent: "settingMall",
        AdminPerm: "order.config.view"
      },
      component: () => import("@/views/shop/setting/setting-order.vue")
    },
    {
      path: "/setting/mall/logisticsList",
      name: "settingLogisticsList",
      meta: {
        title: "物流设置",
        parent: "settingMall",
        AdminPerm: "logistics.view"
      },
      component: () => import("@/views/shop/setting/setting-logistics-list.vue")
    },
    {
      path: "/setting/mall/getCash",
      name: "settingGetCash",
      meta: {
        title: "提现设置",
        parent: "settingMall",
        AdminPerm: "withdraw.config.view"
      },
      component: () => import("@/views/shop/setting/setting-getCash.vue")
    },
    {
      path: "/setting/mall/word",
      name: "settingWord",
      meta: {
        title: "文字设置",
        parent: "settingMall",
        AdminPerm: "word.view"
      },
      component: () => import("@/views/shop/setting/setting-word.vue")
    },
    {
      path: "/setting/mall/merchant",
      name: "settingMerchant",
      meta: {
        title: "商户设置",
        parent: "settingMall",
        AdminPerm: "store.config.view"
      },
      component: () => import("@/views/shop/setting/setting-merchant.vue")
    },
    {
      path: "/setting/mall/generic",
      name: "settingGeneric",
      meta: {
        title: "通用设置",
        parent: "settingMall",
        AdminPerm: "site.config.view"
      },
      component: () => import("@/views/shop/setting/setting-generic.vue")
    },
    {
      path: "/setting/copyright",
      name: "settingCopyright",
      meta: {
        title: "版权设置",
        parent: "settingMall",
        AdminPerm: "copyright.config.view"
      },
      component: () => import("@/views/shop/setting/setting-copyright.vue")
    },
    {
      path: "/setting/mall/service3rd",
      name: "settingService3rd",
      meta: {
        title: "第三方客服",
        parent: "settingMall",
        AdminPerm: "site.config.view"
      },
      component: () => import("@/views/shop/setting/setting-service3rd.vue")
    },
    {
      path: "/setting/ssl/list",
      name: "settingSslList",
      meta: {
        title: "SSL证书",
        parent: "settingMall",
        AdminPerm: "ssl.config.view"
      },
      component: () => import("@/views/shop/setting/ssl/list.vue")
    }
    // {
    //   path: "/setting/mall/roll",
    //   name: "settingRoll",
    //   meta: {
    //     title: "滚屏设置",
    //     parent: "settingMall",
    //     AdminPerm: "withdraw.config.view"
    //   },
    //   component: () => import("@/views/shop/setting/setting-roll.vue")
    // }
  ],
  // 支付设置下的tab切换
  settingPay: [{
      path: "/setting/mall/pay/setting-pay-weixin",
      name: "settingWxPay",
      meta: {
        title: "微信支付",
        parent: "settingPay",
        hideBreadCrum: true,
        isChildren: true,
        AdminPerm: "pay.config.view"
      },
      component: () => import("@/views/shop/setting/setting-pay-weixin.vue")
    },
    {
      path: "/setting/mall/pay/setting-pay-alipay",
      name: "settingAlipay",
      meta: {
        title: "支付宝",
        parent: "settingPay",
        hideBreadCrum: true,
        isChildren: true,
        AdminPerm: "pay.config.view"
      },
      component: () => import("@/views/shop/setting/setting-pay-alipay.vue")
    },
    {
      path: "/setting/mall/pay/setting-pay-bankpay",
      name: "settingBankPay",
      meta: {
        title: "银行账户",
        parent: "settingPay",
        hideBreadCrum: true,
        isChildren: true,
        AdminPerm: "pay.config.view"
      },
      component: () => import("@/views/shop/setting/setting-pay-bankpay.vue")
    },
    {
      path: "/setting/mall/pay/setting-pay-tlpay",
      name: "settingTLPay",
      meta: {
        title: "通联支付",
        parent: "settingPay",
        hideBreadCrum: true,
        isChildren: true,
        AdminPerm: "pay.config.view"
      },
      component: () => import("@/views/shop/setting/setting-pay-tlpay.vue")
    }
  ],
  settingNews: [{
      path: "/setting/news/notice/buyer",
      name: "noticeBuyer",
      meta: {
        title: "买家通知",
        parent: "settingNews",
        AdminPerm: "notice.config.view"
      },
      component: () =>
        import("@/views/shop/setting/message/setting-notice-buyer.vue")
    },
    {
      path: "/setting/news/notice/seller",
      name: "noticeSeller",
      meta: {
        title: "卖家通知",
        parent: "settingNews",
        AdminPerm: "notice.config.view"
      },
      component: () =>
        import("@/views/shop/setting/message/setting-notice-seller.vue")
    },
    {
      path: "/setting/news/message",
      name: "message",
      meta: {
        title: "短信设置",
        parent: "settingNews",
        AdminPerm: "sms.config.view"
      },
      component: () => import("@/views/shop/setting/message/setting-news.vue")
    }
    // {
    //   path: "/setting/news/notice/noticeDetail",
    //   name: "noticeDetail",
    //   meta: {
    //     title: "消息通知",
    //     parent: "settingNews",
    //     AdminPerm: "notice.config.view"
    //   },
    //   component: () => import("@/views/shop/setting/message/notice-detail.vue")
    // },
    // {
    //   path: "/setting/news/notice/noticeDetailBuyer",
    //   name: "noticeDetailBuyer",
    //   meta: {
    //     title: "买家通知",
    //     parent: "settingNews",
    //     AdminPerm: "notice.config.view"
    //   },
    //   component: () => import("@/views/shop/setting/message/notice-detail.vue")
    // },
    // {
    //   path: "/setting/news/notice/noticeDetailSeller",
    //   name: "noticeDetailSeller",
    //   meta: {
    //     title: "卖家通知",
    //     parent: "settingNews",
    //     AdminPerm: "notice.config.view"
    //   },
    //   component: () => import("@/views/shop/setting/message/notice-detail.vue")
    // }
  ],
  noticeBuyer: [{
    path: "/setting/news/notice/buyer/noticeDetailBuyer",
    name: "noticeDetailBuyer",
    meta: {
      title: "买家通知",
      parent: "noticeBuyer",
      AdminPerm: "notice.config.view"
    },
    component: () => import("@/views/shop/setting/message/notice-detail.vue")
  }],
  noticeSeller: [{
    path: "/setting/news/notice/seller/noticeDetailSeller",
    name: "noticeDetailSeller",
    meta: {
      title: "卖家通知",
      parent: "noticeSeller",
      AdminPerm: "notice.config.view"
    },
    component: () => import("@/views/shop/setting/message/notice-detail.vue")
  }],
  goods: [{
    path: "/product/productList",
    name: "productList",
    meta: {
      title: "商品管理",
      parent: "product",
      AdminPerm: "product.view"
    },
    component: () => import("@/views/shop/product/product-list.vue")
  }],
  product: [{
      path: "/product/add",
      name: "productAdd",
      meta: {
        title: "新增商品",
        parent: "product",
        AdminPerm: "product.operate"
      },
      component: () => import("@/views/shop/product/product-detail.vue")
    },
    {
      path: "/product/manage",
      name: "productManage",
      meta: {
        title: "商品列表",
        parent: "product",
        AdminPerm: "product.view"
      },
      component: () => import("@/views/shop/product/product-list.vue")
    },
    {
      path: "/product/setting",
      name: "productSetting",
      meta: {
        title: "商品设置",
        parent: "product",
        hasChildren: true,
        AdminPerm: "product.class.view,product.param.view,product.comment.view"
        // redir: "/product/setting/class"
      },
      component: () => import("@/views/shop/product/product-setting.vue")
    }
  ],
  productManage: [{
    path: "/product/detail",
    name: "productDetail",
    // isHide: true,
    meta: {
      title: "编辑商品",
      parent: "productManage",
      AdminPerm: "product.view"
    },
    component: () => import("@/views/shop/product/product-detail-edit.vue")
  }],
  productSetting: [{
      path: "/product/setting/class",
      name: "productClass",
      meta: {
        title: "商品分类",
        parent: "productSetting",
        hideBreadCrum: true,
        isChildren: true,
        AdminPerm: "product.class.view"
      },
      component: () => import("@/views/shop/product/product-class.vue")
    },
    {
      path: "/product/setting/params",
      name: "productParams",
      meta: {
        title: "商品参数",
        parent: "productSetting",
        hideBreadCrum: true,
        isChildren: true,
        AdminPerm: "product.param.view"
      },
      component: () => import("@/views/shop/product/product-params.vue")
    },
    {
      path: "/product/setting/comments",
      name: "productComments",
      meta: {
        title: "商品评价",
        parent: "productSetting",
        hideBreadCrum: true,
        isChildren: true,
        AdminPerm: "product.comment.view"
      },
      component: () => import("@/views/shop/product/product-comments.vue")
    }
  ],
  productParams: [{
      path: "/product/setting/new-params",
      name: "productParamsAdd",
      meta: {
        title: "新增参数模板",
        parent: "productSetting",
        AdminPerm: "product.param.operate"
      },
      component: () => import("@/views/shop/product/product-params-add.vue")
    },
    {
      path: "/product/setting/edit-params",
      name: "productParamsEdit",
      meta: {
        title: "编辑参数模板",
        parent: "productSetting",
        AdminPerm: "product.param.view"
      },
      component: () => import("@/views/shop/product/product-params-add.vue")
    }
  ],
  marketing: [{
      path: "/marketing/integral",
      name: "marketingIntegral",
      meta: {
        title: "积分管理",
        parent: "marketing",
        AdminPerm: "point.view"
      },
      component: () => import("@/views/shop/marketing/marketing-integral.vue")
    },
    {
      path: "/marketing/manage",
      name: "marketingManage",
      meta: {
        title: "优惠券管理",
        parent: "marketing",
        AdminPerm: "coupon.view"
      },
      component: () => import("@/views/shop/marketing/marketing-manage.vue")
    },
    {
      path: "/marketing/recharge-bonus",
      name: "marketingRechargeBonus",
      meta: {
        title: "充值优惠",
        parent: "marketing",
        AdminPerm: "rechargebonus.view",
        LicensePerm: "ENABLE_RECHARGE_BONUS"
      },
      component: () =>
        import("@/views/shop/marketing/marketing-recharge-bonus.vue")
    },
    {
      path: "/marketing/groupbuying",
      name: "marketingGroupbuying",
      meta: {
        title: "多人拼团",
        parent: "marketing",
        hasChildren: true,
        AdminPerm: "group.buying.view",
        LicensePerm: "ENABLE_GROUP_BUYING"
      },
      component: () =>
        import("@/views/shop/marketing/marketing-groupbuying.vue")
    },
    {
      name: "securityCodestock",
      path: "/marketing/marketing-codestock",
      meta: {
        LicensePerm: "ENABLE_SECURITY_CODE",
        title: "防伪管理",
        parent: "marketing",
        AdminPerm: "security.view",
        hasChildren: true
      },
      component: () =>
        import("@/views/shop/security/security-codestock.vue")
    },
    {
      path: "/marketing/free-shipping",
      name: "marketingFreeShipping",
      meta: {
        title: "包邮活动设置",
        parent: "marketing",
        AdminPerm: "free.shipping.view"
      },
      component: () =>
        import("@/views/shop/marketing/marketing-free-shipping.vue")
    },
    {
      name: "marketingExpress",
      path: "/marketing/marketing-express",
      meta: {
        title: "快递发货应用",
        parent: "marketing",
        AdminPerm: "express.view"
      },
      component: () => import("@/views/shop/marketing/marketing-express.vue")
    }
  ],
  marketingManage: [{
      path: "/marketing/manage/add",
      name: "marketingManageAdd",
      meta: {
        title: "新增优惠券",
        parent: "marketingManage",
        AdminPerm: "coupon.view"
      },
      component: () => import("@/views/shop/marketing/marketing-manage-add.vue")
    },
    {
      path: "/marketing/manage/edit",
      name: "marketingManageEdit",
      meta: {
        title: "编辑优惠券",
        parent: "marketingManage",
        AdminPerm: "coupon.view"
      },
      component: () => import("@/views/shop/marketing/marketing-manage-add.vue")
    }
  ],
  marketingGroupbuying: [
    {
      path: "/marketing/groupbuying/create",
      name: "marketingGroupbuyingCreate",
      meta: {
        title: "创建活动",
        parent: "marketingGroupbuying",
        AdminPerm: "group.buying.view",
        LicensePerm: "ENABLE_GROUP_BUYING"
      },
      component: () =>
        import("@/views/shop/marketing/marketing-groupbuying-create.vue")
    },
    {
      path: "/marketing/groupbuying/edit",
      name: "marketingGroupbuyingEdit",
      meta: {
        title: "编辑活动",
        parent: "marketingGroupbuying",
        AdminPerm: "group.buying.view",
        LicensePerm: "ENABLE_GROUP_BUYING"
      },
      component: () =>
        import("@/views/shop/marketing/marketing-groupbuying-create.vue")
    },
    {
      path: "/marketing/groupbuying/list",
      name: "marketingGroupbuyingList",
      meta: {
        title: "拼团活动",
        isChildren: true,
        hideBreadCrum: true,
        parent: "marketingGroupbuying",
        AdminPerm: "group.buying.view",
        LicensePerm: "ENABLE_GROUP_BUYING"
      },
      component: () =>
        import("@/views/shop/marketing/marketing-groupbuying-list.vue")
    },
    {
      path: "/marketing/groupbuying/data",
      name: "marketingGroupbuyingData",
      meta: {
        title: "活动数据",
        isChildren: true,
        hideBreadCrum: true,
        parent: "marketingGroupbuying",
        AdminPerm: "group.buying.view",
        LicensePerm: "ENABLE_GROUP_BUYING"
      },
      component: () =>
        import("@/views/shop/marketing/marketing-groupbuying-data.vue")
    }
  ],
  finance: [{
      path: "/finance/manage",
      name: "financeManage",
      meta: {
        title: "收支明细",
        parent: "finance",
        AdminPerm: "finance.view"
      },
      component: () => import("@/views/shop/finance/finance-manage.vue")
    },
    {
      path: "/finance/withdrawal",
      name: "financeWithdrawal",
      meta: {
        title: "提现管理",
        parent: "finance",
        AdminPerm: "withdraw.view"
      },
      component: () => import("@/views/shop/finance/finance-withdrawal.vue")
    },
    {
      path: "/finance/balance",
      name: "financeBalance",
      meta: {
        title: "余额管理",
        parent: "finance",
        AdminPerm: "balance.view"
      },
      component: () => import("@/views/shop/finance/finance-balance.vue")
    },
    {
      path: "/finance/settlement",
      name: "financeSettlement",
      meta: {
        title: "分销结算",
        parent: "finance",
        AdminPerm: "commission.view",
        LicensePerm: "ENABLE_DISTRIBUTION"
      },
      component: () => import("@/views/shop/finance/finance-settlement.vue")
    },
    {
      path: "/finance/agent",
      name: "financeAgent",
      meta: {
        title: "代理结算",
        parent: "finance",
        AdminPerm: "agent.commission.view",
        LicensePerm: "ENABLE_AGENT"
      },
      component: () => import("@/views/shop/finance/finance-agent.vue")
    },
    {
      path: "/finance/areaagent",
      name: "financeAreaAgent",
      meta: {
        title: "区代结算",
        parent: "finance",
        AdminPerm: "area.agent.settle.view",
        LicensePerm: "ENABLE_AREA_AGENT"
      },
      component: () => import("@/views/shop/finance/finance-areaagent.vue")
    },
    {
      path: "/finance/cloudstock",
      name: "financeCloudstock",
      meta: {
        title: "经销商结算",
        parent: "finance",
        hasChildren: true,
        AdminPerm: "cloudstock.settle.view",
        LicensePerm: "ENABLE_CLOUDSTOCK"
      },
      component: () => import("@/views/shop/finance/finance-cloudstock.vue")
    },
    {
      path: "/finance/supplier",
      name: "financeSupplier",
      meta: {
        title: "供应商结算",
        parent: "finance",
        AdminPerm: "supplier.settle.view",
        LicensePerm: "ENABLE_SUPPLIER"
      },
      component: () => import("@/views/shop/finance/finance-supplier.vue")
    }
  ],
  financeCloudstock: [{
      path: "/finance/cloudstock/stock",
      name: "financeCloudstockStock",
      meta: {
        title: "云仓进货单结算",
        parent: "financeCloudstock",
        hideBreadCrum: true,
        isChildren: true,
        AdminPerm: "cloudstock.settle.view",
        LicensePerm: "ENABLE_CLOUDSTOCK"
      },
      component: () =>
        import("@/views/shop/finance/components/finance-cloudstock-stock.vue")
    },
    {
      path: "/finance/recommend/stock",
      name: "financeRecommendStock",
      meta: {
        title: "推荐奖结算",
        parent: "financeCloudstock",
        hideBreadCrum: true,
        isChildren: true,
        AdminPerm: "cloudstock.settle.view",
        LicensePerm: "ENABLE_CLOUDSTOCK"
      },
      component: () =>
        import("@/views/shop/finance/components/finance-recommend-stock.vue")
    },
    {
      path: "/finance/performance/stock",
      name: "financePerformanceStock",
      meta: {
        title: "业绩奖结算",
        parent: "financeCloudstock",
        hideBreadCrum: true,
        isChildren: true,
        AdminPerm: "cloudstock.settle.view",
        LicensePerm: "ENABLE_CLOUDSTOCK"
      },
      component: () =>
        import("@/views/shop/finance/components/finance-performance-stock.vue")
    },
    // {
    //   path: "/finance/cloudstock/retail",
    //   name: "financeCloudstockRetail",
    //   meta: {
    //     title: "C端零售单",
    //     parent: "financeCloudstock",
    //     hideBreadCrum: true,
    //     isChildren: true,
    //     AdminPerm: "cloudstock.settle.view",
    //     LicensePerm: "ENABLE_CLOUDSTOCK"
    //   },
    //   component: () => import("@/views/shop/finance/components/finance-cloudstock-retail.vue")
    // },
    {
      path: "/finance/dealer/sales-award",
      name: "financeDealerSalesAward",
      meta: {
        title: "销售奖结算",
        parent: "financeCloudstock",
        hideBreadCrum: true,
        isChildren: true,
        AdminPerm: "cloudstock.settle.view",
        LicensePerm: "ENABLE_CLOUDSTOCK"
      },
      component: () =>
        import("@/views/shop/finance/components/finance-dealer-sales-award.vue")
    }
    // {
    //   path: "/finance/goods/recurrentce-award",
    //   name: "financeGoodsRecurrentceAward",
    //   meta: {
    //     title: "订货返现奖结算",
    //     parent: "financeCloudstock",
    //     hideBreadCrum: true,
    //     isChildren: true
    //     // AdminPerm: "cloudstock.settle.view",
    //     // LicensePerm: "ENABLE_CLOUDSTOCK"
    //   },
    //   component: () =>
    //     import("@/views/shop/finance/components/finance-goods-recurrentce-award.vue")
    // }
  ],
  distributorLevel: [{
      path: "/distributor/level/detail",
      name: "distributorLevelDetail",
      meta: {
        title: "新增分销商等级",
        parent: "distributorLevel",
        AdminPerm: "distributor.level.view"
      },
      component: () =>
        import("@/views/shop/distributor/distributor-level-detail.vue")
    },
    {
      path: "/distributor/level/edit",
      name: "distributorLevelEdit",
      meta: {
        title: "修改分销商等级",
        parent: "distributorLevel",
        AdminPerm: "distributor.level.view"
      },
      component: () =>
        import("@/views/shop/distributor/distributor-level-detail.vue")
    }
  ],
  store: [{
      path: "/store/decoration",
      name: "storeDecoration",
      meta: {
        title: "店铺装修",
        parent: "store",
        AdminPerm: "page.view"
      },
      component: () => import("@/views/shop/store/store-decoration.vue")
    },
    {
      path: "/store/design/mobile-nav",
      name: "storeDesignMobileNav",
      meta: {
        title: "店铺导航",
        parent: "store",
        AdminPerm: "nav.view"
      },
      component: () => import("@/views/shop/store/design/mobile-nav-design.vue")
    },
    {
      path: "/store/colors",
      name: "storeColors",
      meta: {
        title: "店铺色系",
        parent: "store",
        AdminPerm: "color.view"
      },
      component: () => import("@/views/shop/store/store-colors.vue")
    },
    {
      path: "/store/store-poster-manage",
      name: "storePoster",
      meta: {
        title: "海报管理",
        parent: "store",
        hasChildren: true,
        AdminPerm: "poster.view,poster.config.view"
      },
      component: () => import("@/views/shop/store/store-poster-manage.vue")
    },
    {
      path: "/store/page/manage",
      name: "storePageManage",
      meta: {
        title: "页面管理",
        parent: "store",
        AdminPerm: "page.view"
      },
      component: () => import("@/views/shop/store/store-page-manage.vue")
    }
  ],
  // 海报管理下面的嵌套路由
  storePoster: [{
      path: "/store/store-poster-manage/store-poster-list",
      name: "storePosterList",
      meta: {
        title: "海报列表",
        parent: "storePoster",
        hideBreadCrum: true,
        isChildren: true,
        AdminPerm: "poster.view"
      },
      component: () => import("@/views/shop/store/store-poster-list.vue")
    },
    {
      path: "/store/store-poster-manage/store-poster-setting-entry",
      name: "storePosterSettingEntry",
      meta: {
        title: "设置入口",
        parent: "storePoster",
        hideBreadCrum: true,
        isChildren: true,
        AdminPerm: "poster.config.view"
      },
      component: () =>
        import("@/views/shop/store/store-poster-setting-entry.vue")
    }
  ],
  storePosterList: [
    // {
    //   path: "/store/store-poster-manage/store-poster-list/poster-create",
    //   name: "posterCreate",
    //   meta: {
    //     title: "创建海报",
    //     parent: "storePosterList",
    //     AdminPerm: "poster.setting.view"
    //   },
    //   component: () => import("@/views/shop/store/store-poster-create.vue")
    // },
    // {
    //   path: "/store/store-poster-manage/store-poster-list/poster-setting",
    //   name: "posterSetting",
    //   meta: {
    //     title: "编辑海报",
    //     parent: "storePosterList",
    //     AdminPerm: "poster.setting.view"
    //   },
    //   component: () => import("@/views/shop/store/store-poster-create.vue")
    // },
    {
      path: "/store/store-poster-manage/store-poster-list/poster-design",
      name: "posterDesign",
      meta: {
        title: "海报设计",
        parent: "storePosterList",
        AdminPerm: "poster.view"
      },
      component: () =>
        import("@/views/shop/store/design/share-paper/store-poster-design.vue")
    }
  ],
  storeDecoration: [{
      path: "/store/design/home/mobile",
      name: "storeDesignHomeMobile",
      meta: {
        title: "编辑主页",
        parent: "storeDecoration",
        AdminPerm: "page.view"
      },
      component: () =>
        import("@/views/shop/store/design/mobile-page-design.vue")
    },
    {
      path: "/store/design/member/mobile",
      name: "storeDesignMemberMobile",
      meta: {
        title: "编辑个人中心",
        parent: "storeDecoration",
        AdminPerm: "page.view"
      },
      component: () => import("@/views/shop/store/store-design-member.vue")
    }
  ],
  storePageManage: [{
      path: "/store/template",
      name: "storeTemplate",
      meta: {
        title: "新建页面",
        parent: "storePageManage",
        AdminPerm: "page.view"
      },
      component: () => import("@/views/shop/store/store-template.vue")
    },
    {
      path: "/store/design/mobile",
      name: "storeDesignMobile",
      meta: {
        title: "页面编辑",
        parent: "storePageManage",
        AdminPerm: "page.view"
      },
      component: () =>
        import("@/views/shop/store/design/mobile-page-design.vue")
    }
  ],
  order: [{
      path: "/order/shop",
      name: "orderShop",
      meta: {
        title: "商城订单",
        parent: "order",
        AdminPerm: "order.view"
      },
      component: () => import("@/views/shop/order/order-shop.vue")
    },
    {
      path: "/order/afterSele",
      name: "orderAfterSele",
      meta: {
        title: "售后订单",
        parent: "order",
        AdminPerm: "order.after-sale.view"
      },
      component: () => import("@/views/shop/order/order-after-sele.vue")
    }
  ],
  orderShop: [{
      path: "/order/shop/order-detail",
      name: "orderShopDetail",
      meta: {
        title: "订单详情",
        parent: "orderShop",
        AdminPerm: "order.view"
      },
      component: () => import("@/views/shop/order/order-detail.vue")
    },
    {
      path: "/order/order-demolition-order",
      name: "orderDemolitionOrder",
      meta: {
        title: "拆单发货",
        parent: "orderShop",
        AdminPerm: "order.view"
      },
      component: () => import("@/views/shop/order/order-demolition-order.vue")
    }
  ],
  orderAfterSele: [{
    path: "/order/afterSele/details",
    name: "orderAfterSeleDetails",
    meta: {
      title: "售后详情",
      parent: "orderAfterSele",
      AdminPerm: "order.after-sale.view"
    },
    component: () =>
      import("@/views/shop/order/components/order-after-sele-details.vue")
  }],
  channel: [{
      path: "/channel/weixin",
      name: "weixin",
      meta: {
        title: "微信公众号",
        parent: "channel",
        redir: "/channel/weixin/custom-menu"
      }
    },
    {
      path: "/channel/wxapp",
      name: "wxapp",
      meta: {
        title: "微信小程序",
        parent: "channel",
        redir: "/channel/wxapp/wxapp-setting",
        AdminPerm: "wxapp.config.view",
		LicensePerm: "ENABLE_WXAPP"
      }
    },
    {
      path: "/channel/wxwork",
      name: "wxwork",
      meta: {
        title: "企业微信",
        parent: "channel",
        redir: "/channel/wxwork/wxwork-setting",
        AdminPerm: "wxwork.config.view",
		LicensePerm: "ENABLE_WXWORK"
      }
    },
    {
      path: "/channel/h5",
      name: "h5",
      meta: {
        title: "H5端",
        parent: "channel",
        redir: "/channel/h5/h5-setting"
      }
    }
  ],
  securityCodestock: [{
      path: "/marketing/batch",
      name: "securityBatch",
      meta: {
        title: "批次列表",
        parent: "securityCodestock",
        isChildren: true,
        hideBreadCrum: true,
        AdminPerm: "security.view",
        LicensePerm: "ENABLE_SECURITY_CODE"
      },
      component: () => import("@/views/shop/security/security-batch.vue")
    },
    {
      path: "/marketing/code",
      name: "securityCode",
      meta: {
        title: "防伪码列表",
        parent: "securityCodestock",
        isChildren: true,
        hideBreadCrum: true,
        AdminPerm: "security.view",
        LicensePerm: "ENABLE_SECURITY_CODE"
      },
      component: () => import("@/views/shop/security/security-code.vue")
    },
    {
      path: "/marketing/batch-add",
      name: "securityBatchAdd",
      meta: {
        title: "新增批次",
        parent: "securityCodestock",
        AdminPerm: "security.view",
        LicensePerm: "ENABLE_SECURITY_CODE"
      },
      component: () => import("@/views/shop/security/security-batch-add.vue")
    }
  ],
  weixin: [{
      path: "/channel/weixin/custom-menu",
      name: "customMenu",
      meta: {
        title: "自定义菜单",
        parent: "weixin",
        AdminPerm: "mp.menu.view"
      },
      component: () => import("@/views/shop/channel/weixin/custom-menu.vue")
    },
    {
      path: "/channel/weixin/lead-attention",
      name: "leadAttention",
      meta: {
        title: "引导关注",
        parent: "weixin",
        AdminPerm: "mp.reply.view"
      },
      component: () => import("@/views/shop/channel/weixin/lead-attention.vue")
    },
    {
      path: "/channel/weixin/auto-reply",
      name: "autoReply",
      meta: {
        title: "自动回复",
        parent: "weixin",
        AdminPerm: "mp.reply.view"
      },
      component: () => import("@/views/shop/channel/weixin/auto-reply.vue")
    },
    {
      path: "/channel/weixin/auto-reply/addKeywordReply",
      name: "addKeywordReply",
      meta: {
        title: "新增关键词回复",
        parent: "weixin",
        AdminPerm: "mp.reply.view"
      },
      component: () => import("@/views/shop/channel/weixin/add-auto-reply.vue")
    },
    {
      path: "/channel/weixin/auto-reply/editKeywordReply",
      name: "editKeywordReply",
      meta: {
        title: "编辑关键词回复",
        parent: "weixin",
        AdminPerm: "mp.reply.view"
      },
      component: () => import("@/views/shop/channel/weixin/add-auto-reply.vue")
    },
    {
      path: "/channel/weixin/auto-reply/addMessageReply",
      name: "addMessageReply",
      meta: {
        title: "新增消息回复",
        parent: "weixin",
        AdminPerm: "mp.reply.view"
      },
      component: () => import("@/views/shop/channel/weixin/add-auto-reply.vue")
    },
    {
      path: "/channel/weixin/auto-reply/editMessageReply",
      name: "editMessageReply",
      meta: {
        title: "编辑消息回复",
        parent: "weixin",
        AdminPerm: "mp.reply.view"
      },
      component: () => import("@/views/shop/channel/weixin/add-auto-reply.vue")
    },
    {
      path: "/channel/weixin/auto-reply/addFocusReply",
      name: "addFocusReply",
      meta: {
        title: "新增关注回复",
        parent: "weixin",
        AdminPerm: "mp.reply.view"
      },
      component: () => import("@/views/shop/channel/weixin/add-auto-reply.vue")
    },
    {
      path: "/channel/weixin/auto-reply/editFocusReply",
      name: "editFocusReply",
      meta: {
        title: "编辑关注回复",
        parent: "weixin",
        AdminPerm: "mp.reply.view"
      },
      component: () => import("@/views/shop/channel/weixin/add-auto-reply.vue")
    },
    {
      path: "/channel/weixin/material-management",
      name: "materialManagement",
      meta: {
        title: "素材管理",
        parent: "weixin",
        AdminPerm: "mp.media.view"
      },
      component: () =>
        import("@/views/shop/channel/weixin/material-management.vue")
    },
    {
      path: "/channel/weixin/material-management/add-material",
      name: "addMaterial",
      meta: {
        title: "新增素材",
        parent: "weixin",
        AdminPerm: "mp.media.view"
      },
      component: () => import("@/views/shop/channel/weixin/add-material.vue")
    },
    {
      path: "/channel/weixin/material-management/edit-material",
      name: "editMaterial",
      meta: {
        title: "编辑素材",
        parent: "weixin",
        AdminPerm: "mp.media.view"
      },
      component: () => import("@/views/shop/channel/weixin/add-material.vue")
    },
    {
      path: "/channel/weixin/public-management",
      name: "publicManagement",
      meta: {
        title: "公众号管理",
        parent: "weixin",
        AdminPerm: "mp.config.view"
      },
      component: () =>
        import("@/views/shop/channel/weixin/public-management.vue")
    }
  ],
  h5: [{
    path: "/channel/h5/h5-setting",
    name: "h5Setting",
    meta: {
      title: "H5设置",
      parent: "h5",
      AdminPerm: "h5.config.view"
    },
    component: () => import("@/views/shop/channel/h5/h5-setting.vue")
  }],
  wxwork: [{
    path: "/channel/wxwork/wxwork-setting",
    name: "wxworkSetting",
    meta: {
      title: "企业微信",
      parent: "wxwork",
      AdminPerm: "wxwork.config.view"
    },
    component: () => import("@/views/shop/channel/wxwork/wxwork-setting.vue")
  }],
  wxapp: [{
      path: "/channel/wxapp/wxapp-setting",
      name: "wxappSetting",
      meta: {
        title: "小程序绑定",
        parent: "wxapp",
        AdminPerm: "wxapp.config.view"
      },
      component: () => import("@/views/shop/channel/wxapp/wxapp-setting.vue")
    },
    {
      path: "/channel/wxapp/wxapp-publish",
      name: "wxappPublish",
      meta: {
        title: "小程序发布",
        parent: "wxapp",
        AdminPerm: "wxapp.config.view"
      },
      component: () => import("@/views/shop/channel/wxapp/wxapp-publish.vue")
    }
  ],
  // ]
  // order: [
  // {
  //   path: "/order/order-detail",
  //   name: "orderDetail",
  //   meta: {
  //     title: "订单详情",
  //     parent: "order"
  //   },
  //   component: () => import("@/views/shop/order/order-detail.vue")
  // },
  // {
  //   path: "/order/order-demolition-order",
  //   name: "orderDemolitionOrder",
  //   meta: {
  //     title: "拆单发货",
  //     parent: "order"
  //   },
  //   component: () => import("@/views/shop/order/order-demolition-order.vue")
  // }
  /* 经销商授权证书的下级路由 */
  dealerAuthCert: [{
    path: "/dealer/dealer-authcert-design",
    name: "dealerAuthCertDesign",
    meta: {
      title: "证书设计",
      parent: "dealerAuthCert",
      AdminPerm: "dealer.authcert.view"
    },
    component: () => import("@/views/shop/dealer/dealer-authcert-design.vue")
  }],
  /* 授权邀请下级路由 */
  dealerInvite: [{
    path: "/dealer/dealer-inviteposter-design",
    name: "dealerInviterPosterDesign",
    meta: {
      title: "招募海报",
      parent: "dealerInvite",
      AdminPerm: "dealer.dealerinvite.view"
    },
    component: () =>
      import("@/views/shop/dealer/dealer-inviteposter-design.vue")
  }],

  bigscreen: [{
      path: "/bigscreen/decoration",
      name: "bigscreenDecoration",
      meta: {
        title: "广告屏装修",
        parent: "bigscreen",
        AdminPerm: "bigscreen.page.view"
      },
      component: () => import("@/views/shop/bigscreen/bigscreen-decoration.vue")
    },
    {
      path: "/bigscreen/design/mobile-nav",
      name: "bigscreenDesignMobileNav",
      meta: {
        title: "广告屏导航",
        parent: "bigscreen",
        AdminPerm: "bigscreen.nav.view"
      },
      component: () =>
        import("@/views/shop/bigscreen/design/mobile-nav-design.vue")
    },
    {
      path: "/bigscreen/design/popup",
      name: "bigscreenDesignPopup",
      meta: {
        title: "广告屏弹窗",
        parent: "bigscreen",
        AdminPerm: "bigscreen.popup.view"
      },
      component: () => import("@/views/shop/bigscreen/design/popup-design.vue")
    },
    {
      path: "/bigscreen/app",
      name: "bigscreenApp",
      meta: {
        title: "广告屏APP",
        parent: "bigscreen",
        AdminPerm: "bigscreen.app.view"
      },
      component: () => import("@/views/shop/bigscreen/app.vue")
    }
  ],
  bigscreenDecoration: [{
      path: "/bigscreen/design/home/mobile",
      name: "bigscreenDesignHomeMobile",
      meta: {
        title: "编辑广告屏主页",
        parent: "bigscreenDecoration",
        AdminPerm: "bigscreen.page.view"
      },
      component: () =>
        import("@/views/shop/bigscreen/design/mobile-page-design.vue")
    },
    {
      path: "/bigscreen/template",
      name: "bigscreenTemplate",
      meta: {
        title: "选择模板",
        parent: "bigscreenDecoration"
      },
      component: () => import("@/views/shop/bigscreen/template.vue")
    }
  ],
  bigscreenApp: [{
    path: "/bigscreen/app/edit",
    name: "bigscreenAppEdit",
    meta: {
      title: "编辑APP",
      parent: "bigscreenApp",
      AdminPerm: "bigscreen.app.view"
    },
    component: () => import("@/views/shop/bigscreen/app-edit.vue")
  }],
  /* 直播相关 */
  live: [{
      path: "/live/live-manage",
      name: "liveManage",
      meta: {
        LicensePerm: "ENABLE_LIVE",
        title: "直播间管理",
        parent: "live",
        AdminPerm: "live.view"
      },
      component: () => import("@/views/shop/live/live-manage.vue")
    },
    {
      path: "/live/live-add",
      name: "liveAdd",
      meta: {
        LicensePerm: "ENABLE_LIVE",
        title: "创建直播间",
        parent: "live",
        AdminPerm: "live.view"
      },
      component: () => import("@/views/shop/live/live-add.vue")
    }
  ],
  liveManage: [{
      path: "/live/live-desk",
      name: "liveDesk",
      meta: {
        title: "直播工作台",
        parent: "liveManage",
        AdminPerm: "live.view"
      },
      component: () => import("@/views/shop/live/live-desk.vue")
    },
    {
      path: "/live/live-edit",
      name: "liveEdit",
      meta: {
        title: "编辑直播间",
        parent: "liveManage",
        AdminPerm: "live.view"
      },
      component: () => import("@/views/shop/live/live-edit.vue")
    }
  ]
};