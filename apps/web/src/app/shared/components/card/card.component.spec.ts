import { TestBed } from '@angular/core/testing';
import { CardComponent } from './card.component';

describe('CardComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CardComponent],
    });
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(CardComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders title when provided', () => {
    const fixture = TestBed.createComponent(CardComponent);
    fixture.componentRef.setInput('title', 'My Card');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.card-title')?.textContent?.trim()).toBe('My Card');
  });

  it('projects content into card-content', () => {
    const fixture = TestBed.createComponent(CardComponent);
    fixture.componentRef.setInput('title', 'Title');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.card-content')).toBeTruthy();
  });

  it('does not render title element when title is undefined', () => {
    const fixture = TestBed.createComponent(CardComponent);
    fixture.componentRef.setInput('title', undefined);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.card-title')).toBeFalsy();
  });
});
