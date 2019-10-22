import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms'
import { CommonModule } from '@angular/common';
import { ItinerarioComponent } from './components/itinerario/itinerario.component';

@NgModule({
  declarations: [ItinerarioComponent],
  imports: [CommonModule, FormsModule],
  exports: [ItinerarioComponent]
})
export class ItinerarioModule { }
