import { Events } from "./events";
import { Ressource } from "./ressource";

export interface Profile {
  ressource: Ressource;
  events: Events;
}
