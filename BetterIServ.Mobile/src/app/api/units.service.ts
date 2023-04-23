import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {IServService} from "./iserv.service";
import {UnitsData} from "../entities/substitution";
import {firstValueFrom} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class UnitsService {

  private schools: {[domain: string]: {today: string, tomorrow: string}} = {
    ["hgbp.de"]: {
      today: "https://www.humboldt-gymnasium.de/vertretungsplan/PlanINet/heute/subst_001.htm",
      tomorrow: "https://www.humboldt-gymnasium.de/vertretungsplan/PlanINet/morgen/subst_001.htm"
    }
  }

  constructor(private iserv: IServService, private client: HttpClient) {}

  public async getSubstitutionPlan(date: "today" | "tomorrow"): Promise<UnitsData> {
    if (this.schools[this.iserv.userdata.domain] == undefined) return undefined;
    const url = this.schools[this.iserv.userdata.domain][date];
    return await firstValueFrom(this.client.get<UnitsData>(this.iserv.backend + "/units/substitution?url=" + url));
  }

}
