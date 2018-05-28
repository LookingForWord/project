import {Component, ViewChild, ElementRef, OnInit, Output, EventEmitter, Input, OnChanges, SimpleChanges} from '@angular/core';
import {FileItem, FileUploader, FileUploaderOptions} from 'ng2-file-upload';
import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {WorkflowResultDetailTestComponent} from 'app/components/modules/workflow/components/result/detail/test/workflow.result.detail.test';

@Component({
    selector: 'workflow-result-detail-fail-panel-component',
    templateUrl: './workflow.result.detail.fail.panel.component.html',
    styleUrls: ['./workflow.result.detail.fail.panel.component.scss']
})

export class WorkflowResultDetailFailPanelComponent implements OnInit, OnChanges {
    @Input()
    flowId: any;
    @Input()
    exeId: any;
    @Input()
    present: any;

    jobName: any;
    jobFile: any;
    mainFile: any;
    parameter_str: any;
    desc: any;

    dbSource: any;
    dbSourceArr: any;
    pageNum = 1;
    pageSize = 10;
    totalcount = 10;

    tasks = [
        {
            name: 'hive',
            checked: false
        }, {
            name: 'shell',
            checked: false
        }, {
            name: 'etl',
            checked: false
        }
    ];

    importUrl: any;         // 导入地址
    @ViewChild('uploaderRef') uploaderRef: ElementRef;      // 上传按钮
    @Output() changePanel = new EventEmitter<any>();
    uploader: any;
    errorType = 0;
    error = '';

    constructor(private modalService: ModalService) {

    }

    ngOnInit() {
        setTimeout(() => {
            this.initUploader();
        }, 500);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.present.currentValue) {
            this.jobName = this.present.jobName;
            this.jobFile = this.present.jobFile;
            this.mainFile = this.present.mainFile;
            this.parameter_str = this.present.parameter_str;
            this.desc = this.present.desc;
        }
    }
    onPageChange(page) {

    }

    onRadioCallback(data, item) {
        this.tasks.forEach(item => {
            item.checked = false;
        });
        item.checked = !item.checked;
    }

    /**
     * 失败任务面板调试
     */
    testNode($event) {
        let [ins, pIns] = this.modalService.open(WorkflowResultDetailTestComponent, {
            title: '数据预览',
            backdrop: 'static'
        });
        this.changePanel.emit('close');
    }


    /**
     * 初始化上传对象
     */
    initUploader() {
        const option: FileUploaderOptions = {
            url: this.importUrl,
            itemAlias: 'impFile',
            method: 'POST',
            autoUpload: false
        };
        this.uploader = new FileUploader(option);

        this.uploader.onSuccessItem = (item: FileItem, response: string) => {
            let res = JSON.parse(response);
            this.uploader.queue[0].remove();                // 清除上传队列
            this.uploader.progress = 0;                     // 重置上传进度
            this.uploaderRef.nativeElement.valueOf = '';    // 重置file输入框

        };

        this.uploader.onAfterAddingFile = (item: FileItem) => {
            this.errorType = 0;
            // 保证上传队列只有一个文件
            if (this.uploader.queue.length > 1) {
                this.uploader.removeFromQueue(this.uploader.queue[0]);
            }

            let name = item.file.name;

            // // 名字长度小于5 且不是.xml结尾 就判定为不是xml文件
            if ((name.length < 5) || (!(name.substr(name.length - 4) === '.xls') &&  !(name.substr(name.length - 5) === '.xlsx'))) {
                this.error = '请上传xls或xlsx格式文件';
                this.errorType = 11;
            }
        };
    }

    /**
     *
     * @param $event
     */
    checkDbSource($event) {

    }

    /**
     * 保存
     */
    saveTaskClick() {

    }

    /**
     *
     */
    submitTaskClick() {

    }
}
