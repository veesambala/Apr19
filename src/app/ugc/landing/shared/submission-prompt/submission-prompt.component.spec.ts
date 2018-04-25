import { Logo } from '../../../../ugc-shared/http/customization/customization.factory';
import { UgcCustomizationService } from '../../../../ugc-shared/http/customization/customization.service';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SubmissionPromptComponent } from './submission-prompt.component';
import { ComponentFixtureAutoDetect } from '@angular/core/testing';

const BURST_LOGO: Logo = {
    imageUrl: 'https://burst.com/nbw/assets/images/burst.png',
    clickThroughUrl: 'https://burst.com'
};
const TEST_LOGO: Logo = {
    imageUrl: 'https://image.freepik.com/free-icon/macos-platform_318-33076.jpg',
    clickThroughUrl: 'http://www.apple.com'
};

describe('SubmissionPromptComponent', () => {
    describe('creation', () => {
        it('component should create with title', () => {
            let env: TestEnv = setup('', 'NONE', 'Media', 'media');
            expect(env.component).toBeDefined();
        });
    });
    /*
     Test that the core with values  set based on the ugc c11n
      */
    describe('logo variables', () => {
        it('should be text  with no Image', () => {
            let env: TestEnv = setup('', 'NONE', 'Media', ' ');
            expect(env.component.promptType).toEqual('TEXT_ONLY');
            expect(env.component.submissionBannerLogo).toBeUndefined();
            expect(env.component.submissionTitle).toEqual('Media');

        });
        it('whether an burstImage is being set or not when bannerLogo is BURST    ', () => {
            let env: TestEnv = setup('BURST', 'BURST', 'Media', ' ');
            expect(env.component.promptType).toEqual('IMAGE');
            expect(env.component.submissionBannerLogo.imageUrl).toEqual(BURST_LOGO.imageUrl);
            expect(env.component.submissionTitle).toEqual('Media');

        });
        it('whether an Image is being set or not when bannerLogo is string    ', () => {
            let env: TestEnv = setup('IMAGE', 'TEST', 'Media', 'media');
            expect(env.component.promptType).toEqual('IMAGE');
            expect(env.component.submissionBannerLogo.imageUrl).toEqual(TEST_LOGO.imageUrl);
            expect(env.component.submissionTitle).toEqual('Media');
            expect(env.component.submissionBannerText).toEqual('media');
            expect(env.component.submissionBannerImage).toEqual('IMAGE');
        });
    });
    describe('Submission prompt component DOM ', () => {
        it('Media title is being rendered or not based on ugcC11nJSON', () => {
            let env: TestEnv = setup('IMAGE', 'TEST', 'Media', 'media');
            let title: HTMLElement = env.fixture.nativeElement.querySelector('.local-media-file-title');
            expect(title).toBeDefined();
            env.fixture.detectChanges();
            expect(title.textContent).toContain('Media');

        });
        it('should have correct BannerImage', () => {
            let env: TestEnv = setup('IMAGE', 'TEST', 'Media', 'media');
            let primaryImage: HTMLImageElement = env.fixture.nativeElement.querySelector('.banner-image');
            expect(primaryImage).toBeDefined();
            expect(primaryImage.src).toEqual('IMAGE');
        });
        it('SubmissionBanner Text is being rendered or not based on ugcC11nJSON', () => {
            let env: TestEnv = setup('IMAGE', 'TEST', 'Media', 'media');
            let title: HTMLElement = env.fixture.nativeElement.querySelector('.banner-text');
            expect(title).toBeDefined();
            env.fixture.detectChanges();
            expect(title.textContent).toContain('media');

        });
        it('should have Submission BannerLogo and Image', () => {
            let env: TestEnv = setup('IMAGE', 'BURST', 'Media', 'media');
            let primaryEl: HTMLElement = env.fixture.nativeElement.querySelector('.banner-logo');
            let primaryAnchor: HTMLAnchorElement = primaryEl.querySelector('a');
            expect(primaryAnchor).toBeDefined();
            expect(primaryAnchor.href).toEqual(BURST_LOGO.clickThroughUrl);
            let primaryImage: HTMLImageElement = env.fixture.nativeElement.querySelector('.banner-logo-image');
            expect(primaryImage).toBeDefined();
            expect(primaryImage.src).toEqual(BURST_LOGO.imageUrl);
        });
    });
});

/*
Mock parameters for testing
 */
function setup(bannerImage: string,
               bannerLogo: 'NONE' | 'BURST' | string,
               landingTitle: string,
               landingTitlePrompt: string): TestEnv {
    let service = {
        ugcC11n: {
            landing: {
                submissionBannerImageUrl: bannerImage,
                submissionBannerLogo: bannerLogo,
            },
            branding: {
                logos: {
                    BURST: BURST_LOGO,
                    TEST: TEST_LOGO,
                    getLogo: (key: string) => {
                        if (key in service.ugcC11n.branding.logos) {
                            return service.ugcC11n.branding.logos[key];
                        }

                        return service.ugcC11n.branding.logos[key];
                    }
                }
            },
        },
        locales: {
            current: () => {
                return service.locales.locale;
            },
            locale: {
                landingPageTitle: landingTitle,
                landingPageTitlePrompt: landingTitlePrompt,
            },
        }
    };
    TestBed.configureTestingModule({
        declarations: [SubmissionPromptComponent],
        providers: [
            { provide: UgcCustomizationService, useValue: service },
            { provide: ComponentFixtureAutoDetect, useValue: true }
        ]
    });
    let fixture = TestBed.createComponent(SubmissionPromptComponent);

    return {
        fixture: fixture,
        component: fixture.componentInstance,
        customizationService: TestBed.get(UgcCustomizationService)
    };
}

interface TestEnv {
    fixture: ComponentFixture<SubmissionPromptComponent>;
    component: SubmissionPromptComponent;
    customizationService: Partial<UgcCustomizationService>;
}