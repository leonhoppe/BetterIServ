import {Component, ElementRef, NgZone, OnInit, ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {IonicModule, IonModal} from '@ionic/angular';
import {IServService} from "../../api/iserv.service";
import {Course, Lesson, Timetable} from "../../entities/course";
import {WeekPipe} from "../../pipes/week.pipe";
import {LessonComponent} from "../../components/lesson/lesson.component";
import {StorageService} from "../../api/storage.service";

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
  public allCourses: Course[];

  @ViewChild('courseModal') courseModal: IonModal;
  @ViewChild('tableModal') tableModal: IonModal;

  constructor(public iserv: IServService, private storage: StorageService) { }

  async ngOnInit() {
    this.courses = (await this.iserv.getCoursesAndClass()).courses;
    this.timetable = await this.storage.getItem("timetable");

    if (this.timetable == undefined) {
      for (let day of ['mon', 'tue', 'wed', 'thu', 'fri']) {
        for (let i = 0; i < 10; i++) {
          this.timetable[day].push(undefined);
        }
      }

      await this.storage.setItem("timetable", this.timetable);
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
    await this.storage.setItem("courses", JSON.stringify(this.courses));
  }

  public async updateOrCreateLesson(event: any) {
    if (event.detail.role == "delete") {
      delete this.timetable[this.currentLesson.day][this.currentLesson.time];
    }

    if (event.detail.role == "confirm") {
      if (this.currentLesson != undefined) {
        delete this.timetable[this.currentLesson.day][this.currentLesson.time];
      }

      const data = event.detail.data as {lesson: Lesson, day: string, time: number};
      this.timetable[data.day][data.time] = data.lesson;
    }

    await this.storage.setItem("timetable", JSON.stringify(this.timetable));
    location.reload();
  }

  public getCommonCourseRoom(course: string): string {
    if (course == undefined) return "";

    const rooms: string[] = [];
    for (let day of ['mon', 'tue', 'wed', 'thu', 'fri']) {
      const courseTime = this.timetable[day].filter(lesson => lesson != undefined && lesson.course == course) as Lesson[];
      rooms.push(...courseTime.map(time => time.room));
    }

    return rooms[rooms.length - 1];
  }

  public loadAllCourses() {
    this.allCourses = [];
    for (let short of Object.keys(this.iserv.courseNames)) {
      const name = this.iserv.courseNames[short];
      this.allCourses.push({short, name, id: short, color: this.getRandomColor()});
    }
  }

  public getRandomColor(): string {
    return this.iserv.colors[Math.floor(Math.random() * this.iserv.colors.length)].val;
  }

  public addToAll(name: string, short: string) {
    this.allCourses.push({short, name, id: short, color: this.getRandomColor()});
  }

  public async saveCourses(event: any) {
    if (event.detail.role != "confirm") return;
    this.courses = this.allCourses;
    delete this.allCourses;
    await this.storage.setItem("courses", this.courses);
  }

}
