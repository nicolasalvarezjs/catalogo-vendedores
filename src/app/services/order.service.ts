import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private apiUrl = 'http://localhost:3002/api/orders'; // Ajusta la URL según el backend

  constructor(private http: HttpClient) {}

  create(order: Omit<Order, 'id' | 'fecha'>): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, order);
  }

  getAll(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl);
  }

  getById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }

  update(
    id: number,
    order: Partial<Omit<Order, 'id' | 'fecha'>>
  ): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/${id}`, order);
  }

  delete(id: number): Observable<boolean> {
    return this.http.delete<boolean>(`${this.apiUrl}/${id}`);
  }
}
