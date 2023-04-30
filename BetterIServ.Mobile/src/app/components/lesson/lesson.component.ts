import {Component, Input} from '@angular/core';
import {IonicModule} from "@ionic/angular";
import {Course, Lesson} from "../../entities/course";

@Component({
  selector: 'lesson',
  templateUrl: './lesson.component.html',
  styleUrls: ['./lesson.component.scss'],
  imports: [
    IonicModule
  ],
  standalone: true
})
export class LessonComponent {

  @Input('courses') courses: Course[];
  @Input('lesson') lesson: Lesson;

  public findCourse(id: string): Course {
    for (let course of this.courses)
      if (course.id == id) return course;
    return undefined;
  }

}
