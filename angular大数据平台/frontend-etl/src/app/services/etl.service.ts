import {Injectable} from '@angular/core';

import {HttpService} from 'frontend-common/ts_modules/services/http.service';
import {ancestorWhere} from 'tslint';

@Injectable()
export class EtlService {
    // 获取算子列表接口
    getAllModulesUrl = '/etl/schedulTask/getAllModules';
    // 获取目录结构
    queryAllFlowProjectUrl = '/etl/flowProject/queryAllFlowProject/{parentId}';
    // 新建配置任务
    addNodeTaskUrl = '/etl/schedulTask/addNodeTask';
    // 根据TaskId获取任务信息
    getTaskInfoUrl = '/etl/schedulTask/getTaskInfo/{taskId}';
    // 新建调度任务目录
    addFlowProjectUrl = '/etl/flowProject/addFlowProject';
    // 删除调度任务目录
    delFlowProjectUrl = '/etl/flowProject/delFlowProject/{id}';
    // 修改目录信息
    updateFlowProjectUrl = '/etl/flowProject/updateFlowProject';
    // 保存etl配置信息
    saveEtlConfigUrl = '/etl/schedulTask/saveEtlConfig';
    // 删除任务
    delNodeTaskUrl = '/etl/schedulTask/delNodeTask/{taskId}';
    // 提交任务
    submitTaskUrl= '/etl/schedulTask/submitTask/{taskId}';
    // 上传文件到HDFS接口
    uploadFileToHDFSUrl = '/etl/schedulTask/{taskId}/uploadFileToHDFS?hdfsUrl={url}';
    // 修改调度任务基本信息
    updateTaskBasicInfoUrl = '/etl/schedulTask/updateTaskBasicInfo';
    // 非结构化数据字段信息获取
    getUnstructuredDataFiledUrl = '/etl/databaseTable/getUnstructuredDataFiled';

    constructor(private httpService: HttpService) {}

    /**
     * 获取算子列表接口
     * @returns {Promise<any>}
     */
    async getAllModules (): Promise<any> {
        return await this.httpService.get(this.getAllModulesUrl).toPromise();
    }

    /**
     * 获取目录结构
     * @param {string} parentId
     * @param {string} search
     * @returns {Promise<any>}
     */
    async getQueryAllFlowProject (parentId: string, search?: string): Promise<any> {
        let url = this.httpService.getDataUrl(this.queryAllFlowProjectUrl, {parentId});
        if (search) {
            url = this.httpService.getSearchDataUrl(url, {search});
        }
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 新建配置任务
     * @param params
     */
    async addNodeTask(params: any): Promise<any> {
        return await this.httpService.postByJSON(this.addNodeTaskUrl, params).toPromise();
    }

    /**
     * 新建调度任务目录
     * @param params
     * @returns {Promise<any>}
     */
    async addFlowProject(params: any): Promise<any> {
        return await this.httpService.postByJSON(this.addFlowProjectUrl, params).toPromise();
    }

    /**
     * 删除调度任务目录
     * @param {string} id
     * @returns {Promise<any>}
     */
    async delFlowProject(id: string): Promise<any> {
        let url = this.httpService.getDataUrl(this.delFlowProjectUrl, {id});
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 修改目录信息
     * @param params
     * @returns {Promise<any>}
     */
    async updateFlowProject(params: any): Promise<any> {
        return await this.httpService.postByJSON(this.updateFlowProjectUrl, params).toPromise();
    }


    /**
     * 根据TaskId获取任务信息
     * @param {string} taskId
     * @returns {Promise<any>}
     */
    async getTaskInfo(taskId: string): Promise<any> {
        let url = this.httpService.getDataUrl(this.getTaskInfoUrl, {taskId});
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 保存etl配置信息
     * @param params
     * @returns {Promise<any>}
     */
    async saveEtlConfig(params: any): Promise<any> {
        return await this.httpService.postByJSON(this.saveEtlConfigUrl, params).toPromise();
    }

    /**
     * 根据TaskId删除任务
     * @param {string} taskId
     * @returns {Promise<any>}
     */
    async delNodeTask(taskId: string): Promise<any> {
        let url = this.httpService.getDataUrl(this.delNodeTaskUrl, {taskId});
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 提交任务
     * @param {string} taskId
     * @returns {Promise<any>}
     */
    async submitTask(taskId: string): Promise<any> {
        let url = this.httpService.getDataUrl(this.submitTaskUrl, {taskId});
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 修改调度任务基本信息
     * @param params
     * @returns {Promise<any>}
     */
    async updateTaskBasicInfo(params: any): Promise<any> {
        return await this.httpService.postByJSON(this.updateTaskBasicInfoUrl, params).toPromise();
    }

    /**
     * 获取非结构化数据
     * @returns {Promise<any>}
     */
    async getUnstructuredDataFiled(): Promise<any> {
        return await this.httpService.get(this.getUnstructuredDataFiledUrl).toPromise();
    }

}
