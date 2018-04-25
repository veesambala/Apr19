import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UgcSharedModule } from '../../../ugc-shared/ugc-shared.module';
import { ProgressStepComponent } from './steps-progress-bar/progress-step/progress-step.component';
import { StepsProgressBarComponent } from './steps-progress-bar/steps-progress-bar.component';
import { StepsNavButtonsComponent } from './steps-nav-buttons/steps-nav-buttons.component';
import { StepsNavButtonsService } from './steps-nav-buttons/steps-nav-buttons.service';

@NgModule({
  declarations: [
    StepsNavButtonsComponent,
    StepsProgressBarComponent,
    ProgressStepComponent
  ],
  imports: [
    CommonModule,
    UgcSharedModule
  ],
  exports: [
    StepsNavButtonsComponent,
    StepsProgressBarComponent
  ],
  providers: [
    StepsNavButtonsService
  ]
})
export class UploadCoreModule { }
