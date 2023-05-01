export interface Substitution {
  classes: string[];
  times: number[];
  type: string;
  representative: string;
  lesson: string;
  newLesson: string;
  room: string;
  teacher: string;
  description: string;
}

export interface UnitsData {
  date: Date;
  notifications: string[];
  substitutions: Substitution[];
}
