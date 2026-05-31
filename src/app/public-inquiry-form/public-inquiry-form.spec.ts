import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicInquiryForm } from './public-inquiry-form';

describe('PublicInquiryForm', () => {
  let component: PublicInquiryForm;
  let fixture: ComponentFixture<PublicInquiryForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicInquiryForm],
    }).compileComponents();

    fixture = TestBed.createComponent(PublicInquiryForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
