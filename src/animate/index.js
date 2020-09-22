import React from 'react';
import './index.css';

// constant
const SHIFT_PERCENT = 100; // 滑动到两边的百分比

// default config
const SCROLL_THRESHOLD = 90; // 滑动判定是否有效的阈值
const COVER_CONTAINER_SCALE = 1.05; // 最上层容器的 scale
const COVER_CONTAINER_TOP = 15; // 最上层容器 距顶部距离
const ANIMATION_TIME = 0.43; // 动画时间

export default class CardScrollAnimate extends React.PureComponent {
  constructor(props) {
    super(props);

    this.SCROLL_THRESHOLD = props.scrollThreshold || SCROLL_THRESHOLD
    this.COVER_CONTAINER_SCALE = props.coverContainerScale || COVER_CONTAINER_SCALE
    this.COVER_CONTAINER_TOP = props.coverContainerTop || COVER_CONTAINER_TOP
    this.ANIMATION_TIME = props.animationTime || ANIMATION_TIME

    this.state = {
      containerAStyle: {
        transform: `scale(${this.COVER_CONTAINER_SCALE})`,
      },
      containerBStyle: {
        top: `${this.COVER_CONTAINER_TOP}px`,
      },
      childA: this.props.initialPairs[0],
      childB: this.props.initialPairs[1],
    };

    this.lock = false // 滑动锁
    this.uniqueId = String(Math.random()) // 每次手指滑动的唯一ID
    this.uniqueIdWhenTouchStart = null // 当 touchstart 触发时的唯一 ID
    this.validScrollKey = 'A' // 有效的滑动key （上层容器存在的情况下，禁止滑动下层容器）

    this.map = {
      A: {
        ref: this.refA,
        touchX: this.touchAX,
        setMoveX: (v) => {
          this.map.A.moveX = v;
        },
        moveX: this.moveAX,
        setTouchX: (v) => {
          this.map.A.touchX = v;
        },
        setContainerStyle: (v) => this.setState({ containerAStyle: v }),
        oppositeKey: 'B',
      },
      B: {
        ref: this.refB,
        touchX: this.touchBX,
        setMoveX: (v) => {
          this.map.B.moveX = v;
        },
        moveX: this.moveBX,
        setTouchX: (v) => {
          this.map.B.touchX = v;
        },
        setContainerStyle: (v) => this.setState({ containerBStyle: v }),
        oppositeKey: 'A',
      },
    };
  }

  // 上层滑动动画未结束时，禁止下层滑动触发
  isLock = () => this.lock
  updateLock = (flag) => this.lock = flag

  // 只有层级在最上层的容器允许被滑动
  isValidScrollKey = (key) => this.validScrollKey === key
  updateScrollKey = (key) => this.validScrollKey = key

  /**
   * 问题: 当上层的滑动生效后且动画并未执行完毕前，手指快速触发下层的滑动并始终不松开手指。
   *      待上层滑动动画结束后，此时手指滑动会发现，滑动生效。造成的后果是会给人滑动错乱的感觉。
   * 
   * 解决方案：
   *  1. 添加全局的唯一ID，当touchstart触发时，保存此刻的唯一ID。
   *  2. 当touchmove触发时，比对这两个ID是否一致，当一致时才判断滑动生效。
   */

  // 每次滑动结束后，更新 ’唯一ID‘
  updateUniqueId = () => {
    this.uniqueId = String(Math.random())
    // console.log('updateUniqueId', this.uniqueId)
  }
  // 当 touchstart 触发时，保存当前的 ’唯一ID‘
  saveUniqueIdWhenTouchStart = () => {
    this.uniqueIdWhenTouchStart = this.uniqueId
    // console.log('saveUniqueIdWhenTouchStart', this.uniqueIdWhenTouchStart)
  }
  // 当 touchmove 触发时，判定是否是有效滑动（依据当前的 ’唯一ID‘ 和 touchstart 触发时的 ’唯一ID‘ 进行对比）
  isMoveValid = () => {
    // console.log('isMoveValid', this.uniqueId, ' ::: ', this.uniqueIdWhenTouchStart)
    return this.uniqueId === this.uniqueIdWhenTouchStart
  }


  onTouchStart = (e, key) => {
    if (this.isLock() || !this.isValidScrollKey(key)) return
    this.saveUniqueIdWhenTouchStart()

    const x = e.touches[0].clientX;
    this.map[key].setTouchX(x);
  };

  onTouchMove = (e, key) => {
    if (this.isLock() || !this.isValidScrollKey(key) || !this.isMoveValid()) return

    const x = e.touches[0].clientX;
    const { touchX, setMoveX, setContainerStyle } = this.map[key];
    const _moveX = x - touchX;
    setMoveX(_moveX);
    setContainerStyle({
      transform: `translateX(${_moveX}px)`,
    });
  };

  onTransitionEnd = (key) => {
    const { ref, setContainerStyle } = this.map[key];
    const { zIndex } = getComputedStyle(ref);
    // 3. 当前容器置底
    setContainerStyle({
      zIndex: zIndex - 1,
      top: this.COVER_CONTAINER_TOP,
      transform: 'none',
      transition: 'top 0.1s ease',
    });
    this.renderNext(key);
  };

  onTouchEnd = (e, key) => {
    if (this.isLock() || !this.isValidScrollKey(key)) return
    this.updateLock(true)
    this.updateUniqueId()

    const { moveX, setMoveX } = this.map[key];

    setMoveX(0);
    const absMoveX = Math.abs(moveX);

    const turnLeft = Boolean(absMoveX === -moveX);
    const isValidScroll = Boolean(absMoveX > this.SCROLL_THRESHOLD);
    this.runAnimation(turnLeft, isValidScroll, key);
  };

  onToggleNext = (key) => {
    if (this.isLock() || !this.isValidScrollKey(key)) return
    this.updateLock(true)

    const turnLeft = Boolean(Math.random() > 0.5);
    this.runAnimation(turnLeft, true, key);
  };

  runAnimation = (turnLeft, isValidScroll, key) => {
    const { ref, setTouchX, setContainerStyle, oppositeKey } = this.map[key];

    setTouchX(0);
    setContainerStyle({
      top: 0,
      transform: `scale(${this.COVER_CONTAINER_SCALE}) translateX(${
        isValidScroll ? (turnLeft ? `-${SHIFT_PERCENT}%` : `${SHIFT_PERCENT}%`) : 0
      })`,
      transition: `all ${this.ANIMATION_TIME}s ease`,
    });

    if (!isValidScroll) {
      this.updateLock(false)
      return 
    }

    this.map[oppositeKey].setContainerStyle({
      top: 0,
      transform: `scale(${this.COVER_CONTAINER_SCALE})`,
      transition: `all ${this.ANIMATION_TIME}s ease`,
    });
    ref &&
      (ref.ontransitionend = () => {
        ref.ontransitionend = null;
        this.onTransitionEnd(key);
      });
  };

  createRef = (ref, key) => {
    this.map[key].ref = ref;
  };

  renderNext = (key) => {
    const next = this.props.getNext();
    const k = key === 'A' ? 'childA' : 'childB';
    this.setState({
      [k]: next,
    }, () => {
      this.updateUniqueId()
      this.updateScrollKey(this.map[key].oppositeKey)
      this.updateLock(false)
    });
  };

  render() {
    const { childA, containerAStyle, childB, containerBStyle } = this.state;

    return (
      <div className='card-scroll-animate-container'>
        {childA && (
          <div
            className='card-scroll-animate'
            ref={(r) => this.createRef(r, 'A')}
            style={containerAStyle}
            onTouchStart={(e) => this.onTouchStart(e, 'A')}
            onTouchMove={(e) => this.onTouchMove(e, 'A')}
            onTouchEnd={(e) => this.onTouchEnd(e, 'A')}
            onMouseDown={(e) => this.onTouchStart({touches: [{clientX: e.pageX}]}, 'A')}
            onMouseMove={(e) => this.onTouchMove({touches: [{clientX: e.pageX}]}, 'A')}
            onMouseUp={(e) => this.onTouchEnd(null, 'A')}
          >
            {React.cloneElement(childA, { onToggleNext: () => this.onToggleNext('A') })}
          </div>
        )}

        {childB && (
          <div
            className='card-scroll-animate'
            ref={(r) => this.createRef(r, 'B')}
            style={containerBStyle}
            onTouchStart={(e) => this.onTouchStart(e, 'B')}
            onTouchMove={(e) => this.onTouchMove(e, 'B')}
            onTouchEnd={(e) => this.onTouchEnd(e, 'B')}
            onMouseDown={(e) => this.onTouchStart({touches: [{clientX: e.pageX}]}, 'B')}
            onMouseMove={(e) => this.onTouchMove({touches: [{clientX: e.pageX}]}, 'B')}
            onMouseUp={(e) => this.onTouchEnd(null, 'B')}
          >
            {React.cloneElement(childB, { onToggleNext: () => this.onToggleNext('B') })}
          </div>
        )}
      </div>
    );
  }
}
