import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UgcSharedModule } from '../../../ugc-shared/ugc-shared.module';
import { UserInfoComponent } from './user-info.component';
import { UserInfoPromptComponent } from './user-info-prompt/user-info-prompt.component';
import { UserInfoFormComponent } from './user-info-form/user-info-form.component';
import { UserInfoFormIconComponent } from './user-info-form/user-info-form-icons/user-info-form-icon.component';

@NgModule({
  declarations: [
    UserInfoComponent,
    UserInfoPromptComponent,
    UserInfoFormComponent,
    UserInfoFormIconComponent
  ],
  imports: [
    UgcSharedModule,
    CommonModule,
    FormsModule
  ],
  exports: []
})
export class UserInfoModule { }
