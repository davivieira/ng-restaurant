import { TestBed } from '@angular/core/testing';
import { QuantityInputComponent } from './quantity-input.component';

describe('QuantityInputComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [QuantityInputComponent],
    });
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(QuantityInputComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders label and value', () => {
    const fixture = TestBed.createComponent(QuantityInputComponent);
    fixture.componentRef.setInput('label', 'Qty');
    fixture.componentRef.setInput('value', 2);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Qty');
    const input = el.querySelector('input') as HTMLInputElement;
    expect(input?.value).toBe('2');
  });

  it('emits valueChange when increment is clicked', () => {
    const fixture = TestBed.createComponent(QuantityInputComponent);
    fixture.componentRef.setInput('value', 1);
    fixture.detectChanges();
    const emitted = vi.fn();
    fixture.componentInstance.valueChange.subscribe(emitted);
    const plusBtn = fixture.nativeElement.querySelector('.quantity-btn-plus');
    (plusBtn as HTMLElement)?.click();
    expect(emitted).toHaveBeenCalledWith(2);
  });

  it('emits valueChange when decrement is clicked', () => {
    const fixture = TestBed.createComponent(QuantityInputComponent);
    fixture.componentRef.setInput('value', 3);
    fixture.componentRef.setInput('min', 0);
    fixture.detectChanges();
    const emitted = vi.fn();
    fixture.componentInstance.valueChange.subscribe(emitted);
    const minusBtn = fixture.nativeElement.querySelector('.quantity-btn-minus');
    (minusBtn as HTMLElement)?.click();
    expect(emitted).toHaveBeenCalledWith(2);
  });

  it('does not emit below min when decrement is clicked', () => {
    const fixture = TestBed.createComponent(QuantityInputComponent);
    fixture.componentRef.setInput('value', 0);
    fixture.componentRef.setInput('min', 0);
    fixture.detectChanges();
    const emitted = vi.fn();
    fixture.componentInstance.valueChange.subscribe(emitted);
    const minusBtn = fixture.nativeElement.querySelector('.quantity-btn-minus');
    (minusBtn as HTMLElement)?.click();
    expect(emitted).not.toHaveBeenCalled();
  });

  it('disables minus button when value equals min', () => {
    const fixture = TestBed.createComponent(QuantityInputComponent);
    fixture.componentRef.setInput('value', 0);
    fixture.componentRef.setInput('min', 0);
    fixture.detectChanges();
    const minusBtn = fixture.nativeElement.querySelector('.quantity-btn-minus');
    expect((minusBtn as HTMLButtonElement)?.disabled).toBe(true);
  });

  it('emits valueChange when user types in input', () => {
    const fixture = TestBed.createComponent(QuantityInputComponent);
    fixture.componentRef.setInput('value', 0);
    fixture.componentRef.setInput('min', 0);
    fixture.detectChanges();
    const emitted = vi.fn();
    fixture.componentInstance.valueChange.subscribe(emitted);
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = '5';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(emitted).toHaveBeenCalledWith(5);
  });
});
