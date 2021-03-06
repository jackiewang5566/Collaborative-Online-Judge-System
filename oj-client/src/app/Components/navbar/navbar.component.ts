import { Component, OnInit, Inject } from '@angular/core';
import { AuthService } from '../../Services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  title: string = 'COJ';
  profile: any;
  userInfo: any;
  is_admin: boolean;

  constructor(private auth: AuthService) {
    this.auth.userProfile.subscribe(
      profile => this.profile = profile
    );
  }

  ngOnInit() {
  }

  login(): void {
    this.auth.login();
  }

  logout(): void {
    this.auth.logout();
  }

}
