import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {AlertController, IonicModule} from '@ionic/angular';
import {UnitsService} from "../../api/units.service";
import {Substitution, UnitsData} from "../../entities/substitution";
import {IServService} from "../../api/iserv.service";

@Component({
  selector: 'app-substitution',
  templateUrl: './substitution.page.html',
  styleUrls: ['./substitution.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class SubstitutionPage implements OnInit {

  public data: UnitsData;
  public showNews: boolean = false;
  public courses: string[] = [];
  public currentClass: string;
  public filterByClasses: boolean = false;

  constructor(public units: UnitsService, private iserv: IServService, private alerts: AlertController) {
    this.currentClass = localStorage.getItem("class") || 'all';
    this.filterByClasses = localStorage.getItem("filterByClasses") == "true";
  }

  async ngOnInit() {
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

    const groups = await this.iserv.getGroups();
    for (let group of groups) {
      if (!group.includes(".")) continue;
      this.courses.push(group.split(".")[1]);
    }
  }

  public async changeDate(date: string) {
    this.data = await this.units.getSubstitutionPlan(date as "today" | "tomorrow");
  }

  public changeClass(className: string) {
    this.currentClass = className;
    localStorage.setItem("class", className);

    this.filterByClasses = false;
    this.showOnlyCourses(false);
  }

  public getDetails(subs: Substitution): string {
    if (subs.type == "bitte beachten") {
      const desc = subs.description != "&nbsp;" ? ' - ' + subs.description : "";
      let info = `${subs.lesson} (${subs.teacher}) in ${subs.room}`;

      if (subs.lesson != subs.newLesson) {
        info = `${subs.newLesson} (${subs.representative}) statt ${subs.lesson} (${subs.teacher}) in ${subs.room}`;
      }

      return info + desc;
    }

    switch (subs.type) {
      case "Vertretung":
      case "st. regulärem Unt.":
        return `${subs.lesson} (${subs.representative} statt ${subs.teacher}) in ${subs.room}`;

      case "Raumtausch":
        return `${subs.lesson} (${subs.teacher}) in ${subs.room}`;

      case "Entfall":
        return `${subs.lesson} (${subs.teacher})`;

      case "Stillarbeit":
        return `${subs.lesson} (${subs.teacher}) in ${subs.room}`;

      case "Verlegung":
        return `${subs.newLesson} (${subs.representative}) statt ${subs.lesson} (${subs.teacher}) in ${subs.room}`;

      default:
        return subs.lesson + ' (' + subs.teacher + ') ' + subs.room;
    }
  }

  public showOnlyCourses(toggle: boolean) {
    localStorage.setItem("filterByClasses", toggle.toString());
  }

  public hasClass(course: string): boolean {
    if (!this.filterByClasses) return true;
    return this.courses.includes(course);
  }

}
