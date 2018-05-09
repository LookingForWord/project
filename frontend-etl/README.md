---新版ETL 前端项目20171016

gitbal地址
```
http://192.168.0.55/root/frontend-etl.git
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

    /main/repository/table(/app/components/modules/repository/components/table/repository.table.component) 数据仓库管理-数据仓库表管理
    /main/repository/log(/app/components/modules/repository/components/log/repository.log.component) 数据仓库管理-日志查询

    /main/task/dataSource(/app/components/modules/task/components/data.source/task.data.source.component) 任务管理管理-数据源管理
    /main/task/fileUpload(/app/components/modules/task/components/file.upload/task.file.upload.component) 任务管理管理-文件上传
    /main/task/dataClean(/app/components/modules/task/components/data.clean/task.data.clean.component) 任务管理管理-数据清洗配置
    /main/task/dataAggregation(/app/components/modules/task/components/data.aggregation/task.data.aggregation.component) 任务管理管理-数据清洗配置
    /main/task/plugin(/app/components/modules/task/components/plugin/task.plugin.component) 任务管理管理-插件管理
    /main/task/operationLog(/app/components/modules/task/components/operation.log/task.operation.log.component) 任务管理管理-调度日志
    /main/task/dirtyData(/app/components/modules/task/components/dirty.data/task.dirty.data.component) 任务管理管理-脏数据管理

    /main/knowledge/metadata(/app/components/modules/task/components/metadata/knowledge.metadata.component) 知识库-元数据管理

    /main/approval/approveRequest(/app/components/modules/approval/components/approve.request/approval.approve.request.component) 审批管理-审批申请
    /main/approval/checkRequest(/app/components/modules/approval/components/check.request/approval.check.request.component) 审批管理-查看申请
    /main/approval/approveLog(/app/components/modules/approval/components/approve.log/approval.approve.log.component) 审批管理-审批日志

    /main/system/label(/app/components/modules/system/components/label/system.label.component) 系统管理-标签管理
    /main/system/user(/app/components/modules/system/components/user/system.user.component) 系统管理-用户管理
