const PAGE = {
  data: {
    navigatorBarClassArr: ['introduction-section', 'onlinecourses-section', 'teachers-section', 'products-section', 'about-section'],
    navigatorBarActiveClass: null,
    navigatorBarFixedOffset: 0,
    navigatorBarHeight: 0,
    isfixed: false,
    isPlay: false,
    isCloned: false,
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

    // 单点轮播图
    // 初始化宽度
    // let teacherList = document.getElementsByClassName('teachers-list')[0]
    // let teacherWidth = teacherList.children[1].offsetLeft - teacherList.children[0].offsetLeft;
    // teacherList.style.width = teacherWidth * 4 + 'px';
    // 为prev和next绑定事件
    let prev = document.getElementsByClassName('teachers-prev')[0]
    let next = document.getElementsByClassName('teachers-next')[0]
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
      return offsetTop >= document.getElementsByClassName(e)[0].offsetTop - PAGE.data.navigatorBarHeight;
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
    let tarTop = document.getElementsByClassName(tarClass)[0].offsetTop - PAGE.data.navigatorBarHeight
    window.scrollTo({
      top: tarTop - 15,
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
  handleSlide: function (e) {
    let teacherList = document.getElementsByClassName('teachers-list')[0]
    let totalWidth = (teacherList.children[1].offsetLeft) * teacherList.children.length;

    if (!PAGE.data.isCloned) {
      // 如果没有被克隆，进行dom克隆
      let teacherListR = teacherList.cloneNode('deep')
      teacherListR.style.position = 'absolute'
      teacherListR.style.left = totalWidth + 'px'
      teacherListR.style.top = '0px'

      let teacherListL = teacherListR.cloneNode('deep')
      teacherListL.style.position = 'absolute'
      teacherListL.style.left = -totalWidth + 'px'
      teacherListL.style.top = '0px'

      teacherList.parentNode.insertBefore(teacherListL, teacherList)
      teacherList.parentNode.append(teacherListR)

      PAGE.data.isCloned = true;

    }
    if (e.target.className === 'teachers-prev') {
      Array.from(document.getElementsByClassName('teachers-list')).forEach((ele, index) => {
        ele.style.left = parseInt(ele.style.left || 0) + 238 + 'px'
      })
      if (parseInt(document.getElementsByClassName('teachers-list')[0].style.left) >= 0) {
        Array.from(document.getElementsByClassName('teachers-list')).forEach((ele, index) => {
          ele.style.left = parseInt(ele.style.left || 0) - totalWidth + 'px'
        })
      }
    } else if (e.target.className === 'teachers-next') {
      Array.from(document.getElementsByClassName('teachers-list')).forEach((ele, index) => {
        ele.style.left = parseInt(ele.style.left || 0) - 238 + 'px'
      })
      // 移动完后,检查,是否该偏移到第二个
      if (parseInt(document.getElementsByClassName('teachers-list')[2].style.left) <= 0) {
        Array.from(document.getElementsByClassName('teachers-list')).forEach((ele, index) => {
          // ele.style.transition = 'none'
          ele.style.left = parseInt(ele.style.left || 0) + totalWidth + 'px'
          // setTimeout(() => {
          // ele.style.transition = 'left 3s'
          // }, 0)
        })
      }
    }
  }

}
PAGE.init()