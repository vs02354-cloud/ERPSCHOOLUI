import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


export interface HomePageSettings {
  id?: number;
  schoolName: string;
  logoUrl: string;
  address: string;
  email: string;
  phone: string;
  websiteUrl: string;
  heroTagline: string;
  heroHeading: string;
  heroDescription: string;
  heroPrimaryButtonText: string;
  heroPrimaryButtonUrl: string;
  heroSecondaryButtonText: string;
  heroSecondaryButtonUrl: string;
  mapEmbedUrl: string;
}

// ... other interfaces ... (I'll add the necessary ones simply)
export interface QuickLink { id?: number; title: string; url: string; displayOrder: number; isActive: boolean; }
export interface UpcomingEvent { id?: number; title: string; eventDate: string; time: string; description: string; imageUrl: string; isActive: boolean; }
export interface RecentActivity { id?: number; title: string; description: string; imageUrl: string; displayOrder: number; isActive: boolean; }
export interface FacultyExcellence { id?: number; name: string; designation: string; department: string; achievement: string; photoUrl: string; displayOrder: number; isActive: boolean; }
export interface StudentSpotlight { id?: number; name: string; class: string; achievement: string; photoUrl: string; displayOrder: number; isActive: boolean; }
export interface HomeStatistic { id?: number; label: string; value: string; displayOrder: number; isActive: boolean; }
export interface NewsTicker { id?: number; noticeText: string; noticeType: string; priority: number; startDate: string; expiryDate: string; isActive: boolean; }
export interface PortalCard { id?: number; title: string; description: string; iconSvg: string; url: string; themeColor: string; displayOrder: number; isActive: boolean; }
export interface SocialMediaLink { id?: number; platform: string; url: string; isActive: boolean; }

@Injectable({
  providedIn: 'root'
})
export class CmsService {
  private apiUrl = 'https://erpschoolapi.onrender.com/api';
  private publicUrl = `${this.apiUrl}/Public`;
  private adminUrl = `${this.apiUrl}/CmsAdmin`;

  constructor(private http: HttpClient) { }

  // Public Endpoint
  getHomePageData(): Observable<any> {
    return this.http.get(`${this.publicUrl}/HomePageData`);
  }

  // Admin Endpoints
  getSettings(): Observable<HomePageSettings> { return this.http.get<HomePageSettings>(`${this.adminUrl}/Settings`); }
  updateSettings(settings: HomePageSettings): Observable<any> { return this.http.put(`${this.adminUrl}/Settings`, settings); }

  // Generic helper for CRUD
  getItems(type: string): Observable<any[]> { return this.http.get<any[]>(`${this.adminUrl}/${type}`); }
  addItem(type: string, item: any): Observable<any> { return this.http.post(`${this.adminUrl}/${type}`, item); }
  updateItem(type: string, id: number, item: any): Observable<any> { return this.http.put(`${this.adminUrl}/${type}/${id}`, item); }
  deleteItem(type: string, id: number): Observable<any> { return this.http.delete(`${this.adminUrl}/${type}/${id}`); }

  uploadImage(file: File): Observable<{url: string}> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{url: string}>(`${this.adminUrl}/UploadImage`, formData);
  }
}
