import {
  Component, ChangeDetectionStrategy, ChangeDetectorRef, Output, EventEmitter, Input,
  OnInit, OnDestroy
} from '@angular/core';
import { UgcCustomizationService }
    from '../../../../../ugc-shared/http/customization/customization.service';

@Component({
  selector: 'media-adder-button',
  templateUrl: './media-adder-button.component.html',
  styleUrls: ['./media-adder-button.component.scss', './media-adder-button.component.theme.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class MediaAdderButtonComponent implements OnInit, OnDestroy {
  @Output()
  public onAddMedia: EventEmitter<File> = new EventEmitter();

  @Input()
  public set addedMediaCount(count: number) {
    this._addedMediaCount = count;
    this.detectChanges();
  }

  @Input()
  public set maxMediaCount(count: number) {
    this._maxMediaCount = count;
    this.detectChanges();
  }

  public get addMediaText(): string {
    return this._addMediaText;
  }

  public get mediaTrackText(): string {
    let text: string = this._addMediaNumberText;

    return text.replace('__CURRENT__', this._addedMediaCount.toString())
      .replace('__MAX__', this._maxMediaCount.toString());
  }

  public get mediaAdded(): boolean {
    return this._addedMediaCount > 0;
  }

  public get maxReached(): boolean {
    return this._addedMediaCount >= this._maxMediaCount;
  }

  private _initialized: boolean;
  private _addedMediaCount: number = 0;
  private _maxMediaCount: number = 0;
  private _addMediaText: string = '';
  private _addMediaNumberText: string = '';

  constructor(
    private _changeDetector: ChangeDetectorRef,
    private _customizationService: UgcCustomizationService
  ) {
    this.setText();
  }

  public ngOnInit(): void {
    this._initialized = true;
  }

  public ngOnDestroy(): void {
    this._initialized = false;
  }

  public fileSelected(event: UIEvent) {
    let element: any = event.srcElement;

    for (let index: number = 0; index < element.files.length; index++) {
      this.onAddMedia.emit(element.files[index]);
    }

    element.value = null;
  }

  private setText() {
    this._addMediaText = this._customizationService.locales.current().addMediaText;
    this._addMediaNumberText = this._customizationService.locales.current().currentNumMediaText;
  }

  private detectChanges(): void {
    if (!this._initialized) {
      return;
    }

    this._changeDetector.detectChanges();
  }
}
