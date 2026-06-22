import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CmsService, HomePageSettings, QuickLink, UpcomingEvent, RecentActivity, FacultyExcellence, StudentSpotlight, HomeStatistic, NewsTicker, PortalCard, SocialMediaLink } from '../services/cms.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  isMobileMenuOpen = false;
  isLoading = true;

  settings: HomePageSettings | null = null;
  announcements: NewsTicker[] = [];
  topTeachers: FacultyExcellence[] = [];
  topStudents: StudentSpotlight[] = [];
  upcomingEvents: UpcomingEvent[] = [];
  recentActivities: RecentActivity[] = [];
  stats: HomeStatistic[] = [];
  quickLinks: QuickLink[] = [];
  portals: PortalCard[] = [];
  socialMediaLinks: SocialMediaLink[] = [];

  constructor(private cms: CmsService) {}

  ngOnInit() {
    this.cms.getHomePageData().subscribe({
      next: (data) => {
        this.settings = data.settings;
        this.announcements = data.newsTickers;
        this.topTeachers = data.facultyExcellences;
        this.topStudents = data.studentSpotlights;
        this.upcomingEvents = data.upcomingEvents;
        this.recentActivities = data.recentActivities;
        this.stats = data.homeStatistics;
        this.quickLinks = data.quickLinks;
        this.portals = data.portalCards;
        this.socialMediaLinks = data.socialMediaLinks;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading homepage data', err);
        this.isLoading = false;
      }
    });
  }
}
