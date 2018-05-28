/**
 * Created by lh on 2017/12/16.
 *  新增或编辑数据仓库
 */

import {Component, OnInit} from '@angular/core';

import {LoginService} from 'app/services/login.service';
import {RepositoryService} from 'app/services/repository.service';
import {ToolService} from 'frontend-common/ts_modules/services/tool.service';
import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {RegExgConstant} from 'frontend-common/ts_modules/constants/regexp';
import {CollectDatabaseEnum} from 'app/constants/collect.database.enum';
import {ValidateService} from 'frontend-common/ts_modules/services/validate.service';
import {KeysPsw} from '../../../../../../constants/keys.psw';

export class SourceTypes {
    name: string;
    value: string;
}
@Component({
    selector: 'task-database-add-component',
    templateUrl: './task.database.add.component.html',
    styleUrls: ['./task.database.add.component.scss']
})
export class TaskDatabaseAddComponent implements  OnInit {
    error: string;
    errorType: number;
    pIns: any;            // 按钮集合
    sourceName: string;   // 数据源名称
    sourceType: any;      // 数据源类型
    sourceTypes: Array<SourceTypes>;   // 数据源类型集合
    dataSourceNames = [];               // 数据源名称集合
    dataSourceName: any;                // 数据源名称选中项

    sourceId: string;     // 数据源ID
    sourceDsec: any;      // 数据源描述
    sourceDeletedState: number; // 数据源删除状态
    sourceSyncState: string;    // 数据源执行情况
    url = '';             // 数据源Url
    urlId: string;        // 数据源Url ID
    username = '';        // 用户名
    usernameId: string;   // 用户ID
    password = '';        // 密码
    passwordId: string;   // 密码ID

    server: any; // kafka的变量
    port: any;            // 端口
    dsIntent: any;

    status: any;          // 0为查看详情，1为创建数据源，2为编辑数据源

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

    constructor(private repositoryService: RepositoryService,
                private modalService: ModalService,
                private loginService: LoginService,
                private toolService: ToolService,
                private validateService: ValidateService
                ) {}

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
        if (this.status === 1 ) {
            let validate = this.validateService.get(this, this.getValidateObject(), ['sourceType', 'dataSourceName']);
            if (validate) {
                this.error = validate.error;
                this.errorType = validate.errorType;
                return false;
            }
        }
        if (this.status === 2) {
            if (this.sourceType.value === CollectDatabaseEnum.FTP) {
                let validate = this.validateService.get(this, this.getValidateObject(), ['protocol']);
                if (validate) {
                    this.error = validate.error;
                    this.errorType = validate.errorType;
                    return false;
                }
            }

            let sourceName = this.sourceName && this.sourceName.replace(/\s/g, '');
            if (!this.sourceName || this.sourceName === '' || !sourceName || sourceName.length < 1) {
                this.error = '请填写采集源名称';
                this.errorType = 1;
                return;
            }
            // 如果数据源类型是以下类型
            if (this.sourceType.value === CollectDatabaseEnum.MYSQL ||
                this.sourceType.value === CollectDatabaseEnum.ORACLE ||
                this.sourceType.value === CollectDatabaseEnum.HIVE ||
                this.sourceType.value === CollectDatabaseEnum.FTP ||
                this.sourceType.value === CollectDatabaseEnum.HDFS) {

                let url = this.url && this.url.replace(/\s/g, '');
                if (!this.url || this.url === '' || !url || !RegExgConstant.faultChinese.test(this.url)) {
                    this.error = '请填写采集源Url';
                    this.errorType = 2;
                    return;
                }

                // 非hdfs类型 检查用户名、密码
                if (this.sourceType.value !== CollectDatabaseEnum.HDFS) {
                    let username = this.username && this.username.replace(/\s/g, '');
                    if (!this.username || this.username === '' || !username || !RegExgConstant.faultChinese.test(this.username)) {
                        this.error = '请填写正确格式的采集源用户名';
                        this.errorType = 4;
                        return;
                    }
                    // 当模态状态为新增或者修改状态且更新了密码
                    if (this.status === 1 || (this.status !== 1 && this.updatePassword)) {
                        let password = this.password && this.password.replace(/\s/g, '');
                        if (!this.password || this.password === '' || !this.password ||  !RegExgConstant.faultChinese.test(password)) {
                            this.error = '请填写正确格式的采集源密码';
                            this.errorType = 5;
                            return;
                        }
                    }
                }
            } else if (this.sourceType.value === CollectDatabaseEnum.KAFKA) {
                let validate = this.validateService.get(this, this.getValidateObject(), ['server', 'port']);
                if (validate) {
                    this.error = validate.error;
                    this.errorType = validate.errorType;
                    return false;
                }
            } else if (this.sourceType.value === CollectDatabaseEnum.ODPS) {
                let validate = this.validateService.get(this, this.getValidateObject(),
                    ['odpsServer', 'tunnelServer', 'accessId', 'accessKey', 'project']);
                if (validate) {
                    this.error = validate.error;
                    this.errorType = validate.errorType;
                    return false;
                }
            }
        }

        return true;
    }
    /**
     * 检验规则
     */
    getValidateObject() {
        return {
            dataSourceName: {
                presence: {message: '^请选择数据源', allowEmpty: false},
                errorType: 15
            },
            sourceType: {
                presence: { message: '^请选择数据源类型', allowEmpty: false},
                errorType: 14
            },
            protocol: {
                presence: { message: '^请选择ftp类型', allowEmpty: false},
                errorType: 13
            },
            server: {
                presence: { message: '^请填写server', allowEmpty: false},
                errorType: 6
            },
            port: {
                presence: { message: '^请填写端口', allowEmpty: false},
                errorType: 7
            },
            odpsServer: {
                presence: { message: '^请填写odpsServer', allowEmpty: false},
                errorType: 8
            },
            tunnelServer: {
                presence: { message: '^请填写tunnelServer', allowEmpty: false},
                errorType: 9
            },
            accessId: {
                presence: { message: '^请填写odps accessId', allowEmpty: false},
                errorType: 10
            },
            accessKey: {
                presence: { message: '^请填写odps accessKey', allowEmpty: false},
                errorType: 11
            },
            project: {
                presence: { message: '^请填写odps project', allowEmpty: false},
                errorType: 12
            }
        };
    }
    /**
     * 获取数据源列表
     */
    getSourceList(type) {
        this.repositoryService.getDataSourceMenus({dsType: type}).then( d => {
            if (d.success && d.message) {
                d.message.forEach(item => {
                    this.dataSourceNames.push({dsName: item.dsName, id: item.id, dsType: item.dsType});
                });
            } else {
                this.modalService.alert(d.message);
            }
        });
    }
    /**
     * 获取数据类型列表
     */
    getSourcsType() {
        this.repositoryService.searchSourceType()
            .then(d => {
                let temps = [];
                d.message.forEach(type => {
                    temps.push({
                        name: type.rowName,
                        value: type.rowCode
                    });
                });
                this.sourceTypes = temps;

                // 如果为新增数据源时sourceType的值取sourceTypes的第一个value
                if (this.status === 1) {
                    this.sourceType = this.sourceTypes[0];
                    this.getSourceList(this.sourceType.value);
                } else if (this.status !== 1) {

                    this.sourceTypes.forEach( (t) => {
                        if (t.value ===  this.sourceType) {
                            this.sourceType = t;

                        }
                    });
                }
            });
    }

    /**
     * 编辑数据源的保存
     */
    editDataSource() {
        this.repositoryService.editSource({
            dsName: this.sourceName,
            dsType: this.sourceType['value'],
            id: this.sourceId,
            dsDesc: this.sourceDsec,
            deletedState: this.sourceDeletedState,
            syncState: this.sourceSyncState,
            createUserId: this.loginService.userId,
            dsIntent: this.dsIntent,
            dsConfigs: [{
                label: 'url',
                value: this.url,
                id: this.urlId
            }, {
                label: 'username',
                value: this.username,
                id: this.usernameId
            }, {
                label: 'password',
                value: this.updatePassword ? this.toolService.encrypt(this.password, KeysPsw.DATASOURCEKEY) : null,
                id: this.passwordId
            }, {
                label: 'port',
                value: this.port
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
     * 连接测试
     */
    async connectClick() {
        if (!this.check()) {
            return;
        }
        let password = '';
        if (this.status === 2) {
            password = this.password;
        } else {
            password = this.password ? this.toolService.encrypt(this.password, KeysPsw.DATASOURCEKEY) : null;
        }
        this.repositoryService.testSource({
            url: this.url,
            username: this.username,
            password: password,
            dsType: this.sourceType['value'],
        }).then(d => {
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
        });

    }

    /**
     * 保存数据源
     */
    async saveClick() {
        if (!this.check()) {
            return;
        }
        // 新创建 给数据源加标识 代表是数据仓库
        if (this.status === 1) {
            this.repositoryService.updataDsIntent(this.dataSourceName && this.dataSourceName['id']).then( d => {
                if (d.success) {
                    this.modalService.alert(d.message  || '保存成功');
                    this.hideInstance();
                } else  {
                    this.modalService.alert(d.message || '保存失败');
                }
            });
        } else if (this.status === 2) {
            let password = '';
            if (this.status === 2) {
                password = this.password;
            } else {
                password = this.password ? this.toolService.encrypt(this.password, KeysPsw.DATASOURCEKEY) : null;
            }
            // 先调用一遍测试接口
            let d = await this.repositoryService.testSource({
                url: this.url,
                username: this.username,
                password: password,
                dsType: this.sourceType['value'],
            });

            if (d) {
                // if (this.status === 1) {
                //     this.newDataSource();  // 新建保存
                // } else if (this.status === 2) {
                this.editDataSource(); // 编辑保存
                // }
            } else {
                this.modalService.alert('配置有误，请重新编辑');
            }

        }


    }

    /**
     * 取消保存
     *
     */

    cancelClick() {
        this.hideInstance();
    }

    sourceTypeChecked(type: any) {
        // if (this.sourceType.value !== type.value ) {
        //     this.sourceType = type;
        //     this.pIns.setWarn([]);
        // }
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
     * 下拉框选择
     * @param obj
     * @param type
     */
    selectChange (obj: any, type: any) {
        this[type] = obj;
        // 数据源类型选中
        if (type === 'sourceType') {
            this.dataSourceNames = [];
            this.dataSourceName = null;
            this.getSourceList(this.sourceType.value);
        } else {

            if (obj.dsType !== this.sourceType) {
                // this.fieldData = [];
            }
            // this.sourceType = obj.dsType;
            // this.getFieldType();
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
