import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CmsService, HomePageSettings, QuickLink, UpcomingEvent, RecentActivity, FacultyExcellence, StudentSpotlight, HomeStatistic, NewsTicker, PortalCard, SocialMediaLink, Holiday } from '../services/cms.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit, OnDestroy {
  isMobileMenuOpen = false;
  isLoading = true;
  isDarkMode = false;
  currentLanguage: 'en' | 'hi' = 'en';
  currentTimeString = '';
  clockInterval: any;
  safeMapUrl: SafeResourceUrl | null = null;

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

  translations: { [key: string]: { [lang: string]: string } } = {
    aboutUs: { en: 'About Us', hi: 'हमारे बारे में' },
    principalMessage: { en: "Principal's Message", hi: 'प्राचार्य का संदेश' },
    admissions: { en: 'Admissions', hi: 'प्रवेश' },
    contactUs: { en: 'Contact Us', hi: 'संपर्क करें' },
    login: { en: 'Login', hi: 'लॉगिन' },
    holidayCalendar: { en: 'Madhya Pradesh Holiday Calendar', hi: 'मध्य प्रदेश अवकाश कैलेंडर' },
    topTeachers: { en: 'Top Teachers', hi: 'शीर्ष शिक्षक' },
    topPerformers: { en: 'Top Performers', hi: 'शीर्ष प्रदर्शन करने वाले छात्र' },
    upcomingEvents: { en: 'Upcoming Events', hi: 'आगामी कार्यक्रम' },
    recentActivities: { en: 'Recent Activities', hi: 'हाल की गतिविधियां' },
    quickLinks: { en: 'Quick Links', hi: 'त्वरित लिंक्स' },
    contactInfo: { en: 'Contact Info', hi: 'संपर्क सूत्र' },
    latestNotifications: { en: 'Latest Notifications', hi: 'नवीनतम सूचनाएं' },
    readMore: { en: 'Read More', hi: 'अधिक पढ़ें' },
    experience: { en: 'Years Experience', hi: 'वर्षों का अनुभव' },
    graduates: { en: 'Graduates', hi: 'स्नातक' },
    portalsTitle: { en: 'Access Portals', hi: 'प्रवेश पोर्टल' },
    academicExcellence: { en: 'Academic Excellence', hi: 'शैक्षणिक उत्कृष्टता' },
    date: { en: 'Date', hi: 'दिनांक' },
    day: { en: 'Day', hi: 'दिन' },
    holiday: { en: 'Holiday', hi: 'अवकाश' },
    currentTime: { en: 'Current Date & Time', hi: 'वर्तमान दिनांक और समय' },
    exploreSettings: { en: 'Explore', hi: 'अन्वेषण करें' },
    getInTouch: { en: 'Get In Touch', hi: 'संपर्क में रहें' },
    contactUsNow: { en: 'Contact Us Now', hi: 'अभी संपर्क करें' }
  };

  constructor(private cms: CmsService, private sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.isDarkMode = document.documentElement.classList.contains('dark');
    this.currentLanguage = (localStorage.getItem('language') as 'en' | 'hi') || 'en';
    
    this.startClock();

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

        const mapUrl = data.settings?.mapEmbedUrl || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3679.529517170564!2d75.82025687590827!3d22.745700779368367!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3962fd02e2124cb1%3A0x67db238d212133b3!2sSuper%20Corridor%2C%20Indore%2C%20Madhya%20Pradesh!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin";
        this.safeMapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(mapUrl);
      },
      error: (err) => {
        console.error('Error loading homepage data', err);
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy() {
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
    }
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

  toggleLanguage() {
    this.currentLanguage = this.currentLanguage === 'en' ? 'hi' : 'en';
    localStorage.setItem('language', this.currentLanguage);
    this.updateClock();
  }

  startClock() {
    this.updateClock();
    this.clockInterval = setInterval(() => {
      this.updateClock();
    }, 1000);
  }

  updateClock() {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    };
    const locale = this.currentLanguage === 'hi' ? 'hi-IN' : 'en-US';
    this.currentTimeString = now.toLocaleString(locale, options);
  }
}
