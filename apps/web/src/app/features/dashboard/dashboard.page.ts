import { Component } from '@angular/core';
import { CardComponent } from '../../shared';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CardComponent],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss',
})
export class DashboardPage {}
