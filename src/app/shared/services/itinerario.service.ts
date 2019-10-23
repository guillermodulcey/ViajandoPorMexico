import { Injectable } from '@angular/core';

import { Ubicacion } from "../models/ubicacion";

import { Estado } from "../models/estado";
import { Ciudad } from "../models/ciudad";
import { Solucion } from "../models/solucion";
import { SolucionExh } from "../models/solucionExh";

//#Declaración de paquetes JS
declare function getInfoFromJSFile() : any;
//

@Injectable({
  providedIn: 'root'
})
export class ItinerarioService {
  //Variables de clase
  radioTierra: number = 6371;
  ubicaciones: Ubicacion[] = [];
  solucionesExh: Solucion;
  solucionVoraz: Solucion; 
  auxSolucionesExh: SolucionExh[];
  mejorRutaExh: Solucion;

  //Constructor
  constructor() {}

  //Método que agrega la información del lugar al arreglo ubicaciones
  agregarUbicacion(estado: Estado, ciudad: Ciudad) {
    this.ubicaciones.push({
      nombreEstado: estado.nombre,
      nombreCiudad: ciudad.nombre,
      latitud: ciudad.latitud,
      longitud: ciudad.longitud
    });
  }

  //Método que calcula la mejor ruta basado en la latitud, longitud y algoritmo seleccionado
  calcularMejorRuta(latitud: number, longitud: number, algoritmo: string) {
    this.solucionesExh = [];
    this.solucionVoraz = null;
    this.auxSolucionesExh = [];
    this.mejorRutaExh = {ubicaciones: "", distancia: Infinity};

    let ubicacionInicial: Ubicacion = { 
      nombreEstado: "Posición", 
      nombreCiudad: "inicial",
      latitud: latitud,
      longitud: longitud
    };

    let busquedaExhaustiva = "E";
    let busquedaVoraz = "V";
    let ambas = "A";

    switch(algoritmo){
      case busquedaExhaustiva:
          this.busquedaExhaustiva(ubicacionInicial);
        break;
      case busquedaVoraz:
          this.solucionVoraz = this.busquedaVorazv2(ubicacionInicial, this.ubicaciones);
        break;
      case ambas:
          this.busquedaExhaustiva(ubicacionInicial);
          this.solucionVoraz = this.busquedaVorazv2(ubicacionInicial, this.ubicaciones);;
        break;
    }
  }

  //Método que calcula la distancia Harvesine
  calcularDistancia(latitud1: number, longitud1: number, latitud2: number, longitud2: number) { 
    let primeraParte = this.calcularSenoCuadrado(latitud1,latitud2);
    let segundaParte = Math.cos(latitud1)*Math.cos(latitud2);
    let terceraParte = this.calcularSenoCuadrado(longitud1,longitud2);

    let raiz = Math.sqrt(primeraParte + (segundaParte * terceraParte));
    let arcoseno = Math.asin(raiz);

    return 2 * this.radioTierra * arcoseno;
  }

  //Método que calcula el segmento seno de la ecuación de la distancia Harvesine
  calcularSenoCuadrado(numero1: number,numero2: number){
    let seno = Math.sin((numero2-numero1)/2);
    return seno * seno;
  }

  //Método que cambia grados a radianes
  gradosARadianes(grados: number){
    let radianes = grados * (Math.PI/180)
    return radianes;
  }

  //Método que calcula la distancia dadas dos ubicaciones
  calcularDistanciaUbicaciones(ubicacion1: Ubicacion, ubicacion2: Ubicacion){
    return this.calcularDistancia(
      this.gradosARadianes(ubicacion1.latitud), 
      this.gradosARadianes(ubicacion1.longitud),
      this.gradosARadianes(ubicacion2.latitud),
      this.gradosARadianes(ubicacion2.longitud)
      );
  }
  
  //Método que verifica si el usuario ha seleccionado ubicaciones
  ningunoSeleccionado() : boolean {
    if(this.ubicaciones.length === 0){
      return true;
    }
    return false;
  }

  //Método que verifica si existe una solución exhaustiva (basado en la selección del usuario)
  mostrarExhaustiva(): boolean{
    return (!!this.solucionesExh);
  }

  //Método que verifica si existe una solución voráz (basado en la selección del usuario)
  mostrarVoraz(): boolean{
    return (!!this.solucionVoraz);
  }

  //Método que ejecuta la búsqueda voráz simple
  busquedaVoraz(ubicacionInicial:Ubicacion, ubicaciones:Ubicacion[]): Solucion{
    let solucion: Solucion;
    let ordenCiudades: Ubicacion[] = [];
    let auxiliarUbicaciones: Ubicacion[] = [...ubicaciones]; 

    //Se busca la ciudad más cercana al punto inicial
    ordenCiudades.push(this.menorDistancia(ubicacionInicial,auxiliarUbicaciones));

    for (let index = 0; index < ubicaciones.length; index++) {

      auxiliarUbicaciones = this.quitarUbicacion(ordenCiudades[index],auxiliarUbicaciones);
      if(auxiliarUbicaciones.length===0){
        break;
      }
      ordenCiudades.push(this.menorDistancia(ordenCiudades[index],auxiliarUbicaciones));
      
    }

    //Se añade el punto inicial al princio del arreglo de ubicaciones
    ordenCiudades.splice(0,0,ubicacionInicial);
    //Se añade el punto inicial al final del arreglo de ubicaciones
    ordenCiudades.push(ubicacionInicial);

    solucion = this.ubicacionesASolucion(ordenCiudades);
    
    return solucion;
  }

  //Método que encuentra la menor distancia entre una distancia determinada y un conjunto de ubicaciones
  menorDistancia(ubicacion:Ubicacion, ubicaciones:Ubicacion[]): Ubicacion{
    let ubicacionMenorDistancia: Ubicacion;
    let menorDistancia: number = Number.MAX_VALUE;
    let indice: number = 0;
    let elementoContador: number = 0;

    ubicaciones.forEach(elemento => {
      let menor = this.calcularDistanciaUbicaciones(ubicacion,elemento);

      if (menorDistancia > menor) {
        menorDistancia = menor;
        indice = elementoContador;
      }
      elementoContador++;
    });

    ubicacionMenorDistancia = this.clonarUbicacion(ubicaciones[indice]);

    return ubicacionMenorDistancia;
  }

  //Método que quita una ubicación de un arreglo de ubicaciones (para evitar repetir ubicaciones)
  quitarUbicacion(ubicacion: Ubicacion, ubicaciones: Ubicacion[]): Ubicacion[]{
    for (let index = 0; index < ubicaciones.length; index++) {
      if (ubicaciones[index].latitud === ubicacion.latitud && ubicaciones[index].longitud === ubicacion.longitud) {
        ubicaciones.splice(index, 1);
        index--;
      }
    }
    return ubicaciones;
  }

  //Método que transforma un arreglo de ubicaciones a una solución
  ubicacionesASolucion(ubicaciones: Ubicacion[]): Solucion{
    let solucion: Solucion;
    let ciudades: string = "";
    let index: number = 1;
    
    ubicaciones.forEach(elemento => {
      ciudades += "\n"+index+": "+elemento.nombreEstado+" - "+elemento.nombreCiudad+" ";
      index++;
    });

    solucion = {ciudades : ciudades, distancia : this.distanciaRuta(ubicaciones)};
    return solucion;
  }

  //Método que retorna la distancia de una ruta
  distanciaRuta(ubicaciones: Ubicacion[]){
    let ubicacion = ubicaciones[0];
    let distancia: number = 0;
    for (let index = 1; index < ubicaciones.length; index++) {
      let elemento = ubicaciones[index];
      distancia += this.calcularDistanciaUbicaciones(ubicacion,elemento);
      ubicacion = elemento;
    }
    return distancia;
  }

  //Función extra
  //Método que ejecuta la búsqueda voráz v2
  busquedaVorazv2(ubicacionInicial:Ubicacion, ubicaciones:Ubicacion[]): Solucion{
    let solucion: Solucion;
    let ordenCiudades: Ubicacion[] = [];
    let regresoCiudades: Ubicacion[] = [];
    let auxiliarUbicaciones: Ubicacion[] = this.clonarUbicaciones(ubicaciones); 

    //Se buscan las dos ciudades más cercanas al punto inicial
    ordenCiudades.push(this.menorDistancia(ubicacionInicial,auxiliarUbicaciones));
    auxiliarUbicaciones = this.quitarUbicacion(ordenCiudades[0],auxiliarUbicaciones);

    if(auxiliarUbicaciones.length > 0){
      regresoCiudades.push(this.menorDistancia(ubicacionInicial,auxiliarUbicaciones));
      auxiliarUbicaciones = this.quitarUbicacion(regresoCiudades[0],auxiliarUbicaciones);
    }

    for (let index = 0; index < auxiliarUbicaciones.length; index++) {
      ordenCiudades.push(this.menorDistancia(ordenCiudades[index],auxiliarUbicaciones));
      auxiliarUbicaciones = this.quitarUbicacion(ordenCiudades[index+1],auxiliarUbicaciones);

      if(auxiliarUbicaciones.length==0){
        break;
      }

      regresoCiudades.push(this.menorDistancia(regresoCiudades[index],auxiliarUbicaciones));
      auxiliarUbicaciones = this.quitarUbicacion(regresoCiudades[index+1],auxiliarUbicaciones);
    }

    for (let index = regresoCiudades.length -1; index >= 0 ; index--) {
      let element = regresoCiudades[index];
      ordenCiudades.push(element);
    }
    //Se añade el punto inicial al princio del arreglo de ubicaciones
    ordenCiudades.splice(0,0,ubicacionInicial);
    //Se añade el punto inicial al final del arreglo de ubicaciones
    ordenCiudades.push(ubicacionInicial);

    solucion = this.ubicacionesASolucion(ordenCiudades);
    
    return solucion;
  }

  //Se clona el objeto para buen manejo de memoria
  clonarUbicacion(ubicacion: Ubicacion): Ubicacion{
    if(ubicacion === null || typeof ubicacion !== 'object'){
      return ubicacion;
    }
    let temporal = ubicacion.constructor();
    for (const key in ubicacion) {
      if (ubicacion.hasOwnProperty(key)) {
        temporal[key] = this.clonarUbicacion(ubicacion[key]);
      }
    }
    return temporal;
  }

  //Se clona el arreglo para buen manejo de memoria
  clonarUbicaciones(ubicaciones: Ubicacion[]): Ubicacion[]{
    let temporal: Ubicacion[] = [];
    ubicaciones.forEach(elemento => {
      temporal.push(this.clonarUbicacion(elemento));
    });
    return temporal;
  }

  //Realiza las permutaciones de todas las ubicaciones seleccionadas
  permutaciones(tamanio: number, ubicaciones: Ubicacion[]){
    if(tamanio == 1){
      //Crea un nuevo elemento en el arreglo
      this.auxSolucionesExh.push({ubicaciones: [], distancia: 0});
      //Almacena la permutación actual
      for (var i = 0; i < ubicaciones.length; i++) {
        this.auxSolucionesExh[this.auxSolucionesExh.length-1].ubicaciones[i] = ubicaciones[i];
      }

    }else{
      for(let i = 0;i < tamanio;i++){
        this.permutaciones(tamanio-1, ubicaciones);
        if((tamanio%2)==0){
          let aux = ubicaciones[i];
          ubicaciones[i] = ubicaciones[tamanio-1]; 
          ubicaciones[tamanio-1] = aux;
        }else{
          let aux = ubicaciones[0];
          ubicaciones[0] = ubicaciones[tamanio-1];
          ubicaciones[tamanio-1] = aux;
        }
      }
    }
  }

  //Implementa la busqueda exhaustiva
  busquedaExhaustiva(ubicacionInicial: Ubicacion){

    //Si el arreglo contiene elementos, los elimina.
    this.auxSolucionesExh.splice(0,this.auxSolucionesExh.length-1);

    let auxUbicaciones = this.clonarUbicaciones(this.ubicaciones);

    //Ejecuta las permutaciones
    this.permutaciones(auxUbicaciones.length, auxUbicaciones);

    //Calcula las distancias
    for(let i=0; i < this.auxSolucionesExh.length ; i++){
      this.auxSolucionesExh[i].ubicaciones.unshift(ubicacionInicial);
      this.auxSolucionesExh[i].ubicaciones.push(ubicacionInicial);
        
      for (let j=this.auxSolucionesExh[0].ubicaciones.length-1 ; j > 0 ;j--) {
        this.auxSolucionesExh[i].distancia += this.calcularDistanciaUbicaciones(this.auxSolucionesExh[i].ubicaciones[j], this.auxSolucionesExh[i].ubicaciones[j-1]);
      }

      //Almacena la ruta mas corta
      if(this.auxSolucionesExh[i].distancia < this.mejorRutaExh.distancia){
        //Si ya existe una mejor ruta almacenada, la agrega al arreglo de soluciones  
        if(this.mejorRutaExh.distancia!=Infinity) this.solucionesExh.push(this.mejorRutaExh);

        //Almacena la nueva mejor ruta
        this.mejorRutaExh = this.ubicacionesASolucion(this.auxSolucionesExh[i].ubicaciones);
        this.mejorRutaExh.distancia = this.auxSolucionesExh[i].distancia;
      }else{
        //Si no es una mejor solución, la agrega al arreglo de soluciones
        this.solucionesExh.push(this.ubicacionesASolucion(this.auxSolucionesExh[i].ubicaciones));
      }
    }

    //Añade la mejor ruta encontrada al inicio de las soluciones
    this.solucionesExh.unshift(this.mejorRutaExh);
  }

}
