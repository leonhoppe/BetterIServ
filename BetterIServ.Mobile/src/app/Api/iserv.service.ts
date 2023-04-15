import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Userdata} from "../entities/userdata";
import {firstValueFrom} from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class IServService {

  public userdata?: Userdata;
  private backend: string = "http://localhost:5273";

  constructor(private client: HttpClient) {
    const data = localStorage.getItem("userdata");
    if (data != null) {
      this.userdata = JSON.parse(data);
    }
  }

  public async login(email: string, password: string): Promise<boolean> {
    const split = email.split('@');
    this.userdata = {};
    this.userdata.username = split[0];
    this.userdata.domain = split[1];
    this.userdata.password = password;

    const data = new FormData();
    data.append("email", email);
    data.append("password", password);

    try {
      this.userdata.token = await firstValueFrom(this.client.post(`${this.backend}/login`, data, {responseType: "text"}));
      localStorage.setItem("userdata", JSON.stringify(this.userdata));
      return true;
    }catch (error) {
      return false;
    }
  }

}
