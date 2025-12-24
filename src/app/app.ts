import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Acceuil } from "./acceuil/acceuil";
import { SideNav } from './side-nav/side-nav';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Acceuil, SideNav],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'Frontend-angular';
}
