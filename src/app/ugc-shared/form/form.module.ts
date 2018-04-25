import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes, RouterLink } from '@angular/router';
import { FormMaterialInputComponent } from './material-input/material-input.component';
import { FormMaterialCheckboxComponent } from './material-checkbox/material-checkbox.component';

@NgModule({
  declarations: [
    FormMaterialInputComponent,
    FormMaterialCheckboxComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    FormMaterialInputComponent,
    FormMaterialCheckboxComponent
  ]
})
export class FormModule {}
