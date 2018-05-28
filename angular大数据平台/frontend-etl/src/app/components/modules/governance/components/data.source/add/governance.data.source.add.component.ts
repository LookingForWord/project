/**
 * Created by xxy on 2017/11/21/021.
 */

import {Component, OnInit} from '@angular/core';

import {LoginService} from 'app/services/login.service';
import {GovernanceService} from 'app/services/governance.service';
import {CollectDatabaseEnum} from 'app/constants/collect.database.enum';
import {ValidateService} from 'frontend-common/ts_modules/services/validate.service';
import {KeysPsw} from 'app/constants/keys.psw';
import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {ToolService} from 'frontend-common/ts_modules/services/tool.service';
import {RegExgConstant} from 'frontend-common/ts_modules/constants/regexp';

export class SourceTypes {
    name: string;
    value: string;
}

@Component({
    selector: 'governance-data-source-add-component',
    templateUrl: './governance.data.source.add.component.html',
    styleUrls: ['./governance.data.source.add.component.scss']
})
export class GovernanceDataSourceAddComponent implements  OnInit {
    error: string;
    errorType: number;
    pIns: any;            // 按钮集合
    sourceName: string;   // 数据源名称
    sourceType: any;      // 数据源类型
    sourceDsIntent: any;  // 关系型数据库标志，使用旧的字段值
    baseID: number;       // 数据源ID
    url = '';             // 数据源Url
    sourceSyncState: any;
    username = '';        // 用户名
    password = '';        // 密码
    passwordId: string;   // 密码ID
    server: any;          // kafka的变量
    port: any;            // 端口
    status: any;          // 0为查看详情，1为创建数据源，2为编辑数据源
    description: any;     // 数据源描述
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

    constructor(private modalService: ModalService,
                private loginService: LoginService,
                private toolService: ToolService,
                private governanceService: GovernanceService,
                private validateService: ValidateService) {

    }

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
        let validate;
        if (RegExgConstant.regCn.test(this.sourceName) || RegExgConstant.regEn.test(this.sourceName)) {
            this.errorType = 1;
            this.error = '请勿输入特殊字符';
            return;
        }
        if (this.sourceType.value === CollectDatabaseEnum.MYSQL ||
            this.sourceType.value === CollectDatabaseEnum.ORACLE ||
            this.sourceType.value === CollectDatabaseEnum.HIVE ||
            this.sourceType.value === CollectDatabaseEnum.SQLSERVER) {
            validate = this.validateService.get(this, this.getValidateObject(), ['sourceName', 'sourceType', 'url', 'username', 'password']);
        }
        if (this.sourceType.value === CollectDatabaseEnum.FTP ||
            this.sourceType.value === CollectDatabaseEnum.FILE ||
            this.sourceType.value === CollectDatabaseEnum.SPIDER) {
            validate = this.validateService.get(this, this.getValidateObject(), ['sourceName', 'protocol', 'url', 'username', 'password']);
        }
        if (this.sourceType.value === CollectDatabaseEnum.HDFS) {
            validate = this.validateService.get(this, this.getValidateObject(), ['sourceName', 'url']);
        }
        if (this.sourceType.value === CollectDatabaseEnum.KAFKA) {
            validate = this.validateService.get(this, this.getValidateObject(), ['sourceName', 'server', 'port']);
        }
        if (this.sourceType.value === CollectDatabaseEnum.ODPS) {
            validate = this.validateService.get(this, this.getValidateObject(), ['sourceName', 'odpsServer', 'tunnelServer', 'accessId', 'accessKey', 'project']);
        }

        if (validate) {
            this.error = validate.error;
            this.errorType = validate.errorType;
            return false;
        }
        return true;
    }

    getValidateObject() {
        return {
            sourceName: {
                presence: {message: '^请填写数据源名称', allowEmpty: false},
                errorType: 1
            },
            url: {
                presence: {message: '^请填写数据源Url', allowEmpty: false},
                errorType: 2
            },
            username: {
                presence: {message: '^请填写正确格式的数据源用户名', allowEmpty: false},
                errorType: 4
            },
            password: {
                presence: {message: '^请填写正确格式的数据源密码', allowEmpty: false},
                errorType: 5
            },
            server: {
                presence: {message: '^请填写server', allowEmpty: false},
                errorType: 6
            },
            port: {
                presence: {message: '^请填写端口', allowEmpty: false},
                errorType: 7
            },
            odpsServer: {
                presence: {message: '^请填写odpsServer', allowEmpty: false},
                errorType: 8
            },
            tunnelServer: {
                presence: {message: '^请填写tunnelServer', allowEmpty: false},
                errorType: 9
            },
            accessId: {
                presence: {message: '^请填写odps accessId', allowEmpty: false},
                errorType: 10
            },
            accessKey: {
                presence: {message: '^请填写odps accessKey', allowEmpty: false},
                errorType: 11
            },
            project: {
                presence: {message: '^请填写odps project', allowEmpty: false},
                errorType: 12
            },
            protocol: {
                presence: {message: '^请选择ftp类型', allowEmpty: false},
                errorType: 13
            },
            sourceType: {
                presence: {message: '^请选择数据源类型', allowEmpty: false},
                errorType: 14
            }
        };
    }

    /**
     * 获取数据类型列表
     */
    getSourcsType() {
        this.governanceService.searchSourceType()
            .then(d => {
                if (d.success && d.message) {
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
                    } else {
                        this.sourceTypes.forEach( (t) => {
                            if (t.value ===  this.sourceType) {
                                this.sourceType = t;
                            }
                        });
                    }
                } else {
                    this.modalService.alert(d.message);
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
            dsDesc: this.description,
            deletedState: 0,
            creatorId: this.loginService.userId,
            creatorName: this.loginService.realName,
            dsConfigs: [{
                label: 'url',
                value: this.toolService.encrypt(this.url, KeysPsw.DATASOURCEKEY)
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
            dsDesc: this.description,
            dsIntent: this.sourceDsIntent,
            creatorId: this.loginService.userId,
            creatorName: this.loginService.realName,
            dsConfigs: [{
                label: 'url',
                value: this.toolService.encrypt(this.url, KeysPsw.DATASOURCEKEY)
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
            url: this.toolService.encrypt(this.url, KeysPsw.DATASOURCEKEY),
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
