/**
 * Created by LIHUA on 2017/7/31/031.
 * 主界面 任务管理模块
 */

import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {FileUploadModule} from 'ng2-file-upload';
import {NgxMyDatePickerModule} from 'ngx-mydatepicker';
import {AngularEchartsModule} from 'ngx-echarts';
import {DirctiveModule} from 'app/directives/dirctive.module';
import {TaskRouteModule} from 'app/components/modules/task/task.route';
import {TaskComponent} from 'app/components/modules/task/task.component';
import {TaskDataSourceComponent} from 'app/components/modules/task/components/data.source/task.data.source.component';
import {TaskDataSourceAddComponent} from 'app/components/modules/task/components/data.source/add/task.data.source.add.component';
import {TaskConfigComponent} from 'app/components/modules/task/components/config/task.config.component';
import {TaskConfigAsideComponent} from 'app/components/modules/task/components/config/aside/task.config.aside.component';
import {TaskConfigAsideAddComponent} from 'app/components/modules/task/components/config/aside/add/task.config.aside.add.component';
import {TaskConfigContentComponent} from 'app/components/modules/task/components/config/content/task.config.content.component';
import {TaskConfigTreeComponent} from 'app/components/modules/task/components/config/tree/task.config.tree.component';
import {TaskConfigContentDatasyncComponent} from 'app/components/modules/task/components/config/content/datasync/task.config.content.datasync.component';
import {TaskConfigContentTabComponent} from 'app/components/modules/task/components/config/content/tab/task.config.content.tab.component';
import {TaskConfigContentDatasyncCollectionComponent} from 'app/components/modules/task/components/config/content/datasync/collection/task.config.content.datasync.collection.component';
import {TaskConfigContentDatasyncCleanComponent} from 'app/components/modules/task/components/config/content/datasync/clean/task.config.content.datasync.clean.component';
import {TaskConfigContentDatasyncCleanKnowledgeTreeComponent} from 'app/components/modules/task/components/config/content/datasync/clean/knowledge.tree/task.config.content.datasync.clean.knowledge.tree.component';
import {TaskConfigContentDatasyncCleanKnowledgeComponent} from 'app/components/modules/task/components/config/content/datasync/clean/knowledge/task.config.content.datasync.clean.knowledge.component';
import {TaskConfigContentDatasyncCollectionHeaderComponent} from 'app/components/modules/task/components/config/content/datasync/collection/header/task.config.content.datasync.collection.header.component';
import {TaskConfigContentDatasyncCollectionPartitionComponent} from 'app/components/modules/task/components/config/content/datasync/collection/partition/task.config.content.datasync.collection.partition.component';
import {TaskConfigContentDatasyncCleanRuleComponent} from 'app/components/modules/task/components/config/content/datasync/clean/rule/task.config.content.datasync.clean.rule.component';
import {TaskConfigContentDatasyncCleanRuleTreeComponent} from 'app/components/modules/task/components/config/content/datasync/clean/rule.tree/task.config.content.datasync.clean.rule.tree.component';
import {TaskConfigContentDatasyncCollectionSqlComponent} from 'app/components/modules/task/components/config/content/datasync/collection/sql/task.config.content.datasync.collection.sql.component';
import {TaskConfigContentScheduleComponent} from 'app/components/modules/task/components/config/content/schedule/task.config.content.schedule.component';

import {TaskHomeComponent} from 'app/components/modules/task/components/home/task.home.component';
import {TaskDatabaseComponent} from 'app/components/modules/task/components/database/task.database.component';
import {TaskDatabaseAddComponent} from 'app/components/modules/task/components/database/add/task.database.add.component';
import {TaskDatabaseTableComponent} from 'app/components/modules/task/components/database/table/task.database.table.component';
import {TaskDatabaseTableAddComponent} from 'app/components/modules/task/components/database/table/add/task.database.table.add.component';
import {TaskDatabaseTableAddFieldComponent} from 'app/components/modules/task/components/database/table/add/field/task.database.table.add.field.component';
import {TaskKnowledgeAsideComponent} from 'app/components/modules/task/components/knowledge/aside/task.knowledge.aside.component';
import {TaskKnowledgeContentComponent} from 'app/components/modules/task/components/knowledge/content/task.knowledge.content.component';
import {TaskKnowledgeTreeComponent} from 'app/components/modules/task/components/knowledge/tree/task.knowledge.tree.component';
import {TaskKnowledgeAsideAddComponent} from 'app/components/modules/task/components/knowledge/aside/add/task.knowledge.aside.add.component';
import {TaskKnowledgeComponent} from 'app/components/modules/task/components/knowledge/task.knowledge.component';
import {TaskRuleAsideAddComponent} from 'app/components/modules/task/components/rule/aside/add/task.rule.aside.add.component';
import {TaskRuleComponent} from 'app/components/modules/task/components/rule/task.rule.component';
import {TaskRuleAsideComponent} from 'app/components/modules/task/components/rule/aside/task.rule.aside.component';
import {TaskRuleTreeComponent} from 'app/components/modules/task/components/rule/tree/task.rule.tree.component';
import {TaskConvergeComponent} from 'app/components/modules/task/components/converge/task.converge.component';
import {TaskOperationActionComponent} from 'app/components/modules/task/components/operation/action/task.operation.action.component';
import {TaskOperationConvergenceComponent} from 'app/components/modules/task/components/operation/convergence/task.operation.convergence.component';
import {TaskOperationConvergencePreviewComponent} from 'app/components/modules/task/components/operation/convergence/preview/task.operation.convergence.preview.component';
import {TaskOperationInstanceComponent} from 'app/components/modules/task/components/operation/instance/task.operation.instance.component';
import {TaskOperationMaintenanceComponent} from 'app/components/modules/task/components/operation/maintenance/task.operation.maintenance.component';
import {TaskOperationMaintenancePreviewComponent} from 'app/components/modules/task/components/operation/maintenance/preview/task.operation.maintenance.preview.component';
import {TaskOperationInstanceTriggerComponent} from 'app/components/modules/task/components/operation/instance/trigger/task.operation.instance.trigger.component';
import {TaskOperationMaintenanceDataCheckComponent} from 'app/components/modules/task/components/operation/maintenance/data.check/task.operation.maintenance.data.check.component';
import {TaskConfigContentDatasyncOutputComponent} from 'app/components/modules/task/components/config/content/datasync/output/task.config.content.datasync.output.component';
import {TaskConfigContentDatasyncConvergeComponent} from 'app/components/modules/task/components/config/content/datasync/converge/task.config.content.datasync.converge.component';
import {TaskConfigContentDatasyncMergeSplitComponent} from 'app/components/modules/task/components/config/content/datasync/merge.split/task.config.content.datasync.merge.split.component';

import {TaskTextComponent} from 'app/components/modules/task/components/text/task.text.component';

import {GovernanceService} from 'app/services/governance.service';
import {TaskService} from 'app/services/task.service';
import {SystemService} from 'app/services/system.service';
import {AuthGuard} from 'app/services/auth-guard.service';
import {RepositoryService} from 'app/services/repository.service';
import {OperationService} from 'app/services/operation.service';
import {TaskConfigService} from 'app/services/task.config.service';
import {EtlService} from 'app/services/etl.service';

import {TsModule} from 'frontend-common/ts_modules/ts.module';

@NgModule({
    declarations: [
        TaskComponent,

        TaskHomeComponent,

        TaskDatabaseComponent,
        TaskDatabaseAddComponent,
        TaskDatabaseTableComponent,
        TaskDatabaseTableAddComponent,
        TaskDatabaseTableAddFieldComponent,

        TaskDataSourceComponent,
        TaskDataSourceAddComponent,

        TaskConvergeComponent,

        TaskConfigComponent,
        TaskConfigAsideComponent,
        TaskConfigAsideAddComponent,
        TaskConfigContentComponent,
        TaskConfigTreeComponent,
        TaskConfigContentDatasyncComponent,
        TaskConfigContentDatasyncCollectionComponent,
        TaskConfigContentDatasyncCollectionHeaderComponent,
        TaskConfigContentDatasyncCollectionPartitionComponent,
        TaskConfigContentDatasyncCollectionSqlComponent,
        TaskConfigContentDatasyncCleanComponent,
        TaskConfigContentDatasyncCleanKnowledgeComponent,
        TaskConfigContentDatasyncCleanKnowledgeTreeComponent,
        TaskConfigContentDatasyncCleanRuleComponent,
        TaskConfigContentDatasyncCleanRuleTreeComponent,
        TaskConfigContentTabComponent,
        TaskConfigContentScheduleComponent,
        TaskConfigContentDatasyncOutputComponent,
        TaskConfigContentDatasyncConvergeComponent,
        TaskConfigContentDatasyncMergeSplitComponent,

        TaskKnowledgeComponent,
        TaskKnowledgeAsideComponent,
        TaskKnowledgeContentComponent,
        TaskKnowledgeTreeComponent,
        TaskKnowledgeAsideAddComponent,

        TaskRuleComponent,
        TaskRuleAsideComponent,
        TaskRuleTreeComponent,
        TaskRuleAsideAddComponent,

        TaskOperationActionComponent,
        TaskOperationConvergenceComponent,
        TaskOperationConvergencePreviewComponent,
        TaskOperationInstanceComponent,
        TaskOperationMaintenanceComponent,
        TaskOperationMaintenancePreviewComponent,
        TaskOperationInstanceTriggerComponent,
        TaskOperationMaintenanceDataCheckComponent,

        TaskTextComponent

    ],
    imports: [
        CommonModule,
        FormsModule,
        TaskRouteModule,
        TsModule,
        NgxMyDatePickerModule.forRoot(),
        FileUploadModule,
        AngularEchartsModule,
        DirctiveModule
    ],
    exports: [
        TaskComponent
    ],
    providers: [
        TaskService,
        SystemService,
        AuthGuard,
        GovernanceService,
        RepositoryService,
        OperationService,
        TaskConfigService,
        EtlService
    ],
    entryComponents: [
        TaskDatabaseAddComponent,
        TaskDatabaseTableAddComponent,
        TaskDatabaseTableAddFieldComponent,

        TaskDataSourceAddComponent,

        TaskConfigAsideAddComponent,
        TaskConfigContentDatasyncComponent,
        TaskConfigContentDatasyncCollectionComponent,
        TaskConfigContentDatasyncCollectionHeaderComponent,
        TaskConfigContentDatasyncCollectionPartitionComponent,
        TaskConfigContentDatasyncCollectionSqlComponent,
        TaskConfigContentDatasyncCleanComponent,
        TaskConfigContentDatasyncCleanKnowledgeComponent,
        TaskConfigContentDatasyncCleanKnowledgeTreeComponent,
        TaskConfigContentDatasyncCleanRuleComponent,
        TaskConfigContentDatasyncCleanRuleTreeComponent,
        TaskConfigContentTabComponent,
        TaskConfigContentDatasyncOutputComponent,
        TaskConfigContentDatasyncConvergeComponent,
        TaskConfigContentDatasyncMergeSplitComponent,

        TaskKnowledgeAsideAddComponent,
        TaskRuleAsideAddComponent,

        TaskOperationConvergencePreviewComponent,
        TaskOperationMaintenancePreviewComponent,

        TaskTextComponent

    ]
})
export class TaskModule {}
