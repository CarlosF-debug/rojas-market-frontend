import { HttpInterceptorFn } from '@angular/common/http';

// Agrega el token JWT a cada petición saliente
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');

  if (token) {
    const reqConToken = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(reqConToken);
  }

  return next(req);
};