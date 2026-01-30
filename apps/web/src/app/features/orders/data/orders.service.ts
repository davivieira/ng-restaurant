import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import type { Order } from '../models/order.model';

export interface CreateOrderItemDto {
  dishId: string;
  quantity: number;
  observations?: string | null;
}

export interface CreateOrderDto {
  tableId: string;
  items: CreateOrderItemDto[];
}

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/orders`;

  getOrdersByTable(tableId: string) {
    const params = new HttpParams().set('tableId', tableId);
    return this.http.get<Order[]>(this.base, { params });
  }

  createOrder(dto: CreateOrderDto) {
    return this.http.post<Order>(this.base, dto);
  }

  cancelOrder(id: string) {
    return this.http.patch<Order>(`${this.base}/${id}/cancel`, {});
  }
}
