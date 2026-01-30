import { TestBed } from '@angular/core/testing';
import { DashboardPage } from './dashboard.page';

describe('DashboardPage', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DashboardPage],
    });
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(DashboardPage);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render welcome message', () => {
    const fixture = TestBed.createComponent(DashboardPage);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Dashboard');
    expect(el.textContent).toContain('Welcome');
  });
});
