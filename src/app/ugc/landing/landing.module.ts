import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { routes } from './landing.routes';
import { UgcLandingComponent } from './landing.component';
import { PoweredByComponent } from './shared/powered-by/powered-by.component';
import { UploadComponent } from './shared/upload/upload.component';
import { SubmissionPromptComponent } from './shared/submission-prompt/submission-prompt.component';
import { UgcSharedModule } from '../../ugc-shared/ugc-shared.module';

@NgModule({
  declarations: [
    UgcLandingComponent,
    PoweredByComponent,
    SubmissionPromptComponent,
    UploadComponent
  ],
  imports: [
    UgcSharedModule,
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes)
  ],
  exports: []
})
export class UgcLandingModule {}
