import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../api.config';

// Estructura devuelta por /category/read
export interface BackendCategory {
  name: string;
  usesSize?: boolean;
  isNumeric?: boolean;
  sizes?: string[];
  id: string;
}

@Injectable({ providedIn: 'root' })
export class CategoryApiService {
  private baseUrl = `${API_BASE_URL}/category`;
  constructor(private http: HttpClient) {}

  // El endpoint /category/read devuelve listado de categorías
  getCategories(): Observable<BackendCategory[]> {
    return this.http.get<BackendCategory[]>(`${this.baseUrl}/read`);
  }
}
