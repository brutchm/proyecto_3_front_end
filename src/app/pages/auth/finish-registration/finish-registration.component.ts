import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * @class FinishRegistrationComponent
 * @description
 * Este componente se muestra a los nuevos usuarios que se registran a través de Google.
 * No contiene lógica de negocio; su única función es presentar al usuario
 * las opciones para registrarse como un tipo de cuenta u otro, redirigiéndolo
 * al flujo de registro correspondiente.
 */
@Component({
  selector: 'app-finish-registration',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './finish-registration.component.html',
  styleUrls: ['./finish-registration.component.scss'],
})
export class FinishRegistrationComponent { }