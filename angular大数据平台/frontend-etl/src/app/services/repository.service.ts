/**
 * Created by LIHUA on 2017-08-07.
 */
import {Injectable} from '@angular/core';
import {HttpService} from 'frontend-common/ts_modules/services/http.service';

@Injectable()
export class RepositoryService {
    // 获取仓库数据列表的接口
    // databasesUrl = '/rest/database/queryAllDatabase/{pageNum}/{pageSize}';
    // 获取数据仓库列表
    databasesUrl =  '/rest/dbgm/datasources/getRelationalSource/{pageNum}/{pageSize}';
    // 根据仓库ID获取仓库数据库的详情的接口
    // infoDatabaseUrl = '/rest/database/findDatabaseInfo/{id}';
    infoDatabaseUrl = '/rest/dbgm/datasources/{id}';
    // 根据数据源类型获取数据源
    getDataSourceMenuUrl = '/rest/dbgm/datasources/getByDsType/{dsType}';
    // 创建数据仓库 接口
    updataDsIntentUrl = '/rest/dbgm/datasources/updataDsIntent/{id}';
    // 创建保存数据仓库接口
    addDatabaseUrl = '/rest/database/addDatabase';
    // 编辑保存/删除数据仓库详情接口
    editDatabaseUrl = '/rest/database/updateDatabase';
    // 根据仓库id获取数据表列表的接口
    // databaseTableUrl = '/rest/databaseTable/queryAllTables/{pageNum}/{pageSize}';
    databaseTableUrl = 'rest/dbgm/metaTable/findMetaTableListByLabel';
    // 编辑Hive数据表详情的接口
    editDatabaseTableUrl = '/rest/databaseTable/updateTableInfo';
    // 根据表id获取数据表详细信息
    infoDatabaseTableUrl = '/rest/databaseTable/findTableInfo/{id}';


    // 创建保存Hive表的接口
    addTbaleUrl = '/rest/databaseTable/addTable';
    // 可视化建表
    addVisualizationTableUrl = '/rest/dbgm/metaTable/createTable';
    // 获取字段信息
    getfieldsUrl = '/rest/dbgm/metaTable/transColumnByDsType/{targetDsType}/{tableId}';
    // 改变Hive表格的状态
    updateTableStatusUrl = '/rest/databaseTable/updateTableStatus/{id}/{status}';
    // 数据仓库连接测试接口
    testDatabaseUrl = '/rest/database/connectionDatabaseTry';
    // 修改/创建数据表时获取字段信息下拉框列表
    getAllDictUrl= '/rest/dict/getAllDict/{type}';

    // 获取所有数据源
    getAlldictsUrl = '/rest/dbgm/dicts/list?dimCode=DB_TYPE';

    // 删除数据源
    deleteSourceUrl = '/rest/dbgm/datasources/delDataBase/{id}';
    // 获取数据源(调用数据治理接口)
    getDataSourceUrl = '/rest/dbgm/datasources/getByDsType/{dsType}';
    // 根据数据源id获取对应表信息
    getSourceTableUrl = '/rest/dbgm/datasources/{id}/tables';
    // 查询数据源类型
    searchSourceTypeUrl = '/rest/dbgm/dicts/list?dimCode=DB_TYPE';
    // 获取所有数据源
    getAllSourceUrl = '/rest/dbgm/datasources/getRelationalSource';
    // 连接测试数据源
    testSourcsUrl = '/rest/dbgm/datasources/contest';
    // 修改数据源
    editSourceUrl = '/rest/dbgm/datasources/{id}';
    // 数据汇聚执行
    dataConvergeUrl = '/rest/dataGather/executeDataGather';
    // 获取可视化表详情
    getTableDetialUrl = 'rest/dbgm/metaTable/findTableInfoById/{id}';

    // 数据中心数据
    getDataCenterUrl = '/rest/dbgm/statistics/maininfo';
    // 数据中心查询数据项
    getDataItemUrl = '/rest/dbgm/statistics/dataitem/{categoryId}';
    // 数据中心数据集
    getDataSetUrl = '/rest/dbgm/statistics/dataset/{categoryId}';


    constructor(private httpService: HttpService) {

    }

    /**
     * 获取仓库数据列表
     * @param param
     * @returns {Promise<any>}
     */
    async getDatabases (param?: any): Promise<any> {
        // let url = this.databasesUrl.replace('{pageNum}', param.pageNum);
        // url = url.replace('{pageSize}', param.pageSize);
        // url = param.keyword ? (url + `&keyword=${param.keyword}`) : url;
        let url = this.httpService.getDataUrl(this.databasesUrl,
            {pageNum: param.pageNum, pageSize: param.pageSize});
        url = this.httpService.getSearchDataUrl(url, {dsIntent: param.dsIntent, keyword: param.keyword});
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 根据数据源类型获取数据源
     */
    async getDataSourceMenus (param?: any): Promise<any> {
        // let url = this.getDataSourceMenuUrl.replace('{dsType}', param.dsType);
        let url = this.httpService.getDataUrl(this.getDataSourceMenuUrl, {dsType: param.dsType});

        return await this.httpService.get(url).toPromise();
    }
    /**
     * 根据数据源类型获取数据源
     */
    async updataDsIntent (param?: any): Promise<any> {
        // let url = this.updataDsIntentUrl.replace('{id}', param);
        let url = this.httpService.getDataUrl(this.updataDsIntentUrl, {id: param});

        return await this.httpService.get(url).toPromise();
    }

    /**
     * 根据数据源类型获取数据源(调用数据治理接口)
     */
    async getDataSource (param?: any): Promise<any> {
        // let url = this.getDataSourceUrl.replace('{dsType}', param.dsType);
        let url = this.httpService.getDataUrl(this.getDataSourceUrl,
            {dsType: param.dsType});
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 根据数据源id获取表(调用数据治理接口)
     */
    async getSourceTableList (param?: any): Promise<any> {
        // let url = this.getSourceTableUrl.replace('{id}', param.id);
        let url = this.httpService.getDataUrl(this.getSourceTableUrl,
            {id: param.id});
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 根据仓库ID获取仓库详情
     * @param param
     * @returns {Promise<any>}
     */
    async  infoDatabase (param?: any): Promise<any> {
        // let url = this.infoDatabaseUrl.replace('{id}', param);
        let url = this.httpService.getDataUrl(this.infoDatabaseUrl,
            {id: param});
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 创建保存数据仓库
     * @param param
     * @returns {Promise<any>}
     */
    async addDatabase (param?: any): Promise<any> {
        let url = this.addDatabaseUrl;
        return await this.httpService.postByJSON(url, {
            dbName: param.dbName,
            dbUrl: param.dbUrl,
            dbUser: param.dbUser,
            dbPassword: param.dbPassword,
            content: param.content,
            dbType: param.dbType
        }).toPromise();
    }

    /**
     * 修改保存数据仓库详情
     * @param param
     * @returns {Promise<any>}
     */
    async updateDatabaseStatus (param?: any): Promise<any> {
        let url = this.editDatabaseUrl;
        return await this.httpService.postByJSON(url, {
            id: param.id,
            dbName: param.dbName,
            dbUrl: param.dbUrl,
            dbUser: param.dbUser,
            dbPassword: param.dbPassword,
            content: param.content,
            dbType: param.dbType,
            status: param.status,
        }).toPromise();

    }

    /**
     * 根据仓库id获取数据表列表
     * @param param
     * @returns {Promise<any>}
     */
    async gatDatabaseTables (param?: any): Promise<any> {
        let url = this.databaseTableUrl;
        return await this.httpService.postByJSON(url, param).toPromise();


    }

    /**
     * 根据Hive表id获取数据表详情
     * @param param
     * @returns {Promise<any>}
     */
    async infoDatabaseTables (param?: any): Promise<any> {
        // let url = this.infoDatabaseTableUrl.replace('{id}', param.tbid);
        let url = this.httpService.getDataUrl(this.infoDatabaseTableUrl,
            {id: param.tbid});
        return await this.httpService.get(url).toPromise();

    }


    /**
     * 获取表详情
     */
    async getTableDetial (param?: any): Promise<any> {
        // let url = this.getTableDetialUrl.replace('{id}', param.id);
        let url = this.httpService.getDataUrl(this.getTableDetialUrl,
            {id: param.id});
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 创建Hive表
     * @param param
     * @returns {Promise<any>}
     */
    async addHiveTable (param?: any): Promise<any> {
        let url = this.addTbaleUrl;
        return await this.httpService.postByJSON(url, {
            dbId: param.dbId,
            tableName: param.tableName,
            isOutside: param.isOutside,
            storedPath: param.storedPath,
            content: param.content,
            fieldsDelimiter: param.fieldsDelimiter,
            storedFormat: param.storedFormat,
            columns: param.columns,
            partions: param.partions
        }).toPromise();
    }


    /**
     * 可视化建表
     */
    async addVisualizationTable (param?: any): Promise<any> {
        return await this.httpService.postByJSON(this.addVisualizationTableUrl, param).toPromise();
    }

    /**
     * 编辑保存Hive表详情
     * @param param
     * @returns {Promise<any>}
     */
    async editHiveTable (param?: any): Promise<any> {
        let url = this.editDatabaseTableUrl;
        return await this.httpService.postByJSON(url, {
            id: param.id,
            tableName: param.tableName,
            isOutside: param.isOutside,
            storedPath: param.storedPath,
            fieldsDelimiter: param.fieldsDelimiter,
            storedFormat: param.storedFormat,
            content: param.content,
            columns: param.columns,
            partions: param.partions
        }).toPromise();
    }

    /**
     * 根据Hive表id获取数据表详情
     * @param param
     * @returns {Promise<any>}
     */
    async updateTableStatus (param?: any): Promise<any> {
        // let url = this.updateTableStatusUrl.replace('{id}', param.tbid);
        // url = url.replace('{status}', param.tableStatus);
        let url = this.httpService.getDataUrl(this.updateTableStatusUrl,
            {id: param.tbid, status: param.tableStatus});
        return await this.httpService.get(url).toPromise();

    }
    /**
     * 根据表id和类型获取数据表字段信息
     * @param param
     * @returns {Promise<any>}
     */
    async getFields (param?: any): Promise<any> {
        // let url = this.getfieldsUrl.replace('{targetDsType}', param.targetDsType);
        // url = url.replace('{tableId}', param.tableId);
        let url = this.httpService.getDataUrl(this.getfieldsUrl,
            {targetDsType: param.targetDsType, tableId: param.tableId});
        return await this.httpService.get(url).toPromise();

    }

    /**
     * 测试数据仓库
     * @param param
     * @returns {Promise<any>}
     */
    async  testDatabase (param?: any): Promise<any> {
        return await this.httpService.postByJSON(this.testDatabaseUrl, param).toPromise();
    }

     /**
     * 获取字段类型列表
     * @param param
     * @returns {Promise<any>}
     */
    async getAllDict (param?: any): Promise<any> {
        // let url = this.getAllDictUrl.replace('{type}', param);
         let url = this.httpService.getDataUrl(this.getAllDictUrl,
             {type: param});
        return await this.httpService.get(url).toPromise();

    }
    /**
     * 获取所有字段类型
     */
    async getAllFileType (): Promise<any> {
        return await this.httpService.get(this.getAlldictsUrl).toPromise();
    }

    /**
     * 数据汇聚执行保存
     */
    async saveDataConverge(param?: any): Promise<any> {
        let url = this.dataConvergeUrl;
        return await this.httpService.postByJSON(url, param).toPromise();
    }

    /**
     * 删除数据源
     */
    async deleteSourceInfo (param?: any): Promise<any> {
        // let url = this.deleteSourceUrl.replace('{id}', param.id);
        let url = this.httpService.getDataUrl(this.deleteSourceUrl,
            {id: param.id});
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 查询新建数据仓库的数据源类型
     */
    async searchSourceType (param?: any): Promise<any> {
        // let url = this.searchSourceTypeUrl.replace('{type}', param);
        let url = this.httpService.getDataUrl(this.searchSourceTypeUrl,
            {type: param});
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 获取获取已有的字段信息的所有数据源
     */
    async getAllSource (): Promise<any> {
        return await this.httpService.get(this.getAllSourceUrl).toPromise();
    }
    /**
     * 测试数据源（新增页面）
     * @param param
     * @returns {Promise<any>}
     */
    async  testSource (param?: any): Promise<any> {
        return await this.httpService.postByJSON(this.testSourcsUrl, param).toPromise();
    }

    /**
     * 修改数据源基本信息
     * @param param
     * @returns {Promise<any>}
     */
    async  editSource (param?: any): Promise<any> {
        // let url = this.editSourceUrl.replace('{id}', param.id);
        let url = this.httpService.getDataUrl(this.editSourceUrl,
            {id: param.id});
        return await this.httpService.putByJSON(url, param).toPromise();
    }

    /**
     * 获取数据中心数据
     */
    async getDataCenter (param?: any): Promise<any> {
        return await this.httpService.get(this.getDataCenterUrl).toPromise();
    }

    /**
     * Bi数据中心获取数据集详细数据
     */
    async getDataSetList (param?: any): Promise<any> {
        return await this.httpService.get(this.getDataSetUrl).toPromise();
    }

    /**
     * Bi数据中心获取数据项详情数据
     */
    async getDataItemList (param?: any): Promise<any> {
        return await this.httpService.get(this.getDataItemUrl).toPromise();
    }
}
