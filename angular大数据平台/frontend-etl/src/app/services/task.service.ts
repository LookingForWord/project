import {Injectable} from '@angular/core';
import {HttpService} from 'frontend-common/ts_modules/services/http.service';
/**
 * Created by LIHUA on 2017-08-09.
 */

@Injectable()
export class TaskService {
    // 1.获取首页的图表数据
    indexSourceUrl = '/rest/count/getIndexCount';
    // 首页统计的数据
    indexTotalUrl = '/rest/dbgm/datasources/getEtlIndexCount';

    // 获取数据类型列表数据
    getSourcsTypeUrl = '/rest/dict/getAllDict/{type}';
    // 获取工作流目录
    queryAllFlowProjectUrl = '/rest/flowProject/queryAllFlowProject/{type}/{projectId}';
    // 新增工作流目录
    addFlowProjectUrl = '/rest/flowProject/addFlowProject';
    // 删除工作流目录
    deleteFlowInfoUrl = '/rest/flowProject/delFlowProject/{id}';
    // 编辑工作流目录
    editFlowInfoUrl = '/rest/flowProject/updateFlowProject';
    // 添加调度任务
    addFlowTaskUrl = '/rest/flowInfo/addFlowInfo';
   // 删除调度任务
    deleteFlowTaskUrl = '/rest/flowInfo/delFlowInfo/{id}';
    // 目录点击右键编辑调度任务详情
    editFlowTaskUrl = '/rest/flowInfo/updateFlow';
    // 获取调度任务详情
    updateFlowTaskStatusUrl = '/rest/flowInfo/updateFlowInfoStatus/{id}/{status}';
    // 4.12 获取组件（插件）列表
    findAllModuleByPidUrl = '/rest/schedulTask/findAllModuleByPid/{parentId}';
    // 4.13 新建节点
    addNodeTaskUrl = '/rest/schedulTask/addNodeTask';
    // 4.14删除节点
    delNodeTaskUrl = '/rest/schedulTask/delNodeTask/{id}';
    // 4.7获取调度任务详情
    getFlowInfoByIdUrl = '/rest/flowInfo/getFlowInfo/{id}/{type}';
    // 4.8修改调度任务
    updateFlowInfoUrl = '/rest/flowInfo/updateFlowInfo';
    // 4.15保存etl配置
    saveEtlConfigUrl = '/rest/schedulTask/saveEtlConfig';
    // 4.11获取字段信息
    getTableFieldUrl = '/rest/dbgm/metaTable/getTableFields/{tableId}';

    // 导入地址
    importUrl = this.httpService.getServerUrl() + '/rest/flowInfo/import?projectId=';
    // 导出地址
    exportUrl = '/rest/flowInfo/export/{id}/{type}';
    // 提交地址
    submitFlowUrl = '/rest/flowInfo/submitFlow/{flowId}/{userId}';

    // 插件配置 上传jar包
    uploadJarUrl = this.httpService.getServerUrl() + '/rest/schedulTask/uploadJar';
    // 插件配置 获取配置信息
    taskPlugConfigUrl = '/rest/schedulTask/taskPlugConfig/{plugId}';
    // 插件配置 更新配置 不包括重传jar包
    taskPlugUpdateUrl = '/rest/schedulTask/taskPlug/update';
    // hdfs类型 上传文件
    uploadFileToHDFSUrl = this.httpService.getServerUrl() + '/rest/schedulTask/{flowId}/uploadFileToHDFS?hdfsUrl={url}';

    // 获取目标表分区字段信息
    getPartitionFieldUrl = '/rest/schedulTask/getPartitionField/{baseConfigId}/{tableName}';

    // ftp和hdfs查询header信息
    getSourceFieldsUrl = '/rest/schedulTask/source/fields';

    // 解析select语句 任务配置 源表直接写sql
    getFieldsBySqlUrl = '/rest/schedulTask/getFieldsBySql';

    // 非结构化数据字段信息获取
    getUnstructuredDataFiledUrl = '/rest/databaseTable/getUnstructuredDataFiled';

    constructor(private httpService: HttpService) {}

    /**
     * 获取首页图表数据
     * @returns {Promise<any>}
     */
    async getIndexSources (): Promise<any> {
        return await this.httpService.get(this.indexSourceUrl).toPromise();
    }

    /**
     * 获取首页统计数据
     * @returns {Promise<any>}
     */
    async getIndexTotal (): Promise<any> {
        return await this.httpService.get(this.indexTotalUrl).toPromise();
    }

    /**
     * 根据id获取数据源类型数据
     * @param param
     * @returns {Promise<any>}
     */
    async getSourcsType (param?: any): Promise<any> {
        // let url = this.getSourcsTypeUrl.replace('{type}', param);
        let url = this.httpService.getDataUrl(this.getSourcsTypeUrl,
            {type: param});
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 获取工作流目录
     * @param param
     * @returns {Promise<any>}
     */
    async getFlowInfo (param?: any): Promise<any> {
        let url = this.httpService.getDataUrl(this.queryAllFlowProjectUrl, {type: param.type, projectId: param.projectId});
        url = this.httpService.getSearchDataUrl(url, {keyword: param.keyword});
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 添加工作流目录
     * @param param
     * @returns {Promise<any>}
     */
    async addFlow (param?: any): Promise<any> {
        return await this.httpService.postByJSON(this.addFlowProjectUrl, param).toPromise();
    }

    /**
     * 删除工作流目录
     * @param param
     * @returns {Promise<any>}
     */
    async  deleteFlowCatalog (param?: any): Promise<any> {
        // let url = this.deleteFlowInfoUrl.replace('{id}', param);
        let url = this.httpService.getDataUrl(this.deleteFlowInfoUrl,
            {id: param});
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 编辑工作流目录
     * @param param
     * @returns {Promise<any>}
     */
    async editFlowCatalog (param?: any): Promise<any> {
        return await this.httpService.postByJSON(this.editFlowInfoUrl, param).toPromise();
    }

    /**
     * 新增调度任务
     * @param param
     * @returns {Promise<any>}
     */
    async addFlowTask (param?: any): Promise<any> {
        return await this.httpService.postByJSON(this.addFlowTaskUrl, param).toPromise();
    }

    /**
     * 4.12 获取组件（插件）列表
     * @param parentId
     * @returns {Promise<any>}
     */
    async findAllModuleByPid(parentId: any): Promise<any> {
        // let url = this.findAllModuleByPidUrl.replace('{parentId}', parentId);
        let url = this.httpService.getDataUrl(this.findAllModuleByPidUrl,
            {parentId: parentId});
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 删除任务
     * @param param
     * @returns {Promise<any>}
     */
    async  deleteFlowTask (param?: any): Promise<any> {
        // let url = this.deleteFlowTaskUrl.replace('{id}', param);
        let url = this.httpService.getDataUrl(this.deleteFlowTaskUrl,
            {id: param});
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 4.13 新建节点
     * @param param
     * @returns {Promise<any>}
     */
    async addNodeTask(param: any): Promise<any> {
        return await this.httpService.postByJSON(this.addNodeTaskUrl, param).toPromise();
    }

    /**
     * 目录点击右键编辑任务
     * @param param
     * @returns {Promise<any>}
     */
    async editFlowTask (param?: any): Promise<any> {
        return await this.httpService.postByJSON(this.editFlowTaskUrl, param).toPromise();
    }

    /**
     * 修改任务状态
     * @param param
     * @returns {Promise<any>}
     */
    async updateFlowTaskStatus (param?: any): Promise<any> {
        // let url = this.updateFlowTaskStatusUrl.replace('{id}', param.Id);
        // url = url.replace('{status}', param.status);
        let url = this.httpService.getDataUrl(this.updateFlowTaskStatusUrl,
            {id: param.Id, status: param.status});
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 4.14删除节点
     * @param id
     * @returns {Promise<any>}
     */
    async delNodeTask (id: any): Promise<any> {
        // let url = this.delNodeTaskUrl.replace('{id}', id);
        let url = this.httpService.getDataUrl(this.delNodeTaskUrl,
            {id: id});
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 4.7获取调度任务详情
     * @param id
     * @param {string} type
     * @returns {Promise<any>}
     */
    async getFlowInfoById (id: any, type: string): Promise<any> {
        // let url = this.getFlowInfoByIdUrl.replace('{id}', id).replace('{type}', type);
        let url = this.httpService.getDataUrl(this.getFlowInfoByIdUrl,
            {id: id, type: type});
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 4.8修改调度任务
     * @param param
     * @returns {Promise<any>}
     */
    async updateFlowInfo (param?: any): Promise<any> {
        return await this.httpService.postByJSON(this.updateFlowInfoUrl, param).toPromise();
    }

    /**
     * 4.11获取字段信息
     * @param param
     * @returns {Promise<any>}
     */
    async getTableField (param?: any): Promise<any> {
        // let url = this.getTableFieldUrl.replace('{tableId}', param.tableId);
        let url = this.httpService.getDataUrl(this.getTableFieldUrl,
            {tableId: param.tableId});
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 4.15 保存etl配置信息
     * @param param
     * @returns {Promise<any>}
     */
    async saveEtlConfig (param?: any): Promise<any> {
        return await this.httpService.postByJSON(this.saveEtlConfigUrl, param).toPromise();
    }

    /**
     * 提交任务
     * @param {string} flowId
     * @param {string} userId
     * @returns {Promise<any>}
     */
    async getSubmitFlow (flowId: string, userId: string): Promise<any> {
        // let url = this.submitFlowUrl.replace('{flowId}', flowId);
        // url = url.replace('{userId}', userId);
        let url = this.httpService.getDataUrl(this.submitFlowUrl,
            {flowId: flowId, userId: userId});
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 获取插件配置信息
     * @param {string} plugId
     * @returns {Promise<any>}
     */
    async getTaskPlugConfig (plugId: string): Promise<any> {
        // let url = this.taskPlugConfigUrl.replace('{plugId}', plugId);
        let url = this.httpService.getDataUrl(this.taskPlugConfigUrl,
            {plugId: plugId});
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 更新插件配置
     * @param param
     * @returns {Promise<any>}
     */
    async taskPlugUpdate (param?: any): Promise<any> {
        return await this.httpService.postByJSON(this.taskPlugUpdateUrl, param).toPromise();
    }

    /**
     * 获取目标表分区字段信息
     * @param {string} baseConfigId
     * @param tableName
     * @returns {Promise<any>}
     */
    async getPartitionField (baseConfigId: string, tableName): Promise<any> {
        // let url = this.getPartitionFieldUrl.replace('{baseConfigId}', baseConfigId).
        // replace('{tableName}', tableName);
        let url = this.httpService.getDataUrl(this.getPartitionFieldUrl,
            {baseConfigId: baseConfigId, tableName: tableName});
        return await this.httpService.get(url).toPromise();
    }

    /**
     * fpt和hdfs获取header
     * @param param
     * @returns {Promise<any>}
     */
    async getSourceFields (param?: any): Promise<any> {
        return await this.httpService.postByJSON(this.getSourceFieldsUrl, param).toPromise();
    }

    /**
     * 解析select语句
     * @param param
     * @returns {Promise<any>}
     */
    async getFieldsBySql (param?: any): Promise<any> {
        return await this.httpService.postByJSON(this.getFieldsBySqlUrl, param).toPromise();
    }

    /**
     * 获取非结构化数据字段信息
     * @returns {Promise<any>}
     */
    async getUnstructuredDataFiled (): Promise<any> {
        return await this.httpService.get(this.getUnstructuredDataFiledUrl).toPromise();
    }

}
