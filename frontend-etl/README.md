---虎鲨大数据平台 前端项目20171016

gitbal地址
```
https://github.com/LookingForWord/project.git
```

初始化运行
```
npm install -g @angular/cli
npm install
```

开发运行
```
npm run start
```

打包运行
```
npm run build
```


项目本身是由 @angular/cli 初始化目录结构的，一切配置请遵照其要求


目录及路由说明
```
    /login(/app/components/login.component) 登录

    /main/home(/app/components/modules/home/home.component) 首页
    /main/authority  权限系统 (组织管理/用户管理/角色管理/对象管理/在线管理)

    /main/minining 外部接入集成的系统  数据挖掘    (首页/任务台/运行记录/解释器/工作台仓库管理/配置)
    /main/dataServe  数据服务
    /main/task etl系统 (首页/数据仓库配置/任务配置管理/运维中心/任务列表/任务运维/汇聚日志/操作日志/配置管理/转换规则管理/知识库管理/配置管理/转换规则管理/知识库管理)
    /main/governance 数据资产(首页/数据源管理/数据资产管理/字段管理/表管理/目录管理/标签库管理/规则库管理/指标管理/数据质量管理/元数据稽核/数据稽核/指标稽核/数据治理/血缘(影响)分析/表分析报告  等模块)
    /main/workflow 调度平台(工作流管理/运行结果/节点管理)
