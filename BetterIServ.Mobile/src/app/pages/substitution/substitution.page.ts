import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import {UnitsService} from "../../api/units.service";
import {UnitsData} from "../../entities/substitution";

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
  public currentClass: string;

  constructor(private units: UnitsService) {
    this.currentClass = localStorage.getItem("class");
  }

  async ngOnInit() {
    this.data = await this.units.getSubstitutionPlan("today");
  }

  public async changeDate(date: string) {
    this.data = await this.units.getSubstitutionPlan(date as "today" | "tomorrow");
  }

  public getDistinctClasses(): string[] {
    const classes: string[] = [];
    if (this.data == undefined) return [];

    for (let subs of this.data.substitutions) {
      if (classes.indexOf(subs.class) == -1) {
        classes.push(subs.class)
      }
    }

    return classes;
  }

  public changeClass(className: string) {
    this.currentClass = className;
    localStorage.setItem("class", className);
  }

}
