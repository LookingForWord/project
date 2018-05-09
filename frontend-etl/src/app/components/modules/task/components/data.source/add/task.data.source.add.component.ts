/**
 * Created by LIHUA on 2017-08-10.
 */

import {Component, OnInit} from '@angular/core';

import {TaskService} from 'app/services/task.service';
import {LoginService} from 'app/services/login.service';
import {GovernanceService} from 'app/services/governance.service';
import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {ToolService} from 'frontend-common/ts_modules/services/tool.service';

import {CollectDatabaseEnum} from 'app/constants/collect.database.enum';

import {RegExgConstant} from 'frontend-common/ts_modules/constants/regexp';
import {KeysPsw} from 'app/constants/keys.psw';

export class SourceTypes {
    name: string;
    value: string;
}

@Component({
    selector: 'task-data-source-add-component',
    templateUrl: './task.data.source.add.component.html',
    styleUrls: ['./task.data.source.add.component.scss']
})

export class TaskDataSourceAddComponent implements  OnInit {
    error: string;
    errorType: number;
    pIns: any;            // 按钮集合
    sourceName: string;   // 数据源名称
    sourceType: any;      // 数据源类型
    baseID: number;       // 数据源ID
    url = '';             // 数据源Url
    urlId: string;        // 数据源Url ID
    username = '';        // 用户名
    usernameId: string;   // 用户ID
    password = '';        // 密码
    passwordId: string;   // 密码ID
    server: any; // kafka的变量
    port: any;            // 端口
    status: any;          // 0为查看详情，1为创建数据源，2为编辑数据源
    sourceTypes: Array<SourceTypes>;
    updatePassword = false; // 是否修改了密码
    collectDatabaseEnum = CollectDatabaseEnum; // 采集库类型枚举

    // ftp 类型
    protocol: any; // ftp类型
    protocols = [{name: 'ftp', value: 'ftp'}, {name: 'sftp', value: 'sftp'}];

    // odps配置
    odpsServer: string;
    tunnelServer: string;
    accessId: string;
    accessKey: string;
    project: string;

    constructor(private taskService: TaskService,
                private modalService: ModalService,
                private loginService: LoginService,
                private toolService: ToolService,
                private governanceService: GovernanceService) {}

    ngOnInit () {
        this.getSourcsType();
    }

    /**
     * 基本信息检查
     * @returns {boolean}
     */
    check() {
        this.error = null;
        this.errorType = 0;

        if (this.sourceType.value === CollectDatabaseEnum.FTP || this.sourceType.value === CollectDatabaseEnum.FILE || this.sourceType.value === CollectDatabaseEnum.SPIDER) {
            if (!this.protocol) {
                this.error = '请选择ftp类型';
                this.errorType = 13;
                return;
            }
        }

        let sourceName = this.sourceName && this.sourceName.replace(/\s/g, '');
        if (!this.sourceName || this.sourceName === '' || !sourceName || sourceName.length < 1) {
            this.error = '请填写数据源名称';
            this.errorType = 1;
            return;
        }
        // 如果数据源类型是以下类型
        if (this.sourceType.value === CollectDatabaseEnum.MYSQL ||
            this.sourceType.value === CollectDatabaseEnum.ORACLE ||
            this.sourceType.value === CollectDatabaseEnum.HIVE ||
            this.sourceType.value === CollectDatabaseEnum.FTP ||
            this.sourceType.value === CollectDatabaseEnum.FILE ||
            this.sourceType.value === CollectDatabaseEnum.SPIDER ||
            this.sourceType.value === CollectDatabaseEnum.HDFS ||
            this.sourceType.value === CollectDatabaseEnum.SQLSERVER) {

            let url = this.url && this.url.replace(/\s/g, '');
            if (!this.url || this.url === '' || !url || !RegExgConstant.faultChinese.test(this.url)) {
                this.error = '请填写数据源Url';
                this.errorType = 2;
                return;
            }

            // 非hdfs类型 检查用户名、密码
            if (this.sourceType.value !== CollectDatabaseEnum.HDFS) {
                let username = this.username && this.username.replace(/\s/g, '');
                if (!this.username || this.username === '' || !username || !RegExgConstant.faultChinese.test(this.username)) {
                    this.error = '请填写正确格式的数据源用户名';
                    this.errorType = 4;
                    return;
                }
                // 当模态状态为新增或者修改状态且更新了密码
                if (this.status === 1 || (this.status !== 1 && this.updatePassword)) {
                    let password = this.password && this.password.replace(/\s/g, '');
                    if (!this.password || this.password === '' || !this.password ||  !RegExgConstant.faultChinese.test(password)) {
                        this.error = '请填写正确格式的数据源密码';
                        this.errorType = 5;
                        return;
                    }
                }
            }

        } else if (this.sourceType.value === CollectDatabaseEnum.KAFKA) {
            if (!this.server || this.server === '' ) {
                this.error = '请填写server';
                this.errorType = 6;
                return;
            }
            if (!this.port || this.port === '' ) {
                this.error = '请填写端口';
                this.errorType = 7;
                return;
            }
        } else if (this.sourceType.value === CollectDatabaseEnum.ODPS) {
            if (!this.odpsServer || this.odpsServer === '' ) {
                this.error = '请填写odpsServer';
                this.errorType = 8;
                return;
            }
            if (!this.tunnelServer || this.tunnelServer === '' ) {
                this.error = '请填写tunnelServer';
                this.errorType = 9;
                return;
            }
            if (!this.accessId || this.accessId === '' ) {
                this.error = '请填写odps accessId';
                this.errorType = 10;
                return;
            }
            if (!this.accessKey || this.accessKey === '' ) {
                this.error = '请填写odps accessKey';
                this.errorType = 11;
                return;
            }
            if (!this.project || this.project === '' ) {
                this.error = '请填写odps project';
                this.errorType = 12;
                return;
            }
        }

        return true;
    }

    /**
     * 获取数据类型列表
     */
    getSourcsType() {
        this.taskService.getSourcsType('w_dataType')
            .then(d => {
                let temps = [];
                d.message.forEach(type => {
                    temps.push({
                        name: type.value,
                        value: type.value
                    });
                });
                this.sourceTypes = temps;
                // 如果为新增数据源时sourceType的值取sourceTypes的第一个value
                if (this.status === 1) {
                    this.sourceType = this.sourceTypes[0];
                } else {
                    this.sourceTypes.forEach( (t) => {
                        if (t.value ===  this.sourceType) {
                            this.sourceType = t;
                        }
                    });
                }
            });
    }

    /**
     * 新增数据源的保存
     */
    newDataSource() {
        this.governanceService.addSource({
            dsName: this.sourceName,
            dsType: this.sourceType['value'],
            dsDesc: '',
            deletedState: 0,
            creatorId: this.loginService.userId,
            creatorName: this.loginService.realName,
            dsConfigs: [{
                label: 'url',
                value: this.url
            }, {
                label: 'username',
                // hdfs类型的时候 用户名可能为空
                value: this.username ? this.username : null
            }, {
                label: 'password',
                // hdfs类型的时候 密码可能为空
                value: this.password ? this.toolService.encrypt(this.password, KeysPsw.DATASOURCEKEY) : null
            }, {
                label: 'server',
                value: this.server
            }, {
                label: 'port',
                value: this.port
            }, {
                label: 'protocol',
                value: this.protocol ? this.protocol.value : ''
            }, {
                label: 'odpsServer',
                value: this.odpsServer
            }, {
                label: 'tunnelServer',
                value: this.tunnelServer
            }, {
                label: 'accessId',
                value: this.accessId
            }, {
                label: 'accessKey',
                value: this.accessKey
            }, {
                label: 'project',
                value: this.project
            }]
        }).then(d => {
            if (d.success) {
                this.modalService.alert('保存成功');
                this.hideInstance();
            } else {
                this.modalService.alert(d.message || '保存失败');
            }
        });
    }

    /**
     * 编辑数据源的保存
     */
    editDataSource() {
        this.governanceService.editSource({
            id: this.baseID,
            dsName: this.sourceName,
            dsType: this.sourceType['value'],
            dsDesc: '',
            deletedState: 0,
            creatorId: this.loginService.userId,
            creatorName: this.loginService.realName,
            dsConfigs: [{
                label: 'url',
                value: this.url
            }, {
                label: 'username',
                // hdfs类型的时候 用户名可能为空
                value: this.username ? this.username : null
            }, {
                label: 'password',
                // hdfs类型的时候 密码可能为空
                value: this.password ? this.toolService.encrypt(this.password, KeysPsw.DATASOURCEKEY) : null
            }, {
                label: 'server',
                value: this.server
            }, {
                label: 'port',
                value: this.port
            }, {
                label: 'protocol',
                value: this.protocol ? this.protocol.value : ''
            }, {
                label: 'odpsServer',
                value: this.odpsServer
            }, {
                label: 'tunnelServer',
                value: this.tunnelServer
            }, {
                label: 'accessId',
                value: this.accessId
            }, {
                label: 'accessKey',
                value: this.accessKey
            }, {
                label: 'project',
                value: this.project
            }]
        }).then(d => {
            if (d.success) {
                this.modalService.alert('更新成功');
                this.hideInstance();
            } else {
                this.modalService.alert(d.message || '更新失败');
            }
        });
    }

    /**
     * 连接测试
     */
    async connectClick() {
        if (!this.check()) {
            return;
        }
        let d = await this.getTestSource();
        if (d.success) {
            this.pIns.setWarn([{
                name: '测试通过',
                class: 'correct-warn',
            }]);
        } else {
            this.pIns.setWarn([{
                name: '配置有误，请重新编辑',
                class: 'error-warn',
            }]);
        }
    }

    /**
     * 获取测试连接数据
     * @returns {Promise<any>}
     */
    async getTestSource(): Promise<any> {
        // 只有在新增和 非新增且修改了密码的时候才传密码 而且密码在类型为hdfs下可能为空
        let password = null;
        if (this.status === 1 || (this.status !== 1 && this.updatePassword)) {
            password = this.password ? this.toolService.encrypt(this.password, KeysPsw.DATASOURCEKEY) : null;
        }

        return await this.governanceService.testSource({
            dsType: this.sourceType.value,
            url: this.url,
            username: this.username,
            password: password,
            passwordId: this.passwordId,
            server: this.server,
            port: this.port,
            odpsServer: this.odpsServer,
            tunnelServer: this.tunnelServer,
            accessId: this.accessId,
            accessKey: this.accessKey,
            project: this.project,
            protocol: this.protocol ? this.protocol.value : ''
        });
    }

    /**
     * 保存数据源
     */
    async saveClick() {
        if (!this.check()) {
            return;
        }
        // 先调用一遍测试接口
        let d = await this.getTestSource();
        if (d.success) {
            this.pIns.setWarn([{
                name: '测试通过',
                class: 'correct-warn',
            }]);
            if (this.status === 1) {
                this.newDataSource();  // 新建保存
            } else if (this.status === 2) {
                this.editDataSource(); // 编辑保存
            }
        } else {
            this.pIns.setWarn([{
                name: '配置有误，请重新编辑',
                class: 'error-warn',
            }]);
            this.modalService.alert('配置有误，请重新编辑');
        }
    }

    /**
     * 取消保存
     *
     */
    cancelClick() {
        this.hideInstance();
    }

    /**
     * 数据源类型选择回调
     * @param type
     */
    sourceTypeChecked(type: any) {
        if (this.sourceType.value !== type.value ) {
            this.pIns.setWarn([]);
        }
        this.sourceType = type;
        if (this.sourceType.value !== CollectDatabaseEnum.KAFKA) {
            // 清空kafka的数据
            this.server = '';
            this.port = '';
        } else if (this.sourceType.value === CollectDatabaseEnum.KAFKA) {
            // 清空除kafka外的数据
            this.url = '';
            this.username = '';
            this.password = '';
        }
    }

    /**
     * ftp类型选择回调
     * @param protocol
     */
    protocolChecked(protocol: any) {
        this.protocol = protocol;
    }

    hideInstance: Function;
}
