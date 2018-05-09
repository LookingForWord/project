/**
 * Created by LIHUA on 2017-10-17.
 *  权限管理 在线管理
 */
import {Component, OnInit, ViewChild} from '@angular/core';
import {SystemService} from 'app/services/system.service';
import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {INgxMyDpOptions, NgxMyDatePickerDirective} from 'ngx-mydatepicker';
import {Animations} from 'frontend-common/ts_modules/animations/animations';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';

@Component({
    selector: 'task-text-component',
    templateUrl: './task.text.component.html',
    styleUrls: ['./task.text.component.scss'],
    animations: [Animations.slideLeft, Animations.slideBottom, Animations.slideUpDwon]
})
export class TaskTextComponent implements OnInit {
    messageType: any;     // 消息类型
    dateTime: any; // 日期控键
    dateInfo: string;        // 日期信息
    oriText: string;            // 原文
    oriTextShow: SafeHtml;            // 外部描述
    noDataType = false;      // 没有列表数据 true为没有数据，false为有数据

    extractInfos = [];  // 从原文中提取的文本列表
    extractInfosCount: number;            // 列表的条数
    currExtractInfo: string;    // 当前提取的文本内容
    currActions = [];            // 当前文本对应的事件列表

    pagenow = 1;    // 对文本列表进行分页显示
    pagesize = 1;

    messageTypes = [{name: '每日军情动态', value: '每日军情动态'}, {name: '军事活动预告', value: '军事活动预告'}];
    fieldData = [];          // 新增按钮的数据
    deleteActionIndex = -1;     // 删除action所需下标
    deleteKeyIndex = -1;     // 删除快捷键所需下标
    // 快捷键相关数据
    keyboards = [];
    isShowPanel = false;     // 是否显示右侧弹出层

    currActionsChanged = false;

    dataOption: INgxMyDpOptions = {
        todayBtnTxt: '今天',
        dateFormat: 'yyyy-mm-dd',
        dayLabels: {su: '周日', mo: '周一', tu: '周二', we: '周三', th: '周四', fr: '周五', sa: '周六'},
        monthLabels: {
            1: '一月',
            2: '二月',
            3: '三月',
            4: '四月',
            5: '五月',
            6: '六月',
            7: '七月',
            8: '八月',
            9: '九月',
            10: '十月',
            11: '十一月',
            12: '十二月'
        },
    };

    @ViewChild('dpStart') dpStartRef: NgxMyDatePickerDirective;
    dpStart: any;

    constructor(private systemService: SystemService,
                private modalService: ModalService,
                private domSanitizer: DomSanitizer) {
    }


    ngOnInit() {
        this.messageType = this.messageTypes[0];
        this.dateInfo = new Date().toLocaleDateString().split('/').join('-');
        let dateArr = this.dateInfo.split('-');
        if (dateArr.length) {
            this.dateTime = {
                date: {day: dateArr[2], month: dateArr[1], year: dateArr[0]},
                formatted: this.dateInfo
            };
        }
        this.getList(1);
        this.systemService.getKeyList().then(d => {
            if (d.code === 1) {
                this.keyboards = d.data.keyBoards;
            }
        });
    }

    /**
     * 获取列表
     */
    getList(pageIndex) {
        if (this.currActionsChanged) {
            this.modalService.toolConfirm('修改未保存，是否继续？', () => {
                this.sendRequest(pageIndex);
            });
        } else {
            this.sendRequest(pageIndex);
        }
    }

    sendRequest(pageIndex) {
        this.currActionsChanged = false;
        this.pagenow = pageIndex;
        this.dateInfo = this.dateTime.formatted;
        this.systemService.getList({
            dateInfo: this.dateInfo,
            messageType: this.messageType['value']
        }).then(d => {
            if (d.code === 1) {
                this.oriText = d.data.oriText;
                this.extractInfos = d.data.extractInfos;
                this.extractInfosCount = this.extractInfos.length;
                this.currActions = this.extractInfos[pageIndex - 1].actions;
                this.currExtractInfo = this.extractInfos[pageIndex - 1].extractInfo;
                this.highLightKeywords();
            } else {
                this.modalService.alert(d.message);
            }
            // 判断有无数据
            if (!this.currActions.length) {
                this.noDataType = true;
            }
        });
    }

    /**
     * 新增action
     */
    addAction() {
        this.currActions.push({
            extractInfo: null,
            type: null,
            startTime: null,
            endtTime: null,
            fromAddress: null,
            toAddress: null,
            point: null,
            registID: null,
            callID: null,
            country: null,
            belongOrg: null,
        });

        let id = 'target' + (this.currActions.length - 1);
        setTimeout(() => {
            let container = document.getElementById(id);
            container.focus();
            this.deleteActionIndex = (this.currActions.length - 1);
        }, 200);
    }

    /**
     * 删除action
     */
    deleteAction() {
        if (this.deleteActionIndex !== -1 && this.currActions.length > 1) {
            this.currActions.splice(this.deleteActionIndex, 1);
            this.deleteActionIndex = -1;
        }
    }

    /**
     * 获取action索引
     * @param i
     */
    getActionIndex(i) {
        this.deleteActionIndex = i;
    }

    /**
     * 保存actions
     */
    saveActions() {
        this.currActionsChanged = false;
        if (!this.checkActions()) {
            return;
        }
        this.systemService.putList({
            messageType: this.messageType['value'],
            dateInfo: this.dateInfo,
            extractInfo: this.currActions
        }).then(d => {
            this.modalService.alert(d.message);
        });
    }

    /**
     * 校验保存的文本
     * @returns {boolean}
     */
    checkActions() {
        for (let actionIndex = 0; actionIndex < this.currActions.length; actionIndex++) {
            let startT = this.currActions[actionIndex].startTime;
            let endT = this.currActions[actionIndex].endTime;
            let point = this.currActions[actionIndex].point;
            let dateReg = new RegExp('^\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}$', '');
            let pointReg = new RegExp('^\\d{1,}.?\\d{1,},\\d{1,}.?\\d{1,}$', '');
            if (startT != null && !dateReg.test(startT)) {
                this.modalService.alert('时间格式异常！(yyyy-MM-dd HH:mm:ss)');
                return false;
            }
            if (endT != null && !dateReg.test(endT)) {
                this.modalService.alert('时间格式异常！(yyyy-MM-dd HH:mm:ss)');
                return false;
            }
            if (point != null && !pointReg.test(point)) {
                this.modalService.alert('经纬度录入异常！(double,double)');
                return false;
            }
            if (!this.currActions[actionIndex].target) {
                this.modalService.alert('目标名称不能为空！');
                return false;
            }
        }
        return true;
    }

    /**
     * 下拉选择
     */
    sourceTypeCheck(type: any) {
        this.messageType = type;
    }

    /**
     * 分页跳转
     */
    doPageChange(page: any) {
        if (this.currActionsChanged) {
            this.modalService.toolConfirm('修改未保存，是否继续？',
                () => {
                    this.refreshPage(page);
                }
            );
        } else {
            this.refreshPage(page);
        }
    }

    refreshPage(page) {
        this.currActionsChanged = false;
        this.pagenow = page;
        this.currActions = this.extractInfos[page - 1].actions;
        this.currExtractInfo = this.extractInfos[page - 1].extractInfo;
        this.highLightKeywords();
    }

    showKeyInfo(keyBoard: any) {
        let keyInfo = this.keydownReturnKeyInfo(keyBoard);
        let id = 'key' + this.deleteKeyIndex;
        let curr = document.getElementById(id);
        if (keyInfo !== '') {
            curr['value'] = keyInfo;
        }
    }

    /**
     * 按下快捷键，获得按下的键盘信息
     */
    keydownReturnKeyInfo(keyBoard: any) {
        let keyInfo = '';
        let keys = [];
        if (keyBoard.altKey) {
            keys.push('ALT');
        }
        if (keyBoard.ctrlKey) {
            keys.push('CTRL');
        }
        if (keyBoard.shiftKey) {
            keys.push('SHIFT');
        }
        let keyCodeMap = {
            '48': '0',
            '49': '1',
            '50': '2',
            '51': '3',
            '52': '4',
            '53': '5',
            '54': '6',
            '55': '7',
            '56': '8',
            '57': '9',
            '65': 'A',
            '66': 'B',
            '67': 'C',
            '68': 'D',
            '69': 'E',
            '70': 'F',
            '71': 'G',
            '72': 'H',
            '73': 'I',
            '74': 'J',
            '75': 'K',
            '76': 'L',
            '77': 'M',
            '78': 'N',
            '79': 'O',
            '80': 'P',
            '81': 'Q',
            '82': 'R',
            '83': 'S',
            '84': 'T',
            '85': 'U',
            '86': 'V',
            '87': 'W',
            '88': 'X',
            '89': 'Y',
            '90': 'Z'
        };
        if (keyCodeMap[keyBoard.keyCode]) {
            keys.push(keyCodeMap[keyBoard.keyCode]);
            keyInfo = keys.join('+');
        } else {
            keyInfo = '';
        }
        if (keys.length < 2) {
            keyInfo = '';
        }
        return keyInfo;
    }

    /**
     * 按下快捷键，获得快捷键对应的内容
     */
    keydownReturnValueInfo(keyBoard: any) {
        let keyInfo = this.keydownReturnKeyInfo(keyBoard);
        for (let i = 0; i < this.keyboards.length; i++) {
            if (this.keyboards[i][keyInfo]) {
                alert(this.keyboards[i][keyInfo]);
                return this.keyboards[i][keyInfo];
            }
        }
        return '';
    }

    /**
     * 展开快捷键 查看详情
     */
    showPanelClick($event: MouseEvent) {
        this.isShowPanel = true;
        $event.stopPropagation();
    }

    /**
     *隐藏弹出框
     */
    hideRightPannel() {
        this.isShowPanel = false;
    }

    /**
     * 新增快捷键
     */
    addKey() {
        this.keyboards.push({
            keyInfo: null,
            valueInfo: null,
        });
        let id = 'key' + (this.keyboards.length - 1);
        setTimeout(() => {
            let container = document.getElementById(id);
            container.focus();
            this.deleteKeyIndex = (this.keyboards.length - 1);
        }, 200);
    }

    /**
     * 删除快捷键
     */
    deleteKey() {
        if (this.deleteKeyIndex !== -1) {
            this.keyboards.splice(this.deleteKeyIndex, 1);
            this.deleteKeyIndex = -1;
        }
    }

    /**
     * 获取快捷键索引
     * @param i
     */
    getKeyIndex(i) {
        this.deleteKeyIndex = i;
    }

    /**
     * 保存快捷键修改
     */
    saveKeys() {
        if (!this.checkKeys()) {
            this.modalService.alert('快捷键配置有误，请检查！');
            return;
        }
        this.systemService.putKey({
            keyboards: this.keyboards
        }).then(d => {

            this.modalService.alert(d.message);
            if (d.code === 1) {
                this.systemService.getKeyList().then(d => {
                    if (d.code === 1) {
                        this.keyboards = d.data.keyBoards;
                    }
                });
            }
        });
    }

    /**
     * 校验快捷键
     * @returns {boolean}
     */
    checkKeys() {
        for (let keyIndex = 0; keyIndex < this.keyboards.length; keyIndex++) {
            let keyInfo = this.keyboards[keyIndex].keyInfo;
            if (!keyInfo) {
                return false;
            }
            let keySource1 = new Array('F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12', 'CTRL', 'ALT', 'SHIFT');
            let keySource2 = new Array('F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12', 'CTRL', 'ALT', 'SHIFT',
                'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
                '1', '2', '3', '4', '5', '6', '7', '8', '9', '0');

            let keyArr = keyInfo.split('\+');
            // 快捷键必须包含keySouce1中的任意一个或多个
            let mustContains = false;
            for (let i = 0; i < keyArr.length; i++) {
                let curr = keyArr[i].trim().toUpperCase();
                for (let souce1Index = 0; souce1Index < keySource1.length; souce1Index++) {
                    if (curr === keySource1[souce1Index]) {
                        mustContains = true;
                    }
                }

                // 判断是否含有非法字符
                let existedInvalid = true;
                for (let souce2Index = 0; souce2Index < keySource2.length; souce2Index++) {
                    if (curr === keySource2[souce2Index]) {
                        existedInvalid = false;
                    }
                }
                if (existedInvalid) {
                    return false;
                }
            }
            if (!mustContains) {
                return false;
            }
        }
        return true;
    }

    /**
     * 原文所对应的文本高亮显示
     */
    highLightKeywords() {
        this.oriTextShow = this.domSanitizer.bypassSecurityTrustHtml(this.oriText.replace(this.currExtractInfo, `<span style='color:red'>${this.currExtractInfo}</span>`));
    }

    /**
     * input框改变事件
     */
    changeText(id: any) {
        this.currActionsChanged = true;
    }
}
