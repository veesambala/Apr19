
import { AddMediaComponent } from './add-media/add-media.component';
import { UserInfoComponent } from './user-info/user-info.component';
import { UploadConfirmComponent } from './upload-confirm/upload-confirmation.component';
import { TermsAndConditionComponent } from './terms-conditions/terms-conditions.component';
import { ProgressComponent } from './progress/progress.component';
import { SuccessComponent } from './success/success.component';
import { UploadComponent } from './upload.component';

export const routes = [
  {
    path: '',
    component: UploadComponent,
    children: [
      { path: '', redirectTo: 'add-media' },
      { path: 'add-media', component: AddMediaComponent },
      { path: 'user-info', component: UserInfoComponent },
      { path: 'terms-conditions', component: TermsAndConditionComponent },
      { path: 'progress', component: ProgressComponent },
      { path: 'success', component: SuccessComponent }
    ]
  },
  { path: '**', redirectTo: '404'}
];
