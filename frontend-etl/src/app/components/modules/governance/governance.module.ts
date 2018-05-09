/**
 * Created by xxy on 2017/11/21/021.
 */

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {FileUploadModule} from 'ng2-file-upload';

import {TsModule} from 'frontend-common/ts_modules/ts.module';
import {DirctiveModule} from 'app/directives/dirctive.module';

import {DatatransferService} from 'app/services/datatransfer.service';
import {GovernanceService} from 'app/services/governance.service';
import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {ToolService} from 'frontend-common/ts_modules/services/tool.service';
import {AuthorityService} from 'app/services/authority.service';

import {GovernanceRouteModule} from 'app/components/modules/governance/governance.route';
import {GovernanceDataSourceComponent} from 'app/components/modules/governance/components/data.source/governance.data.source.component';
import {GovernanceDataSourceAddComponent} from 'app/components/modules/governance/components/data.source/add/governance.data.source.add.component';
import {GovernanceComponent} from 'app/components/modules/governance/governance.component';
import {GovernanceTagComponent} from 'app/components/modules/governance/components/tag/governance.tag.component';
import {GovernanceTagAddComponent} from 'app/components/modules/governance/components/tag/add/governance.tag.add.component';
import {GovernanceRuleComponent} from 'app/components/modules/governance/components/rule/governance.rule.component';
import {GovernanceRuleAsideAddComponent} from 'app/components/modules/governance/components/rule/aside/add/governance.rule.aside.add.component';
import {GovernanceMetadataComponent} from 'app/components/modules/governance/components/metadata/governance.metadata.component';
import {GovernanceCatalogComponent} from 'app/components/modules/governance/components/catalog/governance.catalog.component';
import {GovernanceCatalogAsideAddComponent} from 'app/components/modules/governance/components/catalog/aside/add/governance.catalog.aside.add.component';
import {GovernanceCatalogAsideComponent} from 'app/components/modules/governance/components/catalog/aside/governance.catalog.aside.component';
import {GovernanceCatalogTreeComponent} from 'app/components/modules/governance/components/catalog/tree/governance.catalog.tree.component';
import {GovernanceMetadataAsideComponent} from 'app/components/modules/governance/components/metadata/aside/governance.metadata.aside.component';
import {GovernanceMetadataAsideAddComponent} from 'app/components/modules/governance/components/metadata/aside/add/governance.metadata.aside.add.component';
import {GovernanceMetadataSourceAnalysisComponent} from 'app/components/modules/governance/components/metadata/source.analysis/governance.metadata.sourceAnalysis.component';
import {GovernanceQualityManageComponent} from 'app/components/modules/governance/components/quality.management/governance.quality.manage.component';
import {GovernanceQualityManageAddComponent} from 'app/components/modules/governance/components/quality.management/add/governance.quality.manage.add.component';
import {GovernanceQualityManageResultComponent} from 'app/components/modules/governance/components/quality.management/result/governance.quality.manage.result.component';
import {GovernanceQualityManageRuleComponent} from 'app/components/modules/governance/components/quality.management/rule/governance.quality.manage.rule.component';
import {GovernanceHomeComponent} from 'app/components/modules/governance/components/home/governance.home.component';
import {GovernanceDataSourceSyncComponent} from 'app/components/modules/governance/components/data.source/sync/governance.data.source.sync.component';
import {GovernanceFieldComponent} from 'app/components/modules/governance/components/field/governance.field.component';

import {GovernanceDataAuditComponent} from 'app/components/modules/governance/components/data.audit/governance.data.audit.component';
import {GovernanceDataAuditAsideComponent} from 'app/components/modules/governance/components/data.audit/aside/governance.data.audit.aside.component';
import {GovernanceDataAuditContentComponent} from 'app/components/modules/governance/components/data.audit/content/governance.data.audit.content.component';
import {GovernanceDataAuditAsideTreeComponent} from 'app/components/modules/governance/components/data.audit/aside/tree/governance.data.audit.aside.tree.component';
import {GovernanceDataAuditAsideAddComponent} from 'app/components/modules/governance/components/data.audit/aside/add/governance.data.audit.aside.add.component';

import {GovernanceNormAuditComponent} from 'app/components/modules/governance/components/norm.audit/governance.norm.audit.component';
import {GovernanceNormAuditAsideComponent} from 'app/components/modules/governance/components/norm.audit/aside/governance.norm.audit.aside.component';
import {GovernanceNormAuditContentComponent} from 'app/components/modules/governance/components/norm.audit/content/governance.norm.audit.content.component';
import {GovernanceNormAuditContentItemsCanvasComponent} from 'app/components/modules/governance/components/norm.audit/content/items/canvas/governance.norm.audit.content.items.canvas.component';
import {GovernanceNormAuditContentRunPluginShellComponent} from 'app/components/modules/governance/components/norm.audit/content/run.plugin/shell/governance.norm.audit.content.run.plugin.shell.component';
import {GovernanceNormAuditContentItemsComponent} from 'app/components/modules/governance/components/norm.audit/content/items/governance.norm.audit.content.items.component';
import {GovernanceNormAuditAsideTreeComponent} from 'app/components/modules/governance/components/norm.audit/aside/tree/governance.norm.audit.aside.tree.component';
import {GovernanceNormAuditContentItemsTriggerComponent} from 'app/components/modules/governance/components/norm.audit/content/items/trigger/governance.norm.audit.content.items.trigger.component';
import {GovernanceNormAuditAsideAddComponent} from 'app/components/modules/governance/components/norm.audit/aside/add/governance.norm.audit.aside.add.component';
import {GovernanceNormAuditContentReplaceHolderComponent} from 'app/components/modules/governance/components/norm.audit/content/replace.placeholder/governance.norm.audit.content.replace.holder.component';


import {GovernanceBloodAnalysisComponent} from 'app/components/modules/governance/components/blood.analysis/governance.blood.analysis.component';
import {GovernanceBloodAnalysisAddComponent} from 'app/components/modules/governance/components/blood.analysis/add/governance.blood.analysis.add.component';
import {GovernanceTableAnalysisComponent} from 'app/components/modules/governance/components/table.analysis/governance.table.analysis.component';
import {GovernanceTableAnalysisTreeContainerComponent} from 'app/components/modules/governance/components/table.analysis/aside/governance.table.analysis.tree.container.component';
import {GovernanceTableAnalysisDetailComponent} from 'app/components/modules/governance/components/table.analysis/detail/governance.table.analysis.detail.component';
import {GovernanceNormComponent} from 'app/components/modules/governance/components/norm/governance.norm.component';
import {GovernanceNormAddComponent} from 'app/components/modules/governance/components/norm/add/governance.norm.add.component';

import {GovernanceTargetComponent} from 'app/components/modules/governance/components/target/governance.target.component';
import {GovernanceMetadataTableAnalysisComponent} from 'app/components/modules/governance/components/metadata/table.analysis/governance.metadata.table.analysis.component';
import {GovernanceMetadataTableAnalysisAddComponent} from 'app/components/modules/governance/components/metadata/table.analysis/add/governance.metadata.table.analysis.add.component';

import {AuthGuard} from 'app/services/auth-guard.service';

@NgModule({
    imports: [
        CommonModule,
        GovernanceRouteModule,
        TsModule,
        FormsModule,
        RouterModule,
        FileUploadModule,
        DirctiveModule
    ],
    declarations: [
        GovernanceComponent,

        GovernanceHomeComponent,

        GovernanceDataSourceComponent,
        GovernanceDataSourceAddComponent,
        GovernanceDataSourceSyncComponent,

        GovernanceTagComponent,
        GovernanceTagAddComponent,

        GovernanceRuleComponent,
        GovernanceRuleAsideAddComponent,

        GovernanceMetadataComponent,
        GovernanceMetadataAsideComponent,
        GovernanceMetadataAsideAddComponent,
        GovernanceMetadataSourceAnalysisComponent,

        GovernanceCatalogComponent,
        GovernanceCatalogAsideAddComponent,
        GovernanceCatalogAsideComponent,
        GovernanceCatalogTreeComponent,

        GovernanceQualityManageComponent,
        GovernanceQualityManageAddComponent,
        GovernanceQualityManageResultComponent,
        GovernanceQualityManageRuleComponent,

        GovernanceFieldComponent,

        GovernanceTargetComponent,

        GovernanceBloodAnalysisComponent,
        GovernanceBloodAnalysisAddComponent,

        GovernanceTableAnalysisComponent,
        GovernanceTableAnalysisTreeContainerComponent,
        GovernanceTableAnalysisDetailComponent,

        GovernanceMetadataTableAnalysisComponent,
        GovernanceMetadataTableAnalysisAddComponent,

        GovernanceNormComponent,
        GovernanceNormAddComponent,

        GovernanceDataAuditComponent,
        GovernanceDataAuditAsideComponent,
        GovernanceDataAuditContentComponent,
        GovernanceDataAuditAsideTreeComponent,
        GovernanceDataAuditAsideAddComponent,

        GovernanceNormAuditComponent,
        GovernanceNormAuditAsideComponent,
        GovernanceNormAuditContentComponent,
        GovernanceNormAuditContentItemsCanvasComponent,
        GovernanceNormAuditContentRunPluginShellComponent,
        GovernanceNormAuditContentItemsComponent,
        GovernanceNormAuditAsideTreeComponent,
        GovernanceNormAuditContentItemsTriggerComponent,
        GovernanceNormAuditAsideAddComponent,
        GovernanceNormAuditContentReplaceHolderComponent
    ],
    exports: [
        GovernanceComponent
    ],
    providers: [
        ModalService,
        DatatransferService,
        ToolService,
        GovernanceService,
        AuthorityService,
        AuthGuard
    ],
    entryComponents: [
        GovernanceDataSourceAddComponent,
        GovernanceDataSourceSyncComponent,

        GovernanceTagAddComponent,

        GovernanceRuleAsideAddComponent,

        GovernanceCatalogAsideAddComponent,

        GovernanceMetadataAsideAddComponent,

        GovernanceQualityManageComponent,
        GovernanceQualityManageAddComponent,
        GovernanceQualityManageResultComponent,
        GovernanceQualityManageRuleComponent,
        GovernanceMetadataTableAnalysisAddComponent,

        GovernanceBloodAnalysisAddComponent,
        GovernanceTableAnalysisTreeContainerComponent,

        GovernanceNormAddComponent,
        GovernanceTableAnalysisDetailComponent,

        GovernanceDataAuditAsideTreeComponent,
        GovernanceDataAuditAsideAddComponent,

        GovernanceNormAuditContentItemsCanvasComponent,
        GovernanceNormAuditContentRunPluginShellComponent,
        GovernanceNormAuditContentItemsComponent,
        GovernanceNormAuditContentItemsComponent,
        GovernanceNormAuditAsideTreeComponent,
        GovernanceNormAuditAsideAddComponent,
        GovernanceNormAuditContentReplaceHolderComponent
    ]
})
export class  GovernanceModule {

}
