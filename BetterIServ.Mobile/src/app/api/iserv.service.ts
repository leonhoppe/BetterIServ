import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Userdata, AuthKeys} from "../entities/userdata";
import {firstValueFrom} from "rxjs";
import {environment} from "../../environments/environment";
import {Course} from "../entities/course";
import {StorageService} from "./storage.service";

@Injectable({
  providedIn: 'root',
})
export class IServService {

  public static userdata?: Userdata;
  public keys?: AuthKeys;
  public backend: string = environment.backend;

  public get userdata(): Userdata {
    return IServService.userdata;
  }

  public courseNames: {[id: string]: string} = {
    ["Bi"]: "Biologie",
    ["Ch"]: "Chemie",
    ["Ma"]: "Mathe",
    ["Ph"]: "Physik",
    ["De"]: "Deutsch",
    ["Ek"]: "Erdkunde",
    ["En"]: "Englisch",
    ["PW"]: "Politik",
    ["Sn"]: "Spanisch",
    ["If"]: "Informatik",
    ["Sp"]: "Sport",
    ["WN"]: "Werte und Normen",
    ["La"]: "Latein",
    ["Re"]: "Religion",
    ["Ge"]: "Geschichte",
    ["Ku"]: "Kunst",
    ["Sf"]: "Seminarfach",
    ["DS"]: "Darstellendes Spiel",
  };
  public colors: {name: string; val: string}[] = [
    {name: "Blau", val: "primary"},
    {name: "Hellblau", val: "secondary"},
    {name: "Lila", val: "tertiary"},
    {name: "Grün", val: "success"},
    {name: "Gelb", val: "warning"},
    {name: "Rot", val: "danger"}
  ];

  constructor(private client: HttpClient, private storage: StorageService) {
    const data = localStorage.getItem("userdata");
    if (data != null) {
      IServService.userdata = JSON.parse(data);
    }

    const keys = localStorage.getItem("keys");
    if (keys != null) {
      this.keys = JSON.parse(keys);
    }
  }

  public async login(email: string, password: string): Promise<boolean> {
    const split = email.split('@');
    IServService.userdata = {
      username: split[0],
      domain: split[1],
      password
    };

    try {
      const keys = await firstValueFrom(this.client.post<AuthKeys>(this.backend + "/iserv/login", IServService.userdata));
      localStorage.setItem("userdata", JSON.stringify(IServService.userdata));
      localStorage.setItem("keys", JSON.stringify(keys));
      return true;
    }catch (error) {
      return false;
    }
  }

  public logout() {
    delete IServService.userdata;
    delete this.keys;
  }

  public async getKeys(): Promise<AuthKeys> {
    const keys = await firstValueFrom(this.client.post<AuthKeys>(this.backend + "/iserv/login", IServService.userdata));
    localStorage.setItem("keys", JSON.stringify(keys));
    return keys;
  }

  public async getGroups(): Promise<string[]> {
    try {
      return (await firstValueFrom(this.client.post<{value: string[]}>(this.backend + "/iserv/groups?domain=" + IServService.userdata.domain, this.keys))).value;
    } catch {
      const keys = await this.getKeys();
      return (await firstValueFrom(this.client.post<{value: string[]}>(this.backend + "/iserv/groups?domain=" + IServService.userdata.domain, keys))).value;
    }
  }

  public async getCoursesAndClass(groups?: string[]): Promise<{class: string, courses: Course[]}> {
    const courses = await this.storage.getItem<Course[]>("courses");
    const className = await this.storage.getItem<string>("class", false);
    if (courses != undefined && className != undefined) return {class: className, courses};

    if (groups == undefined) {
      groups = await this.getGroups();
    }

    const result: {class: string, courses: string[]} = {class: undefined, courses: []};

    const classNames = groups.filter(group => group.startsWith("Klasse ") && !group.includes("."));
    if (classNames.length != 0) {
      result.class = classNames[0].replace("Klasse ", "");
    }else {
      const grades = groups.filter(group => group.startsWith("Jahrgang ") && !group.includes("."));
      if (grades.length != 0) {
        result.class = grades[0].replace("Jahrgang ", "").toUpperCase();
      }
    }
    await this.storage.setItem("class", result.class);

    for (let group of groups) {
      if (!group.includes(".") || !group.toLowerCase().startsWith("q")) continue;
      result.courses.push(group.split(".")[1]);
    }

    if (result.class.startsWith("Q")) {
      const courses: Course[] = [];
      for (let course of result.courses) {
        const short = course.substring(1, 3);
        const name = this.courseNames[short];
        if (name == undefined) continue;
        courses.push({
          id: course,
          short: short.toUpperCase(),
          name: name,
          color: this.colors[Math.floor(Math.random() * this.colors.length)].val
        });
      }
      courses.sort((a, b) => {
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
        return 0;
      });

      await this.storage.setItem("courses", JSON.stringify(courses));
      return {class: result.class, courses};
    }

    return {class: result.class, courses: []};
  }

}
