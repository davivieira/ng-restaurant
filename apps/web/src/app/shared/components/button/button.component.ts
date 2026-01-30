import { Component, input, output } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'danger';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
})
export class ButtonComponent {
  /** Button label (optional if content is projected). */
  label = input<string>('');
  /** Native type: button | submit */
  type = input<'button' | 'submit'>('button');
  /** Disabled state */
  disabled = input<boolean>(false);
  /** Style variant using theme variables */
  variant = input<ButtonVariant>('primary');

  clicked = output<void>();

  onClick() {
    if (!this.disabled()) {
      this.clicked.emit();
    }
  }
}
