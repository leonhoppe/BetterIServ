import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {AlertController, IonicModule} from '@ionic/angular';
import {UnitsService} from "../../api/units.service";
import {Substitution, UnitsData} from "../../entities/substitution";
import {IServService} from "../../api/iserv.service";
import {SubstitutionComponent} from "../../components/substitution/substitution.component";
import {StorageService} from "../../api/storage.service";

@Component({
  selector: 'app-substitution',
  templateUrl: './substitution.page.html',
  styleUrls: ['./substitution.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, SubstitutionComponent]
})
export class SubstitutionPage implements OnInit {

  public data: UnitsData;
  public showNews: boolean = false;
  public courses: string[] = [];
  public currentClass: string;
  public filterByClasses: boolean = false;

  constructor(public units: UnitsService, private iserv: IServService, private alerts: AlertController, private storage: StorageService) {}

  async ngOnInit() {
    this.currentClass = await this.storage.getItem("class", false) || 'all';
    this.filterByClasses = await this.storage.getItem("filterByClasses", false) == "true";

    if (!this.units.doesSchoolExist()) {
      const alert = await this.alerts.create({
        subHeader: "Fehler",
        message: "Deine Schule wird nicht unterstützt!",
        buttons: ["Ok"]
      });

      await alert.present();
      return;
    }

    this.data = await this.units.getSubstitutionPlan("today");

    const data = await this.iserv.getCoursesAndClass();
    if (data.class.startsWith("Q")) {
      for (let course of data.courses) {
        this.courses.push(course.id);
      }

      if (await this.storage.getItem("filterByClasses") == undefined) {
        this.showOnlyCourses(true);
        this.filterByClasses = true;

        if (data.courses.length == 0) {
          const alert = await this.alerts.create({
            header: "Achtung",
            message: "Füge deine Kurse im Stundenplan hinzu um sie hier zu filtern!",
            buttons: ["Ok"]
          });
          await alert.present();
        }
      }
    }
  }

  public async changeDate(date: string) {
    this.data = await this.units.getSubstitutionPlan(date as "today" | "tomorrow");
  }

  public changeClass(className: string) {
    this.currentClass = className;
    this.storage.setItem("class", className);

    this.filterByClasses = false;
    this.showOnlyCourses(false);
  }

  public showOnlyCourses(toggle: boolean) {
    this.storage.setItem("filterByClasses", toggle.toString());
  }

  public hasClass(course: string): boolean {
    if (!this.filterByClasses) return true;
    if (course == "&nbsp;") return true;

    return this.courses.includes(course
      .replace("1", "")
      .replace("2", ""));
  }

  public addFakeSubstitution(event: any) {
    if (event.detail.role != "confirm") return;
    const data = event.detail.data as {course: string, type: string, lessons: string, teacher: string};
    const sub: Substitution = {
      classes: [this.currentClass],
      lesson: data.course,
      times: data.lessons.split(" - ").map(Number),
      type: data.type,
      teacher: data.teacher,
      representative: "",
      newLesson: "",
      room: "---",
      description: ""
    };

    this.data.substitutions.push(sub);
    this.data.substitutions.sort((a, b) => a.times[0] < b.times[0] ? -1 : 1);
  }

}
