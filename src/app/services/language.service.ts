import { Injectable, signal, Pipe, PipeTransform } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  currentLanguage = signal<string>('en');

  // Basic translation dictionary for demonstration and future expansion
  private translations: Record<string, Record<string, string>> = {
    'en': {
      'DASHBOARD': 'Dashboard',
      'FEES': 'Fees',
      'STUDENT': 'Student',
      'ATTENDANCE': 'Attendance',
      'LEAVE': 'Leave',
      'SIGN_OUT': 'Sign Out',
      'PROFILE': 'Profile'
    },
    'hi': {
      'DASHBOARD': 'डैशबोर्ड',
      'FEES': 'शुल्क',
      'STUDENT': 'छात्र',
      'ATTENDANCE': 'उपस्थिति',
      'LEAVE': 'छुट्टी',
      'SIGN_OUT': 'साइन आउट',
      'PROFILE': 'प्रोफ़ाइल'
    }
  };

  constructor() {
    this.initLanguage();
  }

  private initLanguage() {
    const savedLang = localStorage.getItem('language');
    if (savedLang === 'hi' || savedLang === 'en') {
      this.currentLanguage.set(savedLang);
    } else {
      this.currentLanguage.set('en');
    }
  }

  setLanguage(lang: string) {
    this.currentLanguage.set(lang);
    localStorage.setItem('language', lang);
  }

  translate(key: string): string {
    const lang = this.currentLanguage();
    return this.translations[lang]?.[key] || key;
  }
}

// A simple pipe to use in HTML templates: {{ 'DASHBOARD' | translate }}
@Pipe({
  name: 'translate',
  standalone: true,
  pure: false // Impure so it updates when language changes
})
export class TranslatePipe implements PipeTransform {
  constructor(private langService: LanguageService) {}

  transform(value: string): string {
    return this.langService.translate(value);
  }
}
