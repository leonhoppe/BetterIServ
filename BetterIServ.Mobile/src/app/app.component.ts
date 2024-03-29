import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import { IonicModule } from '@ionic/angular';
import {IServService} from "./api/iserv.service";
import {StorageService} from "./api/storage.service";
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [IonicModule, RouterLink, RouterLinkActive, CommonModule],
})
export class AppComponent {

  public appPages = [
    { title: 'Übersicht', url: '/home', icon: 'home' },
    { title: 'E-Mail', url: '/mails', icon: 'mail' },
    { title: 'Dateien', url: '/files', icon: 'folder' },
    { title: 'Stundenplan', url: '/schedule', icon: 'grid' },
    { title: 'Vertretungsplan', url: '/substitution', icon: 'list' },
  ];

  constructor(public router: Router, public iserv: IServService, private storage: StorageService) {
    if (localStorage.getItem("userdata") == null) {
      this.router.navigate(["login"]);
    }
  }

  public async logout() {
    localStorage.clear();
    this.iserv.logout();
    await this.router.navigate(["login"]);
  }

}
