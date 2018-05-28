/**
 * Created by lh on 2017/11/9.
 */

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {TsModule} from 'frontend-common/ts_modules/ts.module';
import {DirctiveModule} from 'app/directives/dirctive.module';
import {NgxMyDatePickerModule} from 'ngx-mydatepicker';
import {FileUploadModule} from 'ng2-file-upload';

import {WorkflowService} from 'app/services/workflow.service';
import {WebSocketService} from 'app/services/websocket.service';

import {WorkflowWorkAsideComponent} from 'app/components/modules/workflow/components/work/aside/workflow.work.aside.component';
import {WorkflowWorkAsideAddComponent} from 'app/components/modules/workflow/components/work/aside/add/workflow.work.aside.add.component';
import {WorkflowWorkAsideTreeComponent} from 'app/components/modules/workflow/components/work/aside/tree/workflow.work.aside.tree.component';
import {WorkflowWorkContentItemsCanvasComponent} from 'app/components/modules/workflow/components/work/content/items/canvas/workflow.work.content.items.canvas.component';
import {WorkflowWorkContentComponent} from 'app/components/modules/workflow/components/work/content/workflow.work.content.component';
import {WorkflowWorkContentItemsTriggerComponent} from 'app/components/modules/workflow/components/work/content/items/trigger/workflow.work.content.items.trigger.component';
import {WorkflowWorkComponent} from 'app/components/modules/workflow/components/work/workflow.work.component';
import {WorkflowRouteModule} from 'app/components/modules/workflow/workflow.route';
import {WorkflowResultComponent} from 'app/components/modules/workflow/components/result/workflow.result.component';
import {WorkflowResultDetailComponent} from 'app/components/modules/workflow/components/result/detail/workflow.result.detail.component';
import {WorkflowNodeComponent} from 'app/components/modules/workflow/components/node/workflow.node.component';
import {WorkflowNodeAddComponent} from 'app/components/modules/workflow/components/node/add/workflow.node.add.component';
import {WorkflowWorkContentItemsComponent} from './components/work/content/items/workflow.work.content.items.component';
import {WorkflowResultDetailLogComponent} from 'app/components/modules/workflow/components/result/detail/log/workflow.result.detail.log';
import {WorkflowResultDetailListComponent} from 'app/components/modules/workflow/components/result/detail.list/workflow.result.detail.list.component';
import {WorkflowWorkContentRunPluginShellComponent} from 'app/components/modules/workflow/components/work/content/run.plugin/shell/workflow.work.content.run.plugin.shell.component';
import {WorkflowResultDetailTestComponent} from 'app/components/modules/workflow/components/result/detail/test/workflow.result.detail.test';
import {WorkflowResultDetailSuccessPanelComponent} from 'app/components/modules/workflow/components/result/detail/success.panel/workflow.result.detail.success.panel.component';
import {WorkflowResultDetailFailPanelComponent} from 'app/components/modules/workflow/components/result/detail/fail.panel/workflow.result.detail.fail.panel.component';
import {WorkflowWorkResultTriggerComponent} from 'app/components/modules/workflow/components/result/detail/trigger/workflow.work.result.trigger.component';
import {WorkflowWorkContentRunPluginTreeComponent} from 'app/components/modules/workflow/components/work/content/run.plugin/tree/workflow.work.content.run.plugin.tree.component';

import {AuthGuard} from 'app/services/auth-guard.service';

@NgModule({
    declarations: [
        WorkflowWorkComponent,

        WorkflowWorkAsideComponent,
        WorkflowWorkAsideAddComponent,
        WorkflowWorkAsideTreeComponent,

        WorkflowWorkContentComponent,
        WorkflowWorkContentItemsComponent,
        WorkflowWorkContentItemsCanvasComponent,
        WorkflowWorkContentItemsTriggerComponent,

        WorkflowWorkContentRunPluginShellComponent,

        WorkflowResultComponent,
        WorkflowResultDetailListComponent,
        WorkflowResultDetailComponent,
        WorkflowResultDetailLogComponent,
        WorkflowResultDetailTestComponent,
        WorkflowResultDetailSuccessPanelComponent,
        WorkflowResultDetailFailPanelComponent,
        WorkflowNodeComponent,
        WorkflowNodeAddComponent,
        WorkflowWorkResultTriggerComponent,
        WorkflowWorkContentRunPluginTreeComponent
    ],
    imports: [
        CommonModule,
        WorkflowRouteModule,
        TsModule,
        FormsModule,
        NgxMyDatePickerModule.forRoot(),
        FileUploadModule,
        DirctiveModule
    ],
    exports: [

    ],
    providers: [
        WorkflowService,
        WebSocketService,
        AuthGuard
    ],
    entryComponents: [
        WorkflowWorkContentItemsComponent,
        WorkflowWorkContentItemsCanvasComponent,
        WorkflowWorkContentItemsTriggerComponent,

        WorkflowWorkContentRunPluginShellComponent,

        WorkflowWorkAsideAddComponent,
        WorkflowResultDetailLogComponent,
        WorkflowResultDetailTestComponent,
        WorkflowResultDetailSuccessPanelComponent,
        WorkflowResultDetailFailPanelComponent,
        WorkflowNodeAddComponent,
        WorkflowWorkContentRunPluginTreeComponent
    ]
})
export class WorkflowModule {}
