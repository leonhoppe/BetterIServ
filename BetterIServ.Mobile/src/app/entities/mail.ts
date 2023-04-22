import {Userdata} from "./userdata";

export interface MailFolder {
  name: string;
  newMessageCount: number;
}

export interface MailData extends Userdata {
  mailBody: string;
  receiver: string;
  subject: string;
}

export interface MailAddress {
  displayName: string;
  user: string;
  address: string;
}

export interface MailContent {
  id: number;
  sender: MailAddress;
  subject: string;
  message: string;
  time: Date;
  read: boolean;
  attachments: string[];
}
