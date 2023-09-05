import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {firstValueFrom, Observable} from "rxjs";
import {environment} from "../../environments/environment";
import {IServService} from "./iserv.service";
import {Lesson} from "../entities/course";

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(private client: HttpClient) {}

  public async getItem<T>(item: string, isJson: boolean = true, defaultValue: T = undefined): Promise<T> {
    try {
      const data = await firstValueFrom(this.client.get<{value: string}>(environment.backend + `/storage?user=${IServService.userdata.username}&item=${item}`));

      if (isJson) return JSON.parse(data.value) as T;
      return data.value as T;
    }catch {
      return defaultValue;
    }
  }

  public getItemLocal<T>(item: string, isJson: boolean = true, defaultValue: T = undefined): Observable<T> {
    return new Observable<T>((result) => {
      const local = localStorage.getItem(item);

      if (local != undefined) {
        if (isJson) result.next(JSON.parse(local) as T);
        else result.next(local as T);
      }

      setTimeout(async () => {
        const response = await this.getItem<T>(item, isJson, defaultValue);
        localStorage.setItem(item, isJson ? JSON.stringify(response) : response as string);
        result.next(response);
        result.complete();
      }, 0);
    })
  }

  public async setItem(item: string, value: any) {
    localStorage.setItem(item, value);
    await firstValueFrom(this.client.post(environment.backend + `/storage?user=${IServService.userdata.username}&item=${item}`, value));
  }

  public isLessonThisWeek(lesson: Lesson): boolean {
    const week = this.getWeek(new Date()) % 2;
    const label = week == 0 ? "a" : "b";
    return (lesson != undefined && (lesson.week == "all" || lesson.week == label));
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
