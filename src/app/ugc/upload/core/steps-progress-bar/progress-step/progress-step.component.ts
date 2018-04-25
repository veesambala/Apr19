import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'progress-step',
  templateUrl: './progress-step.component.html',
  styleUrls: ['./progress-step.component.scss', 'progress-step.component.theme.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProgressStepComponent {
  @Input()
  public completionPercentage;
}
