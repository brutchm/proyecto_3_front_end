import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MessageService } from 'primeng/api';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService, MessageService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call login and return response', () => {
    const mockResponse = { accessToken: 'token', expiresIn: 3600 };
    service.login({ userEmail: 'test@example.com', userPassword: '123456' }).subscribe(res => {
      expect(res).toEqual(mockResponse);
    });
    const req = httpMock.expectOne('auth/login');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should call resetPasswordRequest and return response', () => {
    const mockResponse = { data: {}, message: 'Correo enviado', meta: {} };
    service.resetPasswordRequest('test@example.com').subscribe(res => {
      expect(res).toEqual(mockResponse);
    });
  const req = httpMock.expectOne('auth/reset-password/request');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });
});
