import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/user/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm!: FormGroup;
  hidePassword: boolean = true;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.forgotPasswordForm = new FormGroup({
      email: new FormControl(''),
    });
  }

  async onSendResetPasswordLinkBtnClick() {
    const { email } = this.forgotPasswordForm.value;
    if (email) {
      const res = await this.authService.sendResetPasswordLinkToEmail(email);
      console.log(res);
      if (res.success) {
        alert('Reset Password Link sended to you registered email id');
        this.router.navigate(['auth/login']);
      }

      switch (res.error) {
        case 'auth/user-not-found':
          alert('email is not correct!!');
          break;
        default:
          console.log(res.error);
          break;
      }
    }
  }

}
