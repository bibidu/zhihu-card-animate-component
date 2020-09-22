What is CardScrollAnimate?
===============

仿知乎卡片滑动动画组件.

# Props

| Name| Type | Default value | Required | Description |
| - | - | - | - | - |
| initialPairs | Array | | ✔️ | 初始显示的两个可滑动组件 |
| getNext | Function | | ✔️ | 获取后续的可滑动组件|
| animationTime | Number | 0.43 | | 动画时间 |
| coverContainerScale | Number | 1.05 | | 最上层容器的 scale |
| coverContainerTop | Number | 15 | | 最上层容器 距顶部距离 |
| scrollThreshold | Number | 90 | | 滑动判定是否有效的阈值 |

# Installation and setup

## Npm package

> By npm

```bash
npm install --save like-zhihu-card-scroll-animate
```

> By Yarn

```bash
yarn add like-zhihu-card-scroll-animate
```

# Examples

```javascript
import React from 'react';
import Swiper from 'react-id-swiper';
import 'swiper/css/swiper.css';

const CardScrollContainer = () => (
  <div className="card-scroll-container">
    <CardScrollAnimate
      initialPairs={initialPairs}
      getNext={getNext}
    />
  </div>
)

export default CardScrollContainer;
```