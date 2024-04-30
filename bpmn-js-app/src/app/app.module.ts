import { BrowserModule } from '@angular/platform-browser';
import { DiagramComponent } from './diagram/diagram.component';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { NgEventBus } from 'ng-event-bus';

@NgModule({
  declarations: [
    AppComponent,
    DiagramComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule
  ],
  providers: [
    NgEventBus
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
