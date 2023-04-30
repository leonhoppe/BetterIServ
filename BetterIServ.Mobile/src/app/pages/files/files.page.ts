import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {ActionSheetController, AlertController, IonicModule, Platform, ToastController} from '@ionic/angular';
import {WebdavService} from "../../api/webdav.service";
import {DirectoryContent} from "../../entities/directoryContent";
import {HttpEventType} from "@angular/common/http";

@Component({
  selector: 'app-files',
  templateUrl: './files.page.html',
  styleUrls: ['./files.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class FilesPage implements OnInit {

  public currentDirectory: string = "/Files/";
  public directoryContent: DirectoryContent[];
  public clipboard: DirectoryContent = undefined;
  public loading: boolean = true;

  public progress: number = -1;

  constructor(private webdav: WebdavService, private platform: Platform, private menus: ActionSheetController, private alerts: AlertController, private toasts: ToastController) { }

  async ngOnInit() {
    this.directoryContent = await this.webdav.getDirectory(this.currentDirectory);
    this.loading = false;
  }

  public async switchDirectory(dir: string) {
    this.loading = true;
    this.directoryContent = await this.webdav.getDirectory(dir);
    this.currentDirectory = dir;
    this.loading = false;
  }

  public async goUpFolder() {
    const split = this.currentDirectory.split("/");
    await this.switchDirectory(this.currentDirectory.replace(split[split.length - 2] + "/", ""));
  }

  public async interact(item: DirectoryContent) {
    if (item.type == "dir") {
      await this.switchDirectory(item.url);
    }else {
      const download = this.webdav.downloadFile(item.url);
      window.open(download, "_blank");
    }
  }

  public async openMenu(item: DirectoryContent) {
    const menu = await this.menus.create({
      header: item.name,
      buttons: [
        {
          text: "Löschen",
          role: "destructive",
          data: {action: "delete"}
        },
        {
          text: "Verschieben",
          data: {action: "move"}
        },
        {
          text: "Abbrechen",
          role: "cancel",
          data: {action: "cancel"}
        }
      ]
    });

    await menu.present();
    const result = await menu.onDidDismiss<{action: string}>();

    if (result.data?.action == undefined) return;
    if (result.data.action == "delete") {
      const alert = await this.alerts.create({
        subHeader: "Möchtest du dieses Element wirklich löschen?",
        message: item.name,
        buttons: [
          {
            text: "Abbrechen",
            role: "cancel"
          },
          {
            text: "Löschen",
            role: "destructive"
          },
        ]
      });

      await alert.present();
      const result = await alert.onDidDismiss();
      if (result.role == "destructive") {
        this.loading = true;
        await this.webdav.delete(item.url);
        await this.switchDirectory(this.currentDirectory);
        this.loading = false;

        await (await this.toasts.create({
          message: "Element gelöscht!",
          position: "bottom",
          duration: 2000
        })).present();
      }
    }
    if (result.data.action == "move") {
      this.clipboard = item;
    }
  }

  public async onUpload(files: FileList, form: HTMLFormElement) {
    this.loading = true;
    const uploads: Promise<void>[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files.item(i);
      uploads.push(new Promise<void>(resolve => {
        this.webdav.uploadFile(this.currentDirectory + file.name, file).subscribe(event => {
          if (event.type == HttpEventType.Response) {
            resolve();
          }
        });
      }))
    }

    await Promise.all(uploads);
    await this.switchDirectory(this.currentDirectory);
    this.loading = false;
    form.reset();

    await (await this.toasts.create({
      message: "Element hochgeladen!",
      position: "bottom",
      duration: 2000
    })).present();
  }

  public async createFolder(event: any) {
    if (event.detail.data == null) return;
    this.loading = true;
    await this.webdav.createFolder(this.currentDirectory + event.detail.data);
    await this.switchDirectory(this.currentDirectory);
    this.loading = false;

    await (await this.toasts.create({
      message: "Ordner erstellt!",
      position: "bottom",
      duration: 2000
    })).present();
  }

  public async onMove() {
    this.loading = true;
    await this.webdav.moveElement(this.clipboard.url, this.currentDirectory + this.clipboard.name);
    await this.switchDirectory(this.currentDirectory);
    this.loading = false;
    delete this.clipboard;

    await (await this.toasts.create({
      message: "Element verschoben!",
      position: "bottom",
      duration: 2000
    })).present();
  }

}
