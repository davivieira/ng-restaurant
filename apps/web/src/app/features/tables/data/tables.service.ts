import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import type { Table } from '../models/table.model';

export interface CreateTableDto {
  name: string;
  status?: 'free' | 'occupied';
}

export interface UpdateTableDto {
  name?: string;
  status?: 'free' | 'occupied';
  currentWaiterId?: string | null;
}

@Injectable({ providedIn: 'root' })
export class TablesService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/tables`;

  getTables() {
    return this.http.get<Table[]>(this.base);
  }

  createTable(dto: CreateTableDto) {
    return this.http.post<Table>(this.base, dto);
  }

  updateTable(id: string, dto: UpdateTableDto) {
    return this.http.patch<Table>(`${this.base}/${id}`, dto);
  }

  deleteTable(id: string) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
