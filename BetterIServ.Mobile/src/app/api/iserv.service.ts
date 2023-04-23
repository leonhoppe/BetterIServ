import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Userdata, AuthKeys} from "../entities/userdata";
import {firstValueFrom} from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class IServService {

  public userdata?: Userdata;
  public backend: string = "http://localhost:5273";

  constructor(private client: HttpClient) {
    const data = localStorage.getItem("userdata");
    if (data != null) {
      this.userdata = JSON.parse(data);
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
      await firstValueFrom(this.client.post(this.backend + "/auth/login", this.userdata));
      localStorage.setItem("userdata", JSON.stringify(this.userdata));
      return true;
    }catch (error) {
      return false;
    }
  }

  public async getKeys(): Promise<AuthKeys> {
    return await firstValueFrom(this.client.post<AuthKeys>(this.backend + "/auth/login", this.userdata));
  }

}
