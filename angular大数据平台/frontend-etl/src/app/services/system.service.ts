/**
 * Created by xxy on 2017/8/14/014.
 */

import {Injectable} from '@angular/core';
import {HttpService} from 'frontend-common/ts_modules/services/http.service';

@Injectable()
export  class SystemService {
    // 获取用户列表
    getUserUrl = '/rest/user/userList/{pageSize}/{pageNum}';
    // 新增用户
    addUserUrl = '/rest/user/addUser';
    // 删除用户
     deleteUserUrl = '/rest/user/delUser/{id}';

    // 获取用户详情
    userInfoUrl = '/rest/user/findUserInfo/{userId}';
    // 修改用户详情
    userInfoUpdateUrl = '/rest/user/modUser';

    // 查询目录结构
    queryAllKnowledgeUrl = '/rest/knowledge/queryAllKnowledge';
    // 删除目录
    delCatalogUrl = '/rest/knowledge/delCatalog/{id}';
    // 新增目录
    addCatalogUrl = '/rest/knowledge/addCatalog';
    // 4.19新增知识内容
    addContentUrl = '/rest/knowledge/addContent';
    // 4.20 获取知识库详情
    getContentUrl = '/rest/knowledge/getContentByCatalogId/{catalogId}';

    // 规则库管理 start

    // 获取所有规则列表信息
    getqueryAllRuleContentUrl = '/etl/rule/queryAllRuleContent/{pid}';
    // 获取规则树形结构
    queryAllRuleUrl = '/etl/rule/queryAllRule/{pid}';
    // 新增规则 post
    addRuleContentUrl = '/rest/rule/addRuleContent';
    // 编辑规则 post
    editRuleContentUrl = '/rest/rule/updateRuleContent';
    // 获取规则详情 post
    getRuleContentUrl = '/rest/rule/getRuleContent/{id}';
    // 删除规则 post
    delRuleContentUrl = '/rest/rule/delRuleContent/{id}';
    // 新增规则库 post
    addRuleUrl = '/rest/rule/addRule';
    // 编辑规则库 post
    editRuleUrl = '/rest/rule/updateRule';
    // 删除规则 post
    delRuleUrl = '/rest/rule/delRule/{id}';
    // 规则库管理 end

    // 文本提取 start
    // 获取文本列表
    getListUrl = '/editortool/hbase/get';
    // 保存文本列表
    putListUrl = '/editortool/hbase/put';
    // 获取快捷键列表
    getKeyListUrl = '/editortool/keyboard/get';
    // 快捷键修改（增删改查）
    putKeyUrl = '/editortool/keyboard/put';
    // 文本提取 end

    constructor(private httpService: HttpService) {

    }

    /**
     * 获取用户列表
     * @param param
     * @returns {Promise<any>}
     */
    async  getUsers (param?: any): Promise<any> {

        // let url = this.getUserUrl.replace('{pageNum}', param.pageNum);
        // url = url.replace('{pageSize}', param.pageSize);
        let url = this.httpService.getDataUrl(this.getUserUrl,
            {pageNum: param.pageNum, pageSize: param.pageSize});
        return await this.httpService.postByJSON(url, {
            name: param.keyWord
        }).toPromise();
    }

    /**
     * 添加用户
     * @param param
     * @returns {Promise<any>}
     */
    async addUser (param?: any): Promise<any> {
        return await this.httpService.postByJSON(this.addUserUrl, param).toPromise();
    }

    /**
     * 删除用户
     * @param param
     * @returns {Promise<any>}
     */
    async  deleteUser (param?: any): Promise<any> {
        // let url = this.deleteUserUrl.replace('{id}', param);
        let url = this.httpService.getDataUrl(this.deleteUserUrl, {id: param});
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 根据id获取用户详情
     * @param param
     * @returns {Promise<any>}
     */
    async getUserInfo (param?: any): Promise<any> {
        // let url = this.userInfoUrl.replace('{userId}', param);
        let url = this.httpService.getDataUrl(this.userInfoUrl, {userId: param});

        return await this.httpService.get(url).toPromise();
    }

    /**
     * 修改用户基本信息
     * @param param
     * @returns {Promise<any>}
     */
    async  editUser (param?: any): Promise<any> {
        return await this.httpService.postByJSON(this.userInfoUpdateUrl, param).toPromise();
    }

    /**
     * 获取目录列表
     * @returns {Promise<any>}
     */
    async  getMenus (param?: any): Promise<any> {
        let url = this.queryAllKnowledgeUrl + `?pid=${[param.pid]}`;
        // let url = this.httpService.getSearchDataUrl(this.queryAllKnowledgeUrl,
        //     {pid: param.pid});
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 删除目录
     * @param param
     * @returns {Promise<any>}
     */
    async  deleteMenu (param?: any): Promise<any> {

        // let url = this.delCatalogUrl.replace('{id}', param);
        let url = this.httpService.getDataUrl(this.delCatalogUrl, {id: param});
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 新增目录
     * @param param
     * @returns {Promise<any>}
     */
    async  addMenu (param?: any): Promise<any> {
        return await this.httpService.postByJSON(this.addCatalogUrl, param).toPromise();
    }

    /**
     * 获取知识详情
     * @param param
     * @returns {Promise<any>}
     */
    async  getContent (param?: any): Promise<any> {

        // let url = this.getContentUrl.replace('{catalogId}', param);
        let url = this.httpService.getDataUrl(this.getContentUrl,
            {catalogId: param});
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 新增知识
     * @param param
     * @returns {Promise<any>}
     */
    async  addKnowledgeContent (param?: any): Promise<any> {
        return await this.httpService.postByJSON(this.addContentUrl, param).toPromise();
    }




    /**
     * 获取所有规则信息table   get
     */
    async getAllRuleContent (param?: any): Promise<any> {
        // let url = this.getqueryAllRuleContentUrl.replace('{pid}', param);
        let url = this.httpService.getDataUrl(this.getqueryAllRuleContentUrl,
            {pid: param});
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 获取规则目录树
     */
    async queryAllRuleTree (param?: any): Promise<any> {
        // let url = this.queryAllRuleUrl.replace('{pid}', param.pid);
        // url = param.menuName ? (url + `${param.menuName}`) : url;
        let url = this.httpService.getDataUrl(this.queryAllRuleUrl,
            {pid: param.pid});
        url = this.httpService.getSearchDataUrl(url,
            {menuName: param.menuName});

        return await this.httpService.get(url).toPromise();
    }
     /**
         * 获取规则目录树
         */
    async getRuleContent (param?: any): Promise<any> {
        // let url = this.getRuleContentUrl.replace('{id}', param);
         let url = this.httpService.getDataUrl(this.getRuleContentUrl,
             {id: param});
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 新增规则  post
     */
    async  addRuleContent (param?: any): Promise<any> {
        let url = this.addRuleContentUrl;
        return await this.httpService.postByJSON(url, param).toPromise();
    }
    /**
     * 编辑规则  post
     */
    async  editRuleContent (param?: any): Promise<any> {
        let url = this.editRuleContentUrl;
        return await this.httpService.postByJSON(url, param).toPromise();
    }

    /**
     * 删除规则 delete
     */
    async  deleteRuleContent (param?: any): Promise<any> {
        // let url = this.delRuleContentUrl.replace('{id}', param);
        let url = this.httpService.getDataUrl(this.delRuleContentUrl,
            {id: param});
        return await this.httpService.get(url).toPromise();
    }
    /**
     * 新增规则库  post
     */
    async  addRuleCatalog (param?: any): Promise<any> {
        let url = this.addRuleUrl;
        return await this.httpService.postByJSON(url, param).toPromise();
    }

    /**
     * 编辑规则  post
     */
    async  updateRule (param?: any): Promise<any> {
        let url = this.editRuleUrl;
        return await this.httpService.postByJSON(url, param).toPromise();
    }

     /**
     * 删除规则库 delete
     */
    async  deleteRule (param?: any): Promise<any> {
        // let url = this.delRuleUrl.replace('{id}', param);
         let url = this.httpService.getDataUrl(this.delRuleUrl,
             {id: param});
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 获取文本列表
     */
    async  getList (param?: any): Promise<any> {
        // let url = this.getListUrl + `?messageType=${param.messageType}`
        //     + `&dateInfo=${param.dateInfo}`;
        let url = this.httpService.getSearchDataUrl(this.getListUrl,
            {messageType: param.messageType, dateInfo: param.dateInfo});

        return await this.httpService.postByJSON(url).toPromise();
    }

    /**
     * 上传文本列表
     */
    async  putList (param?: any): Promise<any> {
        let url = this.putListUrl;
        return await this.httpService.putByJSON(url, param).toPromise();
    }

    /**
     * 获取快捷键列表
     */
    async  getKeyList (): Promise<any> {
        let url = this.getKeyListUrl;
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 上传快捷键列表
     */
    async  putKey (param?: any): Promise<any> {
        let url = this.putKeyUrl;
        return await this.httpService.putByJSON(url, param).toPromise();
    }
}
