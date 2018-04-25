import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToasterService } from './toaster.service';
import { ToasterMessageComponent } from './toaster-message/toaster.component';

@NgModule({
  declarations: [
    ToasterMessageComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ToasterMessageComponent
  ],
  providers: [
    ToasterService
  ]
})
export class ToasterModule {}
