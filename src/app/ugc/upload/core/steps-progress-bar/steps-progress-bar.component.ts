import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';

@Component({
  selector: 'steps-progress-bar',
  templateUrl: './steps-progress-bar.component.html',
  styleUrls: ['./steps-progress-bar.component.scss', 'steps-progress-bar.component.theme.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StepsProgressBarComponent {
  @Input()
  public set numSteps(num: number) {
    if (this._steps.length < num) {
      let increaseAmount: number = num - this._steps.length;

      for (let counter: number = 0; counter < increaseAmount; counter++) {
        this._steps.push({
          current: false,
          completionPercentage: 0
        });
      }
    }

    if (this._steps.length > num) {
      let decreaseAmount: number = this._steps.length - num;

      for (let counter: number = 0; counter < decreaseAmount; counter++) {
        this._steps.pop();
      }
    }
  }

  public get steps(): ProgressStep[] {
    return this._steps;
  }

  private _steps: ProgressStep[] = [];

  constructor(
    private _changeDetector: ChangeDetectorRef
  ) { }

  public updateStepCompletionPercentage(stepIndex: number, percentage: number): void {
    if (stepIndex + 1 > this._steps.length) {
      return;
    }

    for (let index: number = 0; index < stepIndex; index++) {
      this._steps[index].current = false;
      this._steps[index].completionPercentage = 100;
    }

    this._steps[stepIndex].current = true;
    this._steps[stepIndex].completionPercentage = percentage;

    for (let index: number = stepIndex + 1; index < this._steps.length; index++) {
      this._steps[index].current = false;
      this._steps[index].completionPercentage = 0;
    }

    this._changeDetector.detectChanges();
  }
}

export interface ProgressStep {
  current: boolean;
  completionPercentage: number;
}
