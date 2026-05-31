import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  isMobileMenuOpen = false;

  announcements = [
    { title: 'Final Exams Timetable Published', date: 'Oct 15, 2026', type: 'Exam' },
    { title: 'Annual Science Fair Registration Open', date: 'Oct 18, 2026', type: 'Event' },
    { title: 'Winter Break Holidays Announced', date: 'Nov 01, 2026', type: 'Holiday' },
  ];

  topTeachers = [
    { name: 'Dr. Sarah Jenkins', designation: 'Head of Science', achievement: 'Best Educator Award 2025', image: 'https://ui-avatars.com/api/?name=Sarah+Jenkins&background=random&size=128' },
    { name: 'Mr. David Chen', designation: 'Senior Mathematics Teacher', achievement: '100% Student Pass Rate', image: 'https://ui-avatars.com/api/?name=David+Chen&background=random&size=128' },
    { name: 'Mrs. Emily Brown', designation: 'English Literature', achievement: 'Excellence in E-Learning', image: 'https://ui-avatars.com/api/?name=Emily+Brown&background=random&size=128' },
  ];

  topStudents = [
    { name: 'Aiden Smith', class: 'Grade 10-A', achievement: 'National Science Olympiad Gold', image: 'https://ui-avatars.com/api/?name=Aiden+Smith&background=random&size=128' },
    { name: 'Priya Sharma', class: 'Grade 12-B', achievement: 'Top Scorer in Mathematics', image: 'https://ui-avatars.com/api/?name=Priya+Sharma&background=random&size=128' },
    { name: 'Lucas Rivera', class: 'Grade 8-C', achievement: 'Inter-school Debate Champion', image: 'https://ui-avatars.com/api/?name=Lucas+Rivera&background=random&size=128' },
  ];

  upcomingEvents = [
    { title: 'Annual Sports Meet', date: 'November 12, 2026', time: '09:00 AM', description: 'Join us for two days of track and field events.' },
    { title: 'Parent-Teacher Meeting', date: 'November 20, 2026', time: '10:00 AM', description: 'Term 1 progress review.' },
    { title: 'Winter Gala', date: 'December 15, 2026', time: '05:00 PM', description: 'Annual cultural festival and student performances.' },
  ];

  recentActivities = [
    { title: 'Robotics Workshop', image: 'https://images.unsplash.com/photo-1561557944-6e7860d1a7eb?q=80&w=400&auto=format&fit=crop' },
    { title: 'Tree Plantation Drive', image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=400&auto=format&fit=crop' },
    { title: 'Inter-School Debate', image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=400&auto=format&fit=crop' },
  ];

  stats = [
    { label: 'Total Students', value: '2,450+' },
    { label: 'Expert Teachers', value: '120+' },
    { label: 'Classrooms', value: '85' },
    { label: 'Passing Rate', value: '99%' }
  ];
}
