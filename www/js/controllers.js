angular.module('starter.controllers', [])
  .config(function ($httpProvider) { //统一配置设置
    //服务注册到$httpProvider.interceptors中  用于接口授权
    $httpProvider.interceptors.push('MyInterceptor');
    /* $httpProvider.defaults.headers.common['Authorization'] = localStorage.getItem('token');*/
    //$http模块POST请求类型编码转换 统一配置
    $httpProvider.defaults.transformRequest = function (obj) {
      var str = [];
      for (var p in obj) {
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p])) //encodeURIComponent保证数据传输的准确性以及防止Url注入带来的跨站点攻击
      }
      return str.join("&")
    }
    $httpProvider.defaults.headers.post = {
      'Content-Type': 'application/x-www-form-urlencoded'
    }

    $httpProvider.defaults.headers.put = {
      'Content-Type': 'application/x-www-form-urlencoded'
    }

  })


  //APP首页面
  .controller('MainCtrl', function ($scope, $rootScope, CommonService, MainService, $ionicHistory, $timeout, WeiXinService, YuanHenXiang, $ionicSlideBoxDelegate, $ionicScrollDelegate) {
    /*    WeiXinService.getweixinPayData().success(function (data) {
     WeiXinService.weixinPay(data);
     })*/
    //获取定位信息
    $scope.cityName = "深圳";//默认地址
    CommonService.getLocation(function () {
      //获取首页地理位置城市名称
      MainService.getCurrentCityName({
        key: YuanHenXiang.gaoDeKey,
        location: Number(localStorage.getItem("longitude")).toFixed(6) + "," + Number(localStorage.getItem("latitude")).toFixed(6)
      }).success(function (data) {
        if (data.status == 1) {
          var addressComponent = data.regeocode.addressComponent;
          $scope.cityName = addressComponent.city ? addressComponent.city.replace("市", "") : addressComponent.province.replace("市", "");
        }
      })
    });
    MainService.getAdvList(CommonService.authParams({code: "index_banner"})).success(function (data) {
      if (data.status == 1) {
        $scope.banner = data.data.lists;
        //ng-repeat遍历生成一个个slide块的时候，执行完成页面是空白的 手动在渲染之后更新一下，在控制器注入$ionicSlideBoxDelegate，然后渲染数据之后
        $timeout(function () {
          $ionicSlideBoxDelegate.$getByHandle("slideboximgs").update();
          //上面这句就是实现无限循环的关键，绑定了滑动框，
          $ionicSlideBoxDelegate.$getByHandle("slideboximgs").loop(true);
          /*            console.log($ionicSlideBoxDelegate.$getByHandle("slideboximgs").slidesCount());*/
        }, 100)
      }
      //在外部浏览器打开连接
      $scope.windowOpen = function (url) {
        CommonService.windowOpen(url)
      }
    })
    //在首页中清除导航历史退栈
    $scope.$on('$ionicView.afterEnter', function () {
      $ionicHistory.clearHistory();
    })
    $scope.scrollWidth = window.innerWidth + 'px';
    $scope.scrollContentWidth = document.querySelector("#main-scroll").clientWidth + 'px';

  })

  //登录页面
  .controller('LoginCtrl', function ($scope, $rootScope, $state, CommonService, AccountService, EncodingService,$cordovaDevice) {
    $scope.user = {};//定义用户对象
    $scope.loginSubmit = function () {
      if (ionic.Platform.isWebView()) { //获取设备UUID
        $scope.user.udid = $cordovaDevice.getUUID();
      } else {
        $scope.user.udid = "43a561a7658ae5b1";
      }
      AccountService.login({
        mobile: $scope.user.mobile,
        password: EncodingService.md5($scope.user.password),
        udid: $scope.user.udid
      }).success(function (data) {
        console.log(data);
        if (data.status == 1) {
          CommonService.getStateName();   //跳转页面
          var info = data.data.info;
          localStorage.setItem("login_name", info.login_name);
          localStorage.setItem("mid", info.mid)
          localStorage.setItem("token", info.token)
        }
        CommonService.platformPrompt(data.info, 'close');

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
  .controller('ReviewOrderCtrl', function ($scope, $rootScope, CommonService,AccountService) {
    $scope.getDefaultAddress = function () { //获取发货地址
      AccountService.getDefaultAddress(CommonService.authParams({mid: localStorage.getItem("mid")})).success(function (data) {
        console.log(data);
        if (data.status == 1) {
          $scope.deliveryAddress=data.data.info;
        }

      })

    }
    $scope.getDefaultAddress();
  })

  //我的订单
  .controller('MyOrderCtrl', function ($scope, $rootScope, CommonService, $ionicSlideBoxDelegate) {
    CommonService.customModal($scope, 'templates/modal/paymodal.html');
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
  .controller('AccountCtrl', function ($scope, $rootScope, $state, CommonService, AccountService) {
    $scope.settings = {
      enableFriends: true
    };
    CommonService.isLogin(true);//判断是否登录
    //获取会员信息
    var params = {};
    AccountService.getMemberInfo(CommonService.authParams(params)).success(function (data) {
      console.log(data);
      if (data.status == 1) {

      }
    })
    //退出登录清除缓存
    $scope.logout = function () {
      AccountService.logout(CommonService.authParams({mid: localStorage.getItem("mid")})).success(function (data) {
        if (data.status == 1) {
          localStorage.removeItem("login_name");
          localStorage.removeItem("mid");
          localStorage.removeItem("token");
          $state.go("login")
        }
        CommonService.platformPrompt(data.info, 'close');
      })

    }


  })
  //注册页面
  .controller('RegisterCtrl', function ($scope, $rootScope, $state, CommonService, AccountService, EncodingService, $cordovaDevice) {
    $scope.user = {};//定义用户对象
    $scope.paracont = "获取验证码"; //初始发送按钮中的文字
    $scope.paraclass = false; //控制验证码的disable
    $scope.checkphone = function (mobilephone) {//检查手机号
      AccountService.checkMobilePhone($scope, mobilephone);
    }

    $scope.getVerifyCode = function () {
      event.preventDefault();
      event.stopPropagation();
      if ($scope.paraclass) { //按钮可用
        //60s倒计时
        AccountService.countDown($scope);
        AccountService.getVerifyCode({mobile: $scope.user.mobile, isFindPwd: "1"}).success(function (data) {
          console.log(data);
          if (data.status == 1) {

          }else {
            CommonService.platformPrompt(data.info, 'close');
          }

        })
      }
    }
    $scope.registerSubmit = function () {
      if (ionic.Platform.isWebView()) { //获取设备UUID
        var uuid = $cordovaDevice.getUUID();
      } else {
        var uuid = "43a561a7658ae5b1";
      }
      AccountService.register({
        mobile: $scope.user.mobile,
        password: EncodingService.md5($scope.user.password),
        verify: $scope.user.verify,
        udid: uuid
      }).success(function (data) {
        console.log(data);
        if (data.status == 1) {

        }
        CommonService.platformPrompt(data.info, 'close');

      }).error(function () {
        CommonService.platformPrompt("注册失败", 'close');
      })
    }
  })

  //重置密码页面
  .controller('ResetPasswordCtrl', function ($scope, $rootScope, $state, CommonService, AccountService, EncodingService) {
    $scope.user = {};//定义用户对象
    $scope.paracont = "获取验证码"; //初始发送按钮中的文字
    $scope.paraclass = false; //控制验证码的disable
    $scope.checkphone = function (mobilephone) {//检查手机号
      AccountService.checkMobilePhone($scope, mobilephone);
    }

    $scope.getVerifyCode = function () {
      event.preventDefault();
      event.stopPropagation();
      if ($scope.paraclass) { //按钮可用
        //60s倒计时
        AccountService.countDown($scope);
        AccountService.getVerifyCode({mobile: $scope.user.mobile, isFindPwd: "2"}).success(function (data) {
          console.log(data);
          if (data.status == 1) {

          }else {
            CommonService.platformPrompt(data.info, 'close');
          }

        })
      }
    }
    $scope.resetpasswordSubmit = function () { //重置密码
      if ($scope.user.newPwd != $scope.user.reNewPwd) {
        CommonService.platformPrompt("两次输入密码不一致", 'close');
        return;
      }
      $scope.user.newPwd = EncodingService.md5($scope.user.newPwd);
      $scope.user.reNewPwd = EncodingService.md5($scope.user.reNewPwd);
      AccountService.resetPassword($scope.user).success(function (data) {
        if (data.status == 1) {
          $state.go("login")
        }
        CommonService.platformPrompt(data.info, 'close');
      })
    }
  })

  //修改密码页面
  .controller('ChangePasswordCtrl', function ($scope, $rootScope, $state, CommonService, AccountService, EncodingService) {
    $scope.user = {};//定义用户对象
    $scope.paracont = "获取验证码"; //初始发送按钮中的文字
    $scope.paraclass = true; //控制验证码的disable
    $scope.getVerifyCode = function () {
      event.preventDefault();
      event.stopPropagation();
      if ($scope.paraclass) { //按钮可用
        //60s倒计时
        AccountService.countDown($scope);
        AccountService.getVerifyCode({
          mobile: localStorage.getItem("login_name"),
          isFindPwd: "2"
        }).success(function (data) {
          if (data.status == 1) {

          }else {
            CommonService.platformPrompt(data.info, 'close');
          }

        })
      }
    }
    $scope.changepasswordSubmit = function () {
      if ($scope.user.newPwd != $scope.user.reNewPwd) {
        CommonService.platformPrompt("两次输入密码不一致", 'close');
        return;
      }
      $scope.params = {
        newPwd: EncodingService.md5($scope.user.newPwd),
        reNewPwd: EncodingService.md5($scope.user.reNewPwd),
        verify: $scope.user.verify,
      }

      AccountService.editPassword(CommonService.authParams($scope.params)).success(function (data) {
        if (data.status == 1) {
          $state.go("tab.account")
        }
        CommonService.platformPrompt(data.info, 'close');
      }).error(function () {
        CommonService.platformPrompt("修改密码失败", 'close');
      })
    }
  })

  //反馈建议页面
  .controller('HelpFeedbackCtrl', function ($scope, $rootScope, $state, CommonService, AccountService) {
    $scope.helpinfo = {};//定义对象
    $scope.helpfeedbackSubmit = function () {
      AccountService.addFeedback(CommonService.authParams({content: $scope.helpinfo.content})).success(function (data) {
        console.log(data);
        if (data.status == 1) {
          $state.go("tab.account");
        }
        CommonService.platformPrompt(data.info, 'close');
      }).error(function () {
        CommonService.platformPrompt("反馈建议提交失败", 'close');
      })
    }
  })

  //地址管理页面
  .controller('AddressManageCtrl', function ($scope, $rootScope, $state, CommonService, AccountService) {
    //$scope.addresslist = ['广东省 深圳市 南山区 高薪科技园北区 深南小巷', '广东省 深圳市 南山区2 高薪科技园北区 深南小巷', '广东省 深圳市 南山区3 高薪科技园北区 深南小巷']
    $scope.getAddressList = function () {
      var params = {};
      AccountService.getAddressList(CommonService.authParams(params)).success(function (data) {
        console.log(data);
        if (data.status == 1) {
          $scope.addresslist = data.data.lists;
        }
      }).error(function () {
        CommonService.platformPrompt("获取地址管理列表失败", 'close');
      })
    }
    $scope.getAddressList()
    //选中地址编辑地址
    $scope.selectAddress = function (index) {
      //选中第几个数组
      $scope.selectindex = index;
    }
    //删除选择的地址
    $scope.deleteAddress = function (id, index) {
      AccountService.deleteAddress(CommonService.authParams({id: id})).success(function (data) {
        if (data.status == 1) {
          $scope.addresslist.splice(index, 1)
        }
        CommonService.platformPrompt(data.info, 'close');
      })

    }

  })

  //添加地址页面
  .controller('AddAddressCtrl', function ($scope, $rootScope, $state, $stateParams, CommonService, AccountService, YuanHenXiang, $ionicScrollDelegate) {
    CommonService.customModal($scope, 'templates/modal/addressmodal.html');
    //地址信息
    $scope.addrinfo = {};
    //修改地址时候获取用户地址信息
    if ($stateParams.id != 0) {
      AccountService.getAddressInfo(CommonService.authParams({id: $stateParams.id})).success(function (data) {
        console.log(data);
        if (data.status == 1) {
          $scope.addrinfo = data.data.info;
          $scope.addrinfo.tel = Number(data.data.info.tel);
          $scope.addrinfo.email = Number(data.data.info.email);
          $scope.addresspcd = $scope.addrinfo.province + $scope.addrinfo.city + $scope.addrinfo.area;
        }
      })
    }
    //获取省市县
    $scope.getAddressPCCList = function (adcode) {
      if (isNaN(adcode) && adcode) {
        $scope.addresspcd = $scope.addrinfo.province + $scope.addrinfo.city + $scope.addrinfo.area;
        $scope.addrinfo.address = adcode;
        $scope.modal.hide();
        return;
      }
      AccountService.getDistrict({
        key: YuanHenXiang.gaoDeKey,
        keywords: adcode || "",
        showbiz: false
      }).success(function (data) {
        $scope.addressinfo = data.districts[0].districts;
        $scope.level = data.districts[0].level;
        if ($scope.level == "province") {
          $scope.addrinfo.province = data.districts[0].name;
        } else if ($scope.level == "city") {
          $scope.addrinfo.city = data.districts[0].name;
        } else if ($scope.level == "district") {
          $scope.addrinfo.area = data.districts[0].name;
        }
        $ionicScrollDelegate.scrollTop()
      }).error(function () {
        CommonService.platformPrompt("获取添加地址省市县失败", 'close');
      })
    }
    $scope.openModal = function () {
      $scope.modal.show();
      $scope.getAddressPCCList();
    }

    //保存地址
    $scope.addressSave = function () {
      if ($stateParams.id == 0) { //增加方法
        AccountService.addAddress(CommonService.authParams($scope.addrinfo)).success(function (data) {
          if (data.status == 1) {
            $state.go("addressmanage");
          }
          CommonService.platformPrompt(data.info, 'close');
        })
      } else {//修改方法
        AccountService.updateAddress(CommonService.authParams($scope.addrinfo)).success(function (data) {
          if (data.status == 1) {
            $state.go("addressmanage");
          }
          CommonService.platformPrompt(data.info, 'close');
        })
      }
    }


  })
  //完善资料页面
  .controller('OrganizingDataCtrl', function ($scope, $rootScope, $state, CommonService, AccountService, YuanHenXiang, $ionicScrollDelegate) {
    //用户信息
    $scope.userinfo = {};
    CommonService.customModal($scope, 'templates/modal/addressmodal.html');
    //地址信息
    $scope.addrinfo = {};
    //获取省市县
    $scope.getAddressPCCList = function (adcode) {
      if (isNaN(adcode) && adcode) {
        $scope.addresspcd = $scope.addrinfo.province + $scope.addrinfo.city + $scope.addrinfo.area;
        $scope.addrinfo.address = adcode;
        $scope.modal.hide();
        return;
      }
      AccountService.getDistrict({
        key: YuanHenXiang.gaoDeKey,
        keywords: adcode || "",
        showbiz: false
      }).success(function (data) {
        $scope.addressinfo = data.districts[0].districts;
        $scope.level = data.districts[0].level;
        if ($scope.level == "province") {
          $scope.addrinfo.province = data.districts[0].name;
        } else if ($scope.level == "city") {
          $scope.addrinfo.city = data.districts[0].name;
        } else if ($scope.level == "district") {
          $scope.addrinfo.area = data.districts[0].name;
        }
        $ionicScrollDelegate.scrollTop()
      }).error(function () {
        CommonService.platformPrompt("获取添加地址省市县失败", 'close');
      })
    }
    $scope.openModal = function () {
      $scope.modal.show();
      $scope.getAddressPCCList();
    }
    //完善资料保存
    $scope.organizingdataSave = function () {
      AccountService.memberInfo().success(function (data) {
        if (data.status == 1) {

        }
        CommonService.platformPrompt(data.info, 'close');
      })
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
  .controller('ContactUsCtrl', function ($scope, CommonService, AccountService) {
    //获取配置信息
    AccountService.getConfigInfo().success(function (data) {
      console.log(data);
      if (data.status == 1) {
        $scope.info = data.data.info;
      }
    })
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
  //上传头像
  .controller('UploadHeadCtrl', function ($scope, CommonService) {
    //上传图片数组集合
    $scope.imageList = [];
    $scope.uploadActionSheet = function () {
      CommonService.uploadActionSheet($scope,"upload");
    }
  })
  //评价
  .controller('EvaluateCtrl', function ($scope, CommonService) {

  })
