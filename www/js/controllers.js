angular.module('starter.controllers', [])
  .config(function ($httpProvider) { //统一配置设置
    //服务注册到$httpProvider.interceptors中  用于接口授权
    $httpProvider.interceptors.push('MyInterceptor');
    /* $httpProvider.defaults.headers.common['Authorization'] = localStorage.getItem('token');*/
  })


  //APP首页面
  .controller('MainCtrl', function ($scope, $rootScope, CommonService, MainService, $ionicHistory, $ionicScrollDelegate) {
    //在首页中清除导航历史退栈
    $scope.$on('$ionicView.afterEnter', function () {
      $ionicHistory.clearHistory();
    })

    $scope.scrollWidth = window.innerWidth + 'px';
    $scope.scrollContentWidth = document.querySelector("#main-scroll").clientWidth + 'px';

  })

  //登录页面
  .controller('LoginCtrl', function ($scope, $rootScope, $state, CommonService, AccountService) {
    $scope.user = {};//定义用户对象
    $scope.loginSubmit = function () {
      AccountService.login($scope.user).success(function (data) {
        CommonService.getStateName();   //跳转页面
      }).error(function () {
        CommonService.platformPrompt("登录失败", 'close');
      })
    }
  })

  //产品分类主页面
  .controller('ClassifyCtrl', function ($scope, $rootScope, CommonService, ClassifyService) {
    $scope.classifyinfo = ['奶粉尿裤', '洗护哺育', '辅食营养', '孕妈专区', '家纺服饰', '童装童鞋'];
    $scope.classifyindex = 0;//选中产品分类标示
    CommonService.customModal($scope, 'templates/search.html');
    //获取产品分类
    $scope.getClassify = function () {
      ClassifyService.getClassify().success(function (data) {
      })
    }
    //点击产品分类获取产品分类详情
    $scope.getClassifyDetails = function (index) {
      $scope.classifyindex = index;
    }

    $scope.scrollHeight = (window.innerHeight - 44 - 49) + 'px';
    $scope.scrollContentHeight = document.querySelector("#classify-scroll-content").clientHeight + 'px';
  })
  //产品列表页面
  .controller('ProductListCtrl', function ($scope, $rootScope, CommonService, ClassifyService, $ionicSlideBoxDelegate) {
    CommonService.customModal($scope, 'templates/search.html');
    $scope.tabIndex = 0;//当前tabs页
    $scope.slideChanged = function (index) {
      $scope.tabIndex = index;
    };

    $scope.selectedTab = function (index) {
      $scope.tabIndex = index;
      //滑动的索引和速度
      $ionicSlideBoxDelegate.$getByHandle("slidebox-productlist").slide(index)
    }
  })
  //产品详情页面
  .controller('ProductDetailsCtrl', function ($scope, $rootScope, CommonService) {
    CommonService.customModal($scope, 'templates/search.html');

  })
  //购物车主界面
  .controller('ShoppingCartCtrl', function ($scope, $rootScope, CommonService) {
    $scope.shoppingcar = {
      isSelectAll: false,//是否全部选择
      showDelete: false,//删除按钮是否显示
      totalnum: 0,//总购买数量
      totalPrice: 0//总价格
    };
    //模拟数据
    $scope.shoppingcartdata = [{
      img: 'img/main/1.png',
      title: '婴幼儿配方奶粉3段1',
      description: '100%海外原装正品荷兰Hero Baby婴幼儿奶粉白井塅3段 700g',
      price: '49.01',
      num: 1,
      checked: false
    }, {
      img: 'img/main/1.png',
      title: '婴幼儿配方奶粉3段2',
      description: '100%海外原装正品荷兰Hero Baby婴幼儿奶粉白井塅3段 700g',
      price: '46.02',
      num: 2,
      checked: false
    }, {
      img: 'img/main/1.png',
      title: '婴幼儿配方奶粉3段3',
      description: '100%海外原装正品荷兰Hero Baby婴幼儿奶粉白井塅3段 700g',
      price: '40.03',
      num: 3,
      checked: false
    }, {
      img: 'img/main/1.png',
      title: '婴幼儿配方奶粉3段4',
      description: '100%海外原装正品荷兰Hero Baby婴幼儿奶粉白井塅3段 700g',
      price: '44.04',
      num: 4,
      checked: false
    }]


    // 监控数组是否变化，动态修改总价
    $scope.$watch("shoppingcartdata", function () {
      getTotal();
    }, true);

    //添加数量
    $scope.add = function ($index) {
      $scope.shoppingcartdata[$index].num++;
    }
    // 减少数量
    $scope.minus = function ($index) {
      if ($scope.shoppingcartdata[$index].num == 0)return;
      $scope.shoppingcartdata[$index].num--;
    }
    // 计算总价
    var getTotal = function () {
      $scope.shoppingcar.totalPrice = 0;
      $scope.shoppingcar.totalnum = 0;
      angular.forEach($scope.shoppingcartdata, function (item, index) {
        if (item.checked) {//选中的购物商品
          $scope.shoppingcar.totalPrice = $scope.shoppingcar.totalPrice + item.num * item.price;//总价格
          $scope.shoppingcar.totalnum += item.num;//总数量
        }
      })
      return $scope.shoppingcar.totalPrice;
    }
    //全部选择
    $scope.selectAll = function (isSelectAll) {
      angular.forEach($scope.shoppingcartdata, function (item, index) {
        item.checked = isSelectAll;
      })
    }
    //删除购物车
    $scope.deleteShoppingCart = function (index) {
      $scope.shoppingcartdata.splice(index, 1)
    }
  })

  //提交订单核对订单
  .controller('ReviewOrderCtrl', function ($scope, $rootScope, CommonService) {

  })

  //我的订单
  .controller('MyOrderCtrl', function ($scope, $rootScope, CommonService, $ionicSlideBoxDelegate) {
    $scope.tabIndex = 0;//当前tabs页
    $scope.slideChanged = function (index) {
      $scope.tabIndex = index;
    };

    $scope.selectedTab = function (index) {
      $scope.tabIndex = index;
      //滑动的索引和速度
      $ionicSlideBoxDelegate.$getByHandle("slidebox-myorderlist").slide(index)
    }
  })
  //我的设置页面
  .controller('AccountCtrl', function ($scope, $rootScope, CommonService, AccountService) {
    $scope.settings = {
      enableFriends: true
    };
  })
  //注册页面
  .controller('RegisterCtrl', function ($scope, $rootScope, $state, CommonService, AccountService) {
    $scope.user = {};//定义用户对象
    $scope.registerSubmit = function () {
      AccountService.login($scope.user).success(function (data) {
      }).error(function () {
        CommonService.platformPrompt("注册失败", 'close');
      })
    }
  })

  //重置密码页面
  .controller('ResetPasswordCtrl', function ($scope, $rootScope, $state, CommonService, AccountService) {
    $scope.user = {};//定义用户对象
    $scope.registerSubmit = function () {
      AccountService.login($scope.user).success(function (data) {
      }).error(function () {
        CommonService.platformPrompt("重置密码失败", 'close');
      })
    }
  })

  //修改密码页面
  .controller('ChangePasswordCtrl', function ($scope, $rootScope, $state, CommonService, AccountService) {
    $scope.user = {};//定义用户对象
    $scope.changepasswordSubmit = function () {
      AccountService.login($scope.user).success(function (data) {
      }).error(function () {
        CommonService.platformPrompt("修改密码失败", 'close');
      })
    }
  })

  //反馈建议页面
  .controller('HelpFeedbackCtrl', function ($scope, $rootScope, $state, CommonService, AccountService) {
    $scope.helpfeedback = {};//定义对象
    $scope.helpfeedbackSubmit = function () {
      AccountService.login($scope.helpfeedback).success(function (data) {
      }).error(function () {
        CommonService.platformPrompt("反馈建议提交失败", 'close');
      })
    }
  })

  //地址管理页面
  .controller('AddressManageCtrl', function ($scope, $rootScope, $state, CommonService, AccountService) {
    $scope.addresslist = ['广东省 深圳市 南山区 高薪科技园北区 深南小巷', '广东省 深圳市 南山区2 高薪科技园北区 深南小巷', '广东省 深圳市 南山区3 高薪科技园北区 深南小巷']
    $scope.getAddressList = function () {
      AccountService.login().success(function (data) {
      }).error(function () {
        CommonService.platformPrompt("获取地址管理列表失败", 'close');
      })
    }
    //选中地址编辑地址
    $scope.selectAddress = function (index) {
      //选中第几个数组
      $scope.selectindex = index;
    }
    //删除选择的地址
    $scope.deleteAddress = function (index) {
      $scope.addresslist.splice(index, 1)
    }

  })

  //添加地址页面
  .controller('AddAddressCtrl', function ($scope, $rootScope, $state, CommonService, AccountService) {
    //地址信息
    $scope.addrinfo = {};
    //获取省市县
    $scope.getAddressPCCList = function () {
      AccountService.login().success(function (data) {
      }).error(function () {
        CommonService.platformPrompt("获取添加地址省市县失败", 'close');
      })
    }

    //保存地址
    $scope.addressSave = function () {

    }

  })
  //完善资料页面
  .controller('OrganizingDataCtrl', function ($scope, $rootScope, $state, CommonService, AccountService) {
    //用户信息
    $scope.userinfo = {};
    //完善资料保存
    $scope.organizingdataSave = function () {

    }
  })
  //我的钱包页面
  .controller('MyWalletCtrl', function ($scope, $rootScope, $state, CommonService) {
    //提现
    $scope.mywalletSubmit = function () {

    }
  })

  //我的收入
  .controller('MyIncomeCtrl', function ($scope, $rootScope, CommonService, $ionicSlideBoxDelegate) {
    $scope.tabIndex = 0;//当前tabs页
    $scope.slideChanged = function (index) {
      $scope.tabIndex = index;
    };

    $scope.selectedTab = function (index) {
      $scope.tabIndex = index;
      //滑动的索引和速度
      $ionicSlideBoxDelegate.$getByHandle("slidebox-myincomelist").slide(index)
    }
  })

  //我的优惠卷页面
  .controller('MyCouponCtrl', function ($scope, CommonService) {
    //失效卷标示
    $scope.isfailureVolumeflg = false;
    //失效卷
    $scope.failureVolume = function () {
      $scope.isfailureVolumeflg = $scope.isfailureVolumeflg ? false : true;
    }
  })
  //邀请记录页面
  .controller('InvitationListCtrl', function ($scope, CommonService) {

  })
  //我的积分页面
  .controller('MyNtegralCtrl', function ($scope, CommonService) {

  })

  //联系我们页面
  .controller('ContactUsCtrl', function ($scope, CommonService) {

  })
  //每日签到页面
  .controller('SignInCtrl', function ($scope, CommonService) {
    //构造一个日期对象：
    var date = new Date();
    //获取年份
    $scope.year = date.getFullYear();
    //获取当前月份
    $scope.mouth = date.getMonth() + 1;
    //获取今天当月的第几天数
    $scope.daycount = date.getDate();
    //今天是星期几
    $scope.week = "日一二三四五六".charAt(new Date().getDay());
    //获取当月总共有多少天
    $scope.getDaysInOneMonth = function (year, month) {
      month = parseInt(month, 10);
      var d = new Date(year, month, 0);
      $scope.monthdays = d.getDate();
    }

  })
  //问卷调查页面
  .controller('QuestionnaireCtrl', function ($scope, CommonService) {

  })
