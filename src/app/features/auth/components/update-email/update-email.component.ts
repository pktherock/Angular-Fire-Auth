import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/user/auth.service';

@Component({
  selector: 'app-update-email',
  templateUrl: './update-email.component.html',
  styleUrls: ['./update-email.component.css'],
})
export class UpdateEmailComponent implements OnInit {
  updateEmailForm!: FormGroup;
  hidePassword: boolean = true;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.updateEmailForm = new FormGroup({
      email: new FormControl(''),
      password: new FormControl(''),
    });
  }

  async onUpdateEmailBtnClick() {
    const { email, password } = this.updateEmailForm.value;
    if (email && password) {
      const res = await this.authService.updateEmail(email, password);
      console.log(res);
      if (res.success) {
        this.router.navigate(['dashboard']);
      }

      switch (res.error) {
        case 'auth/requires-recent-login':
          await this.authService.logOut();
          this.router.navigate(['']);
          break;
        case 'auth/wrong-password':
          alert('Password is not correct!!');
          break;
        case 'auth/user-mismatch':
          this.router.navigate(['']);
          break;
        default:
          console.log(res.error);
          break;
      }
    }
  }
}
