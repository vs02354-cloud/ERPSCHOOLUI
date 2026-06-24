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

  // No URL rewriting. Always use the live API as defined in the service.

  if (token || cloneParams.url) {
    req = req.clone(cloneParams);
  }

  return next(req);
};
