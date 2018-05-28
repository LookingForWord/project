/**
 * Created by LIHUA on 2017-08-05.
 */

import {Subject} from 'rxjs/Subject';

export class DatatransferService {

    // navigate 数据传递
    public navigateSubject: Subject<any> = new Subject<any>();

    // navigate component 数据传递
    public navigateComponentSubject: Subject<any> = new Subject<any>();

    // navigate state 数据传递
    public navigateStateSubject: Subject<any> = new Subject<any>();

    // task模块 树形结构展开关闭
    public taskTreeExpandSubject: Subject<any> = new Subject<any>();
    // task模块 树形结构选中点击
    public taskTreeCheckedSubject: Subject<any> = new Subject<any>();
    // task模块 树形结构双击选中点击
    public taskTreeDbCheckedSubject: Subject<any> = new Subject<any>();
    // 目录添加
    public addCatalogSubject: Subject<any> = new Subject<any>();
    // 目录修改
    public updateCatalogSubject: Subject<any> = new Subject<any>();
    // 删除目录 也可能是删除任务
    public removeCatalogSubject: Subject<any> = new Subject<any>();
    // 数据配置及机器学习的返回
    public backNodeSetSubject: Subject<any> = new Subject<any>();
    // 数据配置详情
    public dataConfigSubject: Subject<any> = new Subject<any>();
    // 知识目录添加和删除的目录刷新
    public addKnowledgeSubject: Subject<any> = new Subject<any>();
    // systemKnowledge模块 树形结构选中点击
    public systemKnowledgeTreeCheckedSubject: Subject<any> = new Subject<any>();
    // systemKnowledge模块 树形结构选中知识表的点击获取详情
    public getKnowledgeTreeCheckedSubject: Subject<any> = new Subject<any>();
    // systemKnowledge模块 树形结构选中知识表的点击保存知识传值
    public addKnowledgesTreeCheckedSubject: Subject<any> = new Subject<any>();

    // 数据采集的原始数据重加载完成
    public datasyncCollectionDataLoadSuccessSubject: Subject<any> = new Subject<any>();
    // 数据采集的原始数据修改完成
    public datasyncCollectionDataChangeSuccessSubject: Subject<any> = new Subject<any>();
    // 数据清洗的原始数据重加载完成(这里的修改只有合并和拆分发生修改才触发)
    public datasyncCleanDataLoadSuccessSubject: Subject<any> = new Subject<any>();
    // 数据清洗的原始数据修改完成(这里的修改只有合并和拆分发生修改才触发)
    public datasyncCleanDataChangeSuccessSubject: Subject<any> = new Subject<any>();
    // 数据清洗里 规则选中变化
    public datasyncCleanRuleChangeSuccessSubject: Subject<any> = new Subject<any>();

    // 权限管理  机构管理  展开关闭
    public authorityOrganizeTreeSubject: Subject<any> = new Subject<any>();
    // 树形结构选中点击
    public authorityOrganizeTreeCheckedSubject: Subject<any> = new Subject<any>();
    // 新增
    public authorityOrganizeTreeAddSubject: Subject<any> = new Subject<any>();
    // 存储组织树
    public authorityOrganizeTrees: Subject<any> = new Subject<any>();
    // 权限管理的角色的权限配置ids和人员配置ids的传递
    public authorityOrleIdsSubject: Subject<any> = new Subject<any>();
    // 对象管理树形展示  编辑删除后刷新tree
    public refreshObjectTree: Subject<any> = new Subject<any>();

    // 数据仓库的创建表获取字段传字段信息
    public databaseCreateTableGetFields: Subject<any> = new Subject<any>();


    // 工作流树形双击选中事件
    public workflowTreeDbCheckedSubject: Subject<any> = new Subject<any>();
    // 调度中心树形增改查操作更新
    public workflowAddTreeSubject: Subject<any> = new Subject<any>();
    // 调度中心树形删除操作
    public  workflowUpdateTreeSubject: Subject<any> = new Subject<any>();
    // 树形删除 发布给画布删除对应tab
    public workflowUpdateCanvasTabsSubject: Subject<any> = new Subject<any>();

    // 元数据管理
    // 元数据左边的type的传递
    public governanceMetadataAsidTypeSubject: Subject<any> = new Subject<any>();

    // 数据稽核树形
    // 最左侧树形双击选中事件
    public dataAuditTreeDbCheckedSubject: Subject<any> = new Subject<any>();
    // 最左侧树形增改查操作更新
    public dataAuditAddTreeSubject: Subject<any> = new Subject<any>();
    // 最左侧树形删除操作
    public  dataAuditUpdateTreeSubject: Subject<any> = new Subject<any>();
    // 树形删除 发布给画布删除对应tab
    public dataAuditUpdateCanvasTabsSubject: Subject<any> = new Subject<any>();

    public normAuditTreeDbCheckedSubject: Subject<any> = new Subject<any>();
    // 最左侧树形增改查操作更新
    public normAuditAddTreeSubject: Subject<any> = new Subject<any>();
    // 最左侧树形删除操作
    public  normAuditUpdateTreeSubject: Subject<any> = new Subject<any>();
    // 树形删除 发布给画布删除对应tab
    public normAuditUpdateCanvasTabsSubject: Subject<any> = new Subject<any>();

}
