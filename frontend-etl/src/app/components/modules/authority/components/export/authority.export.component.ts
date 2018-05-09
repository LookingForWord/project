import {Component, ViewChild, ElementRef, OnInit} from '@angular/core';
import {FileItem, FileUploader, FileUploaderOptions} from 'ng2-file-upload';
import {CookieService} from 'ngx-cookie';

import {Cookie} from 'app/constants/cookie';
import {ServiceStatusEnum} from 'app/constants/service.enum';
import {AuthorityService} from 'app/services/authority.service';
import {HttpService} from 'frontend-common/ts_modules/services/http.service';
import {ModalService} from 'frontend-common/ts_modules/services/modal.service/modal.service';
import {ToolService} from 'frontend-common/ts_modules/services/tool.service';

@Component({
    selector: 'authority-export-component',
    templateUrl: 'authority.export.component.html',
    styleUrls: ['authority.export.component.scss']
})

export class AuthorityExportComponent implements OnInit {
    type: any;       // 导入'import'  导出 'export'
    model: any;      // 模块    组织：'organize'  用户：'user'  角色：'role'  对象：'object'  在线用户：'online'
    importUrl: any;  // 导入地址
    exportUrl: any;  // 导出地址
    @ViewChild('uploaderRef') uploaderRef: ElementRef; // 上传按钮
    uploader: any;
    errorType = 0;
    error: string;
    exportKeyword = '';
    token: any;
    placeholder = '';

    constructor(
        private modalService: ModalService,
        private authorityService: AuthorityService,
        private httpService: HttpService,
        private cookieService: CookieService,
        private toolService: ToolService) {
        this.token = this.cookieService.get(Cookie.TOKEN);
    }
    ngOnInit() {
        let url = '';
        switch (this.model) {
            case 'organize':
                this.importUrl = this.authorityService.importOrganizeUrl;
                this.exportUrl = this.authorityService.exporOrganizetUrl;
                this.placeholder = '支持名称搜索导出';
                break;
            case 'user':
                this.importUrl = this.authorityService.importUserUrl;
                this.exportUrl = this.authorityService.exportUserUrl;
                this.placeholder = '支持姓名、用户名、部门名称、角色名称搜索导出';
                break;
            case 'role':
                this.importUrl = this.authorityService.importRole;
                this.exportUrl = this.authorityService.exportRole;
                this.placeholder = '支持角色名搜索导出';
                break;
            case 'object':
                this.importUrl = this.authorityService.importResourceUrl;
                this.exportUrl = this.authorityService.exportResourceUrl;
                this.placeholder = '支持名称、系统名搜索导出';
                break;
            case 'interface':
                this.importUrl = this.authorityService.importInterfaceUrl;
                this.exportUrl = this.authorityService.exportInterfaceUrl;
                this.placeholder = '支持名称、接口地址搜索导出';
                break;

        }
        if (this.type === 'import') {
            setTimeout(() => {
                this.initUploader();
            }, 200);
        }

    }
    /**
     * 初始化上传对象
     */
    initUploader() {
        const option: FileUploaderOptions = {
            url: this.importUrl + '?token=' + this.token,
            itemAlias: 'impFile',
            method: 'POST',
            autoUpload: false
        };
        this.uploader = new FileUploader(option);

        this.uploader.onSuccessItem = (item: FileItem, response: string) => {
            let res = JSON.parse(response);

            if (res.status === ServiceStatusEnum.SUCCESS) {
                this.modalService.alert('上传成功');
                // this.datatransferService.addCatalogSubject.next(0);
                this.hideInstance();
                this.refreshList();
            } else {
                this.modalService.alert(res.message || res.msg || '导入失败', {auto: true});
            }

            this.uploader.queue[0].remove();                // 清除上传队列
            this.uploader.progress = 0;                     // 重置上传进度
            this.uploaderRef.nativeElement.value = '';     // 重置file输入框
            this.uploaderRef.nativeElement.valueOf = '';   // 重置file输入框

        };

        this.uploader.onAfterAddingFile = (item: FileItem) => {
            this.errorType = 0;
            // 保证上传队列只有一个文件
            if (this.uploader.queue.length > 1) {
                this.uploader.removeFromQueue(this.uploader.queue[0]);
            }

            // 判定是否excel文件
            if (!this.toolService.fileCheck(item.file.name, 'xls')) {
                this.error = '请上传xls或xlsx格式文件';
                this.errorType = 11;
            }
            // 大小限制
            if (item.file.size > 2048 * 1024 * 1024) {
                this.uploader.removeFromQueue(this.uploader.queue[0]);
                this.error = '文件最大为2G';
                this.errorType = 11;
                return;
            }
        };
    }

    /**
     * 导入保存
     */
    saveImport() {
        if (this.type === 'import') {
            if (!this.uploader || !this.uploader.queue.length) {
                this.error = '请选择文件';
                this.errorType = 11;
                return;
            }

            // 判定是否excel文件
            if (!this.toolService.fileCheck(this.uploader.queue[0].file.name, 'xls')) {
                this.error = '请上传xls或xlsx格式文件';
                this.errorType = 11;
                return;
            }
            this.uploader.uploadAll();
        }
    }

    /**
     * 导出保存
     */
    exportClick() {
        this.hideInstance();
        let  url = this.httpService.getRealUrl(this.exportUrl) + '?token=' + this.token + '&keyWord=' + this.exportKeyword;
        let a = document.createElement('a');
        a.href = url;
        a.target = '_self';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            a.parentNode.removeChild(a);
        });
    }

    /**
     * 取消
     */
    cancelClick() {
        this.hideInstance();
    }

    hideInstance: Function;
    refreshList: Function;
}
