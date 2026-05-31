import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InquiryDashboard } from './inquiry-dashboard';

describe('InquiryDashboard', () => {
  let component: InquiryDashboard;
  let fixture: ComponentFixture<InquiryDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InquiryDashboard],
    }).compileComponents();

    fixture = TestBed.createComponent(InquiryDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
