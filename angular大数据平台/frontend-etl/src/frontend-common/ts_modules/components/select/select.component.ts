/**
 * Created by LIHUA on 2017-08-12.
 * 单选下拉框
 */

import {Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, Renderer2, SimpleChange, ViewChild} from '@angular/core';
import {Animations} from 'frontend-common/ts_modules/animations/animations';
import 'rxjs/add/operator/debounceTime';

@Component({
    selector: 'select-component',
    templateUrl: './select.component.html',
    styleUrls: ['./select.component.scss'],
    animations: [Animations.slideUpDwon]
})
export class SelectComponent implements OnInit, OnChanges, OnDestroy {

    @Input()
    option: any;       // 当前被选中的option
    _option: any;

    @Input()           // 传进来的options列表
    options: any;
    _options: any;

    @Input()
    label = 'name';        // 显示的key

    @Input()
    disabled: boolean; // 是否禁用

    @Input()
    index: number;     // 序号，主要是循环出现的时候 区分序列

    @Input()
    type: string;     // 序号类型

    @Input()
    fixed: boolean;    // 是否固定 所谓固定是点击选择的时候不主动隐藏下拉框 true 不隐藏， 默认隐藏

    @Output()
    callback: EventEmitter<any> = new EventEmitter(); // 确定点击回调

    @Input()
    position = 'bottom';  // 下拉位置 默认底部， top 顶部

    @Input()
    placeholder: string; // 空白描述

    @Input()
    single = false;      // 是否为单一源选择，单一源就是 源不拷贝

    @Input()
    clear = false;      // 是否显示清除按钮

    @Input()
    search = false;     // 是否显示搜索按钮
    @Input()
    searchs: any;       // 待搜索数组

    @Input()
    size: string;       // 选中的框的size，small为小的，

    @Input()
    background: any;

    @Input()
    downHeight: number; // 下拉内容的高度

    @Input()
    edit = false; // 是否可以自行编辑
    editModel: any; // 编辑对象
    @Output()
    editCallback: EventEmitter<any> = new EventEmitter<any>(); // 编辑回调
    @Input()
    editDebounceTime = 300; // 编辑回调延迟触发时间

    @Output()
    searchCallback: EventEmitter<any> = new EventEmitter();  // 搜索回调
    @ViewChild('searchInput')
    searchInput: ElementRef;                                 // 搜索绑定

    showDown = false;  // 是否显示下拉

    backgroundClickRef: any; // 背景点击引用

    @Input()
    transfer: any; // 内容传送者

    constructor(private render: Renderer2,
        private  el: ElementRef) {}


    ngOnInit() {
        // 在编辑状态下的还原数据
        if (this.edit && this.option) {
            this.editModel = this.option[this.label];
        }
    }

    ngOnChanges(changes: {[propertyName: string]: SimpleChange}) {
        if (changes['options'] && changes['options'].currentValue) {
            // 非单一源 数据拷贝
            if (!this.single) {
                this._options = JSON.parse(JSON.stringify(changes['options'].currentValue));
                if (this._option) {
                    this._options.forEach(op => {
                        op.checked = op[this.label] === this._option[this.label];
                    });
                }
            } else {
                if (this.option && this.options) {
                    this.options.forEach(op => {
                        if (op[this.label] === this.option[this.label]) {
                            op.checked = true;
                        }
                    });
                }
            }
        }
        if (changes['option']) {
            this._option = changes['option'].currentValue;
            if (this._option && this._options) {
                this._options.forEach(op => {
                    op.checked = op[this.label] === this._option[this.label];
                });
            } else if (this._options) {
                this._options.forEach(op => {
                    op.checked = false;
                });
            }
            // 为解决数据仓库hive表详情
            if (this.edit && changes['option'].currentValue) {
                this.editModel = changes['option'].currentValue[this.label];
            }
        }
    }

    ngOnDestroy() {
        // 如果是single状态 默认认为删除了组件就把选中状态还原
        if (this.single && this.option) {
            this.options.forEach(op => {
                if (op[this.label] === this.option[this.label]) {
                    op.checked = false;
                }
            });
        }
    }

    /**
     * 下拉切换
     * @param $event
     */
    toggleShowDown($event: MouseEvent) {
        if (this.disabled) {
            return;
        }
        this.showDown = !this.showDown;

        if (this.showDown) {
            setTimeout(() => {
                this.backgroundClickRef = this.render.listen('document', 'click', () => {
                    this.showDown = false;
                    this.backgroundClickRef();
                    this.backgroundClickRef = null;
                });
            });
        } else {
            this.backgroundClickRef && this.backgroundClickRef();
            this.backgroundClickRef = null;
        }

        this.deleteSearchInput();

        // $event.stopPropagation();
    }

    /**
     * 选中点击
     * @param option
     * @param $event
     */
    optionClick(option: any, $event: MouseEvent) {

        // 如果是single状态
        if (this.single) {
            // 点击已经选中的option直接返回
            if (option.checked) {
                $event.stopPropagation();
                return;
            }

            // 如果存在原来的选中数据 就把原来的选中置空
            if (this._option) {
                this._options.forEach(op => {
                    if (op[this.label] === this._option[this.label]) {
                        op.checked = false;
                    }
                });
            }

        } else {
            // 非single状态就全部清除选中状态
            this._options.forEach(op => op.checked = false);
        }

        // 选中本身
        option.checked = true;

        let temp = (this.index !== undefined) ? { checked: option, index: this.index, type: this.type, transfer: this.transfer } : option;
        this.callback.emit(temp);

        this.deleteSearchInput();

        if (this.fixed) {
            // 固定 就是点击选项框的时候不隐藏下拉菜单
            $event.stopPropagation();
        }

        if (this.edit) {
            // 如果是编辑状态就直接赋值
            this.editModel = option[this.label];
        }
        this.toggleShowDown($event);
    }

    /**
     * 清除选中
     * @param {MouseEvent} $event
     */
    clearClick($event: MouseEvent) {
        this.options.forEach(op => op.checked = false);
        this.toggleShowDown($event);
        let temp = this.index ? { checked: null, index: this.index, type: this.type, transfer: this.transfer } : null;
        this.callback.emit(temp);

        this.deleteSearchInput();

        $event.stopPropagation();
    }

    /**
     * 搜索点击
     * @param {string} search
     */
    searchKeyup(search: string) {
        // 向父组件发送输入值
        search = search.toLowerCase();
        this.searchCallback.emit(search);

        if (this.options && this.options.length) {
            // 第一步 判定是否是single状态 觉得是否拷贝options
            let temp = [],
                tempOptions = this.single ? this.options : JSON.parse(JSON.stringify(this.options));

            // 第二步 过滤
            tempOptions.forEach(op => {
                if (op[this.label].toLowerCase().indexOf(search) !== -1) {
                    temp.push(op);
                }
            });
            this._options = temp;

            // 第三步 查找选中状态
            if (this._option) {
                this._options.forEach(op => {
                    if (op[this.label] === this.option[this.label]) {
                        op.checked = true;
                    }
                });
            }
        }
    }

    /**
     * 搜索点击
     * @param {MouseEvent} $event
     */
    searchClick($event: MouseEvent) {
        $event.stopPropagation();
    }

    /**
     * 清除搜索框内容
     */
    deleteSearchInput() {
        if (this.search) {
            if (this.searchInput && this.searchInput.nativeElement) {
                this.searchInput.nativeElement.value = '';
            }

            // 数据还原
            if (this.options) {
                this._options = this.single ? this.options : JSON.parse(JSON.stringify(this.options));
                if (this._option) {
                    this._options.forEach(op => {
                        if (op[this.label] === this._option[this.label]) {
                            op.checked = true;
                        }
                    });
                }
            }
        }
    }

    /**
     * 编辑状态 keyup事件
     * @param {MouseEvent} $event
     */
    editKeyup($event: MouseEvent) {
        let temp = (this.index !== undefined) ? { checked: this.editModel, index: this.index, type: this.type  } : this.editModel;
        this.editCallback.emit(temp);

        this._options.forEach(op => {
            op.checked = op[this.label] === this.editModel;
        });
    }

}

