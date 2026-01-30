import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-quantity-input',
  standalone: true,
  imports: [],
  templateUrl: './quantity-input.component.html',
  styleUrl: './quantity-input.component.scss',
})
export class QuantityInputComponent {
  /** Label for the control (e.g. "Qty") */
  label = input<string>('Qty');
  /** Input id for a11y (e.g. "qty-dish-1") */
  inputId = input<string>('');
  /** Current value */
  value = input<number>(0);
  /** Minimum allowed value */
  min = input<number>(0);

  valueChange = output<number>();

  decrement() {
    const current = this.value();
    const minVal = this.min();
    if (current > minVal) {
      this.valueChange.emit(current - 1);
    }
  }

  increment() {
    this.valueChange.emit(this.value() + 1);
  }

  onInput(event: Event) {
    const raw = (event.target as HTMLInputElement).value;
    const parsed = parseInt(raw, 10);
    const minVal = this.min();
    if (!Number.isNaN(parsed) && parsed >= minVal) {
      this.valueChange.emit(parsed);
    }
  }
}
