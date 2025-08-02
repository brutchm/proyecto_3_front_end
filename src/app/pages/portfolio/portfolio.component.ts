import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-portfolio',
   imports: [
      CommonModule,
      RouterModule,
    ],
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.scss']
})

export class PortfolioComponent {
  teamMembers = [
    {
      nombre: 'Fabián Miranda Loaiza',
      rol: 'Desarrollo',
      descripcion: 'Chequeo continuo del código, estándares de programación. Correo: fmirandal@ucenfotec.ac.cr, Tel: 8758 7272, San Pedro, San José.'
    },
    {
      nombre: 'Sthephanie León Vargas',
      rol: 'Calidad',
      descripcion: 'Validaciones de casos de uso, revisión de documentos. Correo: sleonv@ucenfotec.ac.cr, Tel: 86028795, San Francisco, Heredia.'
    },
    {
      nombre: 'Jimmy Alvarez Mendoza',
      rol: 'Soporte',
      descripcion: 'Mantenimiento del repositorio. Correo: jalvarezme@ucenfotec.ac.cr, Tel: 88763864, San José.'
    }
  ];

  about = `DevSync es un equipo de desarrollo de software comprometido con la innovación, la calidad y la mejora continua. Nos enfocamos en la sincronización efectiva y la colaboración ágil para lograr soluciones tecnológicas que impacten positivamente a nuestros clientes.`;

  project = `Proyecto académico de Ingeniería de Software III, enfocado en el desarrollo colaborativo, la transparencia y la responsabilidad. Nuestra misión es ofrecer soluciones de software con honestidad y excelencia, impulsando el desarrollo de software de alta calidad y satisfaciendo las necesidades de nuestros clientes.`;
  vision = 'Impulsar el desarrollo de software de alta calidad, satisfaciendo las necesidades de nuestros clientes.';
  mission = 'Ofrecer soluciones de software mediante trabajo realizado con transparencia y honestidad, para brindar un excelente servicio. Comprometidos a brindar confianza y mejorar la calidad de vida de nuestros clientes.';
}
