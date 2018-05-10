
/**
 * Created by LIHUA on 2017-08-09.
 */
import {Component} from '@angular/core';
@Component({
    selector: 'modal-confirm-component',
    templateUrl: './modal.confirm.component.html',
    styleUrls: ['./modal.confirm.component.scss'],
})
export class ModalConfrimComponent {
    // 显示文字
    message: string;

    // 确定点击
    okClick() {
    }

    // 取消点击
    cancelClick() {}
}
