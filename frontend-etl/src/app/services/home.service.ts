import {Injectable} from '@angular/core';
import {HttpService} from 'frontend-common/ts_modules/services/http.service';
/**
 * Created by XMW on 2017-09-20.
 */

@Injectable()
export class HomeService {

    // 数据中心数据
    getDataCenterUrl = '/rest/dbgm/statistics/maininfo';
    // 数据中心查询数据项
    getDataItemUrl = '/rest/dbgm/statistics/dataitem/{categoryId}';
    // 数据中心数据集
    getDataSetUrl = '/rest/dbgm/statistics/dataset/{categoryId}';

    constructor(private httpService: HttpService) {}

    /**
     * 获取数据中心数据
     */
    async getDataCenter (): Promise<any> {
        return await this.httpService.get(this.getDataCenterUrl).toPromise();
    }

    /**
     * Bi数据中心获取数据集详细数据
     */
    async getDataSetList (param?: any): Promise<any> {
        // let url = this.getDataSetUrl.replace('{categoryId}', param.categoryId);
        let url = this.httpService.getDataUrl(this.getDataSetUrl, {categoryId: param.categoryId});
        return await this.httpService.get(url).toPromise();
    }

    /**
     * Bi数据中心获取数据项详情数据
     */
    async getDataItemList (param?: any): Promise<any> {
        // let url = this.getDataItemUrl.replace(
        // '{categoryId}', param.categoryId)
        // +`?pageNum=${param.pageNum}&pageSize=${param.pageSize}`;
        let url = this.httpService.getDataUrl(this.getDataItemUrl, {categoryId: param.categoryId});
        url = this.httpService.getSearchDataUrl(url, {pageNum: param.pageNum, pageSize: param.pageSize});
        return await this.httpService.get(url).toPromise();
    }
}
