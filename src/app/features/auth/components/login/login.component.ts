import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/user/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  hidePassword: boolean = true;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    if (this.authService.isUserLoggedIn) {
      this.router.navigate(['dashboard']);
    }
    this.loginForm = new FormGroup({
      email: new FormControl(''),
      password: new FormControl(''),
    });
  }

  async onLoginBtnClick() {
    const { email, password } = this.loginForm.value;
    if (email && password) {
      const res = await this.authService.logInWithEmailAndPassword(
        email,
        password
      );
      if (res.success) {
        console.log('Successfully Logged In');
        this.router.navigate(['dashboard']);
      } else {
        alert('Email or Password is not correct');
      }
    }
  }
}
