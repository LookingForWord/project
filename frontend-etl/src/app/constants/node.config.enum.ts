/**
 * Created by LIHUA on 2017-09-26.
 *  节点配置类型
 */

export enum NodeConfigEnum {
    // ETL
    ETL = 10000,

    // 数据挖掘
    DATAMINE = 20000,

    // BI
    BI = 30000,

    // 数据采集
    EXTRACT = 10100,

    // 数据清洗
    CLEAN = 10200,

    // 数据装载
    LOAD = 10400,

    // 插件
    PLUGIN = 10500
}
