import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Store } from '@ngrx/store';
import { TablesManagePage } from './tables-manage.page';
import { tablesActions } from '../../state/tables.actions';

describe('TablesManagePage', () => {
  let storeDispatch: ReturnType<typeof vi.fn>;
  let selectSignalMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    storeDispatch = vi.fn();
    selectSignalMock = vi.fn();
    TestBed.configureTestingModule({
      imports: [TablesManagePage],
      providers: [
        provideRouter([]),
        {
          provide: Store,
          useValue: { dispatch: storeDispatch, selectSignal: selectSignalMock },
        },
      ],
    });
  });

  it('should create', () => {
    selectSignalMock.mockReturnValueOnce(() => []).mockReturnValueOnce(() => false).mockReturnValueOnce(() => null);
    const fixture = TestBed.createComponent(TablesManagePage);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('dispatches clearTablesError and loadTables on init', () => {
    selectSignalMock.mockReturnValueOnce(() => []).mockReturnValueOnce(() => false).mockReturnValueOnce(() => null);
    const fixture = TestBed.createComponent(TablesManagePage);
    fixture.detectChanges();
    expect(storeDispatch).toHaveBeenCalledWith(tablesActions.clearTablesError());
    expect(storeDispatch).toHaveBeenCalledWith(tablesActions.loadTables());
  });

  it('dispatches createTable on submit when name is set', () => {
    selectSignalMock.mockReturnValueOnce(() => []).mockReturnValueOnce(() => false).mockReturnValueOnce(() => null);
    const fixture = TestBed.createComponent(TablesManagePage);
    fixture.detectChanges();
    const comp = fixture.componentInstance;
    comp.name.set('Table 5');
    comp.onSubmit();
    expect(storeDispatch).toHaveBeenCalledWith(
      tablesActions.createTable({ dto: { name: 'Table 5', status: 'free' } })
    );
  });

  it('startEdit and saveEdit dispatch updateTable', () => {
    selectSignalMock
      .mockReturnValueOnce(() => [{ id: 't1', name: 'Table 1', status: 'free' }])
      .mockReturnValueOnce(() => false)
      .mockReturnValueOnce(() => null);
    const fixture = TestBed.createComponent(TablesManagePage);
    fixture.detectChanges();
    const comp = fixture.componentInstance;
    comp.startEdit({ id: 't1', name: 'Table 1', status: 'free' });
    comp.editingName.set('Table One');
    comp.saveEdit();
    expect(storeDispatch).toHaveBeenCalledWith(
      tablesActions.updateTable({ id: 't1', dto: { name: 'Table One', status: 'free' } })
    );
  });

  it('cancelEdit clears editing state', () => {
    selectSignalMock.mockReturnValueOnce(() => []).mockReturnValueOnce(() => false).mockReturnValueOnce(() => null);
    const fixture = TestBed.createComponent(TablesManagePage);
    fixture.detectChanges();
    const comp = fixture.componentInstance;
    comp.startEdit({ id: 't1', name: 'T1', status: 'free' });
    comp.cancelEdit();
    expect(comp.editingId()).toBeNull();
  });
});
