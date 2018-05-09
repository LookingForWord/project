/**
 * Created by xxy on 2017/10/19/019.
 */

import {Injectable} from '@angular/core';
import {HttpService} from 'frontend-common/ts_modules/services/http.service';

@Injectable()
export  class AuthorityService {
    // 密码服务
    // 密码加密
    encryptPwdUrl = '/butler/manage/system/passwordEncrypt';
    // 密码解密
    decryptPwdUrl = '/butler/manage/system/passwordDecrypt';

    // 获取用户列表
    getUserUrl = '/butler/manage/user/list';
    // 新增用户
    addUserUrl = '/butler/manage/user/create';
    // 新增用户获用户角色列表数据
    addUserRoleUrl = '/butler/manage/role/select_all_baseinfo';
    // 新增用户获用户角色列表数据
    addUserDepartmentUrl = '/butler/manage/resource/get_res_tree';
    // 删除用户
    deleteUserUrl = '/butler/manage/user/delete';
    // 获取用户详情
    userInfoUrl = '/butler/manage/user/select';
    // 修改用户详情
    userInfoUpdateUrl = '/butler/manage/user/update';
    // 修改用户密码
    userPasswordUpdateUrl = '/butler/manage/user/update_password_force';
    // 导出用户
    exportUserUrl = '/butler/manage/user/export';
    // 导出用户Excel模版
    exportUserTemplateUrl = '/butler/manage/user/exportTemplate';
    // 导入用户
    importUserUrl = this.httpService.getServerUrl() + '/butler/manage/user/import';


    // 数据权限列表
    getDataUrl = '/butler/manage/resource/listSystem';
    // 查询数据对象
    searchDataUrl = '/butler/manage/dataRight/getMetaListBySystem';
    // 添加数据对象
    addDataUrl = '/butler/manage/dataRight/addRigthManager';
    // 删除数据对象
    deleteDataUrl = '/butler/manage/dataRight/deleteRigthManager';


    // 角色管理查询数据权限
    searchDataAuthorityUrl = '/butler/manage/role/select_data_right';
    // 角色管理增加数据权限
    addDataAuthorityUrl = '/butler/manage/role/add_data_right';
    // 获取角色列表  /butler/manage/role/list
    getRoleUrl = '/butler/manage/role/list';
    // 新增角色
    addRoleUrl = '/butler/manage/role/create';
    // 删除角色 roleId
    deleteRoleUrl = '/butler/manage/role/delete';
    // 获取角色详情
    roleInfoUrl = '/butler/manage/role/select?id={id}';
    // 获取权限配置列表数据
    getAuthoritylist = '/butler/manage/resource/get_res_tree';
    // 获取人员配置列表
    getStafflist = '/butler/manage/org/get_member_tree';
    // 修改角色详情
    roleInfoUpdateUrl = '/butler/manage/role/update';
    // 导出角色
    exportRole = '/butler/manage/role/export';
    // 导出角色Excel模版
    exportRoleTemplateUrl = '/butler/manage/role/exportTemplate';
    // 获取接口列表
    selectBySystemId = '/butler/manage/inter/selectBySystemId';
    // 导入角色
    importRole = '/butler/manage/role/import';
    // 角色列表导出
    getUserRoleUrl = '/butler/manage/role/select_all_baseinfo';

    /*组织机构 start*/

    // 获取所有组织信息 get
    getAllOrganizationUrl = '/butler/manage/org/list_member';
    // 获取组织树形结构
    getOrganizationUrl = '/butler/manage/org/get_org_tree';
    // 新增组织 post
    addOrganizationUrl = '/butler/manage/org/create';
    // 删除组织 post
    deleteOrganizationUrl = '/butler/manage/org/delete';
    // 编辑修改组织 post
    editOrganizationUrl = '/butler/manage/org/update';
    // 获取负责人列表
    getAllPersonsUrl = '/butler/manage/user/select_all_baseinfo';
    // 获取单个组织信息
    getOrganizeDetailUrl = '/butler/manage/org/select';
    // 组织机构导入地址
    importOrganizeUrl = this.httpService.getRealUrl('/butler/manage/org/import');
    // 组织机构导出
    exporOrganizetUrl = '/butler/manage/org/export';
    // 导出组织机构Excel模版
    exportOrganizeTemplateUrl = '/butler/manage/org/exportTemplate';
    /*组织机构 end*/

    // 菜单管理
    getAllMenuUrl = '/butler/manage/resource/list';
    // 菜单详情
    getMenuDetailsUrl = '/butler/manage/resource/select';
    // 删除菜单
    deleteMenuUrl = '/butler/manage/resource/delete';
    // 编辑菜单
    menuInfoEditUrl = '/butler/manage/resource/update';
    // 上级菜单
    upperMenuUrl = '/butler/manage/resource/get_res_tree';
    // 新增对象
    addMenuUrl = '/butler/manage/resource/create';
    // 获取菜单所属系统
    getOwnSystemUrl = '/butler/manage/sys/get_system_dim?code=SYS_DIMENSION';
    // 导出资源
    exportResourceUrl = '/butler/manage/resource/export';
    // 导出资源Excel模版
    exportResourceTemplateUrl = '/butler/manage/resource/exportTemplate';
    // 导入资源
    importResourceUrl = this.httpService.getRealUrl('/butler/manage/resource/import');
    // 获取所有接口
    getInterfacesUrl = '/butler/manage/inter/list';
    // 新增接口
    addInterfaceUrl = '/butler/manage/inter/create';
    // 删除接口
    deleteInterfaceUrl = '/butler/manage/inter/delete';
    // 修改接口
    updateInterfaceUrl = '/butler/manage/inter/update';
    // 根据id查询
    searchByIdUrl = '/butler/manage/inter/select';
    // 导出接口
    exportInterfaceUrl = '/butler/manage/inter/export';
    // 导入接口
    importInterfaceUrl = this.httpService.getRealUrl('/butler/manage/inter/import');
    // 导出接口模板
    exportInterfaceTemplateUrl = '/butler/manage/inter/exportTemplate';

    // 获取在线用户
    getOnlineUserUrl = '/butler/manage/user/online';
    // 强制下线
    offlineUserUrl = '/butler/manage/user/forceQuit';

    constructor(private httpService: HttpService) {

    }

    /**
     * 密码加密服务
     */
    async encryptPwd (param?: any): Promise<any> {
        return await this.httpService.postByJSON(this.encryptPwdUrl, param).toPromise();
    }

    /**
     * 密码解密服务
     */
    async decryptPwd (param?: any): Promise<any> {
        return await this.httpService.postByJSON(this.decryptPwdUrl, param).toPromise();
    }
    /**
     * 获取数据权限列表
     * @param param
     * @returns {Promise<any>}
     */
    async getDataList (param?: any): Promise<any> {
        return await this.httpService.get(this.getDataUrl).toPromise();
    }

    /**
     * 查询数据对象
     * @param param
     * @returns {Promise<any>}
     */
    async searchData (param?: any): Promise<any> {
        let url = this.httpService.getSearchDataUrl(this.searchDataUrl, param);
        return await this.httpService.get(url).toPromise();
    }
    async  addData (param?: any): Promise<any> {
        let url = this.httpService.getDataUrl(this.addDataUrl, param);
        return await this.httpService.postByJSON(url, param).toPromise();
    }
    async  deleteData (param?: any): Promise<any> {
        let url = this.httpService.getDataUrl(this.deleteDataUrl, param);
        return await this.httpService.postByJSON(url, param).toPromise();
    }



    /**
     * 获取所有组织信息table   get
     */
    async getAllOrganization (param?: any): Promise<any> {
        // let url = (param.orgId ? this.getAllOrganizationUrl + `?orgId=${param.orgId}` : this.getAllOrganizationUrl);
        let url = this.httpService.getSearchDataUrl(this.getAllOrganizationUrl, {orgId: param.orgId});
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 获取负责人列表
     */
    async getAllPersons (): Promise<any> {
        return await this.httpService.get(this.getAllPersonsUrl).toPromise();
    }
    /**
     * 获取负责人列表
     */
    async getAlluserRoles (): Promise<any> {
        return await this.httpService.get(this.getUserRoleUrl).toPromise();
    }

    /**
     * 获取单个组织的信息
     */
    async getOrganizeDetail (param?: any): Promise<any> {
        // let url = this.getOrganizeDetailUrl + `?id=${param.id}`;
        let url = this.httpService.getSearchDataUrl(this.getOrganizeDetailUrl, {id: param.id});
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 获取组织树形结构
     */
    async getOrganizationTree (): Promise<any> {
        return await this.httpService.get(this.getOrganizationUrl).toPromise();
    }

    /**
     * 新增组织  post
     */
    async  addOrganization (param?: any): Promise<any> {
        let url = this.addOrganizationUrl;
        return await this.httpService.postByJSON(url, param).toPromise();
    }

    /**
     * 删除组织  delete
     */
    async  deleteOrganization (param?: any): Promise<any> {
        // let url = this.deleteOrganizationUrl + `?id=${param.id}`;
        let url = this.httpService.getSearchDataUrl(this.deleteOrganizationUrl, {id: param.id});

        return await this.httpService.get(url).toPromise();
    }

    /**
     * 编辑修改组织 put
     */
    async  editOrganization (param?: any): Promise<any> {
        let url = this.editOrganizationUrl;
        return await this.httpService.postByJSON(url, param).toPromise();
    }

    /**
     * 获取用户列表
     * @param param
     * @returns {Promise<any>}
     */
    async  getUsers (param?: any): Promise<any> {
        // let url = this.getUserUrl + `?pageNum=${param.pageNum}&pageSize=${param.pageSize}`;
        // url = (param.keyWord ? url + `&keyWord=${param.keyWord}` : url);
        let url = this.httpService.getSearchDataUrl(this.getUserUrl, param);
        return await this.httpService.get(url).toPromise();
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
     * 获取新增用户中用户角色可选内容集合
     */
    // async getRolesList (): Promise<any> {
    //     return await this.httpService.get(this.addUserRoleUrl).toPromise();
    // }


    /**
     * 删除用户
     * @param param
     * @returns {Promise<any>}
     */
    async  deleteUser (param?: any): Promise<any> {
        // let url = this.deleteUserUrl + '?id=' + param;
        let url = this.httpService.getSearchDataUrl(this.deleteUserUrl, {id: param});
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 根据id获取用户详情
     * @param param
     * @returns {Promise<any>}
     */
    async getUserInfo (param?: any): Promise<any> {
        // let url = this.userInfoUrl + '?id=' + param;
        let url = this.httpService.getSearchDataUrl(this.userInfoUrl, {id: param});
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
     * 修改用户密码
     * @param param
     * @returns {Promise<any>}
     */
    async  updatePassword (param?: any): Promise<any> {
        return await this.httpService.postByJSON(this.userPasswordUpdateUrl, param).toPromise();
    }


    async  searchDataAuthority (param?: any): Promise<any> {
        return await this.httpService.postByJSON(this.searchDataAuthorityUrl, param).toPromise();
    }

    /**
     * 角色保存数据权限
     * @param param
     * @returns {Promise<any>}
     */
    async  addDataAuthority (param?: any): Promise<any> {
        return await this.httpService.postByJSON(this.addDataAuthorityUrl, param).toPromise();
    }
    /**
     * 获取角色列表
     * @param param
     * @returns {Promise<any>}
     */
    async  getRoles (param?: any): Promise<any> {
        // let url = this.getRoleUrl + `?pageNum=${param.pageNum}&pageSize=${param.pageSize}`;
        // url = (param.keyWord ? url + `&keyWord=${param.keyWord}` : url);
        let url = this.httpService.getSearchDataUrl(this.getRoleUrl, param);

        return await this.httpService.get(url).toPromise();
    }

    /**
     * 添加角色
     * @param param
     * @returns {Promise<any>}
     */
    async addRole (param?: any): Promise<any> {
        return await this.httpService.postByJSON(this.addRoleUrl, param).toPromise();
    }

    /**
     * 删除角色
     * @param param
     * @returns {Promise<any>}
     */
    async  deleteRole (param?: any): Promise<any> {
        // let url = this.deleteRoleUrl + `?id=${param.id}`;
        let url = this.httpService.getSearchDataUrl(this.deleteRoleUrl, {id: param.id});
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 根据id获取角色详情
     * @param param
     * @returns {Promise<any>}
     */
    async getRoleInfo (param?: any): Promise<any> {
        // let url = this.roleInfoUrl.replace('{id}', param);
        let url = this.httpService.getDataUrl(this.roleInfoUrl, {id: param});
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 修改角色基本信息
     * @param param
     * @returns {Promise<any>}
     */
    async  editRole (param?: any): Promise<any> {
        return await this.httpService.postByJSON(this.roleInfoUpdateUrl, param).toPromise();
    }

    /**
     * 获取新增角色中人员配置的树形结构集合
     */
    async getStaffTree (): Promise<any> {
        return await this.httpService.get(this.getStafflist).toPromise();
    }

    /**
     * 获取新增角色的权限配置的树形结构的集合
     */
    async getDepartmentTree (param?: any): Promise<any> {
        let url = this.getAuthoritylist;

        if (param !== undefined) {
            // url = url + `?status=${param}`;
            url = this.httpService.getSearchDataUrl(url, {status: param.status});
        }
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 获取对应系统下的接口列表
     */
    async getPortList(param?: any): Promise<any> {
        let url = this.httpService.getSearchDataUrl(this.selectBySystemId, param);
        return await this.httpService.get(url).toPromise();
    }



    /**
     * 按条件获取菜单列表
     */
    async getMenuList(param?: any): Promise<any> {
        // let url = this.getAllMenuUrl + `?pageNum=${param.pageNum}&pageSize=${param.pageSize}`;
        // url = (param.keyWord ? url + `&keyWord=${param.keyWord}` : url);
        let url = this.httpService.getSearchDataUrl(this.getAllMenuUrl, param);
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 删除菜单  id
     */
    async deleteMenu(param?: any): Promise<any> {
        // let url = this.deleteMenuUrl + `?id=${param.id}`;
        let url = this.httpService.getSearchDataUrl(this.deleteMenuUrl, {id: param.id});

        return await this.httpService.get(url).toPromise();
    }

    /**
     * 菜单下详情
     */
    async getMenuDetails(param?: any): Promise<any> {
        // let url = this.getMenuDetailsUrl + `?id=${param.id}`;
        let url = this.httpService.getSearchDataUrl(this.getMenuDetailsUrl, {id: param.id});
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 获取在线用户
     */
    async getOnlineUser(param?: any): Promise<any> {
        // let url = this.getOnlineUserUrl + `?pageNum=${param.pageNum}&pageSize=${param.pageSize}`;
        // url = (param.keyWord ? url + `&keyWord=${param.keyWord}` : url);
        let url = this.httpService.getSearchDataUrl(this.getOnlineUserUrl,  param);

        return await this.httpService.get(url).toPromise();
    }

    /**
     * 强制下线
     */
    async offlineUser(param?: any): Promise<any> {
        // let url = this.offlineUserUrl + `?userId=${param.userId}`;
        let url = this.httpService.getSearchDataUrl(this.offlineUserUrl, {userId: param.userId});
        return await this.httpService.get(url).toPromise();
    }
    /**
     * 编辑菜单详情
     */
    async editMenu(param?: any): Promise<any> {
        return await this.httpService.postByJSON(this.menuInfoEditUrl, param).toPromise();
    }

    /**
     * 获取上级组织树形结构
     */
    async getUpperTree (): Promise<any> {
        return await this.httpService.get(this.upperMenuUrl).toPromise();
    }

    /**
     * 增加对象
     */
    async addMenu(param?: any): Promise<any> {
        return await this.httpService.postByJSON(this.addMenuUrl, param).toPromise();
    }

    /**
     * 获取系统列表
     */
    async getOwnSystem(): Promise<any> {
        return await this.httpService.get(this.getOwnSystemUrl).toPromise();
    }

    /**
     * 获取接口列表
     */
    async getInterfacesList(param?: any): Promise<any> {
        // let url = this.getInterfacesUrl + `?pageNum=${param.pageNum}&pageSize=${param.pageSize}`;
        // url = (param.keyWord ? url + `&keyWord=${param.keyWord}` : url);
        let url = this.httpService.getSearchDataUrl(this.getInterfacesUrl, param);

        return await this.httpService.get(url).toPromise();
    }

    /**
     * 删除接口
     */
    async deleteInterface(param?: any): Promise<any> {
        // let url = this.deleteInterfaceUrl + `?id=${param.id}`;
        let url = this.httpService.getSearchDataUrl(this.deleteInterfaceUrl, {id: param.id});
        return await this.httpService.get(url).toPromise();
    }

    /**
     * 编辑保存接口
     */
    async updateInterface(param?: any): Promise<any> {
        return await this.httpService.postByJSON(this.updateInterfaceUrl, param).toPromise();
    }

    /**
     * 新增接口
     */
    async addInterface(param?: any): Promise<any> {
        return await this.httpService.postByJSON(this.addInterfaceUrl, param).toPromise();
    }
}
