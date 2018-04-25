import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UgcSharedModule } from '../../../ugc-shared/ugc-shared.module';
import { TermsAndConditionComponent } from './terms-conditions.component';
import { TcAgreementTextPromptComponent } from './tc-agreement-prompt/tc-agreement-prompt.component';

@NgModule({
  declarations: [
    TermsAndConditionComponent,
    TcAgreementTextPromptComponent
  ],
  imports: [
    UgcSharedModule,
    CommonModule,
    FormsModule
  ],
  exports: []
})
export class TermsAndConditionModule { }
