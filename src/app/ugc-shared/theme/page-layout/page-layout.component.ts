import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MobileHeaderDisplayType } from './mobile-header/mobile-header.component';

@Component({
  selector: 'ugc-page-layout',
  templateUrl: './page-layout.component.html',
  styleUrls: ['./page-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
/**
 * A component to handle the layout on desktop and mobile for all of ugc.
 * Controls the common themes and backgrounds between pages, as well as the usable space
 */
export class UgcPageLayoutComponent {
  @Input()
  public mobileHeaderDisplayType: MobileHeaderDisplayType;

  @Input()
  public mobileHeaderPageTitle: string;

  @Input()
  public mobileHeaderDisableBackgroundPattern: boolean;
}
