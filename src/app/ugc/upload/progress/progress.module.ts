import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressComponent } from './progress.component';
import { ProgressInfoPromptComponent } from './progress-info-prompt/progress-info-prompt.component';
import { UgcSharedModule } from '../../../ugc-shared/ugc-shared.module';

@NgModule({
  declarations: [
    ProgressComponent,
    ProgressInfoPromptComponent
  ],
  imports: [
    UgcSharedModule,
    CommonModule
  ],
  exports: []
})
export class ProgressModule { }
