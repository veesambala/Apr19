import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { UgcSharedModule } from './ugc-shared/ugc-shared.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PreloadAllModules, RouterModule } from '@angular/router';
import { ROUTES } from './app.routes';
import { CoreServicesModule } from './core/services/core.services.module';
import { ENV_PROVIDERS } from './environment';
import '../styles/styles.scss';

const APP_PROVIDERS = [];

@NgModule({
  bootstrap: [AppComponent],
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    UgcSharedModule.forRoot(),
    BrowserAnimationsModule,
    RouterModule.forRoot(ROUTES, { useHash: true, preloadingStrategy: PreloadAllModules }),
    CoreServicesModule.forRoot()
  ],
  providers: [
    ENV_PROVIDERS,
    APP_PROVIDERS
  ]
})
export class AppModule {}
