import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  let cloneParams: any = {};

  if (token) {
    cloneParams.setHeaders = {
      Authorization: `Bearer ${token}`
    };
  }

  // Rewrite URL for local development if running on localhost
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    if (req.url.startsWith('https://erpschoolapi.onrender.com/api')) {
      cloneParams.url = req.url.replace('https://erpschoolapi.onrender.com/api', 'https://localhost:7007/api');
    }
  }

  if (token || cloneParams.url) {
    req = req.clone(cloneParams);
  }

  return next(req);
};
