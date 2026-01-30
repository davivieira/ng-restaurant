import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Store } from '@ngrx/store';
import { TablesListPage } from './tables-list.page';
import { tablesActions } from '../../state/tables.actions';

describe('TablesListPage', () => {
  let storeDispatch: ReturnType<typeof vi.fn>;
  let selectSignalMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    storeDispatch = vi.fn();
    selectSignalMock = vi.fn();
    TestBed.configureTestingModule({
      imports: [TablesListPage],
      providers: [
        provideRouter([]),
        {
          provide: Store,
          useValue: {
            dispatch: storeDispatch,
            selectSignal: selectSignalMock,
          },
        },
      ],
    });
  });

  it('should create', () => {
    selectSignalMock
      .mockReturnValueOnce(() => 'admin')
      .mockReturnValueOnce(() => [])
      .mockReturnValueOnce(() => false)
      .mockReturnValueOnce(() => null);
    const fixture = TestBed.createComponent(TablesListPage);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('dispatches loadTables on init', () => {
    selectSignalMock
      .mockReturnValueOnce(() => 'admin')
      .mockReturnValueOnce(() => [])
      .mockReturnValueOnce(() => false)
      .mockReturnValueOnce(() => null);
    const fixture = TestBed.createComponent(TablesListPage);
    fixture.detectChanges();
    expect(storeDispatch).toHaveBeenCalledWith(tablesActions.loadTables());
  });

  it('dispatches updateTable when setOccupied is called', () => {
    selectSignalMock
      .mockReturnValueOnce(() => 'waiter')
      .mockReturnValueOnce(() => [{ id: 't1', name: 'Table 1', status: 'free' }])
      .mockReturnValueOnce(() => false)
      .mockReturnValueOnce(() => null);
    const fixture = TestBed.createComponent(TablesListPage);
    fixture.detectChanges();
    fixture.componentInstance.setOccupied({ id: 't1' });
    expect(storeDispatch).toHaveBeenCalledWith(
      tablesActions.updateTable({ id: 't1', dto: { status: 'occupied' } })
    );
  });
});
