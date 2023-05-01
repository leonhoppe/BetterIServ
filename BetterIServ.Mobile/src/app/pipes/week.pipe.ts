import { Pipe, PipeTransform } from '@angular/core';
import {Lesson} from "../entities/course";

@Pipe({
  name: 'week',
  standalone: true
})
export class WeekPipe implements PipeTransform {

  transform(objects: Lesson[]): Lesson[] {
    if (objects == undefined) return [];

    const week = this.getWeek(new Date()) % 2;
    const label = week == 0 ? "a" : "b";
    const result = [];
    for (let lesson of objects) {
      if (lesson != undefined && (lesson.week == "all" || lesson.week == label))
        result.push(lesson);
      else result.push(undefined);
    }

    return result;
  }

  private getWeek(orig: Date): number {
    const date = new Date(orig.getTime());
    date.setHours(0, 0, 0, 0);
    // Thursday in current week decides the year.
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    // January 4 is always in week 1.
    const week1 = new Date(date.getFullYear(), 0, 4);
    // Adjust to Thursday in week 1 and count number of weeks from date to week1.
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000
      - 3 + (week1.getDay() + 6) % 7) / 7);
  }

}
