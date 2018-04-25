import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { UgcCustomizationService } from '../../../../ugc-shared/http/customization/customization.service';

@Component({
  selector: 'upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss', './upload.component.theme.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
/**
 * Component for displaying the upload prompt and upload button along with a not now option.
 * Pulls all text from the c11n locales.
 * References the landingPageUploadPrompt, uploadText, notNowText
 * Only shows the not now button if a returnUrl is given in the ugcC11n
 *
 * Fires events for uploadClicked when the button is clicked and notNowClicked when the button is clicked.
 */
export class UploadComponent {
  @Output()
  public onNotNowClicked: EventEmitter<string> = new EventEmitter();

  @Output()
  public onMediaSelection: EventEmitter<File> = new EventEmitter();

  public notNowShown: boolean;
  public promptText: string;
  public uploadText: string;
  public notNowText: string;

  constructor(
    private _customizationService: UgcCustomizationService
  ) {
    this.setShown();
    this.setText();
  }

  /**
   * function handling the onFileSelcted event, only single selection of file is allowed,
   * so emitting only first file from the file array.
   * @param event {UIEvent}
   */
  public fileSelected(event: UIEvent) {
    let element: any = event.srcElement;
    this.onMediaSelection.emit(element.files[0]);
    element.value = null;
  }

  public notNowClick(): void {
    this.onNotNowClicked.emit(this._customizationService.ugcC11n.returnUrl);
  }

  private setShown(): void {
    this.notNowShown = !!this._customizationService.ugcC11n.returnUrl;
  }

  private setText(): void {
    this.promptText = this._customizationService.locales.current().landingPageUploadPrompt;
    this.uploadText = this._customizationService.locales.current().uploadText;
    this.notNowText = this._customizationService.locales.current().notNowText;
  }
}
