/**
 * Created by xxy on 2017/11/21/021.
 */

import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';

import {GovernanceDataSourceComponent} from 'app/components/modules/governance/components/data.source/governance.data.source.component';
import {GovernanceTagComponent} from 'app/components/modules/governance/components/tag/governance.tag.component';
import {GovernanceRuleComponent} from 'app/components/modules/governance/components/rule/governance.rule.component';
import {GovernanceMetadataComponent} from 'app/components/modules/governance/components/metadata/governance.metadata.component';
import {GovernanceCatalogComponent} from 'app/components/modules/governance/components/catalog/governance.catalog.component';
import {GovernanceQualityManageComponent} from 'app/components/modules/governance/components/quality.management/governance.quality.manage.component';
import {GovernanceQualityManageResultComponent} from 'app/components/modules/governance/components/quality.management/result/governance.quality.manage.result.component';
import {GovernanceHomeComponent} from 'app/components/modules/governance/components/home/governance.home.component';
import {GovernanceFieldComponent} from 'app/components/modules/governance/components/field/governance.field.component';
import {GovernanceDataAuditComponent} from 'app/components/modules/governance/components/data.audit/governance.data.audit.component';
import {GovernanceNormAuditComponent} from 'app/components/modules/governance/components/norm.audit/governance.norm.audit.component';
import {GovernanceBloodAnalysisComponent} from 'app/components/modules/governance/components/blood.analysis/governance.blood.analysis.component';
import {GovernanceTableAnalysisComponent} from 'app/components/modules/governance/components/table.analysis/governance.table.analysis.component';
import {GovernanceTargetComponent} from 'app/components/modules/governance/components/target/governance.target.component';
import {GovernanceMetadataTableAnalysisComponent} from 'app/components/modules/governance/components/metadata/table.analysis/governance.metadata.table.analysis.component';
import {GovernanceNormComponent} from 'app/components/modules/governance/components/norm/governance.norm.component';
import {AuthGuard} from 'app/services/auth-guard.service';


const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'home'
    },
    {
        path: 'home',
        pathMatch: 'full',
        component: GovernanceHomeComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'dataSource',
        pathMatch: 'full',
        component: GovernanceDataSourceComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'tag',
        pathMatch: 'full',
        component: GovernanceTagComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'rule',
        pathMatch: 'full',
        component: GovernanceRuleComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'metadata',
        pathMatch: 'full',
        component: GovernanceMetadataComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'metadata/tableAnalysis/:id/:page/:dsType/:tableName/:dsId',
        pathMatch: 'full',
        component: GovernanceMetadataTableAnalysisComponent,
    },
    {
        path: 'catalog',
        pathMatch: 'full',
        component: GovernanceCatalogComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'norm',
        pathMatch: 'full',
        component: GovernanceNormComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'qualityManage',
        pathMatch: 'full',
        component: GovernanceQualityManageComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'qualityManage/result/:id/:page/:pageSize',
        pathMatch: 'full',
        component: GovernanceQualityManageResultComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'field', // 字段管理
        pathMatch: 'full',
        component: GovernanceFieldComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'target', // 指标管理
        pathMatch: 'full',
        component: GovernanceTargetComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'dataAudit', // 数据稽核
        pathMatch: 'full',
        component: GovernanceDataAuditComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'indicatorsAudit', // 指标稽核
        pathMatch: 'full',
        component: GovernanceNormAuditComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'bloodAnalysis', // 血缘分析
        pathMatch: 'full',
        component: GovernanceBloodAnalysisComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'tableAnalysis', // 表分析报告
        pathMatch: 'full',
        component: GovernanceTableAnalysisComponent,
        canActivate: [AuthGuard]
    }
];
@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ]
})
export class GovernanceRouteModule {

}
