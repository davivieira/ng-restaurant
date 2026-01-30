import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { of, throwError } from 'rxjs';
import type { Observable } from 'rxjs';
import { menuActions } from './menu.actions';
import { MenuEffects } from './menu.effects';
import { MenuService } from '../data/menu.service';
import type { Category } from '../models/category.model';
import type { Dish } from '../models/dish.model';

const mockCategory: Category = { id: 'c1', restaurantId: 'r1', name: 'Starters' };
const mockDish: Dish = {
  id: 'd1',
  restaurantId: 'r1',
  name: 'Soup',
  description: null,
  price: '5',
  categoryId: 'c1',
  isActive: true,
};

describe('MenuEffects', () => {
  let actions$: Observable<Action>;
  let menuService: { getCategories: ReturnType<typeof vi.fn>; getDishes: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    menuService = { getCategories: vi.fn(), getDishes: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        provideMockActions(() => actions$),
        { provide: MenuService, useValue: menuService },
      ],
    });
  });

  describe('loadMenu$', () => {
    it('dispatches loadMenuSuccess when getCategories and getDishes succeed', async () => {
      actions$ = of(menuActions.loadMenu());
      menuService.getCategories.mockReturnValue(of([mockCategory]));
      menuService.getDishes.mockReturnValue(of([mockDish]));

      await new Promise<void>((resolve, reject) => {
        TestBed.runInInjectionContext(() => {
          const effect = (MenuEffects.loadMenu$ as unknown as () => import('rxjs').Observable<Action>)();
          effect.subscribe({
            next: (action: Action) => {
              expect(action.type).toBe(menuActions.loadMenuSuccess.type);
              resolve();
            },
            error: reject,
          });
        });
      });
    });

    it('dispatches loadMenuFailure when getCategories fails', async () => {
      actions$ = of(menuActions.loadMenu());
      menuService.getCategories.mockReturnValue(throwError(() => new Error('Network error')));

      await new Promise<void>((resolve, reject) => {
        TestBed.runInInjectionContext(() => {
          const effect = (MenuEffects.loadMenu$ as unknown as () => import('rxjs').Observable<Action>)();
          effect.subscribe({
            next: (action: Action) => {
              expect(action.type).toBe(menuActions.loadMenuFailure.type);
              resolve();
            },
            error: reject,
          });
        });
      });
    });
  });
});
