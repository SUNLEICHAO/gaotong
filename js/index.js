const PAGE = {
  data: {
    navigatorBarClassArr: ['introduction-section', 'onlinecourses-section', 'teachers-section', 'products-section', 'about-section'],
    navigatorBarActiveClass: null,
    navigatorBarFixedOffset: 0,
    navigatorBarHeight: 0,
    // 顶部预留空间，解决直接定位到标题，充满压迫感
    topReservation: 20,
    isfixed: false,
    isPlay: false,
    isCloned: false,
    translateLeft: 0,
  },
  init: function () {
    // 初始化导航栏到顶部的距离以及导航栏的高度
    let navigatorList = document.getElementsByClassName('navigator-section')[0]
    this.data.navigatorBarFixedOffset = navigatorList.offsetTop
    this.data.navigatorBarHeight = navigatorList.offsetHeight

    this.bind()
  },
  bind: function () {
    // 滑动时导航栏的变化
    window.addEventListener('scroll', this.refreshNavigator)
    let navigatorList = document.getElementsByClassName('navigator-list')[0]
    this.onEventListener(navigatorList, 'click', 'navigator-item', this.scrollNav)


    // 目录的展开和折叠
    let catalogue = document.getElementsByClassName('onlinecourses-course__catalogue')[0]
    // 提前初始化高度，为写动画做好铺垫
    this.initHeight()
    this.onEventListener(catalogue, 'click', 'catalogue-chapter__title-arrow', this.collapseCatalogue)
    this.onEventListener(catalogue, 'click', 'catalogue-chapter__title-text', this.collapseCatalogue)

    // 点击课程，可以播放相关视频
    let sectionTitle = document.getElementsByClassName('catalogue-chapter__section-title')
    Array.from(sectionTitle).forEach(item => {
      item.addEventListener('click', this.coursePlay)
    })

    // 点击播放页面，播放视频
    let control = document.getElementsByClassName('onlinecourses-video')[0];
    control.addEventListener('click', this.handleControl)

    // 点击关闭视频播放页面
    let close = document.getElementsByClassName('onlinecourses-video__close')[0];
    close.addEventListener('click', this.handleClose)

    // 为prev和next绑定事件
    let prev = document.getElementsByClassName('teachers-prev')[0]
    let next = document.getElementsByClassName('teachers-next')[0]

    // #1 单点轮播图，初始化宽度
    // let teacherList = document.getElementsByClassName('teachers-list')[0]
    // let teacherWidth = teacherList.children[1].offsetLeft - teacherList.children[0].offsetLeft;
    // teacherList.style.width = teacherWidth * 4 + 'px';

    // #2 无限滚动轮播图
    this.addDom()
    prev.addEventListener('click', this.handleSlide)
    next.addEventListener('click', this.handleSlide)
  },
  onEventListener: function (parentNode, action, childClassName, callback) {
    parentNode.addEventListener(action, (e) => {
      if (e.target.className.indexOf(childClassName) !== -1) {
        callback(e)
      }
    })
  },
  debounce: function (handler, delay) {
    // 防抖
    let timer;
    return function () {
      let self = this, arg = arguments;
      clearTimeout(timer);
      timer = setTimeout(function () {
        handler.apply(self, arg)
      }, delay)
    }
  },
  throttle: function (handler, wait) {
    // 节流
    let lastTime = 0;
    return function () {
      let nowTime = new Date().getTime();
      if (nowTime - lastTime > wait) {
        handler.apply(this, arguments);
        lastTime = nowTime;
      }
    }
  },
  refreshNavigator: function () {
    // 滚动时，根据滚动位置自动fixed
    PAGE.fixedNav()
    // 高亮
    PAGE.lightNav()
  },
  fixedNav: function () {
    let offsetTop = document.documentElement.scrollTop;
    let isfixed = offsetTop > PAGE.data.navigatorBarFixedOffset
    if (isfixed !== PAGE.data.isfixed) {
      PAGE.data.isfixed = isfixed;
      let navigatorList = document.getElementsByClassName('navigator-section')[0]
      navigatorList.className = isfixed ? 'navigator-section fixed' : 'navigator-section';
    }
  },
  lightNav: function () {
    let offsetTop = document.documentElement.scrollTop;
    if (offsetTop < PAGE.data.navigatorBarFixedOffset - PAGE.data.navigatorBarHeight) return
    let overClasses = PAGE.data.navigatorBarClassArr.filter(e => {
      document.getElementsByClassName(e)[0].className = e
      return offsetTop >= document.getElementsByClassName(e)[0].offsetTop - PAGE.data.navigatorBarHeight - PAGE.data.topReservation;
    })
    let navigatorBarActiveClass = overClasses.length ? overClasses[overClasses.length - 1] : null;
    if (navigatorBarActiveClass !== PAGE.data.navigatorBarActiveClass) {
      PAGE.data.navigatorBarActiveClass = navigatorBarActiveClass;
      let list = document.getElementsByClassName('navigator-item');
      for (let i = 0; i < list.length; i++) {
        if (list[i].dataset.nav !== navigatorBarActiveClass) {
          list[i].className = 'navigator-item'
        } else {
          list[i].className = 'navigator-item active'
        }
      }
    }
  },
  scrollNav: function (e) {
    let tarClass = e.target.dataset.nav;
    let tarTop = document.getElementsByClassName(tarClass)[0].offsetTop - PAGE.data.navigatorBarHeight - PAGE.data.topReservation;
    window.scrollTo({
      top: tarTop,
      behavior: 'smooth'
    })
  },
  initHeight: function () {
    let chapters = document.getElementsByClassName('catalogue-chapter')
    for (let j = 0; j < chapters.length; j++) {
      let chapter = chapters[j]
      let childNodes = chapter.childNodes;
      let tarH = 0;
      for (let i = 0; i < childNodes.length; i++) {
        tarH += childNodes[i].nodeType === 1 ? 40 : 0;
      }
      chapter.style.height = tarH + 'px';
    }
  },
  collapseCatalogue: function (e) {
    // #1：js改变高度来实现
    //检查章节的calss有无“collapsed”，有的话取消，展开；没有的话加上，
    let chapter = e.target.parentNode.parentNode;
    if (chapter.className.indexOf('collapsed') !== -1) {
      chapter.className = 'catalogue-chapter'
      let childNodes = chapter.childNodes;
      let tarH = 0;
      for (let i = 0; i < childNodes.length; i++) {
        tarH += childNodes[i].nodeType === 1 ? 40 : 0;
      }
      chapter.style.height = tarH + 'px';
    } else {
      chapter.className = 'catalogue-chapter collapsed'
      e.target.parentNode.parentNode.style.height = 40 + 'px';
    }
  },
  coursePlay: function () {
    let tarTop = document.getElementsByClassName('onlinecourses-container')[0].offsetTop - PAGE.data.navigatorBarHeight
    // let tarTop = document.getElementsByClassName('onlinecourses-video')[0].offsetTop - PAGE.data.navigatorBarHeight;
    window.scrollTo({
      top: tarTop - 15,
      behavior: 'smooth'
    })

    // 传入true,使之开始播放
    PAGE.handleVideo(true)
  },
  handleControl: function () {
    // 问题,为什么只能用这种引用
    PAGE.handleVideo()
  },
  handleClose: function (e) {
    // 阻止冒泡
    e.stopPropagation();

    let video = document.getElementById('course-video');
    video.pause()
    video.style.display = 'none'
  },
  handleVideo: function (isPlay) {
    let video = document.getElementById('course-video');
    let control = document.getElementsByClassName('onlinecourses-video__control')[0];

    // 如果没有参数,toggle；如果有参数，执行该布尔值
    if (!arguments.length) {
      if (PAGE.data.isPlay) {
        video.pause()
        control.className = 'onlinecourses-video__control playing'
      } else {
        video.play()
        control.className = 'onlinecourses-video__control'
        video.style.display = 'block'
      }
      control.classList.toggle('playing')
      PAGE.data.isPlay = !PAGE.data.isPlay;
    } else {
      if (isPlay) {
        video.play()
        PAGE.data.isPlay = true;
        control.className = 'onlinecourses-video__control playing'
        video.style.display = 'block'
      } else {
        video.pause()
        PAGE.data.isPlay = false;
        control.className = 'onlinecourses-video__control'
      }
    }
  },
  addDom: function () {
    // 如果已被克隆，不再进行dom克隆
    if (PAGE.data.isCloned) return

    let teacherList = document.getElementsByClassName('teachers-list')[0]
    let singleWidth = teacherList.children[1].offsetLeft;
    let totalWidth = singleWidth * teacherList.children.length;
    let teacherListR = teacherList.cloneNode('deep')

    teacherListR.style.position = 'absolute'
    teacherListR.style.left = totalWidth + 'px'
    teacherListR.style.top = '0px'

    teacherList.parentNode.append(teacherListR)

    PAGE.data.isCloned = true;
  },
  handleSlide: function (e) {

    // 方式1：定时器
    // PAGE.handleSlideWay1(e)

    // 方式2：left + translateX
    PAGE.handleSlideWay2(e)

  },
  handleSlideWay1: function (e) {
    let teachersList = document.getElementsByClassName('teachers-list');
    let singleWidth = teachersList[0].children[1].offsetLeft;
    let totalWidth = singleWidth * teachersList[0].children.length;

    if (e.target.className === 'teachers-prev') {
      // step1:判断是否需要重置位置
      if (parseInt(teachersList[0].style.left || 0) >= 0) {
        Array.from(teachersList).forEach(ele => {
          ele.style.cssText += `left:${parseInt(ele.style.left || 0) - totalWidth}px;`
          ele.style.cssText += `transition-duration: 0s;`;
        })
      }

      // step2：切换上一个，动画过渡
      setTimeout(() => {
        Array.from(teachersList).forEach(ele => {
          ele.style.cssText += `left:${parseInt(ele.style.left || 0) + singleWidth}px;`
          ele.style.cssText += `transition-duration: .5s;`;
        })
      }, 0)
    } else if (e.target.className === 'teachers-next') {
      // step1和step2可以交换顺序。而实际上：先重置再切换，不容易卡顿；先切换，等500ms后重置时，如果快速点击“下一个”按钮将会出现卡顿
      // step1：判断是否需要重置位置
      if (parseInt(teachersList[1].style.left || 0) <= 0) {
        Array.from(teachersList).forEach(ele => {
          ele.style.cssText += `left:${parseInt(ele.style.left || 0) + totalWidth}px;`
          ele.style.cssText += `transition-duration: 0s;`;
        })
      }

      setTimeout(() => {
        // step2：切换下一个，动画过渡
        Array.from(teachersList).forEach(ele => {
          ele.style.cssText += `left:${parseInt(ele.style.left || 0) - singleWidth}px;`
          ele.style.cssText += `transition-duration: .5s;`;
        })
      }, 0)
    }

  },
  handleSlideWay2: function (e) {
    let teachersList = document.getElementsByClassName('teachers-list');
    let singleWidth = teachersList[0].children[1].offsetLeft;
    let totalWidth = singleWidth * teachersList[0].children.length;

    if (e.target.className === 'teachers-prev') {
      // # prev按钮
      // #step1：判断是否需要translateX
      if ((parseInt(teachersList[0].style.left || 0)) % 1190 === 0) {
        PAGE.data.translateLeft += -totalWidth;
        teachersList[0].style.cssText += `transform: translateX(${PAGE.data.translateLeft}px)`;
        teachersList[1].style.cssText += `transform: translateX(${PAGE.data.translateLeft}px)`;
      }

      // step2:移动元素
      Array.from(teachersList).forEach((ele, index) => {
        ele.style.left = parseInt(ele.style.left || 0) + singleWidth + 'px'
      })

    } else if (e.target.className === 'teachers-next') {
      // # next按钮
      // step1:判断是不是需要左移一个长度
      if ((parseInt(teachersList[1].style.left)) % 1190 === 0 && parseInt(teachersList[1].style.left) !== 1190) {
        PAGE.data.translateLeft += totalWidth;
        teachersList[0].style.cssText += `transform: translateX(${PAGE.data.translateLeft}px)`;
        teachersList[1].style.cssText += `transform: translateX(${PAGE.data.translateLeft}px)`;
      }

      // step2:移动元素
      Array.from(teachersList).forEach((ele, index) => {
        ele.style.cssText += `left:${parseInt(ele.style.left || 0) - singleWidth}px;`
      })
    }
  },
  // 暂时不用
  leftReset: function (arg) {
    let teachersList = document.getElementsByClassName('teachers-list');
    let singleWidth = teachersList[0].children[1].offsetLeft;
    let totalWidth = singleWidth * teachersList[0].children.length;

    // teachersList[0].offsetWidth
    // teachersList[0].style.cssText += `left:0px; transition-duration: 0s;`
    // teachersList[1].style.cssText += `left:${totalWidth}px; transition-duration: 0s;`
    // teachersList[0].offsetWidth
    // teachersList[0].style.cssText += `transition-duration: .5s;`
    // teachersList[1].style.cssText += `transition-duration: .5s;`

    // PAGE.data.translateLeft += totalWidth * arg;
    // teachersList[0].style.cssText += `transform: translateX(${PAGE.data.translateLeft}px)`;
    // teachersList[1].style.cssText += `transform: translateX(${PAGE.data.translateLeft}px)`;

  }
}
PAGE.init()