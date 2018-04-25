import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ugc-background',
  templateUrl: './background.component.html',
  styleUrls: ['./background.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
/**
 * A simple component for applying a background color and projecting content on top of that
 */
export class UgcBackgroundComponent {}
