import {Injectable} from '@angular/core';
import {HttpService} from '../../frontend-common/ts_modules/services/http.service';

@Injectable()
export class WorkflowService {
    // 工作流管理 start
    // 目录树
    // treeListUrl = '/dispatch-platform/folder/getFoler';
    treeListUrl = 'dispatch-platform/folder/loadChildrenFolder';
    // 新增目录
    addTreeDirectoryUrl = '/dispatch-platform/folder/addFolder';
    // 新增工作流
    addTreeWorkUrl = '/dispatch-platform/flow/changeSaveFlowInfo';
    // 删除目录
    deleteTreeUrl = '/dispatch-platform/folder/removeFolder';
    // 修改更新目录
    updateTreeUrl = '/dispatch-platform/folder/update';
    // 关键字查询
    searchTreeUrl = '/dispatch-platform/folder/filterName';
    // 触发器
    saveTriggerUrl = '/dispatch-platform/flow/updateFlowInfo';
    // 获取任务信息
    getTaskInfoUrl = '/dispatch-platform/flow/getDags?flowId={flowId}';
    // 保存工作流任务信息
    saveTasksUrl = '/dispatch-platform/job/update/multTask';
    // 上传shell文件
    uploadShellUrl = this.httpService.getRealUrl('/dispatch-platform/file/save');

    // 外部任务获取系统名称集合
    getSystemNamesUrl = '/dispatch-platform/ExternalSystem/getAllExternalSystem';
    // 外部任务获取任务集合
    getExteriorTasksUrl = '/dispatch-platform/ExternalSystem/getStructureInfo';


    // 获取运行结果列表
    resultListUrl = '/dispatch-platform/flow/getFlowRunStatInfo';
    // 运行结果列表子项
    childResultUrl = '/dispatch-platform/flowCompute/resultList';

    // 获取工作流运行历史
    getFlowRunHistoryUrl = '/dispatch-platform/flow/getFlowRunHistoryDetailInfo';
    // 运行工作流(加入到调度系统而已)
    runWorkflowUrl = '/dispatch-platform/flow/startFlow';

    // 立即运行
    runNowWorkflowUrl = '/dispatch-platform/flow/runOrAddRunFlowNow';
    // 暂停工作流
    stopWorkflowUrl = '/dispatch-platform/flow/pauseFlow';
    // 获取工作流下面单个任务详情
    postSingleFlowUrl = '/dispatch-platform/flowCompute/getFlowComputeByExeId';
    // 取消删除工作流
    deleteWorkflowUrl = '/dispatch-platform/flow/deleteFlow';
    // 激活工作流
    activateWorkflowUrl = '/dispatch-platform/flow/enabledFlow';

    // 获取节点列表
    getNodeListUrl = '/dispatch-platform/agent/agentinfos';
    // 节点编辑保存
    updateNodeUrl = '/dispatch-platform/agent/update';

    // 下载日志
    downLoadLogUrl = '/dispatch-platform/file/downloadLogFile';

  constructor(private httpService: HttpService) {}

    /**
     * 获取目录树
     */
    async getTreeList(param?: any): Promise<any> {
        let url = this.treeListUrl + `?pId=${param.pId}`;
        // let url = this.httpService.getSearchDataUrl(this.treeListUrl, param);
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 筛选目录
     */
    async searchTreeList(param?: any): Promise<any> {
        // let url = this.searchTreeUrl + `?param=${param.name}`;
        let url = this.httpService.getSearchDataUrl(this.searchTreeUrl, param);
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 新增目录
     */
    async addTreeDirectory(param?: any): Promise<any> {
        return await this.httpService.postByJSON(this.addTreeDirectoryUrl, param).toPromise();
    }

    /**
     * 新增工作流
     */
    async addTreeWork(param?: any): Promise<any> {
        return await this.httpService.post(this.addTreeWorkUrl, param).toPromise();
    }

    /**
     * 修改目录
     */
    async updateTree(param?: any): Promise<any> {
        return await this.httpService.postByJSON(this.updateTreeUrl, param).toPromise();
    }

    /**
     * 删除目录
     */
    async deleteTree(param?: any): Promise<any> {
        // let url = this.deleteTreeUrl + `?id=${param.id}`;
        let url = this.httpService.getSearchDataUrl(this.deleteTreeUrl, param);
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 触发器保存
     */
    async saveTrigger(param?: any): Promise<any> {
        return await this.httpService.postByJSON(this.saveTriggerUrl, param).toPromise();
    }

    /**
     * 获取任务信息
     */
    async getTaskInfo(param?: any): Promise<any> {
        // let url = this.getTaskInfoUrl.replace('{flowId}', param.flowId);
        let url = this.httpService.getDataUrl(this.getTaskInfoUrl, {flowId: param.flowId});
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 保存工作流画布配置信息
     */
    async saveTasks(param?: any): Promise<any> {
        return await this.httpService.postByJSON(this.saveTasksUrl, param).toPromise();
    }

    /**
     * 外部任务获取系统名称集合
     */
    async getExteriorsystemNames(param?: any): Promise<any> {
        return await this.httpService.get(this.getSystemNamesUrl).toPromise();
    }

    /**
     * 外部任务获取任务结构集合
     */
    async getExteriorsystemTasks(param?: any): Promise<any> {
        // let url = this.getExteriorTasksUrl + `?treeUrl=${param.treeUrl}&id=${param.id}&flowId=${param.flowId}`;
        let url = this.httpService.getSearchDataUrl(this.getExteriorTasksUrl, param);
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 运行结果列表
     * @param param
     * @returns {Promise<any>}
     */
    async getResultList (param?: any): Promise<any> {
        let url = this.httpService.getSearchDataUrl(this.resultListUrl, param);
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 运行结果列表子项
     * @param param
     * @returns {Promise<any>}
     */
    async getChildResultList (param?: any): Promise<any> {
        return await this.httpService.postByJSON(this.childResultUrl, param).toPromise();
    }

    /**
     * 获取工作流运行历史
     */
    async getFlowRunHistory (param?: any): Promise<any> {
        // let url = this.getFlowRunHistoryUrl + '?flowId=' + param.flowId + '&exeId=' + param.exeId;
        let url = this.httpService.getSearchDataUrl(this.getFlowRunHistoryUrl, param);
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 执行工作流(加入调度而已)
     */
    async runWorkflow (param?: any): Promise<any> {
        // let url = this.runWorkflowUrl + '?flowId=' + param.flowId;
        let url = this.httpService.getSearchDataUrl(this.runWorkflowUrl, param);
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 立即运行
     */
    async runNowWorkflow (param?: any): Promise<any> {
        let url = this.httpService.getSearchDataUrl(this.runNowWorkflowUrl, param);
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 暂停工作流
     */
    async stopWorkflow (param?: any): Promise<any> {
        let url = this.stopWorkflowUrl + `?flowId=${param.flowId}&flowName=${param.flowName}`;
        // let url = this.httpService.getSearchDataUrl(this.stopWorkflowUrl, param);
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 获取工作流下单个任务详情
     */
    async getSingleFlow (param?: any): Promise<any> {
        return await this.httpService.postByJSON(this.postSingleFlowUrl, param).toPromise();
    }

    /**
     * 获取节点列表
     */
    async getNodeList (param?: any): Promise<any> {
        return await this.httpService.get(this.getNodeListUrl).toPromise();
    }

    /**
     * 编辑保存单个节点
     */
    async updateNode (param?: any): Promise<any> {
        return await this.httpService.postByJSON(this.updateNodeUrl, param).toPromise();
    }

    /**
     * 取消删除工作流
     */
    async deleteWorkflow (param?: any): Promise<any> {
        let url = this.httpService.getSearchDataUrl(this.deleteWorkflowUrl, param);
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 激活工作流
     */
    async activateWorkflow (param?: any): Promise<any> {
        let url = this.httpService.getSearchDataUrl(this.activateWorkflowUrl, param);
        return await this.httpService.get(url).toPromise();
    }
}
