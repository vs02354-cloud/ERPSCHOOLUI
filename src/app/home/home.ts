import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CmsService, HomePageSettings, QuickLink, UpcomingEvent, RecentActivity, FacultyExcellence, StudentSpotlight, HomeStatistic, NewsTicker, PortalCard, SocialMediaLink, Holiday } from '../services/cms.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  isMobileMenuOpen = false;
  isLoading = true;
  isDarkMode = false;

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
  holidays: Holiday[] = [];

  constructor(private cms: CmsService) {}

  ngOnInit() {
    this.isDarkMode = document.documentElement.classList.contains('dark');

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
        this.holidays = data.holidays || [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading homepage data', err);
        this.isLoading = false;
      }
    });
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }
}
