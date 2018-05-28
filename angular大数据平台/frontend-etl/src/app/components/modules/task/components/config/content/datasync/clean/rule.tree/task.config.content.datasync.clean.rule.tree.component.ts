/**
 * Created by lh on 2017/11/17.
 */

import {Component, Input, OnInit} from '@angular/core';

import {SystemService} from 'app/services/system.service';
import {DatatransferService} from 'app/services/datatransfer.service';
import {Animations} from 'frontend-common/ts_modules/animations/animations';
import {ToolService} from 'frontend-common/ts_modules/services/tool.service';

@Component({
    selector: 'task-config-content-datasync-clean-rule-tree-component',
    templateUrl: './task.config.content.datasync.clean.rule.tree.component.html',
    styleUrls: ['./task.config.content.datasync.clean.rule.tree.component.scss'],
    animations: [Animations.slideUpDwon]
})
export class TaskConfigContentDatasyncCleanRuleTreeComponent implements OnInit {
    @Input()
    rules: any;
    @Input()
    rulesAll: any;
    @Input()
    ruleParent: any;
    @Input()
    index: number;

    constructor(private toolService: ToolService,
                private datatransferService: DatatransferService,
                private systemService: SystemService) {

    }

    ngOnInit() {
        if (typeof this.rulesAll === 'undefined') {
            this.rulesAll = this.rules;
        }
        if (typeof this.index === 'undefined') {
            this.index = 0;
        }
    }

    getName(rule: any) {
        rule.parent = this.ruleParent;

        return rule.menuName;
    }

    checkedClick(rule: any) {
        this.toolService.treesTraverse(this.rulesAll, {
            callback: (leaf: any) => {
                leaf.checked = false;
            }
        });
        rule.checked = true;

        // 发生变化通知
        this.datatransferService.datasyncCleanRuleChangeSuccessSubject.next(rule);
    }

    /**
     * 切换展开
     * @param rule
     */
    toggleExpandClick(rule: any, $event: MouseEvent) {
        if (!rule.children) {
            rule.children = [];

            this.systemService.queryAllRuleTree({pid: rule.id}).then(d => {

                if (d.success && d.message && d.message.length) {

                    d.message.forEach(m => {
                        m.expand = false;
                        m.checked = false;
                        rule.children.push(m);
                    });
                }
            });
        }

        rule.expand = !rule.expand;

        $event.stopPropagation();
    }
}
