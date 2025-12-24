import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";

@Injectable({
    providedIn: 'root'
})
export class ApiConfigService {
    private apiBaseUrl: string;

    constructor() {
        this.apiBaseUrl = environment.apiBaseUrl;
    }

    getBaseUrl(): string {
        return this.apiBaseUrl;
    }

    buildUrl(endpoint: string): string {
        return `${this.apiBaseUrl}${endpoint}`;
    }
}