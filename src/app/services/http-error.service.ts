import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class HttpErrorService {
  formatError(error: HttpErrorResponse): string {
    if (error.error?.message) return error.error.message;
    if (error.status) return `Error ${error.status}: ${error.statusText}`;
    return 'Error de red desconocido';
  }
}
