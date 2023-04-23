export interface Substitution {
  class: string;
  times: number[];
  type: string;
  representative: string;
  lesson: string;
  room: string;
  teacher: string;
  description: string;
}

export interface UnitsData {
  notifications: string[];
  substitutions: Substitution[];
}
