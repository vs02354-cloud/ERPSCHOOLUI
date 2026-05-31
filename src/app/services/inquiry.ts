import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AdmissionInquiry {
  inquiryId: number;
  inquiryNo: string;
  inquiryDate: string;
  studentName: string;
  dateOfBirth?: string;
  gender?: string;
  classApplyingFor: string;
  parentName: string;
  mobileNo: string;
  alternateMobileNo?: string;
  emailId?: string;
  currentSchool?: string;
  address?: string;
  city?: string;
  stateName?: string;
  pincode?: string;
  inquirySource?: string;
  followUpDate?: string;
  inquiryStatus: string;
  remarks?: string;
  createdBy?: number;
  createdDate: string;
}

export interface InquirySummary {
  total: number;
  details: { status: string; count: number }[];
}

@Injectable({
  providedIn: 'root'
})
export class InquiryService {
  private http = inject(HttpClient);
  private apiUrl = 'https://erpschoolapi.onrender.com/api/AdmissionInquiry';

  submitInquiry(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  getInquiries(status?: string, search?: string): Observable<AdmissionInquiry[]> {
    let params = new HttpParams();
    if (status && status !== 'All') params = params.set('status', status);
    if (search) params = params.set('search', search);
    return this.http.get<AdmissionInquiry[]>(this.apiUrl, { params });
  }

  getInquiry(id: number): Observable<AdmissionInquiry> {
    return this.http.get<AdmissionInquiry>(`${this.apiUrl}/${id}`);
  }

  updateStatus(id: number, data: { status: string, followUpDate?: string, remarks?: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/status`, data);
  }

  getSummary(): Observable<InquirySummary> {
    return this.http.get<InquirySummary>(`${this.apiUrl}/summary`);
  }
}
