import {Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import {IServService} from "../../api/iserv.service";
import {MailService} from "../../api/mail.service";
import {MailContent} from "../../entities/mail";
import {UnitsService} from "../../api/units.service";
import {Substitution} from "../../entities/substitution";
import {SubstitutionComponent} from "../../components/substitution/substitution.component";
import {MailComponent} from "../../components/mail/mail.component";
import {Router} from "@angular/router";
import {Course, Lesson, Timetable} from "../../entities/course";
import {LessonComponent} from "../../components/lesson/lesson.component";

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, SubstitutionComponent, MailComponent, LessonComponent]
})
export class HomePage implements OnInit {

  public unreadMails: MailContent[];
  public today: Date;
  public dayName: string;
  public subs: Substitution[];
  public subsDate: Date;
  public classData: {class: string, courses: Course[]};
  public lessons: Lesson[];

  public constructor(public iserv: IServService, public mails: MailService, public units: UnitsService, public router: Router) {}

  async ngOnInit() {
    this.today = new Date();
    this.dayName = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"][this.today.getDay()];
    const scheduleDay = [undefined, "mon", "tue", "wed", "thu", "fri", undefined][this.today.getDay()];

    const mailPromise = this.mails.getMails("INBOX", 0);
    const classPromise = this.iserv.getCoursesAndClass();
    const subsPromise = this.units.getSubstitutionPlan("today");
    await Promise.all([mailPromise, classPromise, subsPromise]);

    this.unreadMails = (await mailPromise).filter(mail => !mail.read);
    this.classData = await classPromise;
    let unitsData = await subsPromise;

    if (this.dateIsPast(unitsData.date, new Date())) {
      unitsData = await this.units.getSubstitutionPlan("tomorrow");
    }
    this.subs = unitsData.substitutions?.filter(subs => subs.classes.includes(this.classData.class));
    this.subsDate = unitsData.date;

    if (this.classData.class.startsWith("Q")) {
      this.subs = this.subs.filter(subs => this.classData.courses.filter(course => course.id == subs.lesson).length > 0);
    }

    if (scheduleDay != undefined && localStorage.getItem("timetable")) {
      this.lessons = (JSON.parse(localStorage.getItem("timetable")) as Timetable)[scheduleDay].filter(lesson => lesson != undefined);
    }
  }

  private dateIsPast(first: Date, second: Date): boolean {
    return first.setHours(0, 0, 0, 0) <= second.setHours(0, 0, 0, 0);
  }

}
