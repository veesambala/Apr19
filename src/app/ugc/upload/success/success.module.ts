import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UgcSharedModule } from '../../../ugc-shared/ugc-shared.module';
import { SuccessComponent } from './success.component';
import { SuccessPromptComponent } from './success-prompt/success-prompt.component';
import { ShareMediaComponent } from './share-media/share-media.component';
import { NavButtonsComponent } from './nav-buttons/nav-buttons.component';

@NgModule({
  declarations: [
    SuccessComponent,
    SuccessPromptComponent,
    ShareMediaComponent,
    NavButtonsComponent
  ],
  imports: [
    UgcSharedModule,
    CommonModule],
  exports: []
})
export class SuccessModule { }
