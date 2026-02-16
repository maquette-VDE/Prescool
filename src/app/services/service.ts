import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";

@Injectable({
    providedIn:'root'
})
export class service {

    private readonly apiBaseUrl = ((window as any).__env?.API_BASE_URL || 'http://127.0.0.1:8002').replace(/\/$/, '');

    constructor( private router : Router,
                private http : HttpClient
    ){}

    getData() {
        return this.http.get(`${this.apiBaseUrl}/api/v1/users/me`)
    }

//    login(username: string, password: string){
//         return this.http.post(`${this.apiBaseUrl}/api/v1/auth/register`, { username, password });
//     }


}
