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
      'PROFILE': 'Profile',
      
      // Student Module
      'STUDENT_DIRECTORY': 'Student Directory',
      'STUDENT_DIRECTORY_DESC': 'Manage and view all enrolled students.',
      'ADD_NEW_STUDENT': 'Add New Student',
      'SEARCH_STUDENT': 'Search by name or admission no...',
      'FILTER_CLASS': 'Filter by Class',
      'FILTER_SECTION': 'Filter by Section',
      'STUDENT_DETAILS': 'Student Details',
      'CLASS_SECTION': 'Class/Section',
      'CATEGORY': 'Category',
      'PARENT_CONTACT': 'Parent Contact',
      'STATUS': 'Status',
      'ACTIONS': 'Actions',
      
      // Admission Form
      'PERSONAL_DETAILS': 'Personal Details',
      'FIRST_NAME': 'First Name',
      'LAST_NAME': 'Last Name',
      'DOB': 'Date of Birth',
      'GENDER': 'Gender',
      'PARENT_DETAILS': 'Parent/Guardian Details',
      'FATHER_NAME': 'Father\'s Name',
      'MOTHER_NAME': 'Mother\'s Name',
      'CONTACT_NUMBER': 'Contact Number',
      'ADDRESS': 'Residential Address',
      'ACADEMIC_EXTRAS': 'Academic & Extras',
      'ADMISSION_CLASS': 'Admission Class',
      'SUBMIT': 'Submit'
    },
    'hi': {
      'DASHBOARD': 'डैशबोर्ड',
      'FEES': 'शुल्क',
      'STUDENT': 'छात्र',
      'ATTENDANCE': 'उपस्थिति',
      'LEAVE': 'छुट्टी',
      'SIGN_OUT': 'साइन आउट',
      'PROFILE': 'प्रोफ़ाइल',
      
      // Student Module
      'STUDENT_DIRECTORY': 'छात्र निर्देशिका',
      'STUDENT_DIRECTORY_DESC': 'सभी नामांकित छात्रों का प्रबंधन और अवलोकन करें।',
      'ADD_NEW_STUDENT': 'नया छात्र जोड़ें',
      'SEARCH_STUDENT': 'नाम या प्रवेश संख्या से खोजें...',
      'FILTER_CLASS': 'कक्षा द्वारा फ़िल्टर',
      'FILTER_SECTION': 'अनुभाग द्वारा फ़िल्टर',
      'STUDENT_DETAILS': 'छात्र विवरण',
      'CLASS_SECTION': 'कक्षा/अनुभाग',
      'CATEGORY': 'श्रेणी',
      'PARENT_CONTACT': 'माता-पिता का संपर्क',
      'STATUS': 'स्थिति',
      'ACTIONS': 'क्रियाएँ',
      
      // Admission Form
      'PERSONAL_DETAILS': 'व्यक्तिगत विवरण',
      'FIRST_NAME': 'पहला नाम',
      'LAST_NAME': 'अंतिम नाम',
      'DOB': 'जन्म तिथि',
      'GENDER': 'लिंग',
      'PARENT_DETAILS': 'माता-पिता/अभिभावक विवरण',
      'FATHER_NAME': 'पिता का नाम',
      'MOTHER_NAME': 'माता का नाम',
      'CONTACT_NUMBER': 'संपर्क नंबर',
      'ADDRESS': 'आवासीय पता',
      'ACADEMIC_EXTRAS': 'शैक्षणिक और अतिरिक्त',
      'ADMISSION_CLASS': 'प्रवेश कक्षा',
      'SUBMIT': 'जमा करें'
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
