import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertService } from 'src/app/core/services/alert/alert.service';
import { AuthService } from 'src/app/core/services/user/auth.service';

@Component({
  selector: 'app-update-password',
  templateUrl: './update-password.component.html',
  styleUrls: ['./update-password.component.css'],
})
export class UpdatePasswordComponent implements OnInit {
  updatePasswordForm!: FormGroup;
  hideOldPassword: boolean = true;
  hidePassword: boolean = true;

  constructor(
    private authService: AuthService,
    private router: Router,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.updatePasswordForm = new FormGroup({
      oldPassword: new FormControl(''),
      newPassword: new FormControl(''),
      confirmNewPassword: new FormControl(''),
    });
  }

  async onUpdatePasswordBtnClick() {
    const { oldPassword, newPassword, confirmNewPassword } =
      this.updatePasswordForm.value;
    if (newPassword === confirmNewPassword) {
      const res = await this.authService.updatePassword(
        oldPassword,
        newPassword
      );
      if (res.success) {
        this.router.navigate(['dashboard']);
        this.alertService.success('Password updated successfully');
      }

      switch (res.error) {
        case 'auth/requires-recent-login':
          await this.authService.logOut();
          this.router.navigate(['']);
          break;
        case 'auth/wrong-password':
          this.alertService.error('Password is not correct!!');
          break;
        case 'auth/too-many-requests':
          this.alertService.error(
            'To many incorrect attempts, please try after some time, or reset password to to restore!'
          );
          break;
        case 'auth/user-mismatch':
          this.router.navigate(['']);
          break;
        default:
          console.log(res.error);
          break;
      }
    } else {
      this.alertService.error("password dose'nt match");
    }
  }
}
