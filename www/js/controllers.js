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
  .controller('MainCtrl', function ($scope, $rootScope, CommonService, MainService, CityService, SearchService, $ionicHistory, $timeout, YuanHenXiang, $ionicSlideBoxDelegate, $ionicScrollDelegate) {
    /*    if (!CommonService.isLogin(true)) {//判断是否登录
     return false;
     }*/

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

    //获取首页数据
    $scope.getIndexData = function () {
      var params = {};
      MainService.getIndexData(CommonService.authParams(params)).success(function (data) {
        console.log(data);
        if (data.status == 1) {
          $scope.indexData = data.data.lists;
        } else {
          CommonService.platformPrompt(data.info, 'close');
        }
      })
    }
    $scope.getIndexData();
    //设置定位
    $scope.setLocation = function (cityName) {
      var params = {city_name: cityName};
      console.log(params);
      CityService.setLocation(CommonService.authParams(params)).success(function (data) {
        console.log(data);
        if (data.status == 1) {
        } else {
          CommonService.platformPrompt(data.info, 'close');
        }
      }).then(function () {
        $scope.getIndexData();
      })
    }


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
      }).finally(function () {
        $scope.setLocation($scope.cityName);
      })
    });


    //在首页中清除导航历史退栈
    $scope.$on('$ionicView.afterEnter', function () {
      $ionicHistory.clearHistory();

    })
    //搜索modal
    CommonService.customModal($scope, 'templates/search.html');
    //城市选择modal
    CommonService.customModal($scope, 'templates/modal/citymodal.html', 1);
    //点击选择城市
    $scope.openCustomModal = function () {
      $scope.city = {};//城市相关json数据
      $scope.modal1.show();
      MainService.selectCity($scope);
    }

    //搜索操作
    $scope.searchcontent = "";
    $scope.searchList = [];
    $scope.page = 0;
    $scope.total = 1;
    $scope.searchGoods = function (keyword) {
      if ((arguments != [] && arguments[0] == 0) || $scope.searchcontent == "") {
        $scope.page = 0;
        $scope.searchList = [];
      }
      $scope.page++;
      var params = {
        p: $scope.page,//页码
        num: 10,
        keyword: keyword
      };
      console.log(params);
      SearchService.searchGoods(CommonService.authParams(params)).success(function (data) {
        console.log(data);
        if (data.status == 1) {
          angular.forEach(data.data.lists, function (item) {
            $scope.searchList.push(item);
          })
          $scope.total = data.data.pageInfo.totalPages;
          $ionicScrollDelegate.resize();//添加数据后页面不能及时滚动刷新造成卡顿
        } else {
          CommonService.platformPrompt(data.info, 'close');
        }
      }).finally(function () {
        $scope.$broadcast('scroll.infiniteScrollComplete');
      })
    }

    $scope.scrollWidth = window.innerWidth + 'px';
    $scope.scrollContentWidth = document.querySelector("#main-scroll").clientWidth + 'px';

  })

  //登录页面
  .controller('LoginCtrl', function ($scope, $rootScope, $state, CommonService, AccountService, EncodingService, $cordovaDevice) {
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
          var info = data.data.info;
          localStorage.setItem("login_name", info.login_name);
          localStorage.setItem("mid", info.mid)
          localStorage.setItem("token", info.token)
          CommonService.getStateName();   //跳转页面
        } else {
          CommonService.platformPrompt(data.info, 'close');
        }

      }).error(function () {
        CommonService.platformPrompt("登录失败", 'close');
      })
    }
  })

  //产品分类主页面
  .controller('ClassifyCtrl', function ($scope, $rootScope, CommonService, GoodService) {
    // $scope.classifyinfo = ['奶粉尿裤', '洗护哺育', '辅食营养', '孕妈专区', '家纺服饰', '童装童鞋'];
    $scope.classifyindex = 0;//选中产品分类标示
    CommonService.customModal($scope, 'templates/search.html');
    //获取产品分类
    $scope.getClassify = function () {
      GoodService.getClassify().success(function (data) {
        console.log(data);
        if (data.status == 1) {
          $scope.classifyinfo = data.data.lists;
        } else {
          CommonService.platformPrompt(data.info, 'close');
        }
      }).then(function () {
        $scope.getClassifyDetails(0);
      })
    }
    $scope.getClassify()
    //点击产品分类获取产品分类详情
    $scope.getClassifyDetails = function (index) {
      $scope.classifyindex = index;
      $scope.classifyDetails = $scope.classifyinfo[index].son;
    }

    $scope.scrollHeight = (window.innerHeight - 44 - 49) + 'px';
    $scope.scrollContentHeight = document.querySelector("#classify-scroll-content").clientHeight + 'px';
  })
  //产品列表页面
  .controller('ProductListCtrl', function ($scope, $rootScope, $stateParams, CommonService, GoodService, $ionicSlideBoxDelegate, $ionicScrollDelegate) {
    CommonService.customModal($scope, 'templates/search.html');
    $scope.tabIndex = 0;//当前tabs页
    $scope.slideChanged = function (index) {
      $scope.tabIndex = index;
      $scope.getGoodsList(0);
    };

    $scope.selectedTab = function (index) {
      $scope.tabIndex = index;
      $scope.getGoodsList(0);
      //滑动的索引和速度
      $ionicSlideBoxDelegate.$getByHandle("slidebox-productlist").slide(index)
    }

    //产品综合数据
    $scope.pagesynthesize = 0;
    $scope.totalsynthesize = 1;
    $scope.synthesizeList = [];
    //产品销量数据
    $scope.pagesales = 0;
    $scope.totalsales = 1;
    $scope.salesList = [];
    //产品价格数据
    $scope.pageprice = 0;
    $scope.totalprice = 1;
    $scope.priceList = [];
    $scope.getGoodsList = function () {
      if (arguments != [] && arguments[0] == 0) {
        if ($scope.tabIndex == 0) {  //产品综合数据
          $scope.pagesynthesize = 0;
          $scope.synthesizeList = [];
        }
        if ($scope.tabIndex == 1) {  //产品销量数据
          $scope.pagesales = 0;
          $scope.salesList = [];
        }
        if ($scope.tabIndex == 2) {  //产品价格数据
          $scope.pageprice = 0;
          $scope.priceList = [];
        }
      }

      if ($scope.tabIndex == 0 || $scope.pagesynthesize == 0) {  //产品综合数据
        $scope.pagesynthesize++;
      }
      if ($scope.tabIndex == 1 || $scope.pagesales == 0) {  //产品销量数据
        $scope.pagesales++;
      }
      if ($scope.tabIndex == 2 || $scope.pageprice == 0) {  //产品价格数据
        $scope.pageprice++;
      }

      $scope.params = {
        p: $scope.tabIndex == 0 ? $scope.pagesynthesize : ($scope.tabIndex == 1 ? $scope.pagesales : $scope.pageprice),//页码
        num: 10,
        type: $stateParams.type,
        id: $stateParams.id,
        order_by: $scope.tabIndex //0 综合 1 销量 2 价格
      }
      console.log($scope.params);
      GoodService.getGoodsList(CommonService.authParams($scope.params)).success(function (data) {
        console.log(data);
        if (data.status == 1) {
          angular.forEach(data.data.lists, function (item) {
            if ($scope.tabIndex == 0) {  //产品综合数据
              $scope.synthesizeList.push(item);
            }
            if ($scope.tabIndex == 1) {  //产品销量数据
              $scope.salesList.push(item);
            }
            if ($scope.tabIndex == 2) {  //产品价格数据
              $scope.priceList.push(item);
            }

          })
          if ($scope.tabIndex == 0) {  //产品综合数据
            $scope.totalsynthesize = data.data.pageInfo.totalPages;
          }
          if ($scope.tabIndex == 1) {  //产品销量数据
            $scope.totalsales = data.data.pageInfo.totalPages;
          }
          if ($scope.tabIndex == 2) {  //产品价格数据
            $scope.totalprice = data.data.pageInfo.totalPages;
          }

          $ionicScrollDelegate.resize();//添加数据后页面不能及时滚动刷新造成卡顿
        } else {
          CommonService.platformPrompt(data.info, 'close');
        }
      }).finally(function () {
        $scope.$broadcast('scroll.refreshComplete');
        $scope.$broadcast('scroll.infiniteScrollComplete');
      })
    }
    $scope.getGoodsList();

  })
  //产品详情页面
  .controller('ProductDetailsCtrl', function ($scope, $rootScope, $stateParams, $state, GoodService, CommonService, ShoppingCartService, AccountService, $timeout, $ionicSlideBoxDelegate, $ionicScrollDelegate, $ionicTabsDelegate) {
    CommonService.customModal($scope, 'templates/search.html');
    $scope.getGoodsInfo = function () { //获取商品详情
      GoodService.getGoodsInfo(CommonService.authParams({id: $stateParams.id})).success(function (data) {
        if (data.status == 1) {
          $scope.goodsInfo = data.data.info;
          //ng-repeat遍历生成一个个slide块的时候，执行完成页面是空白的 手动在渲染之后更新一下，在控制器注入$ionicSlideBoxDelegate，然后渲染数据之后
          $timeout(function () {
            $ionicSlideBoxDelegate.$getByHandle("productdetails-slideboximgs").update();
            //上面这句就是实现无限循环的关键，绑定了滑动框，
            $ionicSlideBoxDelegate.$getByHandle("productdetails-slideboximgs").loop(true);
            /*            console.log($ionicSlideBoxDelegate.$getByHandle("slideboximgs").slidesCount());*/
          }, 100)
        }
      })
    }
    $scope.getGoodsInfo();

    $scope.getDefaultAddress = function () { //获取发货地址
      var params = {};
      AccountService.getDefaultAddress(CommonService.authParams(params)).success(function (data) {
        if (data.status == 1) {
          $rootScope.deliveryAddress = data.data.info;
        } else {
          CommonService.platformPrompt(data.info, 'close');
        }
      })
    }
    $scope.getDefaultAddress();

    //获取评论信息
    $scope.goodsCommentList = []
    $scope.page = 0;
    $scope.total = 1;
    $scope.getGoodsCommentList = function () {
      if (arguments != [] && arguments[0] == 0) {
        $scope.page = 0;
        $scope.goodsCommentList = [];
      }
      $scope.page++;
      var params = {
        p: $scope.page,//页码
        num: 1000,
        goods_id: $stateParams.id
      };
      GoodService.getGoodsCommentList(CommonService.authParams(params)).success(function (data) {
        console.log(data);
        if (data.status == 1) {
          angular.forEach(data.data.lists, function (item) {
            $scope.goodsCommentList.push(item);
          })
          $scope.total = data.data.pageInfo.totalPages;
          $ionicScrollDelegate.resize();//添加数据后页面不能及时滚动刷新造成卡顿
        } else {
          CommonService.platformPrompt(data.info, 'close');
        }
      }).finally(function () {
        $scope.$broadcast('scroll.refreshComplete');
        $scope.$broadcast('scroll.infiniteScrollComplete');
      })
    }
    $scope.getGoodsCommentList();

    $scope.addToCart = function () { //加入购物车
      var params = {
        goods_id: $stateParams.id
      };
      ShoppingCartService.addToCart(CommonService.authParams(params)).success(function (data) {
        if (data.status == 1) {
          $state.go("tab.shoppingcart");
        }
        CommonService.platformPrompt(data.info, 'close');
      })
    }

    $scope.collectGoods = function () { //收藏商品
      /*   $ionicTabsDelegate.$getByHandle('productdetails-tabs').selectedIndex();*/
      var params = {
        id: $stateParams.id
      };
      GoodService.collectGoods(CommonService.authParams(params)).success(function (data) {
        if (data.status == 1) {

        }
        CommonService.platformPrompt(data.info, 'close');
      })
    }

    $scope.deleteCollect = function () { //取消收藏商品
      var params = {
        id: $stateParams.id
      };
      GoodService.deleteCollect(CommonService.authParams(params)).success(function (data) {
        if (data.status == 1) {

        }
        CommonService.platformPrompt(data.info, 'close');
      })
    }


  })
  //购物车主界面
  .controller('ShoppingCartCtrl', function ($scope, $rootScope, $state, CommonService, ShoppingCartService) {
    $scope.shoppingcar = {
      isSelectAll: false,//是否全部选择
      showDelete: false,//删除按钮是否显示
      totalnum: 0,//总购买数量
      totalPrice: 0//总价格
    };
    $scope.getCartList = function () { //获取购物车商品
      var params = {};
      ShoppingCartService.getCartList(CommonService.authParams(params)).success(function (data) {
        console.log(data);
        if (data.status == 1) {
          $scope.isNotData = false;
          if (data.data.info.cartArr == null || data.data.info.cartArr.length == 0) {
            $scope.isNotData = true;
            return
          }
          $scope.shoppingcartdata = data.data.info;
          angular.forEach($scope.shoppingcartdata.cartArr, function (item, index) {
            $scope.shoppingcartdata.cartArr[index].checked = false;
            $scope.shoppingcartdata.cartArr[index].goods_qty = Number(item.goods_qty)
          })
        } else {
          CommonService.platformPrompt(data.info, 'close');
        }
      }).then(function () {
        // 监控数组是否变化，动态修改总价
        $scope.$watch("shoppingcartdata", function () {
          getTotal();
        }, true);
      })
    }
    $scope.getCartList();
    //修改购物车数量
    $scope.updateCart = function (num, id) {
      var params = {cart_id: id, goods_qty: num};
      ShoppingCartService.updateCart(CommonService.authParams(params)).success(function (data) {
        CommonService.platformPrompt(data.info, 'close');
      })
    }
    //添加数量
    $scope.addnum = function ($index, id) {
      $scope.shoppingcartdata.cartArr[$index].goods_qty++;
      $scope.updateCart($scope.shoppingcartdata.cartArr[$index].goods_qty, id)
    }
    // 减少数量
    $scope.minusnum = function ($index, id) {
      if ($scope.shoppingcartdata.cartArr[$index].goods_qty == 0)return;
      $scope.shoppingcartdata.cartArr[$index].goods_qty--;
      $scope.updateCart($scope.shoppingcartdata.cartArr[$index].goods_qty, id)
    }
    // 计算总价
    var getTotal = function () {
      $scope.shoppingcar.totalPrice = 0;
      $scope.shoppingcar.totalnum = 0;
      angular.forEach($scope.shoppingcartdata.cartArr, function (item, index) {
        if (item.checked) {//选中的购物商品
          $scope.shoppingcar.totalPrice += item.goods_qty * item.price;//总价格
          $scope.shoppingcar.totalnum += Number(item.goods_qty);//总数量
        }
      })
      return $scope.shoppingcar.totalPrice;
    }
    //全部选择
    $scope.selectAll = function (isSelectAll) {
      angular.forEach($scope.shoppingcartdata.cartArr, function (item, index) {
        item.checked = isSelectAll;
      })
    }
    //删除购物车
    $scope.deleteShoppingCart = function (index, id) {
      $scope.shoppingcartdata.cartArr.splice(index, 1);
      var params = {cart_id: id};
      ShoppingCartService.deleteCart(CommonService.authParams(params)).success(function (data) {
        CommonService.platformPrompt(data.info, 'close');
      })
    }
    //结算购物车
    $scope.closeAnAccount = function () {
      $scope.shoppingcartdata.goodsQty = $scope.shoppingcar.totalnum;//总数量
      $scope.shoppingcartdata.goodsAmount = $scope.shoppingcar.totalPrice.toFixed(2);//总价格
      $state.go("revieworder", {item: JSON.stringify($scope.shoppingcartdata)});
    }
  })

  //提交订单核对订单
  .controller('ReviewOrderCtrl', function ($scope, $rootScope, $state, $stateParams, CommonService, OrderService, AccountService) {
    $scope.reviewOrder = JSON.parse($stateParams.item);
    console.log($scope.reviewOrder);
    $scope.getDefaultAddress = function () { //获取发货地址
      var params = {};
      AccountService.getDefaultAddress(CommonService.authParams(params)).success(function (data) {
        if (data.status == 1) {
          console.log(data);
          $rootScope.deliveryAddress = data.data.info;
        } else {
          CommonService.platformPrompt(data.info, 'close');
        }
      })
    }
    $scope.getDefaultAddress();

    $scope.submitOrder = function () {//提交订单
      var cart_id = [];
      angular.forEach($scope.reviewOrder.cartArr, function (item, index) {
        if (item.checked) {
          cart_id.push(item.id)
        }
      })
      var params = {cart_id: cart_id.join(","), address_id: $rootScope.deliveryAddress.id};
      OrderService.addOrder(CommonService.authParams(params)).success(function (data) {
        console.log(data);
        if (data.status == 1) {
          $state.go("myorder");
        } else {
          CommonService.platformPrompt(data.info, 'close');
        }
      })

    }
  })

  //我的订单
  .controller('MyOrderCtrl', function ($scope, $rootScope, CommonService, WeiXinService, AliPayService, OrderService, $ionicSlideBoxDelegate, $ionicScrollDelegate) {
    CommonService.customModal($scope, 'templates/modal/paymodal.html');
    $scope.tabIndex = 0;//当前tabs页


    $scope.pay = { //支付相关
      choice: "A"//选择支付方式默认微信
    }
    //左右滑动列表
    $scope.slideChanged = function (index) {
      $scope.tabIndex = index;
      $scope.pagecreated = 0;
      $scope.pagepayed = 0;
      $scope.pagecomplete = 0;
      $scope.pagerightsin = 0;
      $scope.createdList = [];
      $scope.payedList = [];
      $scope.completeList = [];
      $scope.rightsinList = [];

      $scope.getOrdersList(); //获取订单数据

    };
    //点击选项卡
    $scope.selectedTab = function (index) {
      $scope.tabIndex = index;
      //滑动的索引和速度
      $ionicSlideBoxDelegate.$getByHandle("slidebox-myorderlist").slide(index)
    }

    //未支付订单
    $scope.pagecreated = 0;
    $scope.totalcreated = 1;
    $scope.createdList = [];
    //已支付订单
    $scope.pagepayed = 0;
    $scope.totalpayed = 1;
    $scope.payedList = [];
    //已签收订单数据
    $scope.pagecomplete = 0;
    $scope.totalcomplete = 1;
    $scope.completeList = [];
    //退单订单数据
    $scope.pagerightsin = 0;
    $scope.totalrightsin = 1;
    $scope.rightsinList = [];
    $scope.getOrdersList = function () { //获取订单数据
      if (arguments != [] && arguments[0] == 0) {
        if ($scope.tabIndex == 0) {  //未支付订单数据
          $scope.pagecreated = 0;
          $scope.createdList = [];
        }
        if ($scope.tabIndex == 1) {  //已支付订单数据
          $scope.pagepayed = 0;
          $scope.payedList = [];
        }
        if ($scope.tabIndex == 2) {  //已签收订单数据
          $scope.pagecomplete = 0;
          $scope.completeList = [];
        }
        if ($scope.tabIndex == 3) {  //退单订单数据
          $scope.pagerightsin = 0;
          $scope.rightsinList = [];
        }
      }

      if ($scope.tabIndex == 0 || $scope.pagecreated == 0) {  //未支付订单数据
        $scope.pagecreated++;
      }
      if ($scope.tabIndex == 1 || $scope.pagepayed == 0) {  //已支付订单数据
        $scope.pagepayed++;
      }
      if ($scope.tabIndex == 2 || $scope.pagecomplete == 0) {  //已签收订单数据
        $scope.pagecomplete++;
      }
      if ($scope.tabIndex == 3 || $scope.pagerightsin == 0) {  //退单订单数据
        $scope.pagerightsin++;
      }
      $scope.params = {
        p: $scope.tabIndex == 0 ? $scope.pagecreated : ($scope.tabIndex == 1 ? $scope.pagepayed : ($scope.tabIndex == 2 ? $scope.pagecomplete : $scope.pagerightsin)),//页码
        num: 10,
        order_status: $scope.tabIndex == 0 ? "created" : ($scope.tabIndex == 1 ? "payed" : ($scope.tabIndex == 2 ? "complete" : "rights_in"))
      }
      console.log($scope.params);
      OrderService.myOrder(CommonService.authParams($scope.params)).success(function (data) {
        console.log(data);
        if (data.status == 1) {
          angular.forEach(data.data.lists, function (item) {
            if ($scope.tabIndex == 0) {  //未支付订单数据
              $scope.createdList.push(item);
            }
            if ($scope.tabIndex == 1) {  //已支付订单数据
              $scope.payedList.push(item);
            }
            if ($scope.tabIndex == 2) {  //已签收订单数据
              $scope.completeList.push(item);
            }
            if ($scope.tabIndex == 3) {  //退单订单数据
              $scope.rightsinList.push(item);
            }
          })
          if ($scope.tabIndex == 0) { //未支付订单数据
            $scope.totalcreated = data.data.pageInfo.totalPages;
          }
          if ($scope.tabIndex == 1) {  //已支付订单数据
            $scope.totalpayed = data.data.pageInfo.totalPages;
          }
          if ($scope.tabIndex == 2) {  //已签收订单数据
            $scope.totalcomplete = data.data.pageInfo.totalPages;
          }
          if ($scope.tabIndex == 3) {  //退单订单数据
            $scope.totalrightsin = data.data.pageInfo.totalPages;
          }
          $ionicScrollDelegate.resize();//添加数据后页面不能及时滚动刷新造成卡顿
        } else {
          CommonService.platformPrompt(data.info, 'close');
        }
      }).finally(function () {
        $scope.$broadcast('scroll.refreshComplete');
        $scope.$broadcast('scroll.infiniteScrollComplete');
      })
    }
    $scope.getOrdersList();
    //打开支付选项modal
    $scope.openPayModal = function (orderno) {
      $scope.modal.show();
      $scope.orderno = orderno;
    }
    //确认支付
    $scope.affirmPay = function () {
      var params = {order_no: $scope.orderno};
      if ($scope.pay.choice == "A") {//微信支付
        WeiXinService.getweixinPayData(CommonService.authParams(params)).success(function (data) {
          console.log(data);
          if (data.status == 1) {
            WeiXinService.weixinPay(data.data.info);
            $scope.modal.hide();
          } else {
            CommonService.platformPrompt(data.info, 'close');
          }
        })
      } else if ($scope.pay.choice == "B") {//支付宝支付
        AliPayService.orderAlipayPay(CommonService.authParams(params)).success(function (data) {
          console.log(data);
          if (data.status == 1) {
            AliPayService.aliPay(data.data.info);
            $scope.modal.hide();
          } else {
            CommonService.platformPrompt(data.info, 'close');
          }

        })
      }
    }

    //取消订单
    $scope.cancelOrder = function (orderno) {
      var params = {order_no: orderno};
      OrderService.cancelOrder(CommonService.authParams(params)).success(function (data) {
        console.log(data);
        CommonService.platformPrompt(data.info, 'close');
      })
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
        $scope.userinfo = data.data.info;
        localStorage.setItem("userinfo", data.data.info);
      }
    })
    //退出登录清除缓存
    $scope.logout = function () {
      var params = {};
      AccountService.logout(CommonService.authParams(params)).success(function (data) {
        if (data.status == 1) {
          localStorage.removeItem("login_name");
          localStorage.removeItem("mid");
          localStorage.removeItem("token");
          $state.go("login")
        } else {
          CommonService.platformPrompt(data.info, 'close');
        }

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
          if (data.status == 1) {
            $scope.verify = data.data.info.verify;
          } else {
            CommonService.platformPrompt(data.info, 'close');
          }

        })
      }
    }
    $scope.registerSubmit = function () {
      if ($scope.verify != $scope.user.verify) {
        CommonService.platformPrompt("输入验证码不正确", 'close');
        return;
      }
      if (ionic.Platform.isWebView()) { //获取设备UUID
        var uuid = $cordovaDevice.getUUID();
      } else {
        var uuid = "43a561a7658ae5b1";
      }
      AccountService.register({
        mobile: $scope.user.mobile,
        password: EncodingService.md5($scope.user.password),
        code: $scope.user.code,
        verify: $scope.user.verify,
        udid: uuid
      }).success(function (data) {
        console.log(data);
        if (data.status == 1) {
          $state.go("login");
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
          if (data.status == 1) {
            $scope.verify = data.data.info.verify;
          } else {
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
      if ($scope.verify != $scope.user.verify) {
        CommonService.platformPrompt("输入验证码不正确", 'close');
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
            $scope.verify = data.data.info.verify;
          } else {
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
      if ($scope.verify != $scope.user.verify) {
        CommonService.platformPrompt("输入验证码不正确", 'close');
        return;
      }
      $scope.params = {
        newPwd: EncodingService.md5($scope.user.newPwd),
        reNewPwd: EncodingService.md5($scope.user.reNewPwd),
        verify: $scope.user.verify
      }

      AccountService.editPassword(CommonService.authParams($scope.params)).success(function (data) {
        if (data.status == 1) {
          $state.go("login")
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
  .controller('AddressManageCtrl', function ($scope, $rootScope, $state, $ionicHistory, CommonService, AccountService) {
    $scope.getAddressList = function () {
      var params = {};
      AccountService.getAddressList(CommonService.authParams(params)).success(function (data) {
        console.log(data);
        if (data.status == 1) {
          $rootScope.addresslist = data.data.lists;
        }
      }).error(function () {
        CommonService.platformPrompt("获取地址管理列表失败", 'close');
      })
    }
    $scope.getAddressList()
    //选中地址编辑地址
    $scope.selectAddress = function (index, item) {
      //选中第几个数组
      $scope.selectindex = index;
      $rootScope.deliveryAddress = item;
      $ionicHistory.goBack();
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
    $scope.imgsPicAddr = [];//图片信息数组
    $scope.imageList = [];  //上传图片数组集合
    $scope.uploadActionSheet = function () {
      CommonService.uploadActionSheet($scope, "upload", true);
    }
    //获取省市县
    $scope.getAddressPCCList = function (adcode) {
      if (isNaN(adcode) && adcode) {
        $scope.addresspcd = $scope.userinfo.province + $scope.userinfo.city + $scope.userinfo.area;
        $scope.userinfo.address = adcode;
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
          $scope.userinfo.province = data.districts[0].name;
        } else if ($scope.level == "city") {
          $scope.userinfo.city = data.districts[0].name;
        } else if ($scope.level == "district") {
          $scope.userinfo.area = data.districts[0].name;
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

    $scope.userinfo.head_img = $scope.imgsPicAddr[0];//头像图片存储返回的url
    //完善资料保存
    $scope.organizingdataSave = function () {
      var date = $scope.userinfo.birthday;
      $scope.userinfo.birthday = (new Date(date.setDate(date.getDate() + 1))).toISOString().slice(0, 10);
      AccountService.memberInfo(CommonService.authParams($scope.userinfo)).success(function (data) {
        if (data.status == 1) {
          $state.go("tab.account")
        }
        CommonService.platformPrompt(data.info, 'close');
      })
    }
  })
  //我的钱包页面
  .controller('MyWalletCtrl', function ($scope, $rootScope, $state, CommonService, AccountService) {
    //我的余额
    var params = {};
    AccountService.getBalance(CommonService.authParams(params)).success(function (data) {
      if (data.status == 1) {
        $scope.balance = data.data.info.balance;
      } else {
        CommonService.platformPrompt(data.info, 'close');
      }

    })
    //提现
    $scope.mywalletSubmit = function () {

    }
  })

  //我的收入
  .controller('MyIncomeCtrl', function ($scope, $rootScope, CommonService, AccountService, $ionicSlideBoxDelegate) {
    $scope.tabIndex = 0;//当前tabs页
    $scope.slideChanged = function (index) {
      $scope.tabIndex = index;
    };

    $scope.selectedTab = function (index) {
      $scope.tabIndex = index;
      //滑动的索引和速度
      $ionicSlideBoxDelegate.$getByHandle("slidebox-myincomelist").slide(index)
    }
    //我的收入
    $scope.myincomeList = []
    $scope.pageincome = 0;
    $scope.totalincome = 1;
    $scope.getIncome = function () {
      if (arguments != [] && arguments[0] == 0) {
        $scope.pageincome = 0;
        $scope.myincomeList = [];
      }
      $scope.pageincome++;
      $scope.params = {
        p: $scope.pageincome,//页码
        num: 10
      }
      AccountService.getIncome(CommonService.authParams($scope.params)).success(function (data) {
        console.log(data);
        if (data.status == 1) {
          $scope.isNotData = false;
          if (data.data.list == null || data.data.list.length == 0) {
            $scope.isNotData = true;
            return
          }
          angular.forEach(data.data.list, function (item) {
            $scope.myincomeList.push(item);
          })
          $scope.totalincome = data.data.pageInfo.totalPages;
          $ionicScrollDelegate.resize();//添加数据后页面不能及时滚动刷新造成卡顿
        } else {
          CommonService.platformPrompt(data.info, 'close');
        }
      }).finally(function () {
        $scope.$broadcast('scroll.refreshComplete');
        $scope.$broadcast('scroll.infiniteScrollComplete');
      })
    }
    $scope.getIncome();

    //我的提现
    $scope.withdrawList = []
    $scope.pagewithdraw = 0;
    $scope.totalwithdraw = 1;
    $scope.getWithdrawLog = function () {
      if (arguments != [] && arguments[0] == 0) {
        $scope.pagewithdraw = 0;
        $scope.withdrawList = [];
      }
      $scope.pagewithdraw++;
      $scope.params = {
        p: $scope.pagewithdraw,//页码
        num: 10
      }
      AccountService.getWithdrawLog(CommonService.authParams($scope.params)).success(function (data) {
        console.log(data);
        if (data.status == 1) {
          $scope.isNotData = false;
          if (data.data.list == null || data.data.list.length == 0) {
            $scope.isNotData = true;
            return
          }
          angular.forEach(data.data.list, function (item) {
            $scope.withdrawList.push(item);
          })
          $scope.totalwithdraw = data.data.pageInfo.totalPages;
          $ionicScrollDelegate.resize();//添加数据后页面不能及时滚动刷新造成卡顿
        } else {
          CommonService.platformPrompt(data.info, 'close');
        }
      }).finally(function () {
        $scope.$broadcast('scroll.refreshComplete');
        $scope.$broadcast('scroll.infiniteScrollComplete');
      })
    }
    $scope.getWithdrawLog();
  })

  //我的优惠卷页面
  .controller('MyCouponCtrl', function ($scope, CommonService, AccountService, $ionicSlideBoxDelegate) {
    //失效卷标示
    $scope.isfailureVolumeflg = false;
    //失效卷
    $scope.failureVolume = function () {
      $scope.isfailureVolumeflg = $scope.isfailureVolumeflg ? false : true;
      $scope.getMyCoupon();
    }
    //我的收入
    $scope.myCouponList = []
    $scope.page = 0;
    $scope.total = 1;
    $scope.getMyCoupon = function () {
      if (arguments != [] && arguments[0] == 0) {
        $scope.page = 0;
        $scope.myCouponList = [];
      }
      $scope.page++;
      $scope.params = {
        p: $scope.page,//页码
        num: 10,
        type: $scope.isfailureVolumeflg ? 0 : 1
      }
      AccountService.getMyCoupons(CommonService.authParams($scope.params)).success(function (data) {
        console.log(data);
        if (data.status == 1) {
          $scope.isNotData = false;
          if (data.data.list == null || data.data.list.length == 0) {
            $scope.isNotData = true;
            return
          }
          angular.forEach(data.data.list, function (item) {
            $scope.myCouponList.push(item);
          })
          $scope.total = data.data.pageInfo.totalPages;
          $ionicScrollDelegate.resize();//添加数据后页面不能及时滚动刷新造成卡顿
        } else {
          CommonService.platformPrompt(data.info, 'close');
        }
      }).finally(function () {
        $scope.$broadcast('scroll.refreshComplete');
        $scope.$broadcast('scroll.infiniteScrollComplete');
      })
    }
    $scope.getMyCoupon()
  })
  //邀请记录页面
  .controller('InvitationListCtrl', function ($scope, CommonService, AccountService, $ionicSlideBoxDelegate) {
    //我的收入
    $scope.invitationList = []
    $scope.page = 0;
    $scope.total = 1;
    $scope.getInvitation = function () {
      if (arguments != [] && arguments[0] == 0) {
        $scope.page = 0;
        $scope.invitationList = [];
      }
      $scope.page++;
      $scope.params = {
        p: $scope.page,//页码
        num: 10
      }
      AccountService.getInviteLog(CommonService.authParams($scope.params)).success(function (data) {
        console.log(data);
        if (data.status == 1) {
          $scope.isNotData = false;
          if (data.data.list == null || data.data.list.length == 0) {
            $scope.isNotData = true;
            return
          }
          angular.forEach(data.data.list, function (item) {
            $scope.invitationList.push(item);
          })
          $scope.total = data.data.pageInfo.totalPages;
          $ionicScrollDelegate.resize();//添加数据后页面不能及时滚动刷新造成卡顿
        } else {
          CommonService.platformPrompt(data.info, 'close');
        }
      }).finally(function () {
        $scope.$broadcast('scroll.refreshComplete');
        $scope.$broadcast('scroll.infiniteScrollComplete');
      })
    }
    $scope.getInvitation();
  })
  //我的积分页面
  .controller('MyNtegralCtrl', function ($scope, CommonService, AccountService, $ionicSlideBoxDelegate) {
    //我的收入
    $scope.myNtegralList = []
    $scope.page = 0;
    $scope.total = 1;
    $scope.getMyNtegral = function () {
      if (arguments != [] && arguments[0] == 0) {
        $scope.page = 0;
        $scope.myNtegralList = [];
      }
      $scope.page++;
      $scope.params = {
        p: $scope.page,//页码
        num: 10
      }
      AccountService.getPointLog(CommonService.authParams($scope.params)).success(function (data) {
        console.log(data);
        if (data.status == 1) {
          $scope.isNotData = false;
          if (data.data.list == null || data.data.list.length == 0) {
            $scope.isNotData = true;
            return
          }
          $scope.total_point = data.data.total_point;//当前积分
          angular.forEach(data.data.list, function (item) {
            $scope.myNtegralList.push(item);
          })
          $scope.total = data.data.pageInfo.totalPages;
          $ionicScrollDelegate.resize();//添加数据后页面不能及时滚动刷新造成卡顿
        } else {
          CommonService.platformPrompt(data.info, 'close');
        }
      }).finally(function () {
        $scope.$broadcast('scroll.refreshComplete');
        $scope.$broadcast('scroll.infiniteScrollComplete');
      })
    }
    $scope.getMyNtegral();
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
  .controller('SignInCtrl', function ($scope, CommonService, SignInService) {
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
    $scope.mouthfirstdayweek = "7123456".charAt(new Date($scope.year, parseInt($scope.mouth - 1, 10), 1).getDay());
    console.log($scope.mouthfirstdayweek);
    //获取当月总共有多少天
    $scope.getDaysInOneMonth = function (year, month) {
      month = parseInt(month, 10);
      var d = new Date(year, month, 0);
      $scope.monthdays = d.getDate();
      $scope.monthdaysarry = [];
      for (var i = 1; i <= $scope.monthdays; i++) {
        $scope.monthdaysarry.push({days: i, isSignIn: 0})
      }

    }
    $scope.getDaysInOneMonth($scope.year, $scope.mouth);

    //获取签到列表
    $scope.signInList = function () {
      var params = {}
      SignInService.signInList(CommonService.authParams(params)).success(function (data) {
        console.log(data);
        if (data.status == 1) {
          $scope.signInInfo = data.data.info;
          $scope.signInLists = data.data.lists;
        } else {
          CommonService.platformPrompt(data.info, 'close');
        }
      })
    }

    $scope.signInList();

    //获取签到记录
    $scope.getSignInLog = function () {
      var params = {
        p: 1,//页码
        num: 31
      }
      SignInService.getSignInLog(CommonService.authParams(params)).success(function (data) {
        console.log(data);
        if (data.status == 1) {
          $scope.signInLogs = data.data.lists;
        } else {
          CommonService.platformPrompt(data.info, 'close');
        }
      }).then(function () {
        angular.forEach($scope.signInLogs, function (item, index) {
          angular.forEach($scope.monthdaysarry, function (items, indexs) {
            if (new Date(item.time * 1000).getDate() == items.days) {
              $scope.monthdaysarry[indexs].isSignIn = 1;
            }
          })


        })
      })
    }

    $scope.getSignInLog();

    //签到
    $scope.signIn = function () {
      var params = {}
      SignInService.signIn(CommonService.authParams(params)).success(function (data) {
        console.log(data);
        if (data.status == 1) {
          $scope.signInInfo.signIn++;
          $scope.signInInfo.isSignIn == 1;
        }
        CommonService.platformPrompt(data.info, 'close');
      })
    }

  })
  //问卷调查页面
  .controller('QuestionnaireCtrl', function ($scope, CommonService, QuestionService) {
    $scope.choice = [];//选择变量
    //获取问卷调查
    var params = {question_id: 1}
    QuestionService.getQuestion(CommonService.authParams(params)).success(function (data) {
      console.log(data);
      if (data.status == 1) {
        $scope.questionList = data.data.lists;
      } else {
        CommonService.platformPrompt(data.info, 'close');
      }
    })

    //提交问卷调查
    $scope.addAnswerSubmit = function () {
      console.log($scope.choice);
      var answers = [];
      angular.forEach($scope.choice, function (item, index) {
        var json = {};
        angular.forEach($scope.questionList, function (items) {
          if (items.id == index) {
            json.id = index;
            json.title = items.name;
            json.answer = items.answer[item];
          }
        })


        answers.push(json)
      })

      var params = CommonService.authParams({question_id: 1});
      params.answer = answers;
      console.log(params);
      QuestionService.addAnswer(params).success(function (data) {
        console.log(data);
        CommonService.platformPrompt(data.info, 'close');
      })
    }


  })

  //评价
  .controller('EvaluateCtrl', function ($scope, CommonService, GoodService, OrderService, $ionicHistory, $stateParams) {
    $scope.evaluateinfo = {};//评论信息
    $scope.imgsPicAddr = [];//图片信息数组
    $scope.imageList = [];  //上传图片数组集合
    $scope.uploadActionSheet = function () {
      CommonService.uploadActionSheet($scope, "upload", false);
    }

    var params = {order_no: $stateParams.orderno}
    OrderService.orderInfo(CommonService.authParams(params)).success(function (data) {
      console.log(data);
      if (data.status == 1) {
        $scope.evaluate = data.data.lists[0];
      } else {
        CommonService.platformPrompt(data.info, 'close');
      }

    })
    //点击等级星号
    $scope.evaluatestar = function (stars) {
      $scope.evaluateinfo.star = stars;
    };
    //提交评论
    $scope.submitevalute = function () {
      var params = {
        goods_id: $scope.evaluate.goods_id,
        content: $scope.evaluateinfo.Memo,
        score: $scope.evaluateinfo.star,
        image: $scope.imgsPicAddr
      }
      GoodService.addGoodsComment(CommonService.authParams(params)).success(function (data) {
        console.log(data);
        if (data.status == 1) {
          $ionicHistory.goBack();
        }
        CommonService.platformPrompt(data.info, 'close');
      })
    }

  })

  //上传头像
  .controller('UploadHeadCtrl', function ($scope, CommonService) {


  })
