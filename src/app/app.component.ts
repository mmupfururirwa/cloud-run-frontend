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
  styleUrls: ['./app.component.sass'] 
})

export class AppComponent implements OnInit {
  cloudRunAPI: string = '/api'; // https://smart-view-ums-api-dev-6bsov2mz7q-ey.a.run.app
  loginForm: FormGroup;
  registerForm: FormGroup;
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
  paymentLoading: boolean = false;
  showRegisterForm: boolean = false;
  redirect_url: string = '';

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.loginForm = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
    });
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required]
    });
    
  }

  ngOnInit() {}

  register() {
    const { email, password, confirmPassword, firstName, lastName } = this.registerForm.value;
  
    // Optional: Simple password confirmation check
    if (password !== confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }
  
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';
  
    this.http.post<any>(this.cloudRunAPI + '/auth/register/', { 
        payload: {
          email: email,
          password: password,
          c_password: password,
          firstName: firstName,
          lastName: lastName,
          phone: '0673680477',
          companyName: 'Demo Test Company',
          provider: 'email_password'
        }
      })
      .subscribe(response => {
        console.log('Register response:', response);
        this.loading = false;
        this.successMessage = 'Registration successful! You can now log in.';

        this.showRegisterForm = false;
        this.userId = response.data.userID; // Adjust according to actual API response
        this.accessToken = response.data.access.access_token; // Adjust according to actual API response
        this.getDevices();
      }, error => {
        this.loading = false;
        this.errorMessage = 'Registration failed. Please try again.';
        console.error('Register error:', error);
      });
  }

  processPayFastPayment() {
    this.paymentLoading = true;
    this.http.post<any>(this.cloudRunAPI + '/wallet/payfast/initiate_payfast_topup', { 
        payload: {
          userID: this.userId,
          meteringPointID: 2097,
          amount: 100
        }
      },
      { headers: 
        {
          'content-type': 'application/json',
          Authorization: 'Bearer ' + this.accessToken,
        } 
      })
      .subscribe(response => {
        console.log('PayFast TopUp response:', response);
        this.devicesLoading = false;
        this.redirect_url = response.data.redirect_url; 
        // open new window to PayFast
        const newWindow = window.open(this.redirect_url, '_blank');
        if (newWindow) {
          newWindow.focus();
        }
      }, error => {
        this.devicesLoading = false;
        this.errorMessage = 'Failed to fetch PayFast TopUp';
        console.error('PayFast TopUp error:', error);
      });
  }
  

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

        this.processPayFastPayment();
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
