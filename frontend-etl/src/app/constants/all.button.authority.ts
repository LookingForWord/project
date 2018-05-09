export class AllButtonAuthority {
    static allButtonArr = [
        // 数据治理 数据源管理
        {name: 'governance.dataSource.add', code: 'b020201'},
        {name: 'governance.dataSource.ceshi', code: 'b020202'},
        {name: 'governance.dataSource.synchronous', code: 'b020203'},
        {name: 'governance.dataSource.edit', code: 'b020204'},
        {name: 'governance.dataSource.delete', code: 'b020205'},
        // 数据治理 表管理
        {name: 'governance.metadata.addSQL', code: 'b02030201'},
        {name: 'governance.metadata.addVisual', code: 'b02030202'},
        {name: 'governance.metadata.edit', code: 'b02030203'},
        {name: 'governance.metadata.impact', code: 'b02030204'},
        {name: 'governance.metadata.table.analysis', code: 'b02030205'},
        {name: 'governance.metadata.delete', code: 'b02030206'},
        // 数据治理 质量管理
        // {name: 'governance.qualityManage.add', code: 'b02030201'},
        // {name: 'governance.qualityManage.check', code: 'b02030202'},
        // {name: 'governance.qualityManage.edit', code: 'b02030203'},
        // {name: 'governance.qualityManage.delete', code: 'b02030204'},
        // 数据治理 目录管理
        {name: 'governance.catalog.add', code: 'b02030301'},
        {name: 'governance.catalog.edit', code: 'b02030302'},
        {name: 'governance.catalog.delete', code: 'b02030303'},
        // 数据治理 标签库管理
        {name: 'governance.tag.add', code: 'b02030401'},
        {name: 'governance.tag.edit', code: 'b02030402'},
        {name: 'governance.tag.delete', code: 'b02030403'},
        // 数据治理 规则库管理
        {name: 'governance.rule.add', code: 'b02030501'},
        {name: 'governance.rule.edit', code: 'b02030502'},
        {name: 'governance.rule.delete', code: 'b02030503'},
        // 数据治理 指标管理
        {name: 'governance.norm.add', code: 'b02030601'},
        {name: 'governance.norm.edit', code: 'b02030602'},
        {name: 'governance.norm.delete', code: 'b02030603'},
        // 数据治理   数据质量管理 源数据稽核
        {name: 'governance.qualityManage.add', code: 'b02040101'},
        {name: 'governance.qualityManage.check', code: 'b02040102'},
        {name: 'governance.qualityManage.edit', code: 'b02040103'},
        {name: 'governance.qualityManage.delete', code: 'b02040104'},
        // 数据治理   数据质量管理 数据稽核
        {name: 'governance.dataAudit.addDirectory', code: 'b02040201'},
        {name: 'governance.dataAudit.addTask', code: 'b02040202'},
        {name: 'governance.dataAudit.edit', code: 'b02040203'},
        {name: 'governance.dataAudit.delete', code: 'b02040204'},
        {name: 'governance.dataAudit.runHistory', code: 'b02040205'},
        {name: 'governance.dataAudit.save', code: 'b02040206'},
        {name: 'governance.dataAudit.submit', code: 'b02040207'},
        // 数据治理   数据质量管理 指标稽核
        {name: 'governance.normAudit.addDirectory', code: 'b02040301'},
        {name: 'governance.normAudit.addTask', code: 'b02040302'},
        {name: 'governance.normAudit.edit', code: 'b02040303'},
        {name: 'governance.normAudit.delete', code: 'b02040304'},
        {name: 'governance.normAudit.runHistory', code: 'b02040305'},
        {name: 'governance.normAudit.save', code: 'b02040306'},
        {name: 'governance.normAudit.submit', code: 'b02040307'},
        // 数据治理   血缘分析
        {name: 'governance.bloodAnalysis.save', code: 'b02050101'},
        {name: 'governance.bloodAnalysis.add', code: 'b02050102'},
        {name: 'governance.bloodAnalysis.search', code: 'b02050103'},
        // 数据治理  表分析报告
        {name: 'governance.tableAnalysis.delete', code: 'b02050201'},

        // 调度  工作流管理
        {name: 'workflow.work.addMenu', code: 'b060101'},
        {name: 'workflow.work.addWork', code: 'b060102'},
        {name: 'workflow.work.save', code: 'b060103'},
        {name: 'workflow.work.run', code: 'b060104'},
        {name: 'workflow.work.trigger', code: 'b060105'},
        // 还没添加的
        {name: 'workflow.work.edit', code: 'b060106'},
        {name: 'workflow.work.delete', code: 'b060107'},
        // 运行结果
        {name: 'workflow.result.cancle', code: 'b060201'},
        // 调度 节点任务
        {name: 'workflow.node.edit', code: 'b060301'},


        // 数据融合 配置管理  知识库
        {name: 'task.knowledge.addKnowledge', code: 'b04060201'},
        {name: 'task.knowledge.delete', code: 'b04060202'},
        {name: 'task.knowledge.addContent', code: 'b04060203'},
        {name: 'task.knowledge.save', code: 'b04060204'},
        {name: 'task.knowledge.edit', code: 'b04060205'},
        // 数据融合  配置管理  规则库
        {name: 'task.Catalog.add', code: 'b04060101'},
        {name: 'task.rule.editCatalog', code: 'b04060102'},
        {name: 'task.rule.deleteCataLog', code: 'b04060103'},
        {name: 'task.rule.editRule', code: 'b04060104'},
        {name: 'task.rule.deleteRule', code: 'b04060105'},
        {name: 'task.rule.add', code: 'b04060106'},
        // 数据融合 运维中心  任务列表
        {name: 'task.operation.instance.close', code: 'b04050101'},
        // 数据融合  任务配置
        {name: 'task.config.addCataLog', code: 'b040401'},
        {name: 'task.config.exportCataLog', code: 'b040402'},
        {name: 'task.config.editCataLog', code: 'b040403'},
        {name: 'task.config.deleteCataLog', code: 'b040404'},
        {name: 'task.config.exportTask', code: 'b040405'},
        {name: 'task.config.editTask', code: 'b040406'},
        {name: 'task.config.deleteTask', code: 'b040407'},
        {name: 'task.config.addTask', code: 'b040408'},
        {name: 'task.config.saveTask', code: 'b040409'},
        {name: 'task.config.submitTask', code: 'b040410'},
        {name: 'task.config.import', code: 'b040411'},
        // 数据融合  数据汇聚（没必要，只是操作画布内容）
        {name: 'task.converge.delete', code: 'b040301'},
        {name: 'task.converge.run', code: 'b040302'},
        // 数据融合 数据仓库配置
        {name: 'task.database.addWarehouse', code: 'b040201'},
        {name: 'task.database.editWarehouse', code: 'b040202'},
        {name: 'task.database.deleteWarehouse', code: 'b040203'},
        {name: 'task.database.addTable', code: 'b040204'},
        {name: 'task.database.import', code: 'b040205'},

        // 权限管理
        // 权限 组织管理
        {name: 'authority.organize.addNext', code: 'b070101'},
        {name: 'authority.organize.editDepartment', code: 'b070102'},
        {name: 'authority.organize.delete', code: 'b070103'},
        {name: 'authority.organize.import', code: 'b070104'},
        {name: 'authority.organize.export', code: 'b070105'},
        {name: 'authority.organize.exportModal', code: 'b070106'},
        {name: 'authority.organize.addNextCompany', code: 'b070107'},
        {name: 'authority.organize.editCompany', code: 'b070108'},
        // 权限 用户管理
        {name: 'authority.user.addUser', code: 'b070201'},
        {name: 'authority.user.import', code: 'b070202'},
        {name: 'authority.user.export', code: 'b070203'},
        {name: 'authority.user.exportModal', code: 'b070204'},
        {name: 'authority.user.editUser', code: 'b070205'},
        {name: 'authority.user.deleteUser', code: 'b070206'},
        {name: 'authority.user.editPsd', code: 'b070207'},
        // 权限  角色管理
        {name: 'authority.role.add', code: 'b070301'},
        {name: 'authority.role.import', code: 'b070302'},
        {name: 'authority.role.export', code: 'b070303'},
        {name: 'authority.role.exportModal', code: 'b070304'},
        {name: 'authority.role.edit', code: 'b070305'},
        {name: 'authority.role.delete', code: 'b070306'},
        // 权限 对象管理
        {name: 'authority.object.addMenu', code: 'b070401'},
        {name: 'authority.object.importMenu', code: 'b070402'},
        {name: 'authority.object.exportMenu', code: 'b070403'},
        {name: 'authority.object.exportMenuModal', code: 'b070404'},
        {name: 'authority.object.editMenu', code: 'b070405'},
        {name: 'authority.object.deleteMenu', code: 'b070406'},
        {name: 'authority.object.upMenu', code: 'b070407'}, // 没必要
        {name: 'authority.object.downMenu', code: 'b070408'}, // 没必要  不操作数据库
        {name: 'authority.object.addInterface', code: 'b070409'},
        {name: 'authority.object.importInterface', code: 'b070410'},
        {name: 'authority.object.exportInterface', code: 'b070411'},
        {name: 'authority.object.exportInterfaceModal', code: 'b070412'},
        {name: 'authority.object.editInterface', code: 'b070413'},
        {name: 'authority.object.deleteInterface', code: 'b070414'},
        {name: 'authority.object.menuManage', code: 'b070415'},
        {name: 'authority.object.interfaceManage', code: 'b070416'},
        {name: 'authority.object.dataManage', code: 'b070417'},
        // 权限管理  在线管理
        {name: 'authority.online.offline', code: 'b070501'},

        // 数据服务
        {name: 'data.serve.addServe', code: 'b0801'},
        {name: 'data.serve.applyServe', code: 'b0802'},
        {name: 'data.serve.myApplycation', code: 'b0803'},
        {name: 'data.serve.auditServe', code: 'b0804'},
        {name: 'data.serve.editServe', code: 'b0805'},
        {name: 'data.serve.serviceCall', code: 'b0806'}
    ];
}
