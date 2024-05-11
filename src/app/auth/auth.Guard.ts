import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(private router: Router) { }

    canActivate(): boolean {
        // Check if the user is authenticated
        if (!localStorage.getItem('authToken')) { // or however you manage your user authentication
            // Check if the route being accessed is the registration page
            if (this.router.url === '/auth/register') {
                // Allow access to the registration page
                return true;
            } else {
                // If not authenticated and not on the registration page, navigate to the login page
                this.router.navigate(['/auth/login']);
                return false;
            }
        }
        return true;
    }
}

