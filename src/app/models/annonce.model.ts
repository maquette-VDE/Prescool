export interface Annonce {
  id: number;
  Titre: string;
  slug: string;
  Contenu: ContentBlock[];
}

export interface ContentBlock {
  __component: string;
  texte?: any; 
  Photo?: any[];
  url?: string;
}