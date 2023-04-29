export interface Course {
  id: string;
  name: string;
  short: string;
  color: string;
}

export type Lesson = {course: string, room: string, week?: 'a' | 'b' | 'all'};

export interface Timetable {
  mon: Lesson[];
  tue: Lesson[];
  wed: Lesson[];
  thu: Lesson[];
  fri: Lesson[];
}
