import {Component, ElementRef, NgZone, OnInit, ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {IonicModule, IonModal} from '@ionic/angular';
import {IServService} from "../../api/iserv.service";
import {Course, Lesson, Timetable} from "../../entities/course";
import {WeekPipe} from "../../pipes/week.pipe";
import {LessonComponent} from "../../components/lesson/lesson.component";

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.page.html',
  styleUrls: ['./schedule.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, WeekPipe, LessonComponent]
})
export class SchedulePage implements OnInit {

  public showCourses: boolean = false;
  public courses: Course[] = [];
  public currentCourse: Course;
  public timetable: Timetable = {mon: [], tue: [], wed: [], thu: [], fri: []};
  public currentLesson: {lesson: Lesson, day: string, time: number};

  @ViewChild('courseModal') courseModal: IonModal;
  @ViewChild('tableModal') tableModal: IonModal;

  constructor(public iserv: IServService) { }

  async ngOnInit() {
    this.courses = (await this.iserv.getCoursesAndClass()).courses;

    if (localStorage.getItem("timetable") == undefined) {
      for (let day of ['mon', 'tue', 'wed', 'thu', 'fri']) {
        for (let i = 0; i < 10; i++) {
          this.timetable[day].push(undefined);
        }
      }
      localStorage.setItem("timetable", JSON.stringify(this.timetable));
    }else {
      this.timetable = JSON.parse(localStorage.getItem("timetable"));
    }
  }

  public async onEditOrAdd(course?: Course, lesson?: {lesson: Lesson, day: string, time: number}) {
    this.currentCourse = course;
    this.currentLesson = lesson;
    if (this.showCourses) await this.courseModal.present();
    else await this.tableModal.present();
  }

  public async updateOrCreateCourse(event: any) {
    if (event.detail.role == "delete") {
      this.courses.splice(this.courses.indexOf(this.currentCourse), 1);
    }

    if (event.detail.role == "confirm") {
      const data = event.detail.data as Course;

      if (this.currentCourse != undefined) {
        this.courses[this.courses.indexOf(this.currentCourse)] = data;
        delete this.currentCourse;
      }else {
        this.courses.push(data);
      }
    }

    this.courses.sort((a, b) => {
      if (a.name < b.name) return -1;
      if (a.name > b.name) return 1;
      return 0;
    });
    localStorage.setItem("courses", JSON.stringify(this.courses));
  }

  public async updateOrCreateLesson(event: any) {
    if (event.detail.role == "delete") {
      delete this.timetable[this.currentLesson.day][this.currentLesson.time];
    }

    if (event.detail.role == "confirm") {
      const data = event.detail.data as {lesson: Lesson, day: string, time: number};
      this.timetable[data.day][data.time] = data.lesson;
    }

    localStorage.setItem("timetable", JSON.stringify(this.timetable));
    location.reload();
  }

}