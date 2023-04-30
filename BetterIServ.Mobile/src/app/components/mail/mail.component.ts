import {Component, Input, OnInit} from '@angular/core';
import {IonicModule} from "@ionic/angular";
import {MailContent} from "../../entities/mail";
import {NgIf} from "@angular/common";

@Component({
  selector: 'mail',
  templateUrl: './mail.component.html',
  styleUrls: ['./mail.component.scss'],
  imports: [
    IonicModule,
    NgIf
  ],
  standalone: true
})
export class MailComponent {

  @Input('mail') message: MailContent;

}
