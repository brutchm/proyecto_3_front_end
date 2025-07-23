import { Component, Input } from '@angular/core';
import { IGroupAnimal } from '../../interfaces/group-animal.interface';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-animal-group-card',
  templateUrl: './animal-group-card.component.html',
  styleUrls: ['./animal-group-card.component.scss']
})
export class AnimalGroupCardComponent {
  @Input() groupAnimal!: IGroupAnimal;
  @Input() farmId!: string | number;

  constructor(private router: Router) {}

  goToDetails() {
    this.router.navigate(['/app/animal-group'], { queryParams: { farmId: this.farmId, groupId: this.groupAnimal.id } });
  }
}
