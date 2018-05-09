import {Injectable} from '@angular/core';
import {HttpService} from 'frontend-common/ts_modules/services/http.service';
/**
 * Created by LIHUA on 2017-08-09.
 */

@Injectable()
export class OperationService {
    // 获取周期任务列表
    missionListUrl = '/rest/runRecord/queryAllRecord/{pageNum}/{pageSize}/{type}';

    // 获取周期任务子列表
    findChildListByPidUrl = '/rest/runRecord/findAllByPid/{pid}';

    // 运行日志
    runLogUrl = '/rest/runRecord/getLogByRunId/{runId}';

    // 弹出层数据预览
    dataPreviewUrl = '/rest/runRecord/preview/{runId}/{limit}';
    // 汇聚日志
    convergenceLogUrl = '/rest/runRecord/queryDataGather/{pageNum}/{pageSize}';

    // 实例任务列表
    instanceListUrl = '/rest/runRecord/queryAllFlow/{pageNum}/{pageSize}/{type}';

    // 开关实例任务
    openOrCloseUrl = '/rest/flowInfo/updateFlowInfoStatus/{id}/{status}/{userId}';

    // 获取系统操作日志
    actionLogUrl = '/rest/operateLog/queryAllLogs/{pageNum}/{pageSize}';
    // 获取流式任务的实时数据
    workflowLogUrl = '/rest/runRecord/monitoring/{flowId}/{time}';
    // 数据检查 流程图
    flowProcessUrl = '/rest/runRecord/localEtl/{flowId}';
    // 获取流式任务
    worflowListUrl = '/rest/runRecord/queryFlowTask/{pageNum}/{pageSize}';

    constructor(private httpService: HttpService) {}

    /**
     * 获取周期任务列表
     * @param param
     * @returns
     */
    async  getMissionList(param?: any): Promise<any> {
        // let url = this.missionListUrl.replace('{pageNum}', param.pageNum);
        // url = url.replace('{pageSize}', param.pageSize);
        // url = url.replace('{type}', param.type);
        // url = url + '?flowName=' + param.flowName;
        let url = this.httpService.getDataUrl(this.missionListUrl,
            {pageNum: param.pageNum, pageSize: param.pageSize, type: param.type});
        url = this.httpService.getSearchDataUrl(url, {flowName: param.flowName});

        // return await this.httpService.postByJSON(url).toPromise();
        return await this.httpService.get(url).toPromise();
    }
    /**
     * 获取任务子列表
     * @param param
     * @returns {Promise<any>}
     */
    async findChildListByPid(param?: any): Promise<any> {
        // let url = this.findChildListByPidUrl.replace('{pid}', param.pid);
        let url = this.httpService.getDataUrl(this.findChildListByPidUrl,
            {pid: param.pid});
        return await this.httpService.get(url).toPromise();
    }
    /**
     * 运行日志
     * @param param
     * @returns {Promise<any>}
     */
    async getRunLogByPid(param?: any): Promise<any> {
        // let url = this.runLogUrl.replace('{runId}', param.runId);
        let url = this.httpService.getDataUrl(this.runLogUrl,
            {runId: param.runId});
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 数据预览
     * @param param  limit 显示条数
     * @returns {Promise<any>}
     */
    async getDataPreviewList(param?: any): Promise<any> {
        // let url = this.dataPreviewUrl.replace('{runId}', param.runId);
        // url = url.replace('{limit}', param.limit);
        let url = this.httpService.getDataUrl(this.dataPreviewUrl,
            {runId: param.runId, limit: param.limit});
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 汇聚日志
     */
    async getConvergenceLog(param?: any): Promise<any> {
        // let url = this.convergenceLogUrl.replace('{pageNum}', param.pageNum);
        // url = url.replace('{pageSize}', param.pageSize);
        // url = param.configName ? (url + '?configName=' + param.configName) : url;
        let url = this.httpService.getDataUrl(this.convergenceLogUrl,
            {pageNum: param.pageNum, pageSize: param.pageSize});
        url = this.httpService.getSearchDataUrl(url, {configName: param.configName});


        return await this.httpService.get(url).toPromise();
    }

    /**
     * 实例任务列表
     */
    async getInstanceList(param?: any) {
        // let url = this.instanceListUrl.replace('{pageNum}', param.pageNum);
        // url = url.replace('{pageSize}', param.pageSize);
        // url = url.replace('{type}', param.type);
        // url = param.flowName ? (url + '?flowName=' + param.flowName) : url;
        let url = this.httpService.getDataUrl(this.instanceListUrl,
            {pageNum: param.pageNum, pageSize: param.pageSize, type: param.type});
        url = this.httpService.getSearchDataUrl(url, {flowName: param.flowName});

        return await this.httpService.get(url).toPromise();
    }

    /**
     * 开关实例任务
     */
    async changeInstance(param?: any) {
        // let url = this.openOrCloseUrl.replace('{id}', param.id);
        // url = url.replace('{status}', param.status);
        // url = url.replace('{userId}', param.userId);
        let url = this.httpService.getDataUrl(this.openOrCloseUrl,
            {id: param.id, status: param.status, userId: param.userId});
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 获取系统操作日志
     */
    async getActionLogList (param?: any) {
        // let url = this.actionLogUrl.replace('{pageNum}', param.pageNum);
        // url = url.replace('{pageSize}', param.pageSize);
        // url = (param.keyword ? url + `?keyword=${param.keyword}` : url) ;
        let url = this.httpService.getDataUrl(this.actionLogUrl,
            {pageNum: param.pageNum, pageSize: param.pageSize, type: param.type});
        url = this.httpService.getSearchDataUrl(url, {keyword: param.keyword});
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 流式任务实时监控数据
     */
    async getWorkflowLog (param?: any) {
        // let url = this.workflowLogUrl.replace('{flowId}', param.flowId);
        // url = url.replace('{time}', param.time);
        let url = this.httpService.getDataUrl(this.workflowLogUrl,
            {flowId: param.flowId, time: param.time});
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 数据检查流程图
     */
    async getTaskProcessData (param?: any) {
        // let url = this.flowProcessUrl.replace('{flowId}', param.flowId);
        let url = this.httpService.getDataUrl(this.flowProcessUrl,
            {flowId: param.flowId});
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 获取流式任务
     */
    async getWorkflowList (param?: any) {
        let url = this.httpService.getDataUrl(this.worflowListUrl,
            {pageNum: param.pageNum, pageSize: param.pageSize});
        url = this.httpService.getSearchDataUrl(url, {flowName: param.flowName});
        return await this.httpService.get(url).toPromise();
    }
}
