# 用canvas画的甘特图demo

> 一个基于zrender的甘特图demo

## 怎么启动

### 安装依赖
`npm install`

### 启动
`npm run dev`

## 支持的query参数

| 参数名 | 默认值 |
| --- | --- |
| debug | false |
| unitWidth | 160 |
| taskNamePaddingLeft | 15 |
| timeScaleHeight | 20 |
| milestoneTopHeight | 20 |
| barHeight | 30 |
| barMargin | 1 |
| scrollSpeed | 30 |
| includeHoliday | false |
| useLocal | false |
| useRemote | false |
| view | '' |
| mockTaskSize | 0 |
| filter | null |
| showFilter | false |
| showArrow | true |

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
