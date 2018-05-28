import { Injectable } from '@angular/core';
import { HttpService } from 'frontend-common/ts_modules/services/http.service';

export const ServiceOrderByEnum = {
    create_time_desc: 'create_time_desc', // 创建时间
    create_time_asc: 'create_time_asc',
    access_count_desc: 'access_count_desc', // 访问量
    access_count_asc: 'access_count_asc'

}
@Injectable()
export class DataServeService {
    // 服务列表
    serveListUrl = '/data-serve/serveApi/listServeApis';
    // 新增服务
    addServeUrl = '/data-serve/serveApi/createServeApi';
    // 新增服务-获取标签列表
    addServe_getTagsArrayUrl = '/data-serve/serveApi/listServeTags';
    // 新增服务-获取系统列表+数据库列表
    addSerce_getSysListArrayUrl = '/data-serve/serveApi/listSystem';
    // 新增服务-获取表列表
    addSerce_getTableArrayUrl = '/data-serve/serveApi/getTablesBySystemAndDs'; // /{systemId}/{dsId}
    // 新增服务-根据表id获取字段信息
    addServe_getColumnByTableIdUrl = '/data-serve/serveApi/getColumnsByTableId'; // /{tableId}
    // 新增服务-根据表的信息获取标准sql
    addServe_getStdSqlByTablesInfoUrl = '/data-serve/serveApi/getSqlByParams';
    // 修改服务
    editServeUrl = '/data-serve/serveApi/updateServeApi';
    // 删除服务
    deleteServeUrl = '/data-serve/serveApi/deleteServeApi';
    // 根据id查看服务详情
    serveDetailUrl = '/data-serve/serveApi/selectServeApiById';

    // 服务申请记录
    applyHistoryListUrl = '/data-serve/manage/apply/selectAllApply';
    // 申请服务
    applyServeUrl = '/data-serve/manage/apply/addApply';
    // 取消申请
    cancelApplyUrl = '/data-serve/manage/apply/{id}/cancel';
    // 审批服务申请
    auditApplyUrl = '/data-serve/manage/apply/approve';
    // 服务审批记录
    aduitServeHistoryUrl = '/data-serve/manage/apply/listApproveServe';
    // 服务调用
    serveCallUrl = '/data-serve/api/{urlId}';
    // 查询公共服务列表
    publicServeListUrl = '/data-serve/serveApi/listPublicServeApis';

    constructor(private httpService: HttpService) { }

    /**
     * 获取服务列表
     * @param param
     * @returns {Promise<any>}
     */
    async getServeList(param: any): Promise<any> {
        let url = this.httpService.getSearchDataUrl(this.serveListUrl, param);
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 获取公共服务列表   （公共服务才能申请）
     */
    async getPublicServeList(param: any): Promise<any> {
        let url = this.httpService.getSearchDataUrl(this.publicServeListUrl, param);
        return await this.httpService.get(url).toPromise();
    }
    /**
     * 新增服务
     * @param param
     * @param params
     * @returns {Promise<any>}
     */
    async addServe(param: any): Promise<any> {
        // param['params'] =  JSON.stringify(params);
        return await this.httpService.postByJSON(this.addServeUrl, param).toPromise();
    }

    /**
     * 新增服务-获取标签列表
     */
    async addServe_getTagsArray(): Promise<any> {
        return await this.httpService.get(this.addServe_getTagsArrayUrl).toPromise();
    }

    /**
     * 新增服务-获取系统列表+数据库列表
     * @param param: object
     * @returns {Promise<any>}
     */
    async addServe_getSysList(): Promise<any> {
        return await this.httpService.get(this.addSerce_getSysListArrayUrl).toPromise();
    }
    /**
     * 新增服务-获取表列表
     * @param param: object
     * @returns {Promise<any>}
     */
    async addServe_getTableList(param: {
        systemId: string,
        dsId: string
    }): Promise<any> {
        let url = `${this.addSerce_getTableArrayUrl}/${param.systemId}/${param.dsId}`;
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 服务新增-根据表id获取字段信息
     */
    async addServe_getColumnByTableId(tableId: string): Promise<any>  {
        let url = `${this.addServe_getColumnByTableIdUrl}/${tableId}`;
        return await this.httpService.get(url).toPromise();
    }

     /**
     * 服务新增-根据表的信息获取标准sql
     */
    async addServe_getStdSqlByTablesInfo(_params: any): Promise<any> {
        let data = {
            params: _params
        };
        return await this.httpService.postByJSON(this.addServe_getStdSqlByTablesInfoUrl, data).toPromise();
    }


    /**
     * 编辑服务
     * @param param
     * @returns {Promise<any>}
     */
    async editServe(param?: any): Promise<any> {
        return await this.httpService.postByJSON(this.editServeUrl, param).toPromise();
    }

    /**
     * 编辑服务-根据id获取服务详情
     */
    async editServe_getServeDetailById(param: any): Promise<any> {
        let url = this.httpService.getSearchDataUrl(this.serveDetailUrl, param);
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 删除服务
     * @param param
     * @returns {Promise<any>}
     */
    async deleteServe(param?: any): Promise<any> {
        let url = this.httpService.getSearchDataUrl(this.deleteServeUrl, param);
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 申请服务
     * @param param
     * @returns {Promise<any>}
     */
    async applyServe(param?: any): Promise<any> {
        return await this.httpService.postByJSON(this.applyServeUrl, param).toPromise();
    }
    /**
     * 取消申请
     * @param param
     * @returns {Promise<any>}
     */
    async cancleApplyServe(param?: any): Promise<any> {
        let url = this.httpService.getDataUrl(this.cancelApplyUrl, {id: param.id});
        return await this.httpService.postByJSON(url, param).toPromise();
    }

    /**
     * 审批服务申请
     * @param param
     * @returns {Promise<any>}  applyHistoryListUrl
     */
    async auditServe(param?: any): Promise<any> {
        return await this.httpService.postByJSON(this.auditApplyUrl, param).toPromise();
    }
    /**
     * 服务申请记录
     * @param param  aduitServeHistoryUrl
     * @returns {Promise<any>}
     */
    async userApplyHistoryList(param?: any): Promise<any> {
        let url = this.httpService.getSearchDataUrl(this.applyHistoryListUrl, param);
        return await this.httpService.get(url).toPromise();
    }
    /**
     * 服务审批记录
     * @param param
     * @returns {Promise<any>}
     */
    async aduitServeHistoryList(param?: any): Promise<any> {
        let url = this.httpService.getSearchDataUrl(this.aduitServeHistoryUrl, param);
        return await this.httpService.get(url).toPromise();
    }
    /**
     * 服务调用
     * @param param
     * @returns {Promise<any>}
     */
    async serveCallList(param?: any): Promise<any> {
        let url = this.httpService.getDataUrl(this.serveCallUrl, param);
        url = this.httpService.getSearchDataUrl(url, {pageNum: param.pageNum, pageSize: param.pageSize});
        return await this.httpService.get(url).toPromise();
    }
}
