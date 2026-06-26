import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://erpschoolapi.onrender.com/api/Auth';
  
  private authState = new BehaviorSubject<boolean>(this.hasToken());

  constructor(private http: HttpClient) { }

  private hasToken(): boolean {
    return !!localStorage.getItem('jwt_token');
  }

  isLoggedIn(): Observable<boolean> {
    return this.authState.asObservable();
  }

  login(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, data).pipe(
      tap((response: any) => {
        if (response.token) {
          localStorage.setItem('jwt_token', response.token);
          this.authState.next(true);
        }
      })
    );
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  forgotPassword(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, data);
  }

  resetPassword(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, data);
  }

  logout() {
    localStorage.removeItem('jwt_token');
    this.authState.next(false);
  }

  getToken(): string | null {
    return localStorage.getItem('jwt_token');
  }

  getUserRole(): string | null {
    const token = this.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const rawRole = payload['UserType'] || 'Staff';
        let role = rawRole.charAt(0).toUpperCase() + rawRole.slice(1).toLowerCase();
        if (rawRole.toLowerCase() === 'super admin') role = 'Super Admin';
        if (rawRole.toLowerCase() === 'school admin') role = 'School Admin';
        return role;
      } catch {
        return null;
      }
    }
    return null;
  }

  getUserName(): string | null {
    const token = this.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const firstName = payload['FirstName'] || '';
        const lastName = payload['LastName'] || '';
        if (firstName || lastName) {
          return `${firstName} ${lastName}`.trim();
        }
        return payload['unique_name'] || null;
      } catch {
        return null;
      }
    }
    return null;
  }
}
