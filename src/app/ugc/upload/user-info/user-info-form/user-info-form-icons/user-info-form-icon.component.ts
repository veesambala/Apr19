import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { UgcCustomizationService } from
  '../../../../ugc-shared/services/ugc-customization/ugc-customization.service';
import { UploadTrackerService } from '../../../../ugc-shared/upload-tracker/upload-tracker.service';
import {
  InputValidator,
  ValueEvent
} from '../../../../ugc-shared/components/form/material-input/material-input.component';
import { StepsNavButtonsService } from '../../core/steps-nav-buttons/steps-nav-buttons.service';
import { FormField } from '../../../../ugc-shared/factories/customization.factory';
import { BurstLogService } from '../../../../core/services/logging/log.service';

@Component({
  selector: 'user-info-form-icon',
  templateUrl: './user-info-form-icon.component.html',
  styleUrls: ['./user-info-form-icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserInfoFormIconComponent {
  @Input()
  public iconName: IconNames;
}

export type IconNames = 'account.ico' | 'email.ico';
