import {Component, Input, OnInit} from '@angular/core';
import {Substitution} from "../../entities/substitution";
import {IonicModule} from "@ionic/angular";

@Component({
  selector: 'substitution',
  templateUrl: './substitution.component.html',
  styleUrls: ['./substitution.component.scss'],
  imports: [
    IonicModule
  ],
  standalone: true
})
export class SubstitutionComponent {

  @Input('subs') subs: Substitution;

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

}
