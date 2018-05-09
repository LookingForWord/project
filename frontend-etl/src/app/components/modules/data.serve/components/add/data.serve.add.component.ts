import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ModalService, ToolOpenOptions } from 'frontend-common/ts_modules/services/modal.service/modal.service';
import { DataServeService } from 'app/services/data.serve.service';
import { ServiceStatusEnum } from 'app/constants/service.enum';
import { DataServeAddSetColRangeModelComponent } from 'app/components/modules/data.serve/components/add/model/data.serve.add.set.col.range.model.component';

@Component({
    selector: 'data-serve-add-component',
    templateUrl: './data.serve.add.component.html',
    styleUrls: ['./data.serve.add.component.scss']
})
export class DataServeAddComponent implements OnInit {
    errorType: any;
    error: any;
    serveId: any;
    remark: any;            // 服务说明
    sqlStatement: any;      // sql语句
    serveName: any;         // 服务名称
    tags: any;              // 标签集合
    checkedTag = [];        // 选中的标签
    statusArray: any;       // 状态集合
    checkedStatus: any;     // 选中的状态

    // 添加表
    sysArray: any;          // 系统集合
    checkedSys: any;        // 选择的系统
    dbArray: any;           // 数据库集合
    checkedDb: any;         // 选择的数据库
    tableArray: any;        // 表集合
    checkedTable: any;      // 选择的表
    columnArray = [];       // 表的字段信息 {columnComment columnName id}


    // 可编辑状态
    isDisabled = {
        addTable: false,
        editSql: true
    };

    // 保存字段的条件
    savedColRange = {};    // {id: range}

    //
    isAddServe = true;   // 新增还是编辑

    serveTypes = [
        {name: '公共服务', value: 0},
        {name: '个人服务', value: 1}
    ];
    checkedServeType = {name: '公共服务', value: 0};
    constructor(private router: Router,
        private location: Location,
        private activatedRoute: ActivatedRoute,
        private modalService: ModalService,
        private dataServeService: DataServeService) {
        this.activatedRoute.params.subscribe(params => {
            this.serveId = Number(params.id);
        });

    }

    ngOnInit() {
        this.statusArray = [
            {
                name: '激活', value: 0
            }, {
                name: '暂停', value: 1
            }, {
                name: '失效', value: 2
            }
        ];
        this.checkedStatus = {
            name: '激活', value: 0
        };

        this._getInitSelectOpts_thenInitCheck();

    }

    /**
     * 编辑服务-初始化信息
     */
    _initData(serveId: any) {
        this.dataServeService.editServe_getServeDetailById({id: serveId}).then( d => {
            if (d.rspcode === ServiceStatusEnum.SUCCESS && d.data) {
               doInit(d.data);
            } else {
                this.modalService.alert(d.data || d.rspdesc || d.message, { auto: true });
            }
        });

        let doInit = (data) => {
            let params = {};
            if (data.params) {
                params = JSON.parse(data.params);
            }
            this.serveName = data.name;                 // 服务名称
            this.remark = data.serveDesc;               // 服务介绍
            this.sqlStatement = data.standardSql;
            // 服务状态
            this.statusArray.forEach( o => {
                if (o.value === data.status) {
                    this.checkedStatus = o;
                }
            });
            // 服务类别
            this.serveTypes.forEach(item => {
                if (item.value === data.type) {
                    this.checkedServeType = item;
                }
            });
            // 选择系统
            data.systemId &&  this.sysArray.forEach( s => {
                if (s.id === data.systemId) {
                    this.checkSys(s);
                }
            });
            // 标签
            let tagArr = [];
            data.serveTags && this.tags.forEach(item => {
               data.serveTags.forEach(tag => {
                   if (item.name === tag.tagName) {
                        tagArr.push(item);
                   }
               });
            });
            this.checkedTag = tagArr;
            // 获取表字段
            let doCheckCol = () => {
                this.columnArray.forEach( col => {
                    let _tempColName = col.columnName;
                    let column = params['tables'][0]['columns'].find( c => c.columnName === _tempColName);
                    if (column) {
                        col.checked = true;
                    }

                    // 字段过滤
                    let range = params['readRanges'] && params['readRanges'].find(idx => {
                        return idx.columnName === col.columnName;
                    });
                    if (range) {
                        col.range = range.range;
                    }
                });
            };
            // 获取表
            let doCheckTable = () => {
                params['tables'][0]['id'] && this.tableArray.forEach( t => {
                    if (t.id === params['tables'][0]['id']) {
                        this.checkTable(t);
                        // 处理列
                        setTimeout( () => {
                            doCheckCol();
                        }, 400);

                    }
                });
            };


            // 选择数据库->获取表列表
            data.dsId && this.dbArray.forEach( d => {
                if (d.dsId === data.dsId) {
                    this.checkDb(d);
                    // 选择表
                     setTimeout( () => {
                        doCheckTable();
                     }, 400);
                }
            });
        };
    }

    /**
     * 新增、编辑保存服务
     */
    addData(type: any) {
        if (!this._check()) {
            return;
        }
        let tagNames = [];
        this.checkedTag && this.checkedTag.forEach(item => {
            tagNames.push(item.name);
        });
        let _post_param = {
            name: this.serveName,                                   // 服务名称
            systemId: this.checkedSys ? this.checkedSys.id : '',    // 所属系统id号
            dsId: this.checkedDb ? this.checkedDb.dsId : '',        // 数据源id号
            serveDesc: this.remark || '',                           // 服务说明
            status: this.checkedStatus.value,                       // 服务状态：0 - 正常；1 - 暂停；2 - 失效
            type: this.checkedServeType.value,                      // 服务类别：0 - 公共服务；1 - 个人服务
            sqlType: this.isDisabled.editSql ? 0 : 1,               // sql定义方式：0 - 解析生成；1 - 自定义
            standardSql: this.sqlStatement,                         // sql语句
            tagNames: tagNames,                                      // 标签集合,
            params: null
        };
        let _post_params = {
            tables: [
                {
                    id: this.checkedTable.id,
                    tableName: this.checkedTable.tableName,
                    alias: 't1', // 别名：前端自己定义规则生成，需要tables里面唯一
                    columns: []
                }
            ],
            readRanges: []

        };
        this.columnArray.forEach(col => {
            if (col.checked) {
                _post_params.tables[0].columns.push({
                    columnName: col.columnName
                });

                if (col.range) {
                    if (!_post_params['readRanges']) { _post_params['readRanges'] = [] }

                    _post_params['readRanges'].push({
                        columnName: col.columnName,
                        tableAlias: 't1',
                        range: col.range
                    });
                }
            }
        });
        _post_param.params = JSON.stringify(_post_params);
        type === 'add' && this.dataServeService.addServe(_post_param).then(d => {
            if (d.rspcode === ServiceStatusEnum.SUCCESS && d.data) {
                this.modalService.alert('新建服务成功');
                this.goBack();
            } else {
                this.modalService.alert(d.data || d.rspdesc || d.message, { auto: true });
            }
        });
        if (type === 'edit') {
            this.dataServeService.editServe({
                id: this.serveId,
                ..._post_param
            }).then(d => {
                if (d.rspcode === ServiceStatusEnum.SUCCESS && d.data) {
                    this.modalService.alert('服务保存成功');
                    this.goBack();
                } else {
                    this.modalService.alert(d.data || d.rspdesc || d.message, { auto: true });
                }
            });
        }
    }


    /**
     * 新增之前检查
     * @returns boolean
     */
    _check(): boolean {
        let res = true;

        if (this.serveName === '' || this.serveName === undefined) {
            this.errorType = 'serveName';
            this.error = '请填写服务名称';
            res = false;
        } else if (!this.checkedStatus) {
            this.errorType = 'checkedStatus';
            this.error = '请选择服务状态';
            res = false;
        } else if (!this.checkedSys) {
            this.errorType = 5;
            this.error = '请选择系统';
            res = false;
        } else if (!this.checkedDb) {
            this.errorType = 6;
            this.error = '请选择数据源';
            res = false;
        } else if (!this.checkedTable) {
            this.errorType = 7;
            this.error = '请选择表';
            res = false;
        } else {
            this.error = '';
        }

        // this.error && this.modalService.alert(this.error, { auto: true });
        return res;

    }

    /**
     * 获取各种下拉选项
     */
    _getInitSelectOpts_thenInitCheck() {
        let getNum = 0;
        let init = () => {
            getNum ++ ;

            if (getNum < 2) {
                return;
            }
            if (this.serveId > 0) {
                // 编辑
                this.isAddServe = false;
                this._initData(this.serveId);

            } else {
                // 新增
                this.isAddServe = true;
            }
        };

        // 1 标签列表
        this.dataServeService.addServe_getTagsArray().then(d => {
            if (d.rspcode === ServiceStatusEnum.SUCCESS && d.data) {
                let _ops = [];
                d.data.forEach(element => {
                    _ops.push({
                        name: element
                    });
                });
                this.tags = _ops;

            } else {
                this.modalService.alert(d.data || d.rspdesc || d.message, { auto: true });
            }

            init();

        });
        // 2 系统列表 和 数据库列表
        this.dataServeService.addServe_getSysList().then(d => {

            if (d.success === true) {
                d.message.forEach(item => {
                    item.name = item.systemName;
                    item.metaDses.forEach(o => {
                        o.name = o.dsName;
                    });
                });
                this.sysArray = d.message;

            } else {
                this.modalService.alert(d.data || d.rspdesc || d.message, { auto: true });
            }

              init();
        });




    }

    goBack() {
        this.location.back();
    }

    /**
     * 标签-选择
     */
    checkTag(item: any) {
        this.checkedTag = item;
    }

    /**
     * 选择-状态
     */
    checkStatus(item: object) {
        this.checkedStatus = item;
        if (this.errorType === 'checkedStatus') {
            this.errorType = '';
        }
    }

    /**
     * 服务类别选择
     */
    checkType(item: any) {
        if (this.checkedServeType.value !== item.value) {
            this.checkedServeType = item;
        }
    }
    /**
     * 选择-系统
     */
    checkSys(item: any) {
        this.checkedSys = item;
        this.dbArray = item.metaDses;
        this.checkedDb = null;
        this.checkedTable = null;
    }
    /**
     * 选择-数据库
     */
    async checkDb(item: any) {
        this.checkedDb = item;
        this.checkedTable = null;
        // 获取数据库下的表
        let _data = {
            dsId: this.checkedDb['dsId'],
            systemId: this.checkedSys.id
        };
        let d = await this.dataServeService.addServe_getTableList(_data);
        if (d.success === true) {
            d.message.forEach(element => {
                element.name = element.tableName;
            });
            this.tableArray = d.message;

        } else {
            this.modalService.alert(d.data || d.rspdesc || d.message, { auto: true });
        }
    }
    /**
     * 选择-表
     */
    checkTable(item: any) {
        this.checkedTable = item;

        this.dataServeService.addServe_getColumnByTableId(item.id).then(d => {
            if (d.success === true) {
                this.columnArray = d.message;
            } else {
                this.modalService.alert('根据表获取字段信息失败', { auto: true });
            }
        });
    }
    /**
     * 选择表的col
     */
    checkCol(item: any, $event?: MouseEvent) {
        if ($event) {
            item.checked = !item.checked;
        }
        let _data = {
            tables: [
                {
                    id: this.checkedTable.id,
                    tableName: this.checkedTable.tableName,
                    alias: 't1', // 别名：前端自己定义规则生成，需要tables里面唯一
                    columns: []
                }
            ],
            readRanges: []
        };
        this.columnArray.forEach(k => {
            if (k.checked) {
                _data.tables[0].columns.push({
                    columnName: k.columnName
                });
                k.range && _data.readRanges.push({
                    alias: 't1',
                    columnName: k.columnName,
                    range: k.range
                });
            }
        });
        this.dataServeService.addServe_getStdSqlByTablesInfo(_data).then(d => {
            if (d.rspcode === ServiceStatusEnum.SUCCESS && d.data) {
                this.sqlStatement = d.data;
            } else {
                this.modalService.alert(d.data || d.rspdesc || d.message, { auto: true });
            }
        });
        $event && $event.stopPropagation();
    }

    /**
     * 设置字段范围
     */
    setColRange(_colInfo: any) {
        // 打开弹窗
        let [ins] = this.modalService.toolOpen({
            title: '设置字段范围',
            component: DataServeAddSetColRangeModelComponent,
            datas: {
                colInfo: _colInfo
            },
            okCallback: () => {
                let _range = ins.saveClick();
                _colInfo.range = _range;
                if (_colInfo.checked) {
                    this.checkCol(_colInfo);
                }
            }
        } as ToolOpenOptions);
    }

}
