import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {firstValueFrom} from "rxjs";
import {environment} from "../../environments/environment";
import {IServService} from "./iserv.service";

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(private client: HttpClient) {}

  public async getItem<T>(item: string, isJson: boolean = true): Promise<T> {
    try {
      const data = await firstValueFrom(this.client.get<{value: string}>(environment.backend + `/storage?user=${IServService.userdata.username}&item=${item}`));

      if (isJson) return JSON.parse(data.value) as T;
      return data.value as T;
    }catch {
      return undefined;
    }
  }

  public async setItem(item: string, value: any) {
    await firstValueFrom(this.client.post(environment.backend + `/storage?user=${IServService.userdata.username}&item=${item}`, value));
  }

  public async clear() {
    await firstValueFrom(this.client.delete(environment.backend + `/storage?user=${IServService.userdata.username}`));
  }

}
