import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { routes } from './upload.routes';
import { UploadComponent } from './upload.component';
import { AddMediaModule } from './add-media/add-media.module';
import { UploadCoreModule } from './core/core.module';
import { UserInfoModule } from './user-info/user-info.module';
import { ProgressModule } from './progress/progress.module';
import { TermsAndConditionModule } from './terms-conditions/terms-conditions.module';
import { SuccessModule } from './success/success.module';
import { UgcSharedModule } from '../../ugc-shared/ugc-shared.module';

@NgModule({
  declarations: [
    UploadComponent
  ],
  imports: [
    UgcSharedModule,
    UploadCoreModule,
    AddMediaModule,
    UserInfoModule,
    ProgressModule,
    TermsAndConditionModule,
    SuccessModule,
    FormsModule,
    CommonModule,
    RouterModule.forChild(routes)
  ],
  exports: []
})
export class UploadModule { }
