import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/user/auth.service';

@Component({
  selector: 'app-delete-user',
  templateUrl: './delete-user.component.html',
  styleUrls: ['./delete-user.component.css'],
})
export class DeleteUserComponent implements OnInit {
  deleteUserForm!: FormGroup;
  hidePassword: boolean = true;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.deleteUserForm = new FormGroup({
      password: new FormControl(''),
    });
  }

  async onDeleteUserBtnClick() {
    const { password } = this.deleteUserForm.value;
    if (password) {
      const res = await this.authService.deleteUserFromDB(password);
      console.log(res);
      if (res.success) {
        alert('User has been DELETED successfully');
        this.router.navigate(['auth/login']);
      }

      switch (
        res.error // todo
      ) {
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
