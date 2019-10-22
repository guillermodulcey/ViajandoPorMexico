import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { ItinerarioModule } from "./itinerario/itinerario.module";

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, AppRoutingModule, ItinerarioModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
