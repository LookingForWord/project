/**
 * Created by lh on 2017/12/18.
 * 运维中心 汇聚日志
 */

declare let jsPlumb: any;

import {Component, AfterViewInit, OnInit, ViewChild, ElementRef} from '@angular/core';

@Component({
    selector: 'task-operation-convergence-preview-component',
    templateUrl: './task.operation.convergence.preview.component.html',
    styleUrls: ['./task.operation.convergence.preview.component.scss']
})
export class TaskOperationConvergencePreviewComponent implements OnInit, AfterViewInit {
    @ViewChild('canvas') canvas: ElementRef;         // 画布容器
    ins: any;                                       // 连线对象
    dataType: any;                                  // split 一表多拆    merge 多表合一

    sourceSplitName: any;                           // 一表多拆源表名字
    sourceSplitKeys = [];                           // 一表多拆源字段集合;
    targetTables = [];                              // 一表多拆目标字段集合

    join = [];                                      // 表内关联

    targetMergeName: any;                           // 多表合一目标表名
    targetMergeKeys = [];                           // 多表合一目标字段集合;
    sourceTables = [];                              // 多表合一源字段集合

    dataAttr: any;

    constructor() {

    }

    ngOnInit() {
        // 一表多拆
        if (this.dataType === 'split') {
            this.dataAttr.forEach(item => {
                this.sourceSplitName = item.sourceTableName[0];
                let arr = item.fieldName.split(',');
                let obj = {
                    name: item.targetTableName,
                    keys: []
                };
                // 一表多拆 源表一个字段可能对应多个字段
                arr.forEach(idx => {
                    this.sourceSplitKeys.push({source: idx.slice(idx.indexOf('.') + 1, idx.indexOf(' ')), target: [item.targetTableName + '.' + idx.slice(idx.indexOf(' ') + 1)]});
                    obj.keys.push({source: idx.slice(idx.indexOf('.') + 1, idx.indexOf(' ')), target: idx.slice(idx.indexOf(' ') + 1)});
                });
                this.targetTables.push(obj);
            });
            // 源表集合去掉重复字段
            let newArr = [];
            const len = this.sourceSplitKeys.length;
            for (let i = 0; i < len; i++) {
                let flag = true;
                let obj = null;
                for (let j = i + 1; j < len; j++) {
                    // 源表如果出现同名
                    if ( this.sourceSplitKeys[i] && this.sourceSplitKeys[j] && this.sourceSplitKeys[i].source === this.sourceSplitKeys[j].source) {
                        this.sourceSplitKeys[i].target = this.sourceSplitKeys[i].target.concat(this.sourceSplitKeys[j].target);
                        delete  this.sourceSplitKeys[j];
                    }
                }
                newArr.push(this.sourceSplitKeys[i]);
            }
            let arr = [];
            newArr.forEach(item => {
                if (item) {
                    arr.push(item);
                }
            });
            this.sourceSplitKeys = arr;
        } else  if (this.dataType === 'merge') {
            this.dataAttr.forEach(item => {
                this.join = item.join && item.join.split(',');
                this.targetMergeName = item.targetTableName;
                let arr = item.fieldName.split(',');
                item.sourceTableName.forEach(source => {
                    let obj = {
                        name: source,
                        keys: []
                    };
                    arr.forEach(field => {
                        if (field.slice(0, field.indexOf('.')) === source) {
                            obj.keys.push({
                                source: field.slice(field.indexOf('.') + 1, field.indexOf(' ')),
                                target: field.slice(field.indexOf(' ') + 1),
                                type: ''
                            });
                        }
                    });
                    this.sourceTables.push(obj);
                });
                arr.forEach(field => {
                    this.targetMergeKeys.push({
                        sourceTable: field.slice(0, field.indexOf('.')),
                        source: field.slice(field.indexOf('.') + 1, field.indexOf(' ')),
                        target: field.slice(field.indexOf(' ') + 1),
                        type: ''
                    });
                });
            });
            // 数据正常情况下不会出现该情况的   多表合一  目标表一个字段只允许连一根线
            let newArr = [];
            let arr = [];
            const len = this.targetMergeKeys.length || 0;
            for (let i = 0; i < len; i++) {
                let flag = true;
                let obj = null;
                for (let j = i + 1; j < len; j++) {
                    // 源表如果出现同名
                    if ( this.targetMergeKeys[i] && this.targetMergeKeys[j] && this.targetMergeKeys[i].target === this.targetMergeKeys[j].target) {
                        delete  this.targetMergeKeys[j];
                    }
                }
                newArr.push(this.targetMergeKeys[i]);
            }
            newArr.forEach(item => {
                if (item) {
                    arr.push(item);
                }
            });
            this.targetMergeKeys = arr;
            // 判断源表映射字段是否是与上面的重复字段
            this.join.length && this.join.forEach(idx => {
                let relation = idx.split('=');
                let sourceTable = relation[0].slice(0, relation[0].indexOf('.'));
                let sourceField = relation[0].slice(relation[0].indexOf('.') + 1, );
                let targetTable = relation[1].slice(0, relation[1].indexOf('.'));
                let targetField = relation[1].slice(relation[1].indexOf('.') + 1, );

                this.sourceTables.forEach(source => {
                    if (source.name === sourceTable) {
                        let result = source.keys.filter(key => {
                            return key.source === sourceField;
                        });
                        result.length === 0 && source.keys.push({
                            source: sourceField,
                            target: targetField,
                            type: 'join'
                        });
                    }
                    if (source.name === targetTable) {
                        let result = source.keys.filter(key => {
                            return key.source === targetField;
                        });
                        result.length === 0 && source.keys.push({
                            source: targetField,
                            target: targetField,
                            type: 'join'
                        });
                    }
                });
            });
        }

    }

    ngAfterViewInit( ) {
        setTimeout(() => {
            this.initJsplumb();
            this.initLines();
        }, 100);
    }

    /**
     * 初始化连线组件
     */
    initJsplumb() {
        const that = this;
        jsPlumb.ready(() => {
            that.ins = jsPlumb.getInstance({
                Connector: [ 'Bezier', { curviness: 150 } ],
                HoverPaintStyle: { stroke: 'orange' }
            });
        });
    }

    initLines() {
        setTimeout(() => {
            let point = this.getEndPoint().firstPoint;
            // 源表目标表连线
            let sources = this.canvas.nativeElement.querySelectorAll('.source .item');
            let targets = this.canvas.nativeElement.querySelectorAll('.target .item');
            sources.forEach(source => {
                targets.forEach(target => {
                    if (source.getAttribute('name') === target.getAttribute('source') && source.getAttribute('table') === target.getAttribute('sourceTable')) {
                        this.ins.addEndpoint(source, { anchors: 'Right' }, point);
                        this.ins.addEndpoint(target, { anchors: 'Left' }, point);
                        this.ins.connect(this.getConnectionStyle({
                            source: source,
                            target: target,
                            stroke: '#108EE9',
                            location: 0.5
                        }));
                    }
                });
            });
            // 源表映射连线
            this.join.length && this.join.forEach(idx => {
                let relation = idx.split('=');
                let sourceTable = relation[0].slice(0, relation[0].indexOf('.'));
                let sourceField = relation[0].slice(relation[0].indexOf('.') + 1, );
                let targetTable = relation[1].slice(0, relation[1].indexOf('.'));
                let targetField = relation[1].slice(relation[1].indexOf('.') + 1, );

                let sourceArr = this.canvas.nativeElement.querySelectorAll(`.source .item[table="${sourceTable}"]`);
                let targetArr = this.canvas.nativeElement.querySelectorAll(`.source .item[table="${targetTable}"]`);
                let source;
                let target;
                sourceArr.forEach(idx => {
                    if (idx.innerHTML === sourceField) { source = idx; }
                });
                targetArr.forEach(idx => {
                    if (idx.innerHTML === targetField) { target = idx; }
                });
                this.ins.addEndpoint(source, { anchors: 'Left' }, point);
                this.ins.addEndpoint(target, { anchors: 'Left' }, point);
                this.ins.connect(this.getConnectionStyle({
                    source: source,
                    target: target,
                    stroke: '#108EE9',
                    location: 0.5
                }, 'join'));
            });
        }, 200);
    }
    /**
     * 连接点基本设置
     * @returns points
     */
    getEndPoint() {
        let exampleDropOptions = {
            hoverClass: 'dropHover',                                             // 释放时指定鼠标停留在该元素上使用的css class
            activeClass: 'dragActive'                                            // 可拖动到的元素使用的css class
        };

        let firstPoint = {
            endpoint: ['Dot', { radius: 3 }],                                      // 设置连接点的形状为圆形
            paintStyle: { fill: '#fff', stroke: '#CCDDEE', strokeWidth: 2 },       // 设置连接点的颜色
            hoverPaintStyle: { stroke: 'orange' },
            isSource: true,                                                        // 是否可以拖动（作为连线起点）
            scope: 'auto',                                                         // 连接点的标识符，只有标识符相同的连接点才能连接
            connectorStyle: { stroke: '#2E3131', strokeWidth: 0.4, fill: 'none' }, // 连线颜色、粗细
            connector: ['Bezier', { curviness: 150 } ],                            // 设置连线为贝塞尔曲线
            maxConnections: 100,                                                   // 设置连接点最多可以连接几条线
            isTarget: true,                                                        // 是否可以放置（作为连线终点）
            dropOptions: exampleDropOptions,                                       // 设置放置相关的css
            connectionsDetachable: false,                                          // 连接过后可否分开
            connectorOverlays: [                                                   // 连接箭头
                ['Arrow', {width: 6, length: 6, location: 0.5}]
            ]
        };
        return {firstPoint};
    }

    /**
     * 获取连接线样式
     * @param option
     * @param type
     * @returns {{source; target; anchors: ([string , string] | [string , string]); deleteEndpointsOnDetach: boolean; paintStyle: {stroke; strokeWidth: number}; hoverPaintStyle: {stroke: string}; endpoint: [string , {radius: number}]; endpointStyle: {fill: string; strokeWidth: number}; connector: [string , {curviness: number}]; overlays: [(string | {width: number; length: number; location})[]]; detachable: boolean; scope; connectionsDetachable: boolean}}
     */
    getConnectionStyle(option: any, type?: any) {
        return {
            source: option.source,
            target: option.target,
            anchors: (type === 'join' ? ['Left', 'Left'] : ['Right', 'Left']),
            deleteEndpointsOnDetach: false,
            paintStyle: {stroke: option.stroke, strokeWidth: 0.5},
            hoverPaintStyle: { stroke: 'orange' },
            endpoint: ['Dot', {radius: 2}],
            endpointStyle: { fill: '#108EE9', strokeWidth: 0 },
            connector: ['Bezier', {curviness: 150}],
            overlays: [['Arrow', {width: 6, length: 6, location: option.location}]],
            detachable: false,
            scope: option.scope, // 表示连线是组合
            connectionsDetachable: false,
        };
    }
}
