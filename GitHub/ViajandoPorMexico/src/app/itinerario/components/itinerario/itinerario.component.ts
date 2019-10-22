import { Component, OnInit, Input } from '@angular/core';

import lugares from 'src/assets/js/lugares.json';

import { Estado } from 'src/app/shared/models/estado.js';
import { Ciudad } from 'src/app/shared/models/ciudad.js';

import { ItinerarioService } from "src/app/shared/services/itinerario.service.js";

@Component({
  selector: 'app-itinerario',
  templateUrl: './itinerario.component.html',
  styleUrls: ['./itinerario.component.css']
})
export class ItinerarioComponent implements OnInit {
  @Input() latitud: number;
  @Input() longitud: number;
  @Input() algoritmo: string = "E";

  mostrarResultado: boolean = false;
  estados: Estado[] = lugares.estados;
  estadoSeleccionado: Estado = this.estados[0];
  ciudades: Ciudad[] = this.estadoSeleccionado.ciudades;
  ciudadSeleccionada: Ciudad = this.ciudades[0];

  constructor(public itinerarioService: ItinerarioService) {}

  ngOnInit() {}

  cambiarEstado(nombreEstado: string) {
    this.estadoSeleccionado = this.estados.find(
      estado => estado.nombre === nombreEstado
    );
    this.ciudades = this.estadoSeleccionado.ciudades;
    this.ciudadSeleccionada = this.estadoSeleccionado.ciudades[0];
  }

  cambiarCiudad(nombreCiudad: string) {
    this.ciudadSeleccionada = this.ciudades.find(
      ciudad => ciudad.nombre === nombreCiudad
    );
  }

  agregarUbicacion() {
    this.itinerarioService.agregarUbicacion(
      this.estadoSeleccionado,
      this.ciudadSeleccionada
    );
  }

  calcularMejorRuta() {
    this.itinerarioService.calcularMejorRuta(this.latitud, this.longitud, this.algoritmo);
  }

  ningunoSeleccionado() : boolean {
    return (!this.latitud || !this.longitud || this.itinerarioService.ningunoSeleccionado());
  }

}
