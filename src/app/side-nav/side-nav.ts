import { Component } from '@angular/core';
import { RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'app-side-nav',
  imports: [
    RouterLink,
    RouterOutlet,
    RouterLinkActive,
    CommonModule,
    NgTemplateOutlet
  ],
  templateUrl: './side-nav.html',
  styleUrl: './side-nav.css',
})
export class SideNav {

}
