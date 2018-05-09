/**
 * Created by xxy on 2017/11/21/021.
 */

import {Injectable} from '@angular/core';
import {HttpService} from 'frontend-common/ts_modules/services/http.service';
@Injectable()
export class GovernanceService {
    // 数据源接口 start
    datasourcesUrl = '/rest/dbgm/datasources/list';
    // 新增数据源
    addSourceUrl = '/rest/dbgm/datasources';
    // 获取数据源详情
    sourceInfoUrl = '/rest/dbgm/datasources/{id}';
    // 获取数据类型列表数据
    getSourcsTypeUrl = '/rest/dbgm/dicts/list?dimCode=DB_TYPE';
    // 根据数据源类型获取数据源
    getDataSourceMenuUrl = '/rest/dbgm/datasources/getByDsType/{dsType}';
    // 根据数据源id获取表
    getSourceTableUrl = '/rest/dbgm/datasources/{id}/tables';
    // 连接测试数据源（新增页面）
    testSourcsUrl = '/rest/dbgm/datasources/contest';
    // 通过ID连接测试数据源
    testSourceByIdUrl = '/rest/dbgm/datasources/{id}/contest';
    // 查询数据源类型
    searchSourceTypeUrl = '/rest/dbgm/dicts/list';
    // 数据源同步元数据
    asyncDataUrl = '/rest/dbgm/datasources/syncMeta/{dataSourceId}';
    // 根据数据源类型查询列表
    getDataSourceByTypeUrl = '/rest/dbgm/datasources/getDataSourceByType/{dsType}';
    // 根据Id获取表字段信息
    getTableFieldsUrl = 'rest/dbgm/metaTable/getTableFields/{tableId}';
    // 数据源接口 end

    // 规则库管理 start
    // 获取所有规则列表信息
    getqueryAllRuleContentUrl = '/rest/dbgm/ruleCheck/queryAllRule/{pageNum}/{pageSize}';
    // 新增规则 post
    addRuleContentUrl = '/rest/dbgm/ruleCheck/addRuleConfig';
    // 编辑规则 post
    editRuleContentUrl = '/rest/dbgm/ruleCheck/updateRuleConfig';
    // 获取对应表下的配置好的规则 post
    getRuleContentUrl = '/rest/dbgm/ruleCheck/findOneById/{id}';
    // 删除规则 post
    delRuleContentUrl = '/rest/dbgm/ruleCheck/deleteRuleConfig/{id}';
    // 删除规则 post
    delRuleUrl = '/rest/rule/delRule/{id}';
    // 获取执行函数
    queryAllFuncUrl= '/rest/dbgm/ruleCheck/queryAllFunc';
    // 规则库管理 end

    // 标签库管理 start
    // 标签列表
    labelListUrl = '/rest/dbgm/metaLabel/queryAllLabel/{pageNum}/{pageSize}';
    // 新增标签
    addLabelUrl = '/rest/dbgm/metaLabel/addLabel';
    // 修改标签
    editLabelUrl = '/rest/dbgm/metaLabel/updateLabel';
    // 删除标签
    deleteLabelUrl = '/rest/dbgm/metaLabel/delLabel/{id}';
    // 获取标签详情
    labelDetailUrl = '/rest/dbgm/metaLabel/getLabel/{id}';
    // 标签库管理 end

    // 目录管理 start
    // 获取子目录
    getCatalogUrl = '/rest/dbgm/directory/{id}/child';
    // 更新目录
    updateDirectoryUrl = '/rest/dbgm/directory/{id}/update';
    // 新增目录
    addDirectoryUrl = '/rest/dbgm/directory/add';
    // 删除目录
    deleteDirectoryUrl = '/rest/dbgm/directory/{id}/remove';
    // 目录管理 end

    // 关联分析 start
    // 影响分析(查询表的去向)
    getInfluenceUrl = '/rest/dbgm/relations/{sourceId}/targets';
    // 来源分析(查询画布)
    getSourceCanvasUrl = '/rest/dbgm/relations/tables/{tableId}/relationCanvas';
    // 获取全部关系 血缘分析需要
    getAllRelationUrl = '/rest/dbgm/relations/getAllRelation';
    // 删除关系接口
    deleteRelationsUrl = '/rest/dbgm/relations/deleteByIds';
    // 新增关闭表
    saveRelationsUrl = '/rest/dbgm/relations';
    // 关联分析  end

    // 质量管理 start
    // 获取检查列表
    getCheckListUrl = '/rest/dbgm/ruleCheck/queryAllCheck/{pageNum}/{pageSize}';
    // 获取所有的规则(不分页)
    getAllRuleListUrl = '/rest/dbgm/ruleCheck/queryAllRule/{actOn}';
    // 保存检查配置（新建）
    buildCheckUrl = '/rest/dbgm/ruleCheck/addCheckConfig';
    // 编辑检查配置
    editCheckUrl = '/rest/dbgm/ruleCheck/updataCheckConfig';
    // 获取表检查配置详情
    getFormCheckUrl = '/rest/dbgm/ruleCheck/findOne/{id}';
    // 删除表的检查配置
    deleteFormCheckUrl = '/rest/dbgm/ruleCheck/deleteCheckConfig/{id}';
    // 获取检查报告列表
    getCheckReportUrl = '/rest/dbgm/ruleCheck/queryCheckRecord/{id}/{pageNum}/{pageSize}';
    // 执行规则检查
    runRuleCheckUrl = '/rest/dbgm/ruleCheck/runRuleCheck/{id}';
    // 质量管理 end

    // 元数据表管理 start
    // 获取所有标签
    getMetaLabelUrl = '/rest/dbgm/metaLabel/findLabelByKeywords';
    // 获取所有关系型数据源
    getAllSourceUrl = '/rest/dbgm/datasources/getRelationalSource';
    // 获取所有数据源（包含有字段类型在里面）
    getAlldictsUrl = '/rest/dbgm/dicts/list?dimCode=DB_TYPE';
    // 生成SQL
    viewCreateSqlUrl = '/rest/dbgm/metaTable/viewCreateSql/{id}';
    // SQL建表
    createTableBySqlUrl = '/rest/dbgm/metaTable/createTableBySql';
    // 根据标签获取表信息列表
    metaTableByTagUrl = '/rest/dbgm/metaTable/findMetaTableListByLabel';
    // 获取可视化表详情
    getTableDetialUrl = '/rest/dbgm/metaTable/findTableInfoById/{id}';
    // 获取拆分依赖列表
    getSplitByUrl = '/rest/dbgm/metaTable/getSplitBy/{tableId}';
    // 可视化建表
    addVisualizationTableUrl = '/rest/dbgm/metaTable/addMetaTable';
    // 可视化表编辑保存
    editVisualizationTableUrl = '/rest/dbgm/metaTable/updateTableInfo';
    // 删除表
    deleteTableUrl = '/rest/dbgm/metaTable/deleteTableInfoById/{id}';
    // SQL建表获取所属系统
    getDataListUrl = '/rest/dbgm/metaSystem/listSystem';
    // 元数据表管理 end

    // 数据资产  首页
    homeDataUrl = '/rest/dbgm/datasources/getIndexCount';

    // 字段管理 start

    // 获取字段名列表
    getFieldListUrl = '/rest/dbgm/metaField/findAllFieldsName/{pageNum}/{pageSize}';
    // 根据字段名获取字段列表
    getFieldDetailUrl = '/rest/dbgm/metaField/findByFieldName/{fieldName}/{pageNum}/{pageSize}';
    // 字段管理 end

    // 指标管理
    normListUrl = '/rest/dbgm/dataCheckNorm/getAllNorms/{pageNum}/{pageSize}';
    // 添加指标
    addNormUrl = '/rest/dbgm/dataCheckNorm';
   // 编辑保存指标
    editNormUrl = '/rest/dbgm/dataCheckNorm/{id}';
    // 删除指标
    deleteNormUrl = '/rest/dbgm/dataCheckNorm/{id}';
    // 指标详情
    detailNormUrl = '/rest/dbgm/dataCheckNorm/{id}';
    // sql 预览
    sqlPreviewUrl = '/rest/dbgm/dataCheckNorm/preview';

    // 表分析报告(表分析) start
    // 根据目录id查询表报告
    getTableReportUrl = '/rest/dbgm/analyse/findResultByDirId/{dirId}/{pageNum}/{pageSize}';
    // 删除表报告
    deleteTableReportUrl = '/rest/dbgm/analyse/delAnalyseJob/{jobId}';
    // 根据报告id查询报告详情
    getReportDetailUrl = '/rest/dbgm/analyse/findInfoById/{id}';
    // 获取表的字段信息
    getTableFieldUrl = '/rest/dbgm/metaTable/getTableFields/{tableId}';
    // 保存表分析作业
    saveTableAnalysisUrl = '/rest/dbgm/analyse/saveAnalyseJob';
    // 根据表id获取作业列表
     getTableAnalysisUrl= '/rest/dbgm/analyse/getJobList/{tableId}';
     // 获取表分析作业详情
    analysisDetailUrl= '/rest/dbgm/analyse/getJobInfo/{jobId}';
    // 提交作业(运行)
    submitAnalysisUrl = '/rest/dbgm/analyse/submitJob/{jobId}';
    // 根据作业任务id获取运行历史
     getHistoryListUrl = '/rest/dbgm/analyse/getResultById/{jobId}/{pageNum}/{pageSize}';
     // 获取运行历史详情
    getHistoryDetailUrl = '/rest/dbgm/analyse/getResultInfo/{resultId}';
    // 表分析报告 end

    /**** 数据稽核 ****/
    // 获取稽核目录 get
    auditDirectoryUrl = '/rest/dbgm/audit/getCatalog/{parentId}/{catalogType}';
    // 根据数据源获取对应指标
    getNormListByDsIdUrl = '/rest/dbgm/dataCheckNorm/getNormsByDsId/{dsId}';
    // 修改目录信息  put
    editAuditDirectoryUrl = '/rest/dbgm/audit/updateCatalog';
    // 删除目录 delete
    deleteAuditDirectoryUrl = '/rest/dbgm/audit/delCatalog/{id}/{catalogType}';
    // 新增目录 post
    addAuditDirectoryUrl = '/rest/dbgm/audit/addCatalog';
    // 新增稽核任务 post
    addAuditTaskUrl = '/rest/dbgm/audit/addAuditConfig';
    // 删除稽核任务 delete
    deleteAuditTaskUrl = '/rest/dbgm/audit/delAuditConfig/{id}';
    // 修改任务信息 put
    editAuditTaskUrl = '/rest/dbgm/audit/updateConfig';
    // 修改任务名字
    changeAuditTaskNameUrl = '/rest/dbgm/audit/updateConfigName';
    // 获取运行历史  get
    runHistoryUrl = '/rest/dbgm/audit/getRunLog/{configId}/{pageNum}/{pageSize}';
    // 删除运行记录 delete
    deleteRunHistoryUrl = '/rest/dbgm/audit/delResult/{id}';
    // 立即执行 post       /rest/dbgm/audit/runImmediately
    runNowUrl = '/rest/dbgm/audit/submitJob/{id}';
    // 获取函数模板接口  get
    functionModalUrl = '/rest/dbgm/template/getAllTemplate';
    // 通过指标获取字段信息
    fieldMessageUrl = '/rest/dbgm/audit/getFieldByNorm/{normId}';
    // 保存任务配置信息
    saveDataAuditUrl = '/rest/dbgm/audit/addConfig';
    // 获取任务详情
    getdataAuditDetailUrl = '/rest/dbgm/audit/getAuditConfig/{id}';

    constructor(private httpService: HttpService) {

    }

    /**
     * 获取字段名列表
     * @param param
     * @returns {Promise<any>}
     */
    async getFieldList (param?: any): Promise<any> {
        let url = this.httpService.getDataUrl(this.getFieldListUrl, {pageNum: param.pageNum, pageSize: param.pageSize});
        url = this.httpService.getSearchDataUrl(url, {keyword: param.keyword});
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 根据字段名获取字段列表
     * @param param
     * @returns {Promise<any>}
     */
    async getFieldDetail (param?: any): Promise<any> {
        let url = this.httpService.getDataUrl(this.getFieldDetailUrl, param);
        return await this.httpService.get(url).toPromise();
    }
    /**
     * 获取数据源列表 全部数据库
     */
    async getDatasources (param?: any): Promise<any> {
        let url = this.datasourcesUrl + '?' + this.httpService.parseToURLSearchParams(param);
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 获取数据源列表 关系型数据库
     * 数据资产首页
     */
    async getHomeData (param?: any): Promise<any> {
        return await this.httpService.postByJSON(this.homeDataUrl, param).toPromise();
    }

    /**
     * 添加数据源
     * @param param
     * @returns {Promise<any>}
     */
    async addSource (param?: any): Promise<any> {
        return await this.httpService.postByJSON(this.addSourceUrl, param).toPromise();
    }

    /**
     * 根据数据源类型获取数据源
     * @param param
     * @returns {Promise<any>}
     */
    async getDataSourceMenus (param?: any): Promise<any> {
        // let url = this.getDataSourceMenuUrl.replace('{dsType}', param.dsType);
        let url = this.httpService.getDataUrl(this.getDataSourceMenuUrl, {dsType: param.dsType});
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 根据数据源id获取表
     * @param param
     * @returns {Promise<any>}
     */
    async getSourceTables (param?: any): Promise<any> {
        let url = this.httpService.getDataUrl(this.getSourceTableUrl, {id: param.id});
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 根据id获取数据源详情
     * @param param
     * @returns {Promise<any>}
     */
    async getSourceInfo (param?: any): Promise<any> {
        // let url = this.sourceInfoUrl.replace('{id}', param);
        let url = this.httpService.getDataUrl(this.sourceInfoUrl, {id: param});
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 获取数据源类型数据
     * @returns {Promise<any>}
     */
    async getSourcsType (): Promise<any> {
        return await this.httpService.get(this.getSourcsTypeUrl).toPromise();
    }

    /**
     * 修改数据源基本信息
     * @param param
     * @returns {Promise<any>}
     */
    async  editSource (param?: any): Promise<any> {
        let url = this.httpService.getDataUrl(this.sourceInfoUrl, {id: param.id});
        return await this.httpService.putByJSON(url, param).toPromise();
    }

    /**
     * 删除数据源
     * @param param
     * @returns {Promise<any>}
     */
    async deleteSourceInfo (param?: any): Promise<any> {
        let url = this.httpService.getDataUrl(this.sourceInfoUrl, {id: param});
        return await this.httpService.delete(url).toPromise();
    }

    /**
     * 测试数据源（新增页面
     * @param param
     * @returns {Promise<any>}
     */
    async  testSource (param?: any): Promise<any> {
        return await this.httpService.postByJSON(this.testSourcsUrl, param).toPromise();
    }

    /**
     * 通过id测试数据源
     * @param param
     * @returns {Promise<any>}
     */
    async testSourceById (param?: any): Promise<any> {
        // let url = this.testSourceByIdUrl.replace('{id}', param);
        let url = this.httpService.getDataUrl(this.testSourceByIdUrl, {id: param});

        return await this.httpService.get(url).toPromise();
    }

    /**
     * 查询数据源类型
     * @param param
     * @returns {Promise<any>}
     */
    async searchSourceType (param?: any): Promise<any> {
        let url = this.httpService.getDataUrl(this.searchSourceTypeUrl, {type: param});
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 数据源同步元数据
     * @param param
     * @returns {Promise<any>}
     */
    async asyncData (param?: any): Promise<any> {
        // let url = this.asyncDataUrl.replace('{dataSourceId}', param.dataSourceId);
        let url = this.httpService.getDataUrl(this.asyncDataUrl, {dataSourceId: param.dataSourceId});

        return await this.httpService.postByJSON(url, param).toPromise();
    }

    /**
     * 根据数据源类型查询列表
     * @param param
     * @returns {Promise<any>}
     */
    async getDataSourceByType (param?: any): Promise<any> {
        let url = this.httpService.getDataUrl(this.getDataSourceByTypeUrl, {dsType: param});

        return await this.httpService.get(url).toPromise();
    }

    /**
     * 根据Id获取表字段信息
     * @param param
     * @returns {Promise<any>}
     */
    async getTableFields (param?: any): Promise<any> {
        let url = this.httpService.getDataUrl(this.getTableFieldsUrl, {tableId: param});
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 获取列表页
     * @param param
     * @returns {Promise<any>}
     */
    async getLabelList (param?: any): Promise<any> {
        let url = this.httpService.getDataUrl(this.labelListUrl,
            {pageNum: param.pageNum, pageSize: param.pageSize});
        url = this.httpService.getSearchDataUrl(url, {keyWord: param.keyWord});
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 根据单个id删除标签
     * @param param
     * @returns {Promise<any>}
     */
    async deleteLabel (param?: any): Promise<any> {
        let url = this.httpService.getDataUrl(this.deleteLabelUrl, {id: param.id});
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 修改标签
     * @param param
     * @returns {Promise<any>}
     */
    async  editLabel (param?: any): Promise<any> {
        let url = this.httpService.getDataUrl(this.editLabelUrl, {id: param.id, name: param.name, description: param.description});

        return await this.httpService.postByJSON(url, param).toPromise();
    }

    /**
     * 新增标签
     * @param param
     * @returns {Promise<any>}
     */
    async addLabel (param?: any): Promise<any> {
        return await this.httpService.postByJSON(this.addLabelUrl, param).toPromise();
    }

    /**
     * 根据单个id 获取标签详情
     * @param param
     * @returns {Promise<any>}
     */
    async getLabelDetail (param?: any): Promise<any> {
        // let url = this.labelDetailUrl.replace('{id}', param.id);
        let url = this.httpService.getDataUrl(this.labelDetailUrl, {id: param.id});

        return await this.httpService.get(url).toPromise();
    }

    /**
     * 获取所有规则信息table   get
     * @param param
     * @returns {Promise<any>}
     */
    async getAllRuleContent (param?: any): Promise<any> {
        let url = this.httpService.getDataUrl(this.getqueryAllRuleContentUrl,
            {pageNum: param.pageNum, pageSize: param.pageSize});
        url = this.httpService.getSearchDataUrl(url, {keyWord: param.keyWord});
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 获取所有执行函数   get
     * @returns {Promise<any>}
     */
    async getAllFunc (): Promise<any> {
        let url = this.queryAllFuncUrl;
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 获取表对应配置好的规则
     * @param param
     * @returns {Promise<any>}
     */
    async getRuleContent (param?: any): Promise<any> {
        // let url = this.getRuleContentUrl.replace('{id}', param);
        let url = this.httpService.getDataUrl(this.getRuleContentUrl, {id: param});

        return await this.httpService.get(url).toPromise();
    }

    /**
     * 新增规则  post
     * @param param
     * @returns {Promise<any>}
     */
    async  addRuleContent (param?: any): Promise<any> {
        return await this.httpService.postByJSON(this.addRuleContentUrl, param).toPromise();
    }

    /**
     * 编辑规则  post
     * @param param
     * @returns {Promise<any>}
     */
    async  editRuleContent (param?: any): Promise<any> {
        let url = this.editRuleContentUrl;
        return await this.httpService.postByJSON(url, param).toPromise();
    }

    /**
     * 删除规则 delete
     * @param param
     * @returns {Promise<any>}
     */
    async  deleteRuleContent (param?: any): Promise<any> {
        // let url = this.delRuleContentUrl.replace('{id}', param);
        let url = this.httpService.getDataUrl(this.delRuleContentUrl, {id: param});
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 删除规则库 delete
     * @param param
     * @returns {Promise<any>}
     */
    async  deleteRule (param?: any): Promise<any> {
        // let url = this.delRuleUrl.replace('{id}', param);
        let url = this.httpService.getDataUrl(this.delRuleUrl, {id: param});
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 获取子目录
     * @param param
     * @returns {Promise<any>}
     */
    async getCatalogList (param?: any): Promise<any> {
        // let url = this.getCatalogUrl.replace('{id}', param.id);
        // url = param.excludeId ? (url + `?excludeId=${param.excludeId}`) : url;
        let url = this.httpService.getDataUrl(this.getCatalogUrl, {id: param.id});
        url = this.httpService.getSearchDataUrl(url, {excludeId: param.excludeId});
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 更新目录
     * @param param
     * @returns {Promise<any>}
     */
    async updateDirectory (param?: any): Promise<any> {
        // let url = this.updateDirectoryUrl.replace('{id}', param.id);
        let url = this.httpService.getDataUrl(this.updateDirectoryUrl, {id: param.id});
        return await this.httpService.postByJSON(url, param).toPromise();
    }

    /**
     * 新增目录
     * @param param
     * @returns {Promise<any>}
     */
    async addDirectory (param?: any): Promise<any> {
        return await this.httpService.postByJSON(this.addDirectoryUrl, param).toPromise();
    }

    /**
     * 删除目录
     * @param param
     * @returns {Promise<any>}
     */
    async deleteDirectory (param?: any): Promise<any> {
        // let url = this.deleteDirectoryUrl.replace('{id}', param.id);
        let url = this.httpService.getDataUrl(this.deleteDirectoryUrl, {id: param.id});

        return await this.httpService.get(url).toPromise();
    }

    /**
     * 根据标签list
     * @returns {Promise<any>}
     */
    async getMetaLabel (): Promise<any> {
        let url = this.getMetaLabelUrl;
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 根据id生成SQL
     * @param param
     * @returns {Promise<any>}
     * @constructor
     */
    async CreateSql (param?: any): Promise<any> {
        // let url = this.viewCreateSqlUrl.replace('{id}', param);
        let url = this.httpService.getDataUrl(this.viewCreateSqlUrl, {id: param});
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 影响分析
     * @param param
     * @returns {Promise<any>}
     */
    async getInfluenceList (param?: any): Promise<any> {
        // let url = this.getInfluenceUrl.replace('{sourceId}', param.sourceId);
        let url = this.httpService.getDataUrl(this.getInfluenceUrl, {sourceId: param.sourceId});

        return await this.httpService.get(url).toPromise();
    }

    /**
     * SQL建表
     * @param param
     * @returns {Promise<any>}
     */
    async addTableBySql (param?: any): Promise<any> {
        return await this.httpService.postByJSON(this.createTableBySqlUrl, param).toPromise();
    }

    /**
     * 获取检查列表
     * @param param
     * @returns {Promise<any>}
     */
    async getCheckList (param?: any): Promise<any> {
        // let url = this.getCheckListUrl.replace('{pageNum}', param.pageNum);
        // url = url.replace('{pageSize}', param.pageSize) + `?keyword=${param.keyword}`;
        let url = this.httpService.getDataUrl(this.getCheckListUrl, {pageNum: param.pageNum, pageSize: param.pageSize});
        url = this.httpService.getSearchDataUrl(url, {keyword: param.keyword});

        return await this.httpService.get(url).toPromise();
    }

    /**
     * 搜索表列表页 dirId=1&dsId=**&pageNum=1&pageSize=5
     * @param param
     * @returns {Promise<any>}
     */
    async getmetaTableByTag (param?: any): Promise<any> {
        let url = this.metaTableByTagUrl;
        return await this.httpService.postByJSON(url, param).toPromise();
    }

    /**
     * 获取表详情
     * @param param
     * @returns {Promise<any>}
     */
    async getTableDetial (param?: any): Promise<any> {
        // let url = this.getTableDetialUrl.replace('{id}', param.id);
        let url = this.httpService.getDataUrl(this.getTableDetialUrl, {id: param.id});
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 获取表详情
     * @param param
     * @returns {Promise<any>}
     */
    async getSplitBy (param?: any): Promise<any> {
        let url = this.httpService.getDataUrl(this.getSplitByUrl, {tableId: param.id});

        return await this.httpService.get(url).toPromise();
    }

    /**
     * 获取所有数据源
     * @returns {Promise<any>}
     */
    async getAllSource (): Promise<any> {
        return await this.httpService.get(this.getAllSourceUrl).toPromise();
    }

    /**
     * 获取所有字段类型
     * @returns {Promise<any>}
     */
    async getAllFileType (): Promise<any> {
        return await this.httpService.get(this.getAlldictsUrl).toPromise();
    }

    /**
     * 获取所有规则接口（不分页）
     * @returns {Promise<any>}
     */
    async getAllRuleList (param: any): Promise<any> {
        let url = this.httpService.getDataUrl(this.getAllRuleListUrl, {actOn: param.actOn});
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 新建/编辑检查配置
     * @param param
     * @returns {Promise<any>}
     */
    async buildCheck (param?: any): Promise<any> {
        return await this.httpService.postByJSON(this.buildCheckUrl, param).toPromise();
    }

    /**
     * 编辑检查配置
     * @param param
     * @returns {Promise<any>}
     */
    async editCheck (param?: any): Promise<any> {
        return await this.httpService.postByJSON(this.editCheckUrl, param).toPromise();
    }

    /**
     * 获取表检查配置详情
     * @param param
     * @returns {Promise<any>}
     */
    async getFormDetail (param?: any): Promise<any> {
        // let url = this.getFormCheckUrl.replace('{id}', param.id);
        let url = this.httpService.getDataUrl(this.getFormCheckUrl, {id: param.id});
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 删除表的检查配置
     * @param param
     * @returns {Promise<any>}
     */
    async deleteFormCheck (param?: any): Promise<any> {
        // let url = this.deleteFormCheckUrl.replace('{id}', param);
        let url = this.httpService.getDataUrl(this.deleteFormCheckUrl, {id: param});
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 获取检查报告列表
     * @param param
     * @returns {Promise<any>}
     */
    async getCheckReport (param?: any): Promise<any> {
        let url = this.httpService.getDataUrl(this.getCheckReportUrl, param);
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 执行规则检查
     * @param param
     * @returns {Promise<any>}
     */
    async runRuleCheck (param?: any): Promise<any> {
        // let url = this.runRuleCheckUrl.replace('{id}', param.id);
        let url = this.httpService.getDataUrl(this.runRuleCheckUrl, {id: param.id});
        return await this.httpService.postByJSON(url, param).toPromise();
    }

    /**
     * 可视化建表
     * @param param
     * @returns {Promise<any>}
     */
    async addVisualizationTable (param?: any): Promise<any> {
        return await this.httpService.postByJSON(this.addVisualizationTableUrl, param).toPromise();
    }

    /**
     * 可视化建表编辑保存
     * @param param
     * @returns {Promise<any>}
     */
    async eidtVisualizationTable (param?: any): Promise<any> {
        return await this.httpService.postByJSON(this.editVisualizationTableUrl, param).toPromise();
    }

    /**
     * 来源分析（获取表的来源画布信息）血缘分析
     * @param param
     * @returns {Promise<any>}
     */
    async getSourceCanvas (param?: any): Promise<any> {
        // let url = this.getSourceCanvasUrl.replace('{tableId}', param.tableId);
        let url = this.httpService.getDataUrl(this.getSourceCanvasUrl, {tableId: param.tableId});
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 保存指定表的来源信息（血缘分析）
     * @param param
     * @returns {Promise<any>}
     */
    async saveSourceCanvas (param?: any): Promise<any> {
        // let url = this.getSourceCanvasUrl.replace('{tableId}', param.tableId);
        let url = this.httpService.getDataUrl(this.getSourceCanvasUrl, {tableId: param.tableId});

        return await this.httpService.postByJSON(url, param).toPromise();
    }

    /**
     * 查询全部关系 血缘分析
     * @param params
     * @returns {Promise<any>}
     */
    async getAllRelation (params?: any): Promise<any> {
        let url = this.httpService.getSearchDataUrl(this.getAllRelationUrl, params);
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 删除关系 血缘分析
     * @param param
     * @returns {Promise<any>}
     */
    async deleteRelations (param: any): Promise<any> {
        return await this.httpService.postByJSON(this.deleteRelationsUrl, param).toPromise();
    }

    /**
     * 新增关系 血缘分析
     * @param param
     * @returns {Promise<any>}
     */
    async saveRelations (param: any): Promise<any> {
        return await this.httpService.postByJSON(this.saveRelationsUrl, param).toPromise();
    }

    /**
     * 删除表
     * @param param
     * @returns {Promise<any>}
     */
    async deleteTable (param?: any): Promise<any> {
        // let url = this.deleteTableUrl.replace('{id}', param.id);
        let url = this.httpService.getDataUrl(this.deleteTableUrl, {id: param.id});

        return await this.httpService.delete(url).toPromise();
    }

    async getDataList (param?: any): Promise<any> {
        return await this.httpService.get(this.getDataListUrl).toPromise();
    }
    // 指标管理
    /**
     * 指标管理列表
     * @param param
     * @returns {Promise<any>}
     */
    async getNormList (param?: any): Promise<any> {
        let url = this.httpService.getDataUrl(this.normListUrl, {pageNum: param.pageNum, pageSize: param.pageSize});
        url = this.httpService.getSearchDataUrl(url, {keyword: param.keyword});
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 添加指标
     */
    async addNorm (param?: any): Promise<any> {
        return await this.httpService.postByJSON(this.addNormUrl, param).toPromise();
    }
    /**
     * 指标详情
     */
    async getNormDetail (param?: any): Promise<any> {
        let url = this.httpService.getDataUrl(this.detailNormUrl, param);
        return await this.httpService.get(url).toPromise();
    }
    /**
     * 修改指标
     */
    async editNorm (param?: any): Promise<any> {
        let url = this.httpService.getDataUrl(this.editNormUrl, {id: param.id});
        return await this.httpService.putByJSON(url, param).toPromise();
    }
    /**
     * 删除指标
     */
    async deleteNorm (param?: any): Promise<any> {
        let url = this.httpService.getDataUrl(this.deleteNormUrl, param);
        return await this.httpService.delete(url).toPromise();
    }
    /**
     * sql预览
     */
    async previewSql (param?: any): Promise<any> {
        return await this.httpService.postByJSON(this.sqlPreviewUrl, param).toPromise();
    }

    /**
     * 根据目录id查询表报告
     * @param param
     * @returns {Promise<any>}
     */
    async getTableReport (param?: any): Promise<any> {
        let url = this.httpService.getDataUrl(this.getTableReportUrl, param);
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 删除作业
     * @param param
     * @returns {Promise<any>}
     */
    async deleteReport (param?: any): Promise<any> {
        let url = this.httpService.getDataUrl(this.deleteTableReportUrl, param);
        return await this.httpService.delete(url).toPromise();
    }

    /**
     * 根据报告id查询报告详情
     * @param param
     * @returns {Promise<any>}
     */
    async getReportDetail (param?: any): Promise<any> {
        let url = this.httpService.getDataUrl(this.getReportDetailUrl, param);
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 获取字段信息
     * @param param
     * @returns {Promise<any>}
     */
    async getTableField (param?: any): Promise<any> {
        let url = this.httpService.getDataUrl(this.getTableFieldUrl, param);
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 保存表分析作业
     * @param param
     * @returns {Promise<any>}
     */
    async saveTableAnalysis (param?: any): Promise<any> {
        return await this.httpService.postByJSON(this.saveTableAnalysisUrl, param).toPromise();
    }
    /**
     * 根据表id获取表分析作业
     * @param param
     * @returns {Promise<any>}
     */
    async getTableAnalysis (param?: any): Promise<any> {
        let url = this.httpService.getDataUrl(this.getTableAnalysisUrl, param);
        return await this.httpService.get(url).toPromise();
    }
    /**
     * 获取作业详情
     * @param param
     * @returns {Promise<any>}
     */
    async getAnalysisDetail (param?: any): Promise<any> {
        let url = this.httpService.getDataUrl(this.analysisDetailUrl, param);
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 提交作业（运行）
     * @param param
     * @returns {Promise<any>}
     */
    async submitAnalysis (param?: any): Promise<any> {
        let url = this.httpService.getDataUrl(this.submitAnalysisUrl, param);
        return await this.httpService.postByJSON(url, param).toPromise();
    }

    /**
     * 根据作业任务id获取运行历史
     * @param param
     * @returns {Promise<any>}
     */
    async getHistoryList (param?: any): Promise<any> {
        let url = this.httpService.getDataUrl(this.getHistoryListUrl, param);
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 获取运行历史详情
     */
    async getHistoryDetail (param?: any): Promise<any> {
        let url = this.httpService.getDataUrl(this.getHistoryDetailUrl, param);
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 获取稽核任务详情
     */
    async getdataAuditDetail (param?: any): Promise<any> {
        let url = this.httpService.getDataUrl(this.getdataAuditDetailUrl, param);
        return await this.httpService.get(url).toPromise();
    }

    /******  数据稽核 ******/
    /**
     * 获取稽核目录
     * @param param  parentId
     * @returns {Promise<any>}
     */
    async getAuditDirectoryTree (param?: any): Promise<any> {
        let url = this.httpService.getDataUrl(this.auditDirectoryUrl, param);
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 新增目录
     * @param param
     * @returns {Promise<any>}
     */
    async addAuditDirectory (param?: any): Promise<any> {
        return await this.httpService.postByJSON(this.addAuditDirectoryUrl, param).toPromise();
    }
    /**
     * 编辑稽核目录
     */
    async editAuditDirectory (param?: any): Promise<any> {
        return await this.httpService.putByJSON(this.editAuditDirectoryUrl, param).toPromise();
    }

    /**
     * 根据数据源获取对应指标列表
     */
    async getNormListByDsId (param?: any): Promise<any> {
        let url = this.httpService.getDataUrl(this.getNormListByDsIdUrl, param);
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 删除目录
     * id
     */
    async deleteAuditDirectory (param?: any): Promise<any> {
        let url = this.httpService.getDataUrl(this.deleteAuditDirectoryUrl, param);
        return await this.httpService.delete(url).toPromise();
    }
    /**
     * 新增稽核任务
     * @param param
     * @returns {Promise<any>}
     */
    async addAuditTask (param?: any): Promise<any> {
        return await this.httpService.postByJSON(this.addAuditTaskUrl, param).toPromise();
    }
    /**
     * 编辑稽核任务
     */
    async editAuditTask (param?: any): Promise<any> {
        return await this.httpService.putByJSON(this.editAuditTaskUrl, param).toPromise();
    }

    /**
     * 修改任务名字
     */
    async changeAuditTaskName (param?: any): Promise<any> {
        return await this.httpService.putByJSON(this.changeAuditTaskNameUrl, param).toPromise();
    }

    /**
     * 删除稽核任务
     *  id
     */
    async deleteAuditTask (param?: any): Promise<any> {
        let url = this.httpService.getDataUrl(this.deleteAuditTaskUrl, param);
        return await this.httpService.delete(url).toPromise();
    }

    /**
     * 获取运行历史
     * configId    pageNum  pageSize
     */
    async getAuditRunHistoryList (param?: any): Promise<any> {
        let url = this.httpService.getDataUrl(this.runHistoryUrl, param);
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 删除运行历史
     * id
     */
    async deleteAuditRunHistory (param?: any): Promise<any> {
        let url = this.httpService.getDataUrl(this.deleteRunHistoryUrl, param);
        return await this.httpService.delete(url).toPromise();
    }

    /**
     * 保存稽核配置信息
     */
    async saveDataAudit (param?: any): Promise<any> {
        return await this.httpService.putByJSON(this.saveDataAuditUrl, param).toPromise();
    }
    /**
     * 立即执行
     */
    async auditRunNow (param?: any): Promise<any> {
        let url = this.httpService.getDataUrl(this.runNowUrl, {id: param.id});
        return await this.httpService.postByJSON(url, param).toPromise();
    }
    /**
     * 获取函数模板
     */
    async getFunctionModal (param?: any): Promise<any> {
        let url = this.httpService.getSearchDataUrl(this.functionModalUrl, param);
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 通过指标获取字段信息接口
     * normId
     */
    async getFieldMessage (param?: any): Promise<any> {
        let url = this.httpService.getDataUrl(this.fieldMessageUrl, param);
        return await this.httpService.get(url).toPromise();
    }
}
