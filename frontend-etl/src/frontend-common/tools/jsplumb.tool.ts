/**
 *  连线库辅助方法 都是静态方法
 */

import {DomSanitizer} from '@angular/platform-browser';

/**
 * 连线参数
 */
export interface ConnectOptions {
    source?: any;
    target?: any;
    anchors?: any;
    stroke?: string;
    strokeWidth?: number;
    hoverStroke?: string;
    endpointRadius?: number;
    endpointFill?: string;
    endpointStroke?: string;
    endpointStrokeWidth?: number;
    arrowWidth?: number;
    location?: number;
    scope?: string;
    curviness?: number;
    maxConnections?: number;
    connectionsDetachable?: boolean;
}

export interface EndpointOptions {
    endpointRadius?: number;
    stroke?: string;
    strokeWidth?: number;
    hoverStroke?: string;
    connectorStroke?: string;
    connectorStrokeWidth?: number;
    maxConnections?: number;
    arrowWidth?: number;
    location?: number;
    scope?: string;
    connectionsDetachable?: boolean;
}

export class JsplumbTool {

    /**
     * 获取连线参数
     * @param {ConnectOptions} options
     * @returns obj
     */
    static getConnectOptions(options: ConnectOptions) {
        let defaultOptions = {
            stroke: '#108EE9',
            strokeWidth: 0.5,
            hoverStroke: 'orange',
            endpointRadius: 3,
            endpointFill: '#108EE9',
            endpointStroke: 'transparent',
            endpointStrokeWidth: 0,
            arrowWidth: 8,
            location: 0.5,
            scope: 'auto',
            curviness: 65,
            maxConnections: 1,
            connectionsDetachable: false
        } as ConnectOptions;

        options = Object.assign(defaultOptions, options);

        return {
            source: options.source,
            target: options.target,
            anchors: options.anchors,
            deleteEndpointsOnDetach: false,
            paintStyle: { stroke: options.stroke, strokeWidth: options.strokeWidth, outlineStroke: 'transparent', outlineWidth: 5},
            // hoverPaintStyle: { stroke: options.hoverStroke },
            endpoint: ['Dot', { radius: options.endpointRadius }],
            endpointStyle: { fill: options.endpointFill, strokeWidth: options.endpointStrokeWidth, stroke: options.endpointStroke },
            // detachable: true,
            overlays: [['Arrow', {width: options.arrowWidth, length: options.arrowWidth, location: options.location}]],
            scope: options.scope,
            connector: ['Bezier', { curviness: options.curviness } ],                // 设置连线为贝塞尔曲线
            maxConnections: options.maxConnections,                   // 设置连接点最多可以连接几条线
            connectionsDetachable: options.connectionsDetachable,     // 连接过后可否分开
        };
    }

    /**
     * 获取连接点参数配置
     * @param {EndpointOptions} options
     * @returns obj
     */
    static getEndpointOptions(options: EndpointOptions) {
        let defaultOption = {
            endpointRadius: 4,
            stroke: '#CCDDEE',
            strokeWidth: 2,
            hoverStroke: 'orange',
            connectorStroke: '#108EE9',
            connectorStrokeWidth: 1,
            maxConnections: 1,
            location: 0.5,
            arrowWidth: 8,
            connectionsDetachable: false
        } as EndpointOptions;

        options = Object.assign(defaultOption, options);

        return {
            endpoint: ['Dot', { radius: options.endpointRadius }],   // 设置连接点的形状为圆形
            paintStyle: { fill: '#fff', stroke: options.stroke, strokeWidth: options.strokeWidth },      // 设置连接点的颜色
            // hoverPaintStyle: { stroke: options.hoverStroke },
            isSource: true,                                          // 是否可以拖动（作为连线起点）
            scope: options.scope,                                    // 连接点的标识符，hand 手动 auto 自动
            connectorStyle: { stroke: options.connectorStroke, strokeWidth: options.connectorStrokeWidth, fill: 'none', outlineStroke: 'transparent', outlineWidth: 10 },           // 连线颜色、粗细
            connector: ['Bezier', { curviness: 65 } ],                // 设置连线为贝塞尔曲线
            maxConnections: options.maxConnections,                   // 设置连接点最多可以连接几条线
            isTarget: true,                                           // 是否可以放置（作为连线终点）
            dropOptions: {                                            // 设置放置相关的css
                hoverClass: 'dropHover',                              // 释放时指定鼠标停留在该元素上使用的css class
                activeClass: 'dragActive'                             // 可拖动到的元素使用的css class
            },
            connectionsDetachable: options.connectionsDetachable,     // 连接过后可否分开
            connectorOverlays: [['Arrow', { width: options.arrowWidth, length: options.arrowWidth, location: options.location}]]
        };
    }

    /**
     * 获取dom元素 相对于父容器的绝对位置
     * @param element
     * @returns {{x: any; y: any}}
     */
    static getElementAbsolutePosition(element: any) {
        let x = element.offsetLeft,
            y = element.offsetTop;
        while (element = element.offsetParent) {
            x += element.offsetLeft;
            y += element.offsetTop;
        }
        return {x, y};
    }

    /**
     * 鼠标滚轮事件 放大缩小画布
     * @param event
     * @param option
     */
    static doMousewheelScale(event: any, option: any) {
        let delta = Math.max(-1, Math.min(1, (event.wheelDelta || -event.detail)));
        if (delta > 0) {
            // 向上滚动
            option.scale = option.scale + 0.1;
        } else if (delta < 0) {
            // 向下滚动
            if (option.scale > 0.5) {
                option.scale = option.scale - 0.1;
            }
        }
    }

    /**
     * 鼠标点击 画布放大缩小
     * @param {string} type
     * @param option
     */
    static doMouseclickScale(type: string, option: any) {
        if (type === '+') {
            option.scale = option.scale + 0.1;
        } else {
            if (option.scale >= 0.5) {
                option.scale = option.scale - 0.1;
            }
        }
    }

    /**
     * 格式化拖动目标的位置
     * @param {DomSanitizer} sanitizer
     * @param option
     * @returns {SafeStyle}
     */
    static getDragTargetPosition(sanitizer: DomSanitizer, option: any) {
        // translate值变为整数值，才不会导致自容器字体边框虚化
        let x = parseInt(option.x + '', 10);
        let y = parseInt(option.y + '', 10);
        return  sanitizer.bypassSecurityTrustStyle(`translate(${x}px, ${y}px) scale(${option.scale})`);
    }

    /**
     * 画布位置居中还原
     * @param target
     * @param option
     */
    static doInitDragTargetPosition(target: any, option: any) {
        let parent = target.nativeElement.parentNode;
        let parentWidth = parent.offsetWidth,
            parentHeight = parent.offsetHeight;

        // 拖动区域的中心在父容器的中心
        option.x = - (option.width - parentWidth) / 2;
        option.y = - (option.height - parentHeight) / 2;


        // 计算子元素位置，把子元素也固定在画布中央
        if (option.elements.length) {
            // 找到边界元素值
            let minX = option.elements[0].x,
                maxX = option.elements[0].x,
                minY = option.elements[0].y,
                maxY = option.elements[0].y;
            option.elements.forEach(e => {
                if (e.x < minX) {
                    minX = e.x;
                }
                if (e.x > maxX) {
                    maxX = e.x;
                }
                if (e.y < minY) {
                    minY = e.y;
                }
                if (e.y > maxY) {
                    maxY = e.y;
                }
            });

            // 中心点位置
            let middleX = (maxX - minX) / 2 + minX,
                middleY = (maxY - minY) / 2 + minY;
            // 相对于画布中心点偏移量
            let diffX = (option.width / 2) - middleX,
                diffY = (option.height / 2) - middleY;
            // 整体偏移
            option.elements.forEach(e => {
                e.x = e.x + diffX;
                e.y = e.y + diffY;
            });
        }
    }


}

