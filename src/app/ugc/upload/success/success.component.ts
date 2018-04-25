import { Component ,ChangeDetectorRef,ChangeDetectionStrategy} from '@angular/core';
import { StepsNavButtonsService } from '../core/steps-nav-buttons/steps-nav-buttons.service';
import { UgcCustomizationService } from '../../../ugc-shared/http/customization/customization.service';
import {UploadTrackerService} from '../../../ugc-shared/upload-tracker/upload-tracker.service';
import {Router} from '@angular/router';
@Component({
  selector: 'upload-success',
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.scss', './success.component.theme.scss'],
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class SuccessComponent {
  public shareMedia: string;
  public addedFiles:File[]=[];
  public viewYourMedia:boolean=false;
  public viewMediaNotenabled:boolean=true;

  constructor(
    private _buttonsService: StepsNavButtonsService,
    private _customizationService: UgcCustomizationService,
    private _uploadFilesTracker:UploadTrackerService,
    private _changeDetector: ChangeDetectorRef,
    private _router:Router

  ) {
    this._buttonsService.primaryButtonState = 'NONE';
    this.addedFiles=this._uploadFilesTracker.filesList;
  }
  public addmore(event:UIEvent){
    let element: any = event.srcElement;
          this._uploadFilesTracker.addFile(element.files[0]);
          this._router.navigate(['/ugc/upload'], { queryParamsHandling: 'merge'});
          this._changeDetector.detectChanges(); 
          element.value = null;
  }
  public viewAllMedia(event:UIEvent){
    console.log("view All Media from success component");
    this.viewYourMedia=true;
    console.log("view your media",this.viewYourMedia);
    this.viewMediaNotenabled=false;
  }
}
