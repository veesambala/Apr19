import { Component, ChangeDetectionStrategy,EventEmitter,Output } from '@angular/core';
import { UgcCustomizationService } from
  '../../../../ugc-shared/http/customization/customization.service';


@Component({
  selector: 'nav-buttons',
  templateUrl: './nav-buttons.component.html',
  styleUrls: ['./nav-buttons.component.scss', './nav-buttons.component.theme.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavButtonsComponent {
  @Output()
  public fileSelectedEmitter: EventEmitter<any>=new EventEmitter();
  @Output()
  public viewMediaClicked:EventEmitter<boolean>=new EventEmitter();

  public addMore: string;
  public finished: string;
  public viewMedia: string;
  constructor(
    private _customizationService: UgcCustomizationService
  ) {
    this.setText();
  }

  public setText() {
    this.addMore = this._customizationService.locales.current().addMoreText;
    this.finished = this._customizationService.locales.current().finishedText;
    this.viewMedia = this._customizationService.locales.current().viewMediaText;
  }
  public fileSelected(event:UIEvent){
    console.log(event);
    this.fileSelectedEmitter.next(event);

  }
  public clickedviewMedia(event:UIEvent){
    console.log("clickedViewMEdia");
    this.viewMediaClicked.next(true);

  }
}
