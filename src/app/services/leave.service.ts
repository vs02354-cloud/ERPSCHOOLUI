import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LeaveRequest {
  id?: number;
  employeeId?: number | null;
  studentId?: number | null;
  startDate: string;
  endDate: string;
  reason: string;
  status?: string;
  managerRemarks?: string;
  student?: any;
}

@Injectable({
  providedIn: 'root'
})
export class LeaveService {
  private apiUrl = 'https://erpschoolapi.onrender.com/api/LeaveRequests';
  // Use localhost if running locally: private apiUrl = 'https://localhost:7153/api/LeaveRequests';

  constructor(private http: HttpClient) { }

  getMyLeaves(): Observable<LeaveRequest[]> {
    return this.http.get<LeaveRequest[]>(`${this.apiUrl}/my-leaves`);
  }

  applyLeave(leaveRequest: LeaveRequest): Observable<LeaveRequest> {
    return this.http.post<LeaveRequest>(this.apiUrl, leaveRequest);
  }

  getMyStudents(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/my-students`);
  }
}
