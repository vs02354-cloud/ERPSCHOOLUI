import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Notification {
  id: number;
  title: string;
  message: string;
  userId: string;
  isRead: boolean;
  dateSent: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = 'https://erpschoolapi.onrender.com/api/Notifications';
  
  constructor(private http: HttpClient) { }

  getMyNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/my-notifications`);
  }

  markAsRead(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/read`, {});
  }

  markAllAsRead(): Observable<any> {
    return this.http.put(`${this.apiUrl}/mark-all-read`, {});
  }

  sendNotification(data: { title: string, message: string, userIds: string[] }): Observable<any> {
    return this.http.post(`${this.apiUrl}/send`, data);
  }

  getUsersByRole(role: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users?role=${role}`);
  }
}
