import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import type { Category } from '../models/category.model';
import type { Dish } from '../models/dish.model';

export interface CreateCategoryDto {
  name: string;
}

export interface UpdateCategoryDto {
  name?: string;
}

export interface CreateDishDto {
  name: string;
  description?: string;
  price: number;
  categoryId?: string | null;
  isActive?: boolean;
}

export interface UpdateDishDto {
  name?: string;
  description?: string;
  price?: number;
  categoryId?: string | null;
  isActive?: boolean;
}

@Injectable({ providedIn: 'root' })
export class MenuService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/menu`;

  getCategories() {
    return this.http.get<Category[]>(`${this.base}/categories`);
  }

  createCategory(dto: CreateCategoryDto) {
    return this.http.post<Category>(`${this.base}/categories`, dto);
  }

  updateCategory(id: string, dto: UpdateCategoryDto) {
    return this.http.patch<Category>(`${this.base}/categories/${id}`, dto);
  }

  deleteCategory(id: string) {
    return this.http.delete<void>(`${this.base}/categories/${id}`);
  }

  getDishes(categoryId?: string) {
    let params = new HttpParams();
    if (categoryId) params = params.set('categoryId', categoryId);
    return this.http.get<Dish[]>(`${this.base}/dishes`, { params });
  }

  createDish(dto: CreateDishDto) {
    return this.http.post<Dish>(`${this.base}/dishes`, dto);
  }

  updateDish(id: string, dto: UpdateDishDto) {
    return this.http.patch<Dish>(`${this.base}/dishes/${id}`, dto);
  }

  deleteDish(id: string) {
    return this.http.delete<void>(`${this.base}/dishes/${id}`);
  }
}
