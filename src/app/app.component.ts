import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule], // ADD THIS
  templateUrl: './app.component.html',
})

export class AppComponent implements OnInit {
  cloudRunAPI: string = 'https://smart-view-ums-api-dev.europe-west3.internal.run.app';
  loginForm: FormGroup;
  userId: string = '';
  accessToken: string = '';
  devices: any[] = [];
  currentPage: number = 1;
  pageSize: number = 5;
  totalDevices: number = 0;

  // Add these variables:
  successMessage: string = '';
  errorMessage: string = '';
  loading: boolean = false;
  devicesLoading: boolean = false;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.loginForm = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  ngOnInit() {}

  login() {
    const { email, password } = this.loginForm.value;

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';
  
    this.http.post<any>(this.cloudRunAPI + '/auth/login/', { 
        payload: {
          email: email, 
          password: password,
          provider: 'email_password'
        }
      })
      .subscribe(response => {
        console.log('Login response:', response);
        this.loading = false;
        this.userId = response.data.userID; // Adjust according to actual API response
        this.accessToken = response.data.access.access_token; // Adjust according to actual API response
        this.successMessage = 'Login successful!';
        this.getDevices();
      }, error => {
        this.loading = false;
        this.errorMessage = 'Login failed. Please check your credentials.';
        console.error('Login error:', error);
      });
  }
  

  getDevices() {
    this.devicesLoading = true;
    this.http.post<any>(this.cloudRunAPI + '/utilities/devices/', { 
        payload: {
          userID: this.userId
        }
      },
      { headers: 
        {
          'content-type': 'application/json',
          Authorization: 'Bearer ' + this.accessToken,
        } 
      })
      .subscribe(response => {
        console.log('Devices response:', response);
        this.devicesLoading = false;
        this.devices = response.data.devices; // Adjust based on response
        this.totalDevices = response.data.total;
        this.currentPage = 1;
      }, error => {
        this.devicesLoading = false;
        this.errorMessage = 'Failed to fetch devices.';
        console.error('Devices error:', error);
      });
  }

  get paginatedDevices() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.devices.slice(start, start + this.pageSize);
  }

  get totalPages() {
    return Math.ceil(this.devices.length / this.pageSize);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  prevPage() {
    if (this.currentPage > 1) this.currentPage--;
  }
}
