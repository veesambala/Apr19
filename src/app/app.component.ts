import { Component, Renderer2, ViewEncapsulation } from '@angular/core';
import { AppState } from './shared/services/app/app.service';
import { CoreServicesManager } from './core/services/core.services.manager';
import { UgcCustomizationService } from './ugc-shared/http/customization/customization.service';

@Component({
  selector: 'app',
  encapsulation: ViewEncapsulation.None,
  styleUrls: [
    './app.component.scss'
  ],
  templateUrl: './app.component.html'
})
export class AppComponent {
  constructor(
    private _customization: UgcCustomizationService,
    private _coreServicesManager: CoreServicesManager,
    private _renderer: Renderer2
  ) {
    this._coreServicesManager.configure(this._renderer);
    this.setTheme();
  }

  private setTheme(): void {
    let themeName: string = this._customization.ugcC11n.theme.themeName;

    if (themeName) {
      document.body.classList.add(themeName);
    }
  }
}
