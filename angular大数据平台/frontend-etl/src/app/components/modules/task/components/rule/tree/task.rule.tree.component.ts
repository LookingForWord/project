/**
 * Created by XMW on 2017-10-19.
 *  树形递归展示
 */
import {
    AfterContentInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild
} from '@angular/core';
import {DatatransferService} from 'app/services/datatransfer.service';
import {ModalService, ToolOpenOptions} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {Animations} from 'frontend-common/ts_modules/animations/animations';
import {SystemService} from 'app/services/system.service';
import {ActionTypeEnum} from 'app/components/modules/task/components/rule/task.rule.component';
import {TaskRuleAsideAddComponent} from 'app/components/modules/task/components/rule/aside/add/task.rule.aside.add.component';
import {LoginService} from 'app/services/login.service';

@Component({
    selector: 'task-rule-tree-component',
    templateUrl: './task.rule.tree.component.html',
    styleUrls: ['./task.rule.tree.component.scss'],
    animations: [Animations.slideUpDwon]
})
export class TaskRuleTreeComponent implements AfterContentInit, OnDestroy, OnInit {
    @Input()
    list: any;       // 目录列表

    @Input()
    type: any;

    @Input()
    parent: any;

    @Input()
    index: any;


    @ViewChild('titleContainer') titleContainer: ElementRef; // 目录 在目录上监听右键事件

    projectName: any;           // 目录名称


    constructor(private datatransferService: DatatransferService,
                private modalService: ModalService,
                private loginService: LoginService,
                private systemService: SystemService) {
        this.datatransferService.authorityOrganizeTreeAddSubject.subscribe(data => {

        });
    }

    ngOnInit() {
        if (typeof this.index === 'undefined') {
            this.index = 0;
        }
        if (this.parent === 'undefined') {
            this.parent = this.list;
        }
    }
    ngAfterContentInit() {

    }
    ngOnDestroy() {

    }

    /**
     * 树形单击
     * @param flow
     * @param {MouseEvent} $event
     */
    checkedClick(flow, $event: MouseEvent) {
        this.datatransferService.taskTreeCheckedSubject.next({
            flow: flow,
            type: this.type,
        });
        if (this.type === ActionTypeEnum.ADDCATALOG) {
            this.expandClick(flow, $event);
        }


    }

    /**
     * 展开点击
     * @param flow
     * @param {MouseEvent} $event
     * 改变当前项expand即可  索引地址
     */
    expandClick(flow, $event: MouseEvent) {
        // 也可发布订阅到父组件中（此处为了避免父组件中继续使用递归，未使用）
        this.datatransferService.taskTreeExpandSubject.next({
            flow: flow,
            type: this.type,
        });
        $event.stopPropagation();
    }

    /**
     * 删除目录
     */
    deleteCatalog(id) {
        this.modalService.toolConfirm('确认删除？', () => {
            this.systemService.deleteRule(id).then(d => {
                if (d.success) {
                    this.modalService.alert('删除成功');
                    // 发布通知删除成功 在aside页面重新调用树形的接口
                    this.datatransferService.addCatalogSubject.next(0);
                } else {
                    this.modalService.alert(d.msg || d.message || '删除失败');
                }
            });
        });
    }

    /**
     *
     */
    editCatalog(data) {
        let [ins] = this.modalService.toolOpen({
            title: '编辑规则详情',
            component: TaskRuleAsideAddComponent,
            datas: {
                editId: data.id,
                pid: data.pid,
                newRule: data.menuName,
                createUser: data.createUser,
                remark: data.remark,
                status: ActionTypeEnum.EDITCATALOG,
            },
            okCallback: () => {
                ins.saveClick();
            }
        } as ToolOpenOptions);
        ins.hideInstance = () => {
            ins.destroy();
        };

    }

    /**
     * 判断按钮权限
     * model  模块   code  code值
     */
    checkBtnAuthority(name: any) {
        if (!name) {
            return false;
        }
        let result = this.loginService.findButtonAuthority(name);
        return result;
    }
}
