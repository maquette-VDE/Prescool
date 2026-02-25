import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header'; // Vérifie le chemin
import { SideNav } from './side-nav/side-nav'; 
import { ToastComponent } from './toast/toast'; // Vérifie le chemin (parfois ./components/toast/toast.component)

@Component({
  selector: 'app-root',
  standalone: true, // Très important
  imports: [
    RouterOutlet, 
    SideNav, 
    HeaderComponent, 
    ToastComponent // Ajoute-le ici
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  protected title = 'Frontend-angular';
}