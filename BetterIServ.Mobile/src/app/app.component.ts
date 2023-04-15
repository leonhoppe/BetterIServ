import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import { IonicModule } from '@ionic/angular';
import {IServService} from "./Api/iserv.service";
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
    { title: 'E-Mail', url: '/email', icon: 'mail' },
    { title: 'Dateien', url: '/files', icon: 'folder' },
    { title: 'Aufgaben', url: '/tasks', icon: 'clipboard' },
    { title: 'Stundenplan', url: '/schedule', icon: 'grid' },
    { title: 'Vertretungsplan', url: '/substitution', icon: 'list' },
  ];
  public email = "leon.hoppe@hgbp.de";

  constructor(private router: Router, public iserv: IServService) {
    if (localStorage.getItem("userdata") == null) {
      this.router.navigate(["login"]);
    }
  }

  public logout() {
    localStorage.removeItem("userdata");
    this.router.navigate(["login"]);
  }

}
