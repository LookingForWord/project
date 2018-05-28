/**
 * Created by lh on 2017/11/17.
 * 规则模态框
 */

import {Component, OnDestroy, OnInit} from '@angular/core';

import {SystemService} from 'app/services/system.service';
import {DatatransferService} from 'app/services/datatransfer.service';

@Component({
    selector: 'task-config-content-datasync-clean-rule-component',
    templateUrl: './task.config.content.datasync.clean.rule.component.html',
    styleUrls: ['./task.config.content.datasync.clean.rule.component.scss']
})
export class TaskConfigContentDatasyncCleanRuleComponent implements OnInit, OnDestroy {
    rules = []; // 规则树
    defaultRuleId = '0'; // 根规则id
    initRulesIndex = 0;  // 初始化rule层级
    maxRulesIndex = 2;  // 初始化rule层级
    contents = []; // 内容列表
    contentId: string;
    pagenow = 1;
    pagesize = 10;
    pagetotle = 1;
    unsubscribes = []; // 订阅函数钩子

    constructor(private systemService: SystemService,
                private datatransferService: DatatransferService) {
        let datasyncCleanRuleChangeSuccessSubject = this.datatransferService.datasyncCleanRuleChangeSuccessSubject.subscribe(data => {
            if (this.contentId !== data.id) {
                this.initContents(data.id);
                this.contentId = data.id;
            }
        });
        this.unsubscribes.push(datasyncCleanRuleChangeSuccessSubject);
    }

    ngOnInit() {
        this.initRules();
    }

    ngOnDestroy() {
        this.unsubscribes.forEach(u => u.unsubscribe());
    }

    /**
     * 初始化规则目录
     * @param rule
     */
    initRules(rule?: any) {
        // 限定初始化层级
        if (this.initRulesIndex >= this.maxRulesIndex) {
            return;
        }
        let pid = rule ? rule.id : this.defaultRuleId;
        this.systemService.queryAllRuleTree({
            pid: pid
        }).then(d => {
            if (d.success && d.message && d.message.length) {
                if (!rule) {
                    d.message.forEach(m => {
                        m.expand = true;
                        m.checked = false;
                        this.rules.push(m);
                    });
                    this.rules.forEach(r => {
                        this.initRules(r);
                    });
                } else {
                    rule.children = [];
                    d.message.forEach(m => {
                        m.expand = false;
                        m.checked = false;
                        rule.children.push(m);
                    });
                }
                this.initRulesIndex++;
            }
        });
    }

    /**
     * 获取内容
     * @param id
     */
    initContents(id: any) {
        this.contents.length = 0;
        this.systemService.getAllRuleContent(id).then(d => {
            if (d.success && d.message && d.message.length) {
                d.message.forEach(m => {
                    m.checked = false;
                    this.contents.push(m);
                });
            }
        });
    }

    /**
     * checkbox选择点击
     * @param content
     */
    checkedClick(content: any) {
        // 单选，把其他已选中数据置空
        this.contents.forEach(c => {
            if (c !== content && c.checked) {
                c.checked = false;
            }
        });
    }
}
