import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {InfiniteScrollCustomEvent, IonicModule, IonModal, Platform, ToastController} from '@ionic/angular';
import {MailService} from "../../api/mail.service";
import {MailContent, MailFolder} from "../../entities/mail";
import {marked} from "marked";
import {HttpDownloadProgressEvent, HttpEventType} from "@angular/common/http";
import {File} from "@awesome-cordova-plugins/file/ngx";
import {saveAs} from "file-saver";

@Component({
  selector: 'app-mails',
  templateUrl: './mails.page.html',
  styleUrls: ['./mails.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class MailsPage implements OnInit {

  public showLoading = false;
  public mails: MailContent[] = [];
  public folders: MailFolder[] = [];
  public currentMail: MailContent;
  private currentPage = 0;
  private currentFolder: MailFolder;

  constructor(private mail: MailService, private platform: Platform, private toasts: ToastController) { }

  async ngOnInit() {
    this.showLoading = true;
    const folderResponse = this.mail.getFolders();
    const mailResponse = this.mail.getMails("INBOX", this.currentPage);
    await Promise.all([mailResponse, folderResponse]);

    this.folders = await folderResponse;
    this.mails = await mailResponse;

    this.currentFolder = this.folders.filter(folder => folder.name == "INBOX")[0];
    this.showLoading = false;
  }

  public async changeFolder(folder: MailFolder) {
    this.showLoading = true;
    this.currentFolder = folder;
    this.currentPage = 0;
    this.mails = await this.mail.getMails(this.currentFolder.name, this.currentPage);
    this.showLoading = false;
  }

  public async loadMore(event: any) {
    this.showLoading = true;
    this.currentPage++;
    const newMails = await this.mail.getMails(this.currentFolder.name, this.currentPage);
    this.mails.push(...newMails);
    this.showLoading = false;
    await event.target.complete();
  }

  public async selectMail(message: MailContent, modal: IonModal) {
    this.showLoading = true;
    message.read = true;
    this.currentMail = message;

    const body = await this.mail.getMail(message.id);
    this.currentMail.message = marked(body.message);
    this.currentMail.attachments = body.attachments;

    this.showLoading = false;
    await modal.present();
  }

  public async downloadAttachment(attachment: string, mailId: number) {
    this.showLoading = true;
    this.mail.downloadAttachment(mailId, attachment).subscribe(async event => {
      if (event.type == HttpEventType.Response) {
        const blob = event.body;
        const file = new File();

        if (this.platform.is('desktop')) {
          saveAs(blob, attachment);
          this.showLoading = false;
          return;
        }

        const downloadPath = (
          this.platform.is('android')
        ) ? file.externalDataDirectory : file.documentsDirectory;
        await file.writeFile(downloadPath, attachment, blob, {replace: true});
        this.showLoading = false;
      }
    })
  }

  public async sendMail(receiver: string, subject: string, message: string, modal: IonModal) {
    this.showLoading = true;
    await this.mail.sendMail(subject, receiver, message);
    await modal.dismiss();
    this.showLoading = false;

    const toast = await this.toasts.create({
      message: "E-Mail gesendet!",
      duration: 2000,
      position: "bottom"
    });
    await toast.present();
  }

}
