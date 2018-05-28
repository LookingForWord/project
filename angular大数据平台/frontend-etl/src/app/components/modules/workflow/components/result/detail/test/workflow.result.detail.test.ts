import {Component, OnInit} from '@angular/core';

@Component({
    selector: 'workflow-result-detail-test-component',
    templateUrl: './workflow.result.detail.test.html',
    styleUrls: ['./workflow.result.detail.test.scss']
})
export class WorkflowResultDetailTestComponent implements OnInit {
    result: any;
    radioValue = '';
    header = false;

    constructor() {

    }

    ngOnInit() {

    }

    onRadioCallback(event, value) {
        this.radioValue = value;
    }
}
