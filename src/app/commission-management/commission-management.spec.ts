import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommissionManagement } from './commission-management';

describe('CommissionManagement', () => {
  let component: CommissionManagement;
  let fixture: ComponentFixture<CommissionManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommissionManagement],
    }).compileComponents();

    fixture = TestBed.createComponent(CommissionManagement);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
