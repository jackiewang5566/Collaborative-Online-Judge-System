import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import 'rxjs/add/operator/filter';
import * as auth0 from 'auth0-js';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/toPromise';
import Auth0Lock from 'auth0-lock';

const AUTH0_CLIENTID = 'r2F3TiAFQy1OUq1G06RyhOtLW1vmaNOi';
const AUTH0_DOMAIN = 'jackiewang5566.auth0.com';
@Injectable()
export class AuthService {
  userProfile = new BehaviorSubject<any>(undefined);
  userInfo = new BehaviorSubject<any>(undefined);
  lock = new Auth0Lock(AUTH0_CLIENTID, AUTH0_DOMAIN);

  auth0 = new auth0.WebAuth({
    clientID: 'r2F3TiAFQy1OUq1G06RyhOtLW1vmaNOi',
    domain: 'jackiewang5566.auth0.com',
    responseType: 'token id_token',
    audience: 'https://jackiewang5566.auth0.com/userinfo',
    redirectUri: 'http://localhost:3000',      
    scope: 'openid profile'
  });
  

  constructor(public router: Router) {
    this.userProfile.next(JSON.parse(localStorage.getItem('profile')));
  }

  public getProfile(): void {
    const accessToken = localStorage.getItem('access_token');
    const idToken = localStorage.getItem('id_token');
    if (!accessToken) {
      throw new Error('Access token must exist to fetch profile');
    }

    const self = this;
    this.auth0.client.userInfo(accessToken, (err, profile) => {
      if (profile) {
        self.userProfile.next(profile);
        localStorage.setItem('profile', JSON.stringify(profile));
      }
    });

    this.lock.getProfile(idToken, (err: any, userInfo: any) => {
      if (err) {
        throw new Error(err);
      }
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
    });
  }

  public login(): void {
    this.auth0.authorize();
  }

  public handleAuthentication(): void {
    this.auth0.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        window.location.hash = '';
        this.setSession(authResult);
        this.getProfile();
        this.router.navigate(['/home']);
      } else if (err) {
        this.router.navigate(['/home']);
        console.log(err);
      }
    });
  }

  private setSession(authResult): void {
    // Set the time that the access token will expire at
    const expiresAt = JSON.stringify((authResult.expiresIn * 1000) + new Date().getTime());
    localStorage.setItem('access_token', authResult.accessToken);
    localStorage.setItem('id_token', authResult.idToken);
    localStorage.setItem('expires_at', expiresAt);
  }

  public logout(): void {
    // Remove tokens and expiry time from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('expires_at');
    localStorage.removeItem('profile');
    localStorage.removeItem('userInfo');
    // Go back to the home route
    this.router.navigate(['/']);
  }

  public isAuthenticated(): boolean {
    // Check whether the current time is past the
    // access token's expiry time
    const expiresAt = JSON.parse(localStorage.getItem('expires_at'));
    return new Date().getTime() < expiresAt;
  }

  // Check whether user is admin or not
  public isAdmin(): boolean {
    let is_admin: boolean = false;
    let userInfo = null;
    userInfo = JSON.parse(localStorage.getItem('userInfo'));
    is_admin = userInfo && userInfo.app_metadata ? userInfo.app_metadata.is_admin : false;
    return is_admin;
  }

}