import {Injectable} from '@angular/core';
import {IServService} from "./iserv.service";
import {HttpClient, HttpEvent} from "@angular/common/http";
import {DirectoryContent} from "../entities/directoryContent";
import {firstValueFrom, Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class WebdavService {

  constructor(private iserv: IServService, private client: HttpClient) {}

  public async getDirectory(path: string): Promise<DirectoryContent[]> {
    const contents = await firstValueFrom(this.client.post<DirectoryContent[]>(this.iserv.backend + "/webdav/content?dir=" + path, this.iserv.userdata));

    for (let content of contents) {
      content.name = decodeURIComponent(content.name);
      content.url = decodeURI(content.url);
      content.lastModified = new Date(content.lastModified);
    }

    return contents;
  }

  public downloadFile(url: string): string {
    //return this.client.get(this.iserv.backend + `/webdav/download?url=${url}&credentialString=${JSON.stringify(this.iserv.userdata)}`, {responseType: "blob", reportProgress: true, observe: "events"});
    return this.iserv.backend + `/webdav/download?url=${url}&credentialString=${JSON.stringify(this.iserv.userdata)}`;
  }

  public async delete(url: string) {
    await firstValueFrom(this.client.post(this.iserv.backend + "/webdav/delete?url=" + url, this.iserv.userdata));
  }

  public uploadFile(url: string, file: File): Observable<HttpEvent<any>> {
    const form = new FormData();
    form.append('username', this.iserv.userdata.username);
    form.append('password', this.iserv.userdata.password);
    form.append('domain', this.iserv.userdata.domain);
    form.append('file', file);

    return this.client.post(this.iserv.backend + "/webdav/upload?url=" + url, form, {reportProgress: true, observe: "events"});
  }

  public async createFolder(url: string) {
    await firstValueFrom(this.client.post(this.iserv.backend + "/webdav/create/?url=" + url, this.iserv.userdata));
  }

  public async moveElement(url: string, newUrl: string) {
    await firstValueFrom(this.client.post(this.iserv.backend + `/webdav/move/?url=${url}&newUrl=${newUrl}`, this.iserv.userdata));
  }

}
