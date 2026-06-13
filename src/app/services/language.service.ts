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
      
      // Sidebar Navigation
      'NAV_DASHBOARD': 'Dashboard Overview',
      'NAV_STUDENT': 'Student',
      'NAV_STUDENT_ADMISSION': 'Student Admission',
      'NAV_STUDENT_LIST': 'Student List',
      'NAV_ASSIGNMENTS': 'Assignments',
      'NAV_FEES': 'Fees',
      'NAV_FEE_COLLECTION': 'Fee Collection',
      'NAV_FEE_STRUCTURE': 'Fee Structure',
      'NAV_ATTENDANCE': 'Attendance',
      'NAV_MARK_ATTENDANCE': 'Mark Attendance',
      'NAV_VIEW_REPORTS': 'View Reports',
      'NAV_TC': 'Transfer Certificate',
      'NAV_LEAVE_MGMT': 'Leave Management',
      'NAV_INQUIRIES': 'Inquiries',
      'NAV_EMPLOYEES': 'Employees',
      'NAV_EMPLOYEE_LIST': 'Employee List',
      'NAV_COMMISSIONS': 'Commissions',
      'NAV_NOTIFICATIONS': 'Notifications',
      'NAV_SEND_NOTIF': 'Send Notification',
      'NAV_ALL_NOTIF': 'All Notifications',
      'NAV_REPORTS': 'Reports',
      'NAV_MENU': 'Menu',

      // Dashboard Metrics
      'DASH_OVERVIEW': 'Overview Dashboard',
      'DASH_OVERVIEW_DESC': 'Welcome back to the SchoolERP Admin Panel.',
      'DASH_WELCOME_PARENT': 'Welcome,',
      'DASH_WELCOME_STUDENT': 'Welcome to SchoolERP',
      'DASH_METRIC_STUDENTS': 'Total Students',
      'DASH_METRIC_REVENUE': 'Monthly Revenue',
      'DASH_METRIC_ATTENDANCE': 'Average Attendance',
      'DASH_METRIC_STAFF': 'Active Staff',
      'DASH_CHART_TITLE': 'Revenue & Attendance Trends',
      'DASH_CHART_REVENUE': 'Revenue',
      'DASH_CHART_ATT': 'Attendance',
      'DASH_RECENT_ACT': 'Recent Activity',
      'DASH_VIEW_ALL_ACT': 'View All Activity',
      
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
      
      // Sidebar Navigation
      'NAV_DASHBOARD': 'डैशबोर्ड अवलोकन',
      'NAV_STUDENT': 'छात्र',
      'NAV_STUDENT_ADMISSION': 'छात्र प्रवेश',
      'NAV_STUDENT_LIST': 'छात्र सूची',
      'NAV_ASSIGNMENTS': 'कार्य',
      'NAV_FEES': 'शुल्क',
      'NAV_FEE_COLLECTION': 'शुल्क संग्रह',
      'NAV_FEE_STRUCTURE': 'शुल्क संरचना',
      'NAV_ATTENDANCE': 'उपस्थिति',
      'NAV_MARK_ATTENDANCE': 'उपस्थिति दर्ज करें',
      'NAV_VIEW_REPORTS': 'रिपोर्ट देखें',
      'NAV_TC': 'स्थानांतरण प्रमाणपत्र (TC)',
      'NAV_LEAVE_MGMT': 'छुट्टी प्रबंधन',
      'NAV_INQUIRIES': 'पूछताछ',
      'NAV_EMPLOYEES': 'कर्मचारी',
      'NAV_EMPLOYEE_LIST': 'कर्मचारी सूची',
      'NAV_COMMISSIONS': 'कमीशन',
      'NAV_NOTIFICATIONS': 'सूचनाएं',
      'NAV_SEND_NOTIF': 'सूचना भेजें',
      'NAV_ALL_NOTIF': 'सभी सूचनाएं',
      'NAV_REPORTS': 'रिपोर्ट',
      'NAV_MENU': 'मेन्यू',

      // Dashboard Metrics
      'DASH_OVERVIEW': 'अवलोकन डैशबोर्ड',
      'DASH_OVERVIEW_DESC': 'स्कूल ईआरपी एडमिन पैनल में आपका स्वागत है।',
      'DASH_WELCOME_PARENT': 'स्वागत है,',
      'DASH_WELCOME_STUDENT': 'स्कूल ईआरपी में आपका स्वागत है',
      'DASH_METRIC_STUDENTS': 'कुल छात्र',
      'DASH_METRIC_REVENUE': 'मासिक राजस्व',
      'DASH_METRIC_ATTENDANCE': 'औसत उपस्थिति',
      'DASH_METRIC_STAFF': 'सक्रिय कर्मचारी',
      'DASH_CHART_TITLE': 'राजस्व और उपस्थिति रुझान',
      'DASH_CHART_REVENUE': 'राजस्व',
      'DASH_CHART_ATT': 'उपस्थिति',
      'DASH_RECENT_ACT': 'हाल की गतिविधि',
      'DASH_VIEW_ALL_ACT': 'सभी गतिविधियाँ देखें',
      
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
