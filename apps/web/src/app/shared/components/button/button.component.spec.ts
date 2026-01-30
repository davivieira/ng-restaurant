import { TestBed } from '@angular/core/testing';
import { ButtonComponent } from './button.component';

describe('ButtonComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ButtonComponent],
    });
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ButtonComponent);
    fixture.componentRef.setInput('label', 'Click me');
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders label', () => {
    const fixture = TestBed.createComponent(ButtonComponent);
    fixture.componentRef.setInput('label', 'Submit');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent?.trim()).toContain('Submit');
  });

  it('emits clicked when button is clicked and not disabled', () => {
    const fixture = TestBed.createComponent(ButtonComponent);
    fixture.componentRef.setInput('label', 'Click');
    fixture.componentRef.setInput('disabled', false);
    fixture.detectChanges();
    const emitted = vi.fn();
    fixture.componentInstance.clicked.subscribe(emitted);
    const btn = fixture.nativeElement.querySelector('button');
    btn?.click();
    expect(emitted).toHaveBeenCalled();
  });

  it('does not emit when disabled', () => {
    const fixture = TestBed.createComponent(ButtonComponent);
    fixture.componentRef.setInput('label', 'Click');
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const emitted = vi.fn();
    fixture.componentInstance.clicked.subscribe(emitted);
    const btn = fixture.nativeElement.querySelector('button');
    btn?.click();
    expect(emitted).not.toHaveBeenCalled();
  });

  it('applies variant class', () => {
    const fixture = TestBed.createComponent(ButtonComponent);
    fixture.componentRef.setInput('label', 'Save');
    fixture.componentRef.setInput('variant', 'primary');
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('button');
    expect(btn?.classList.contains('btn-primary')).toBe(true);
  });
});
