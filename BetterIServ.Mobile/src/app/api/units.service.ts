import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {IServService} from "./iserv.service";
import {UnitsData} from "../entities/substitution";
import {firstValueFrom} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class UnitsService {

  public schools: {[domain: string]: {today: string, tomorrow: string, classes: string[]}} = {
    ["hgbp.de"]: {
      today: "https://www.humboldt-gymnasium.de/vertretungsplan/PlanINet/heute/subst_001.htm",
      tomorrow: "https://www.humboldt-gymnasium.de/vertretungsplan/PlanINet/morgen/subst_001.htm",
      classes: ["5a", "5b", "5c", "5d", "6a", "6b", "6c", "6d", "7a", "7b", "7c", "7d", "8a", "8b", "8c", "8d", "9a", "9b", "9c", "9d", "10a", "10b", "10c", "10d", "11a", "11b", "11c", "11d", "Q1", "Q2"]
    }
  }

  constructor(private iserv: IServService, private client: HttpClient) {}

  public doesSchoolExist(): boolean {
    return this.schools[this.iserv.userdata.domain] != undefined;
  }

  public getClasses(): string[] {
    return this.schools[this.iserv.userdata.domain]?.classes;
  }

  public async getSubstitutionPlan(date: "today" | "tomorrow"): Promise<UnitsData> {
    if (this.schools[this.iserv.userdata.domain] == undefined) return undefined;
    const url = this.schools[this.iserv.userdata.domain][date];
    return await firstValueFrom(this.client.get<UnitsData>(this.iserv.backend + "/units/substitution?url=" + url));
  }

}
