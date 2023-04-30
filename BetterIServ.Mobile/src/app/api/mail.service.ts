import { Injectable } from '@angular/core';
import {IServService} from "./iserv.service";
import {HttpClient, HttpEvent} from "@angular/common/http";
import {MailContent, MailData, MailFolder} from "../entities/mail";
import {firstValueFrom, Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class MailService {

  constructor(private iserv: IServService, private client: HttpClient) { }

  public async getMails(folder: string, page: number): Promise<MailContent[]> {
    const mails = await firstValueFrom(this.client.post<MailContent[]>(this.iserv.backend + `/mail/list/${page}?folder=${folder}`, this.iserv.userdata));

    for (let mail of mails) {
      mail.time = new Date(mail.time);
    }

    return mails;
  }

  public async getMail(id: number): Promise<MailContent> {
    const mail = await firstValueFrom(this.client.post<MailContent>(this.iserv.backend + "/mail/content/" + id, this.iserv.userdata));

    mail.time = new Date(mail.time);
    return mail;
  }

  public async getFolders(): Promise<MailFolder[]> {
    return (await firstValueFrom(this.client.post<{value: MailFolder[]}>(this.iserv.backend + "/mail/folder", this.iserv.userdata))).value;
  }

  public async sendMail(subject: string, receiver: string, mailBody: string) {
    const data: MailData = {
      domain: this.iserv.userdata.domain,
      username: this.iserv.userdata.username,
      password: this.iserv.userdata.password,
      subject, receiver, mailBody
    };
    await firstValueFrom(this.client.post(this.iserv.backend + "/mail/send", data));
  }

  public downloadAttachment(mailId: number, attachment: string): string {
    //return this.client.post(this.iserv.backend + `/mail/download/${mailId}/${attachment}`, this.iserv.userdata, {responseType: "blob", reportProgress: true, observe: "events"});
    return this.iserv.backend + `/mail/download/${mailId}/${attachment}?credentialString=${JSON.stringify(this.iserv.userdata)}`;
  }

}
