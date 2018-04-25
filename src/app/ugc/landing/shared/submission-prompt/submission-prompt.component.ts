import { ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Logo } from '../../../../ugc-shared/http/customization/customization.factory';
import { UgcCustomizationService } from '../../../../ugc-shared/http/customization/customization.service';

@Component({
  selector: 'submission-prompt',
  templateUrl: './submission-prompt.component.html',
  styleUrls: ['./submission-prompt.component.scss', './submission-prompt.component.theme.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
/**
 * Component for displaying the local-media-file submission title and banner images.
 * Pulls the title as well as the submission prompt (if available) from the c11n locales.
 * References the defaultLandingPageTitle and the landingPageTitlePrompt
 * Pulls the submission images from the c11n.landing object.
 * References the submissionBannerImage and the submissionBannerLogo
 *
 * Can be configured to just show the title, if so then the promptType will be TEXT_ONLY
 * Can be configured to show the title and a banner image, if so then the promptType will be IMAGE
 *
 * OnInit an event will be fired for what the prompt type is decided as
 */
export class SubmissionPromptComponent implements OnInit {
  @Output()
  public onPromptTypeSet: EventEmitter<PromptType> = new EventEmitter();

  public promptType: PromptType;
  public submissionTitle: string;
  public submissionBannerImage: string;
  public submissionBannerLogo: Logo;
  public submissionBannerText: string;

  constructor(
    private _customizationService: UgcCustomizationService
  ) {
    this.setType();
    this.setText();
    this.setImages();
  }

  public ngOnInit(): void {
    this.onPromptTypeSet.next(this.promptType);
  }

  private setType(): void {
    this.promptType = this._customizationService.ugcC11n.landing.submissionBannerImageUrl ? 'IMAGE' : 'TEXT_ONLY';
    this.onPromptTypeSet.next(this.promptType);
  }

  private setText(): void {
    this.submissionTitle = this._customizationService.locales.current().landingPageTitle;
    this.submissionBannerText = this._customizationService.locales.current().landingPageTitlePrompt;
  }

  private setImages(): void {
    if (this.promptType === 'TEXT_ONLY') {
      return;
    }

    this.submissionBannerImage = this._customizationService.ugcC11n.landing.submissionBannerImageUrl;
    let logoKey: string = this._customizationService.ugcC11n.landing.submissionBannerLogo;
    this.submissionBannerLogo = this._customizationService.ugcC11n.branding.logos.getLogo(logoKey);
  }
}

export type PromptType = 'TEXT_ONLY' | 'IMAGE';
