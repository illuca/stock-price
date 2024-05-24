

# 项目结构

```shell
$project
├── README.md
├── back-end
│   ├── dist
│   ├── nest-cli.json
│   ├── node_modules
│   ├── package-lock.json
│   ├── package.json
│   ├── src
│   ├── test
│   ├── tsconfig.build.json
│   └── tsconfig.json
└── front-end
    ├── node_modules
    ├── package-lock.json
    ├── package.json
    ├── public
    └── src
```

# 如何运行

```shell
cd $project/back-end
npm install
npm run start

cd $project/front-end
npm install
npm run start
```

# 功能介绍

输入股票编号、起止日期、截止日期后，点击提交，服务器会返回股票在日期范围内的收盘价。

客户端根据收盘价绘制一条二维曲线，横坐标是日期， 纵坐标是日期对应的收盘价。为了方便用户观察重要信息，对数据进行去噪，如果两个连续的点之间的幅度在10%以内，则去掉后面的一个点(即去掉时间靠后的点)，使最终绘制的曲线上，两个连续点之间的幅度(上涨或下跌)在10%以上。

例如:

若下降中，点A价位100，点B为98，点C为88，则去掉点B。

若上升中，点A价位为100，点B为105，点C为116，则去掉点B。
