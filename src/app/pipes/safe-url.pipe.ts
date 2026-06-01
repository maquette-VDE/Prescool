import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Pipe({
  name: 'safeUrl',
  standalone: true
})
export class SafeUrlPipe implements PipeTransform {
  private sanitizer = inject(DomSanitizer);

  transform(url: string): SafeResourceUrl {
    if (url && url.includes('youtube.com/watch?v=')) {
      // On remplace 'watch?v=' par 'embed/' pour que Youtube accepte l'affichage
      url = url.replace('watch?v=', 'embed/');
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}