import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AssignmentMaster {
  assignmentId: number;
  title: string;
  description: string;
  subject: string;
  className: string;
  section: string;
  dueDate: string;
  maxMarks: number;
  attachmentPath?: string;
  createdDate: string;
  submissions?: AssignmentSubmission[];
}

export interface AssignmentSubmission {
  submissionId: number;
  assignmentId: number;
  studentId: number;
  student?: any; // To hold nested student info
  filePath?: string;
  submittedDate: string;
  status: string;
  marksObtained?: number;
  teacherRemark?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AssignmentService {
  private apiUrl = 'https://erpschoolapi.onrender.com/api/Assignments';
  // Use localhost for local dev if needed: private apiUrl = 'http://localhost:5242/api/Assignments';

  constructor(private http: HttpClient) {}

  getAssignments(className?: string, section?: string): Observable<AssignmentMaster[]> {
    let url = this.apiUrl;
    if (className && section) {
      url += `?className=${className}&section=${section}`;
    }
    return this.http.get<AssignmentMaster[]>(url);
  }

  getAssignmentDetails(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  createAssignment(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  uploadFile(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/Upload`, formData);
  }

  submitAssignment(assignmentId: number, data: AssignmentSubmission): Observable<any> {
    return this.http.post(`${this.apiUrl}/${assignmentId}/Submit`, data);
  }

  evaluateSubmission(submissionId: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/Submission/${submissionId}/Evaluate`, data);
  }

  getStudentAssignments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Student`);
  }

  getParentAssignments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Parent`);
  }
}
