import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NgProgressModule} from 'ngx-progressbar';

import {AppComponent} from 'app/app.component';
import {AppRouteModule} from 'app/app.route';
import {LoginModule} from 'app/components/login/login.module';
import {MainModule} from 'app/components/main/main.module';
import {ErrorModule} from 'app/components/error/error.module';
import {DemoModule} from 'app/components/demo/demo.module';

import {MainGuard} from 'app/components/main/main.guard';
import {LoginGuard} from 'app/components/login/login.guard';
import {MainMiningGuard} from 'app/components/main/main.mining.guard';


@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        NgProgressModule,
        ErrorModule,
        LoginModule,
        MainModule,
        AppRouteModule,
        DemoModule
    ],
    providers: [
        LoginGuard,
        MainGuard,
        MainMiningGuard
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
