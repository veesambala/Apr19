import { UgcLandingComponent } from './landing.component';

export const routes = [
  { path: '', component: UgcLandingComponent },
  { path: '**', redirectTo: '404'}
];
