# 用canvas画的甘特图demo

> 一个基于zrender的甘特图demo

## 怎么启动

### 安装依赖
`npm install`

### 启动
`npm run dev`

## 支持的query参数

> 使用方式 url?参数名=参数值  
> 例如：[/?barHeight=40](https://qinbinhua601.github.io/gantt-demo/index.html?barHeight=40)

| 参数名 | 默认值 | 说明|
| --- | --- | --- |
| debug | false | 调试模式 |
| unitWidth | 160 | 日期格子宽度 |
| taskNamePaddingLeft | 15 | 任务名左内边距 |
| timeScaleHeight | 20 | 时间轴高度 |
| milestoneTopHeight | 20 | 里程碑高度 |
| barHeight | 30 | 任务条高度 |
| barMargin | 1 |任务条下外边距 |
| scrollSpeed | 30 | 滚动速度 |
| includeHoliday | false | 计算task耗时是否包含周末 |
| useLocal | false | 是否用本地数据 |
| useRemote | false |是否用远端数据 |
| view | '' |视图名 |
| mockTaskSize | 0 | mock任务条数量 |
| filter | null | 过滤色值 |
| showFilter | false | 开启过滤器 |
| showArrow | true |是否显示左右📌箭头 |

## 功能点 (roadmap)

- [x]  taskBar
    - [x]  基本UI
    - [x]  可左右扩展duration长度
    - [x]  可水平方向调整位置
    - [x]  可上下调整记录位置
    - [x]  双击可修改task任务信息
    - [x]  支持空行绘制
    - [x]  左右超出视口箭头显隐
    - [x]  点击超出视口箭头定位到taskBar
    - [x]  显示所占天数（不算工作日）
    - [x]  复制当前taskBar到下一行
- [x]  时间线
    - [x]  基本UI
    - [x]  日期
    - [x]  hover日期有🚩
- [x]  里程碑
    - [x]  基本UI (比较粗糙)
    - [x]  hover日期点击可创建里程碑线
    - [x]  再次hover日期点击可删除已有的里程碑
    - [x]  可以输入名字
    - [ ]  可以修改名字
- [x]  网格线
    - [x]  格子
        - [x]  基本布局
        - [x]  周末、休息日画斜线
        - [x]  hover可添加taskBar
    - [x]  多画一个空行，可以用来添加
- [x]  无限布局
    - [x]  画基本布局
    - [x]  可滚动 （左右滚动）
- [x]  数据持久化存储
    - [x]  写在本地 localStorage
    - [x]  服务端 (mongodb)
        - [x]  先实现基本的查询和更新操作
        - [x]  抽出所有修改tasks和mileStones的操作，然后可以统一封装修改
        - [x]  设计数据库 （最好可以分视图存储）
- [x]  标识当天的垂直线
- [x]  性能
    - [x]  只画视口内的taskBar
- [x]  工程
    - [x]  迁移到vite
    - [x]  修改打包方式
    - [x]  修改部署方式自动化
        - [x]  github-pages
        - [x]  vercel
- [x]  按颜色过滤 (?showFilter=1)
- [x]  移动端可以滚动，不可以拖动taskBar
