import {Component, OnInit, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {IonicModule, IonModal, Platform, ToastController} from '@ionic/angular';
import {MailService} from "../../api/mail.service";
import {MailContent, MailFolder} from "../../entities/mail";
import {marked} from "marked";
import {MailComponent} from "../../components/mail/mail.component";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-mails',
  templateUrl: './mails.page.html',
  styleUrls: ['./mails.page.scss'],
  standalone: true,
    imports: [IonicModule, CommonModule, FormsModule, MailComponent]
})
export class MailsPage implements OnInit {

  public showLoading = false;
  public mails: MailContent[] = [];
  public folders: MailFolder[] = [];
  public currentMail: MailContent;
  private currentPage = 0;
  private currentFolder: MailFolder;

  @ViewChild('mailModal') mailModal: IonModal;

  constructor(private mail: MailService, private platform: Platform, private toasts: ToastController, private route: ActivatedRoute) { }

  async ngOnInit() {
    this.showLoading = true;
    const folderResponse = this.mail.getFolders();
    const mailResponse = this.mail.getMails("INBOX", this.currentPage);
    await Promise.all([mailResponse, folderResponse]);

    this.folders = await folderResponse;
    this.mails = await mailResponse;

    this.currentFolder = this.folders.filter(folder => folder.name == "INBOX")[0];
    this.showLoading = false;

    this.route.params.subscribe((params: {id: string}) => {
      if (params.id != undefined) {
        const id = Number(params.id);
        const email = this.mails.filter(mail => mail.id == id)[0];
        this.selectMail(email, this.mailModal);
      }
    })
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
    const download = this.mail.downloadAttachment(mailId, attachment);
    window.open(download, "_blank");
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
