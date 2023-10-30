import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/user/auth.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css'],
})
export class SignUpComponent implements OnInit {
  signUpForm!: FormGroup;
  hidePassword: boolean = true;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    if (this.authService.isUserLoggedIn) {
      this.router.navigate(['dashboard']);
    }
    this.signUpForm = new FormGroup({
      email: new FormControl(''),
      password: new FormControl(''),
      confirmNewPassword: new FormControl(''),
    });
  }

  async onSignUpBtnClick() {
    const { email, password, confirmNewPassword } = this.signUpForm.value;
    if (password === confirmNewPassword && email) {
      const response = await this.authService.signUpWithEmailAndPassword(
        email,
        password
      );

      if (response.success) {
        console.log(response.data);
        this.router.navigate(['dashboard']);
      } else {
        alert(`Email or password must be correct ${response.error}`);
      }
    }
  }
}
