/**
 * Created by LIHUA on 2017-08-12.
 * demo界面 主要做测试和组件展示
 */
import {AfterContentInit, Component, ElementRef, OnInit, Renderer2, ViewChild} from '@angular/core';
import {fadeIn, fadeOut} from 'frontend-common/ts_modules/animations/sim-anim';
import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {INgxMyDpOptions} from 'ngx-mydatepicker';
import {DatepickerOptions} from '../../../frontend-common/ts_modules/directives/datepicker/datepicker.directive';
import {HttpService} from '../../../frontend-common/ts_modules/services/http.service';
// import {DatepickerOptions} from '../../../frontend-common/ts_modules/directives/datepicker/datepicker.directive';

declare var jsPlumb: any;
declare var moment: any;

@Component({
    selector: 'demo-component',
    templateUrl: './demo.component.html',
    styleUrls: ['./demo.component.scss'],
    animations: [fadeIn, fadeOut]
})
export class DemoComponent implements OnInit, AfterContentInit {

    optionChecked: any;
    optionChecked2: any;
    optionChecked3: any;
    smallOptionChecked: any;
    smallOptionChecked2: any;
    smallOptionChecked3: any;

    loginName: string;
    loginError: any;

    options = [
        {name: '中国'},
        {name: '美国fcshsghfsfshfghsdfdgfeturergeure'},
        {name: '英国'}
    ];

    options1 = [
        {name: 'DSDH'},
        {name: 'FHCXCHJ'},
        {name: 'GFDBGFGJ'},
        {name: 'BHFGJFJJE'},
        {name: 'CVDGFSG'},
        {name: 'FDVFDHF'},
        {name: 'KLJHKLA'},
        {name: 'TWEYTY'},
        {name: 'QWXAPM'},
        {name: 'TYTUYI'},
        {name: 'XZVBGB'},
        {name: 'MNBLKGF'},
        {name: 'FDF'},
        {name: 'IUKJ'},
    ];

    mutilOptions = [
        {name: '中国'},
        {name: '美国1'},
        {name: '美国2'},
        {name: '美国3'},
        {name: '美国4'},
        {name: '美国5'},
        {name: '英国'}
    ];
    mutilOption = [];
    mutilOption2 = [
        {name: '中国'},
        {name: '美国1'}
        ];
    smallMutilOption = [];
    smallMutilOption2 = [];

    show = true;

    @ViewChild('slot')
    slot: ElementRef;

    radio = false;

    tress = [{
        id: '1', pid: '0', name: '全部节点', expand: true, checked: false, some: false, childrenChecked: 'none', children: [
            {id: '2', pid: '1', name: '2', expand: true, checked: false, some: false, childrenChecked: 'none', children: [
                {id: '5', pid: '2', name: '5', expand: true, checked: false, some: false, childrenChecked: 'none', children: null},
                {id: '6', pid: '2', name: '6', expand: true, checked: false, some: false, childrenChecked: 'none', children: null}
            ]},
            {id: '3', pid: '1', name: '3', expand: true, checked: false,  some: false, childrenChecked: 'none', children: [
                {id: '7', pid: '3', name: '7', expand: true, checked: false, some: false, childrenChecked: 'none', children: null},
                {id: '8', pid: '3', name: '8', expand: true, checked: false,  some: false, childrenChecked: 'none', children: [
                    {id: '9', pid: '8', name: '9', expand: true, checked: false, some: false, childrenChecked: 'none', children: null},
                    {id: '10', pid: '8', name: '10', expand: true, checked: false, some: false, childrenChecked: 'none', children: null}
                ]}
            ]},
            {id: '4', pid: '1', name: '4', expand: true, checked: false, some: false, childrenChecked: 'none', children: null},
        ]
    }, {
        id: '11', pid: '0', name: '全部节点2', expand: true, checked: false, some: false, children: [
            {id: '12', pid: '11', name: '12', expand: true, checked: false, some: false}
        ]
    }];

    constructor(private modalService: ModalService,
                private render: Renderer2,
                private httpService: HttpService) {}

    ngOnInit() {
        // console.log(this.slot);
    }

    ngAfterContentInit() {
        this.initJsplumb();
    }

    optionCheckedCallback(option: any) {
        this.optionChecked = option;
    }

    optionCheckedCallback2(option: any) {
        this.optionChecked2 = option;
        // console.log(this.optionChecked2);
    }

    optionCheckedCallback3(option: any) {
        this.optionChecked3 = option;
        // console.log(this.optionChecked3);
    }

    onSearchCallback3(search: string) {
        // console.log(search);
    }

    smallOptionCheckedCallback(option: any) {
        this.smallOptionChecked = option;
    }

    smallOptionCheckedCallback2(option: any) {
        this.smallOptionChecked2 = option;
    }

    smallOptionCheckedCallback3(option: any) {
        this.smallOptionChecked3 = option;
    }


    mutilOptionCallback(option: any) {
        this.mutilOption = option;
    }

    mutilOptionCallback2(option: any) {
        this.mutilOption2 = option;
    }
    smallMutilOptionCallback(option: any) {
        this.smallMutilOption = option;
    }

    smallMutilOptionCallback2(option: any) {
        this.smallMutilOption2 = option;
        // console.log(this.smallMutilOption2);
    }
    onSearchCallback(search: string) {
        // console.log(search);
    }


    showLoadingClick() {
        this.modalService.loadingShow(3000);
    }

    showConfrimClick() {
        this.modalService.toolConfirm('确认删除？', () => {
            // ins.okClick();
        });


        // let [ins, pIns] = this.modalService.confirm('确定删除吗？', {title: '测试提示框'});
        // pIns.setBtns([{
        //     name: '取消',
        //     class: 'btn',
        //     click: () => {
        //         ins.cancelClick();
        //     }
        // }, {
        //     name: '确认',
        //     class: 'btn primary',
        //     click: () => {
        //         ins.okClick();
        //     }
        // }]);
        //
        // ins.onDestroy = () => {
        //     console.log('销毁组件');
        // };
    }

    showalertClick(type: number) {
        if (type === 1) {
            this.modalService.alert('alert提示alert提示alert提示alert提示alert提示alert提示alert提示alert提示');
        }
        if (type === 2) {
            this.modalService.alert('alert提示alert提示alert提示alert提示alert提示alert提示alert提示alert提示', {
                title: '提示',
                auto: true,
            });
        }
        if (type === 3) {
            this.modalService.alert('我是不会自己消失的 我是不会自己消失的 我是不会自己消失的 我是不会自己消失的 我是不会自己消失的', {
                auto: true,
                time: 0
            });
        }
    }

    showTClick() {
        this.slot['show'] = !this.slot['show'];
    }

    nextClick() {
        alert('我是父容器的提示');
    }

    /**
     * 连线测试
     */

    leftList = [{
        fieldname: 'name'
    }, {
        fieldname: 'age'
    }, {
        fieldname: 'food'
    }, {
        fieldname: 'water'
    }];

    rightList = [{
        fieldname: 'person'
    }, {
        fieldname: 'food'
    }];

    merges = [
        {
            oldName: [{
                fieldname: 'name'
            }],
            combineSymbol: '#',
            targetName: 'person',
            targetType: 'm'
        },
        {
            oldName: [{
                fieldname: 'food'
            }, {
                fieldname: 'water'
            }],
            combineSymbol: '#',
            targetName: 'food',
            targetType: 'm'
        }
    ];

    splits = [{
        oldName: 'person',
        combineSymbol: '#',
        targetName: [{
            fieldname: 'food'
        }],
        targetType: 's'
    }, {
        oldName: 'food',
        combineSymbol: '#',
        targetName: [{
            fieldname: 'age',
        }, {
            fieldname: 'water',
        }],
        targetType: 's'
    }];

    ins: any;

    @ViewChild('jsplumbContainer') jsplumbContainer: ElementRef;

    startTime: any; // 日期
    dateOption: INgxMyDpOptions = { // 开始日期选择配置
        todayBtnTxt: '今天',
        dateFormat: 'yyyy-mm-dd',
        dayLabels: { su: '周日', mo: '周一', tu: '周二', we: '周三', th: '周四', fr: '周五', sa: '周六' },
        monthLabels: { 1: '一月', 2: '二月', 3: '三月', 4: '四月', 5: '五月', 6: '六月', 7: '七月', 8: '八月', 9: '九月', 10: '十月', 11: '十一月', 12: '十二月' },
        // alignSelectorRight: false     // 选择器右对齐
    };

    // customTime = {
        // date: new Date().getTime()
    // };

    customTime = null;

    customOptions: DatepickerOptions = {
        format: 'YYYY-MM-DD HH:mm:ss',
    };


    initJsplumb() {
        this.initIns();
        setTimeout(() => {
            this.initPonit();
        }, 500);
    }

    initIns() {
        jsPlumb.importDefaults({
            Connector: [ 'Bezier', { curviness: 150 } ],
            Anchors: [ 'TopCenter', 'BottomCenter' ],
            // Overlays: [
            //     ['Arrow', {width: 8, length: 8, location: 0.5}]
            // ],
            HoverPaintStyle: { stroke: 'orange' }
        });

        const that = this;
        jsPlumb.ready(() => {
            that.ins = jsPlumb.getInstance();

            // 连线事件监听
            that.ins.bind('connection', function (data) {
                // console.log(data);

                if (data.connection.scope === 'hand') {
                    that.ins.connect({
                        source: data.source,
                        target: data.target,
                        anchors: ['Right', 'Left'],
                        paintStyle: { stroke: '#108EE9', strokeWidth: 0.5},
                        hoverPaintStyle: { stroke: 'orange' },
                        // endpoint: ['Dot', { radius: 3, cssClass: 'jsplumb-dot-css', hoverClass: 'jsplumb-dot-hover' }],
                        endpoint: ['Dot', { radius: 3 }],
                        endpointStyle: { fill: '#108EE9', strokeWidth: 0 },
                        connector: [ 'Bezier', { curviness: 150 } ],
                        // connector: [ 'Flowchart', { stub: [40, 60], gap: 10, cornerRadius: 5, alwaysRespectStubs: true } ],
                        overlays: [['Arrow', {width: 6, length: 6, location: 0.3}]],
                        dropOptions: {cursor: 'crosshair'},
                        scope: 'auto'
                    });

                    setTimeout(() => {
                        that.ins.deleteConnection(data.connection);
                    });
                }
            });

            // 解除连线事件监听
            that.ins.bind('connectionDetached', function (data) {

            });

            // 右键点击 显示出删除连线按钮
            that.ins.bind('contextmenu', function (connection, originalEvent: MouseEvent) {

            });
        });
    }

    initPonit() {
        let point = this.getEndPoint();

        let leftTds = this.jsplumbContainer.nativeElement.querySelectorAll('.left');
        [].forEach.call(leftTds, (td) => {
            this.ins.addEndpoint(td, { anchors: 'Right' }, point);
            // this.initTdMouseEvent(td);
        });

        let rightTds = this.jsplumbContainer.nativeElement.querySelectorAll('.right');
        [].forEach.call(rightTds, (td) => {
            this.ins.addEndpoint(td, { anchors: 'Left' }, point);
            // this.initTdMouseEvent(td);
        });

        this.initConnection();
    }

    initTdMouseEvent(td) {
        this.render.listen(td, 'mouseenter', (e: MouseEvent) => {
            let points = this.ins.getEndpoints(td);
            points.forEach(point => {
                point.endpoint.canvas.classList.add('jsplumb-dot-hover');
            });
        });
        this.render.listen(td, 'mouseleave', (e: MouseEvent) => {
            // console.log('leave');
            let points = this.ins.getEndpoints(td);
            points.forEach(point => {
                point.endpoint.canvas.classList.remove('jsplumb-dot-hover');
            });
        });
    }

    initConnection() {

        let leftTds = this.jsplumbContainer.nativeElement.querySelectorAll('.left');
        let rightTds = this.jsplumbContainer.nativeElement.querySelectorAll('.right');

        let getMergeDivByName = (name: string) => {
            let temp;
            [].forEach.call(leftTds, (td) => {
                if (td.innerHTML === name) {
                    temp = td;
                }
            });
            return temp;
        };

        let getSplitDivByName = (name: string) => {
            let temp;
            [].forEach.call(rightTds, (td) => {
                if (td.innerHTML === name) {
                    temp = td;
                }
            });
            return temp;
        };

        let mergeDiv, splitDiv;

        this.merges.forEach(merge => {
            merge.oldName.forEach(name => {
                mergeDiv = getMergeDivByName(name.fieldname);
                if (mergeDiv) {
                    splitDiv = getSplitDivByName(merge.targetName);
                    if (splitDiv) {
                        // this.ins.connect({
                        //     source: mergeDiv,
                        //     target: splitDiv,
                        //     anchors: ['Right', 'Left'],
                        //     paintStyle: { stroke: '#108EE9', strokeWidth: 0.5},
                        //     // endpoint: ['Dot', { radius: 3, cssClass: 'jsplumb-dot-css', hoverClass: 'jsplumb-dot-hover' }],
                        //     endpoint: ['Dot', { radius: 3 }],
                        //     endpointStyle: { fill: '#108EE9', strokeWidth: 0 },
                        //     connector: [ 'Bezier', { curviness: 150 } ],
                        //     overlays: [['Arrow', {width: 6, length: 6, location: 0.3}]],
                        //     dropOptions: {cursor: 'crosshair'}
                        // });
                    }
                }
            });
        });

        this.splits.forEach(split => {
            splitDiv = getSplitDivByName(split.oldName);
            if (splitDiv) {
                split.targetName.forEach(name => {
                    mergeDiv = getMergeDivByName(name.fieldname);
                    if (mergeDiv) {
                        // this.ins.connect({
                        //     source: splitDiv,
                        //     target: mergeDiv,
                        //     anchors: ['Left', 'Right'],
                        //     paintStyle: { stroke: '#CC5B58', strokeWidth: 0.5},
                        //     // endpoint: ['Dot', { radius: 3, cssClass: 'jsplumb-dot-css', hoverClass: 'jsplumb-dot-hover' }],
                        //     endpoint: ['Dot', { radius: 3 }],
                        //     endpointStyle: { fill: '#108EE9', strokeWidth: 0 },
                        //     connector: [ 'Bezier', { curviness: 50 } ],
                        //     // connector: ['Flowchart', { cornerRadius: 5} ],
                        //     overlays: [['Arrow', {width: 6, length: 6, location: 0.3}]],
                        //     dropOptions: {cursor: 'crosshair'}
                        // });
                    }
                });
            }
        });
    }

    getEndPoint() {
        let exampleDropOptions = {
            hoverClass: 'dropHover', // 释放时指定鼠标停留在该元素上使用的css class
            activeClass: 'dragActive', // 可拖动到的元素使用的css class
            cursor: 'crosshair'
        };

        let firstPoint = {
            // endpoint: ['Dot', { radius: 3, cssClass: 'jsplumb-dot-css', hoverClass: 'jsplumb-dot-hover' }], // 设置连接点的形状为圆形
            endpoint: ['Dot', { radius: 4 }], // 设置连接点的形状为圆形
            paintStyle: {
                fill: '#fff', // 设置连接点内容的颜色
                stroke: '#CCDDEE',
                strokeWidth: 2
            },
            hoverPaintStyle: { stroke: 'orange' },
            isSource: true,  // 是否可以拖动（作为连线起点）
            scope: 'hand', // 连接点的标识符，只有标识符相同的连接点才能连接
            connectorStyle: { stroke: '#108EE9', strokeWidth: 0.5, fill: 'none' }, // 连线颜色、粗细
            connector: ['Bezier', { curviness: 65 } ], // 设置连线为贝塞尔曲线
            // connector: [ 'Flowchart', { stub: [40, 60], gap: 0, cornerRadius: 10, alwaysRespectStubs: true } ],
            maxConnections: 1, // 设置连接点最多可以连接几条线
            isTarget: true,  // 是否可以放置（作为连线终点）
            dropOptions: exampleDropOptions, // 设置放置相关的css
        };

        return firstPoint;
    }

    onRadioCallback(data) {
        this.radio = data.type === 'yes';
    }

    save() {
        if (!this.loginName) {
            this.loginError = 1;
        }
    }

    /**
     * 获取时间
     */
    getStartTime() {
        // console.log(this.startTime);
        if (this.startTime) {
            alert(this.startTime.formatted);
        }
    }

    /**
     * 设置原始时间
     */
    setStartTime() {
        let time = 1508814405042; // 原始时间

        this.startTime = {
            jsdate: new Date(time),
            formatted: moment(time).format('YYYY-MM-DD')
        };
    }

    showConfrimErrorClick() {

    }

    getCustomTime() {
        console.log(this.customTime);
    }

    setCustomTime() {
        if (this.customTime && this.customTime.date) {
            this.customTime = {
                date: this.customTime.date._d.getTime() + 1000
            };
        }
    }

    httpServerGetDataUrlClick() {
        console.log(this.httpService.getDataUrl('/rest/{name}', {
            name: '1234'
        }));

        console.log(this.httpService.getSearchDataUrl('/rest/xx', {
            name: null,
            age: 12,
            sex: 'male'
        }));
    }

}
