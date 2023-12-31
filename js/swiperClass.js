class fullSwipter {
  constructor(props) {
    this.state = {
      id: props.id,
      duration: props.duration,
      isShowPagination: props.isShowPagination,

      index: 2,
      isLock: false,
      translateX: 0,
      defaultLength: null,
      itemWidth: null,
      _swiperList: null,
    };

    this._$ = selector => document.querySelector(selector);
    this._createElement = type => document.createElement(type);
    this._setContent = (elem, content) => elem.innerHTML = content;
    this._appendChild = (container, node) => container.append(node);
    this.addHTML()
  }

  addHTML() {
    let $ = this._$;
    let idContatiner = $(`#${this.state.id}`);
    // 初始化
    this.state._swiperList = idContatiner.querySelector('#swiper-list');
    let swiperItem = this.state._swiperList.querySelectorAll('.teachers-item')
    this.state.defaultLength = swiperItem.length;

    let swiperPagination = this._createElement('div');
    let swiperPaginationItem = this._createElement('span');
    let swiperArrowL = this._createElement('a');
    let swiperArrowR = this._createElement('a');



    if (this.state.isShowPagination) {
      swiperPagination.setAttribute('class', 'swiper-pagination')
      swiperPaginationItem.setAttribute('class', 'swiper-pagination-switch')
      // 动态加入小指示圆点
      for (let i = 0; i < this.state.defaultLength; i++) {
        let tran = swiperPaginationItem.cloneNode()
        if (i === 0) {
          tran.setAttribute('class', 'swiper-pagination-switch active')
        } else {
          tran.setAttribute('class', 'swiper-pagination-switch')
        }
        this._appendChild(swiperPagination, tran)
        this._appendChild(idContatiner, swiperPagination)
      }
    }

    this._appendChild(idContatiner, swiperArrowL)
    this._appendChild(idContatiner, swiperArrowR)

    let prev = document.getElementsByClassName('teachers-prev')[0]
    let next = document.getElementsByClassName('teachers-next')[0]
    prev.addEventListener('click', this.swiperPrev.bind(this))
    next.addEventListener('click', this.swiperNext.bind(this))

    let swiperSwitch = this.state._swiperList.parentNode.querySelectorAll('.swiper-pagination-switch');
    for (let i = 0; i < swiperSwitch.length; i++) {
      swiperSwitch[i].setAttribute('data-index', i);
      swiperSwitch[i].addEventListener('click', this.swiperSwitch.bind(this));
    }

    // 非全屏组件，不用根据尺寸进行变化
    // window.addEvetListener('resize', this.swiperReset.bind(this))

    this.clone()
  }

  animateTo(begin, end, duration, changeCallback, finishCallback) {
    let startTime = Date.now();
    let that = this
    requestAnimationFrame(function update() {
      let dataNow = Date.now();
      let time = dataNow - startTime;
      let value = that.linear(time, begin, end, duration);
      typeof changeCallback === 'function' && changeCallback(value)
      if (startTime + duration > dataNow) {
        requestAnimationFrame(update)
      } else {
        typeof finishCallback === 'function' && finishCallback(end)
      }
    })
  }

  linear(time, begin, end, duration) {
    return (end - begin) * time / duration + begin
  }

  clone() {
    let swiperItem = this.state._swiperList.querySelectorAll('.teachers-item');
    let firstItem1 = swiperItem[0].cloneNode('deep');
    let firstItem2 = swiperItem[1].cloneNode('deep');
    let firstItem3 = swiperItem[2].cloneNode('deep');
    let lastItem1 = swiperItem[swiperItem.length - 1].cloneNode('deep');
    let lastItem2 = swiperItem[swiperItem.length - 2].cloneNode('deep');
    let lastItem3 = swiperItem[swiperItem.length - 3].cloneNode('deep');

    let swiperList = this.state._swiperList
    let index = this.state.index;
    let swiperItemWidth = swiperList.children[1].offsetLeft - swiperList.children[0].offsetLeft;


    this.state.itemWidth = swiperItemWidth;
    this.state.translateX = - (swiperItemWidth + swiperItemWidth * index);

    swiperList.append(firstItem1, firstItem2, firstItem3)
    swiperList.prepend(lastItem3, lastItem2, lastItem1)

    this.goIndex(index)
  }
  goIndex(index) {
    let swiperDuration = this.state.duration;
    let swiperItemWidth = this.state.itemWidth;
    let beginTranslateX = this.state.translateX;

    let endTranslateX = - (swiperItemWidth + swiperItemWidth * index)
    let swiperList = this.state._swiperList

    let isLock = this.state.isLock;

    if (isLock) return

    this.state.isLock = true

    let that = this;
    this.animateTo(beginTranslateX, endTranslateX, swiperDuration, function (value) {
      swiperList.style.transform = `translateX(${value}px)`;
    }, function (value) {
      let swiperLength = that.state.defaultLength;
      if (index === -1) {
        index = swiperLength - 1;
        value = - (swiperItemWidth + swiperItemWidth * index);
      }
      if (index === swiperLength) {
        index = 0;
        value = - (swiperItemWidth + swiperItemWidth * index);
      }

      swiperList.style.transform = `translateX(${value}px)`
      that.state.index = index;
      that.state.translateX = value;

      that.state.isLock = false

      that.state.isShowPagination && that.hightlight(index)

    })
  }
  swiperPrev() {
    let index = this.state.index;
    this.goIndex(index - 1);
  }
  swiperNext() {
    let index = this.state.index;
    this.goIndex(index + 1);
  }
  swiperSwitch(e) {
    let index = e.target.dataset.index;
    index = Number(index)
    this.goIndex(index)
  }

  hightlight(index) {
    let swiperItem = this.state._swiperList.parentNode.querySelectorAll('.swiper-pagination-switch');
    for (let i = 0; i < swiperItem.length; i++) {
      swiperItem[i].className = 'swiper-pagination-switch';
    }
    swiperItem[index].className = 'swiper-pagination-switch active';
  }
  swiperReset() {
    console.log('触发');
    let swiperList = this.state._swiperList
    // let swiperItemWidth = swiperList.offsetWidth;
    let index = this.state.index;

    let translateX = - (swiperItemWidth + swiperItemWidth * index);
    this.state.itemWidth = swiperItemWidth;
    this.state.translateX = translateX;
    swiperList.style.transform = `translateX(${translateX}px)`;
  }
}