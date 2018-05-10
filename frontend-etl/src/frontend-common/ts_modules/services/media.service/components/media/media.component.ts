/**
 * Created by LIHUA on 2017-08-14.
 */

import {Component,AfterViewInit} from '@angular/core';

@Component({
    selector: 'media-component',
    templateUrl: './media.component.html',
    styleUrls: ['./media.component.scss']
})
export class MediaComponent implements AfterViewInit {

    // 地址
    src: string;

    // 媒体类型
    type: string;

    ngAfterViewInit() {
        document.getElementById('imgage-img').setAttribute('src', this.src);
    }

    /**
     * 关闭点击
     */
    closeClick() {}
}
