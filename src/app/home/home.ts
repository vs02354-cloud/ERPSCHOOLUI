import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CmsService, HomePageSettings, QuickLink, UpcomingEvent, RecentActivity, FacultyExcellence, StudentSpotlight, HomeStatistic, NewsTicker, PortalCard, SocialMediaLink, Holiday } from '../services/cms.service';
import { ThemeService } from '../services/theme.service';

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
  currentLanguage: 'en' | 'hi' = 'en';
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

  private timerInterval: any;
  currentTime: string = '--:--:--';
  countdownDays: string = '00';
  countdownHours: string = '00';
  countdownMins: string = '00';
  countdownSecs: string = '00';

  constructor(
    private cms: CmsService, 
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
    public themeService: ThemeService
  ) {}

  ngOnInit() {
    this.currentLanguage = (localStorage.getItem('language') as 'en' | 'hi') || 'en';

    this.timerInterval = setInterval(() => {
      this.updateTime();
      this.updateCountdown();
    }, 1000);
    this.updateTime();
    this.updateCountdown();

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
        this.portals = (data.portalCards || []).map((p: any) => ({
          ...p,
          safeIconSvg: p.iconSvg ? this.sanitizer.bypassSecurityTrustHtml(p.iconSvg) : null
        }));
        this.socialMediaLinks = data.socialMediaLinks;
        this.holidays = data.holidays || [];
        this.isLoading = false;

        const mapUrl = data.settings?.mapEmbedUrl || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3679.529517170564!2d75.82025687590827!3d22.745700779368367!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3962fd02e2124cb1%3A0x67db238d212133b3!2sSuper%20Corridor%2C%20Indore%2C%20Madhya%20Pradesh!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin";
        this.safeMapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(mapUrl);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading homepage data', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  updateTime() {
    const now = new Date();
    const h = now.getHours().toString().padStart(2, '0');
    const m = now.getMinutes().toString().padStart(2, '0');
    const s = now.getSeconds().toString().padStart(2, '0');
    this.currentTime = `${h}:${m}:${s}`;
  }

  updateCountdown() {
    const target = new Date('2026-07-15T09:00:00');
    const now = new Date();
    const diff = target.getTime() - now.getTime();
    if (diff > 0) {
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      this.countdownDays = String(d).padStart(2, '0');
      this.countdownHours = String(h).padStart(2, '0');
      this.countdownMins = String(m).padStart(2, '0');
      this.countdownSecs = String(s).padStart(2, '0');
    }
  }

  onLanguageChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.currentLanguage = select.value as 'en' | 'hi';
    localStorage.setItem('language', this.currentLanguage);
    this.cdr.detectChanges();
  }

  toggleLanguage() {
    this.currentLanguage = this.currentLanguage === 'en' ? 'hi' : 'en';
    localStorage.setItem('language', this.currentLanguage);
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
