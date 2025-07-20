import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-animal-group',
  templateUrl: './animal-group.component.html',
  styleUrls: ['./animal-group.component.scss']
})
export class AnimalGroupComponent {
  farmId: string | null = null;
  groupId: string | null = null;

  constructor(private route: ActivatedRoute, private router: Router) {
    this.route.queryParamMap.subscribe(params => {
      this.farmId = params.get('farmId');
      this.groupId = params.get('groupId');
      if (!this.farmId || !this.groupId) {
        this.router.navigate([this.router.url === '/app/animal-group' ? '/app/farm-details' : '..']);
      }
    });
  }
}
