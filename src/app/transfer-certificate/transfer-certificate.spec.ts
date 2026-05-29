import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferCertificate } from './transfer-certificate';

describe('TransferCertificate', () => {
  let component: TransferCertificate;
  let fixture: ComponentFixture<TransferCertificate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransferCertificate],
    }).compileComponents();

    fixture = TestBed.createComponent(TransferCertificate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
