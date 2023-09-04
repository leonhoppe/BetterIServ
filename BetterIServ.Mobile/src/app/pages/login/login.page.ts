import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {AlertController, IonicModule} from '@ionic/angular';
import {IServService} from "../../api/iserv.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class LoginPage implements OnInit {

  public showLoading: boolean = false;

  constructor(private iservApi: IServService, private router: Router, private alerts: AlertController) { }

  ngOnInit() {
  }

  public async onLogin(email?: string, password?: string) {
    if (email == undefined || password == undefined) return;
    if (this.showLoading) return;
    this.showLoading = true;

    if (await this.iservApi.login(email, password)) {
      setTimeout(async () => {
        this.showLoading = false;
        await this.router.navigate(['home']);
      }, 500);
    }else {
      this.showLoading = false;
      const alert = await this.alerts.create({
        header: "Fehler",
        message: "Die angegebenen Logindaten sind nicht korrekt!",
        buttons: ['Ok']
      });

      await alert.present();
    }
  }

}
