angular.module('starter.controllers', [])
  .config(function ($httpProvider) { //统一配置设置
    //服务注册到$httpProvider.interceptors中  用于接口授权
    // $httpProvider.interceptors.push('AuthInterceptor');
    /* $httpProvider.defaults.headers.common['Authorization'] = localStorage.getItem('token');*/
  })


  //APP首页面
  .controller('MainCtrl', function ($scope, $rootScope, CommonService, MainService, $ionicHistory) {
    //在首页中清除导航历史退栈
    $scope.$on('$ionicView.afterEnter', function () {
      $ionicHistory.clearHistory();
    })

    $scope.scrollWidth=window.innerWidth+'px';
    $scope.scrollContentWidth=document.querySelector("#main-scroll").clientWidth+'px';
  })
  //产品分类主页面
  .controller('ClassifyCtrl', function ($scope, $rootScope, CommonService, ClassifyService) {
    $scope.classifyinfo=['奶粉尿裤','洗护哺育','辅食营养','孕妈专区','家纺服饰','童装童鞋'];
    $scope.classifyindex=0;//选中产品分类标示
    CommonService.customModal($scope, 'templates/search.html');
    //获取产品分类
    $scope.getClassify=function () {
      ClassifyService.getClassify().success(function (data) {
      })
    }
    //点击产品分类获取产品分类详情
    $scope.getClassifyDetails=function (index) {
      $scope.classifyindex = index;
    }

    $scope.scrollHeight=(window.innerHeight-44-49)+'px';
    $scope.scrollContentHeight=document.querySelector("#classify-scroll-content").clientHeight+'px';
    })

  //购物车主界面
  .controller('ShoppingCartCtrl', function ($scope, $rootScope, CommonService) {

  })
  //登录页面
  .controller('LoginCtrl', function ($scope, $rootScope, $state, CommonService, AccountService) {
    $scope.user = {};//提前定义用户对象
    $scope.loginSubmit = function () {
      AccountService.login($scope.user).success(function (data) {
        CommonService.getStateName();   //跳转页面
      }).error(function () {
        CommonService.platformPrompt("登录失败!", 'close');
      })
    }
  })
  //我的设置页面
  .controller('AccountCtrl', function ($scope, $rootScope, CommonService, AccountService) {
    $scope.settings = {
      enableFriends: true
    };
  });
