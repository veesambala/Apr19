import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddMediaComponent } from './add-media.component';
import { AddMediaPromptComponent } from './add-media-prompt/add-media-prompt.component';
import { MediaAdderComponent } from './media-adder/media-adder.component';
import { MediaAdderButtonComponent } from './media-adder/media-adder-button/media-adder-button.component';
import { UgcSharedModule } from '../../../ugc-shared/ugc-shared.module';

@NgModule({
  declarations: [
    AddMediaComponent,
    AddMediaPromptComponent,
    MediaAdderComponent,
    MediaAdderButtonComponent
  ],
  imports: [
    UgcSharedModule,
    CommonModule
  ],
  exports: []
})
export class AddMediaModule { }
