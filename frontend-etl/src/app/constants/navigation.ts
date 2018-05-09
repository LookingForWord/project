/**
 * Created by LIHUA on 2017-08-05.
 * 导航配置对象  预留03给另一个模块
 */

export class Navigation {

    static navigate = [
        {name: '首页', link: '/main/home', checked: true, id: 'f01'},
        {name: '数据资产', link: '/main/governance', checked: false, expand: false, id: 'f02', children: [
                {name: '首页', link: '/main/governance/home', checked: false, icon: 'ico_home_f', id: 's0201'},
                {name: '数据源管理', link: '/main/governance/dataSource', checked: false, icon: 'ico_datasource', id: 's0202'},
                {name: '数据资产管理', link: '/main/governance/field', checked: false, icon: 'ico_arrow_right2', id: 's0203', children: [
                        {name: '字段管理', link: '/main/governance/field', checked: false, icon: 'ziduanguanli', id: 's020301'},
                        {name: '表管理', link: '/main/governance/metadata', checked: false, icon: 'ico_sheet_manage', id: 's020302'},
                        {name: '目录管理', link: '/main/governance/catalog', checked: false, icon: 'ico_folder_manage', id: 's020303'},
                        {name: '标签库管理', link: '/main/governance/tag', checked: false, icon: 'ico_tags_manage', id: 's020304'},
                        {name: '规则库管理', link: '/main/governance/rule', checked: false, icon: 'ico_rule', id: 's020305'},
                        {name: '指标管理', link: '/main/governance/norm', checked: false, icon: 'zhibiaoguanli', id: 's020306'},
                    ]},
                {name: '数据质量管理', link: 'main/governance', checked: false, icon: 'ico_arrow_right2', id: 's0204', children: [
                        {name: '元数据稽核', link: '/main/governance/qualityManage', checked: false, icon: 'yuanshujujihe', id: 's020401'},
                        {name: '数据稽核', link: '/main/governance/dataAudit', checked: false, icon: 'shujujihe1', id: 's020402'},
                        {name: '指标稽核', link: '/main/governance/indicatorsAudit', checked: false, icon: 'zhibiaoguanli', id: 's020403'}
                    ]},
                {name: '数据治理', link: 'main/governance', checked: false, icon: 'ico_arrow_right2', id: 's0205', children: [
                        {name: '血缘(影响)分析', link: '/main/governance/bloodAnalysis', checked: false, icon: 'xieyuanyingxiangfenxi', id: 's020501'},
                        {name: '表分析报告', link: '/main/governance/tableAnalysis', checked: false, icon: 'biaofenxibaogao', id: 's020502'}
                    ]}
            ]},

        {name: '数据融合', link: '/main/task', checked: false, id: 'f04', children: [
            {name: '首页', link: '/main/task/home', checked: false, icon: 'home_f', id: 's0401'},
            {name: '数据仓库配置', link: '/main/task/database', checked: false, expand: false, icon: 'data_warehouse', id: 's0402'},
            // {name: '数据汇聚', checked: false, expand: false, icon: 'data_aggregation', link: '/main/task/converge', id: 's0403'},
            {name: '任务配置管理', link: '/main/task/config', checked: false, icon: 'task_setup', id: 's0404'},
            {name: '运维中心', checked: false, icon: 'ico_arrow_right2', id: 's0405', children: [
                {name: '任务列表', checked: false, expand: false, icon: 'ico_field_manage', link: '/main/task/operation/instance', id: 's040501'},
                {name: '任务运维', checked: false, expand: false, icon: 'ico_periodic_task', link: '/main/task/operation/maintenance', id: 's040502'},
                {name: '汇聚日志', checked: false, expand: false, icon: 'ico_datapick', link: '/main/task/operation/convergence', id: 's040503'},
                {name: '操作日志', checked: false, expand: false, icon: 'ico_modify', link: '/main/task/operation/action', id: 's040504'}
            ]},
            {name: '配置管理', checked: false, icon: 'ico_arrow_right2', id: 's0406', children: [
                {name: '转换规则管理', link: '/main/task/rule', checked: false, icon: 'ico_rule', id: 's040601'},
                {name: '知识库管理', link: '/main/task/knowledge', checked: false, icon: 'ico_knowledge', id: 's040602'}]},

            {name: '配置管理', checked: false, icon: 'arrow_right2', id: 's0406', children: [
                {name: '转换规则管理', link: '/main/task/rule', checked: false, icon: 'rule', id: 's040601'},
                {name: '知识库管理', link: '/main/task/knowledge', checked: false, icon: 'knowledge', id: 's040602'}]},
            // {name: '文本提取', link: '/main/task/text', checked: false, icon: 'task_setup', id: 's0407'},
        ]},

        {name: '数据挖掘', link: '/main/mining', checked: false, id: 'f05', children: [
            {name: '首页', link: '', checked: false, icon: '', id: 's0501'},
            {name: '任务台', link: '', checked: false, icon: '', id: 's0502'},
            {name: '运行记录', link: '', checked: false, icon: '', id: 's0503'},
            {name: '解释器', link: '', checked: false, icon: '', id: 's0504'},
            {name: '工作台仓库管理', link: '', checked: false, icon: '', id: 's0505'},
            {name: '配置', link: '', checked: false, icon: '', id: 's0506'},
        ]},

        {name: '调度平台', link: '/main/workflow', checked: false, id: 'f06', children: [
            {name: '工作流管理', link: '/main/workflow/work', checked: false, icon: 'ico_workflow_manage', id: 's0601'},
            {name: '运行结果', link: '/main/workflow/result', checked: false, icon: 'ico_running_result', id: 's0602'},
            {name: '节点管理', link: '/main/workflow/node', checked: false, icon: 'ico_node_manage', id: 's0603'}
            ]},

        {name: '权限管理', link: '/main/authority', checked: false, id: 'f07', children: [
            {name: '组织管理', link: '/main/authority/organize', checked: false, icon: 'ico_organization', id: 's0701'},
            {name: '用户管理', link: '/main/authority/user', checked: false, icon: 'ico_user', id: 's0702'},
            {name: '角色管理', link: '/main/authority/role', checked: false, icon: 'ico_character', id: 's0703'},
            {name: '对象管理', link: '/main/authority/object', checked: false, icon: 'ico_object', id: 's0704'},
            {name: '在线管理', link: '/main/authority/online', checked: false, icon: 'ico_online_user', id: 's0705'}
            ]},

        {name: '数据服务', link: '/main/dataServe', checked: false, id: 'f08'}
    ];
}
