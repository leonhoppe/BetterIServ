import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Userdata, AuthKeys} from "../entities/userdata";
import {firstValueFrom} from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class IServService {

  public userdata?: Userdata;
  public keys?: AuthKeys;
  public backend: string = "http://localhost:5273";

  constructor(private client: HttpClient) {
    const data = localStorage.getItem("userdata");
    if (data != null) {
      this.userdata = JSON.parse(data);
    }

    const keys = localStorage.getItem("keys");
    if (keys != null) {
      this.keys = JSON.parse(keys);
    }
  }

  public async login(email: string, password: string): Promise<boolean> {
    const split = email.split('@');
    this.userdata = {
      username: split[0],
      domain: split[1],
      password
    };

    try {
      const keys = await firstValueFrom(this.client.post<AuthKeys>(this.backend + "/iserv/login", this.userdata));
      localStorage.setItem("userdata", JSON.stringify(this.userdata));
      localStorage.setItem("keys", JSON.stringify(keys));
      return true;
    }catch (error) {
      return false;
    }
  }

  public async getKeys(): Promise<AuthKeys> {
    const keys = await firstValueFrom(this.client.post<AuthKeys>(this.backend + "/iserv/login", this.userdata));
    localStorage.setItem("keys", JSON.stringify(keys));
    return keys;
  }

  public async getGroups(): Promise<string[]> {
    try {
      return (await firstValueFrom(this.client.post<{value: string[]}>(this.backend + "/iserv/groups?domain=" + this.userdata.domain, this.keys))).value;
    } catch {
      await this.getKeys();
      return (await firstValueFrom(this.client.post<{value: string[]}>(this.backend + "/iserv/groups?domain=" + this.userdata.domain, this.keys))).value;
    }
  }

}
