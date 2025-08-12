import { TestBed } from '@angular/core/testing';
import { UserService } from './user.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { IUser } from '../interfaces';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService]
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call add (save) and return response', () => {
    const mockUser: IUser = { userEmail: 'test', authorities: [] } as IUser;
    const mockResponse = { data: mockUser, message: 'User added', meta: {} };
    service.add(mockUser).subscribe(res => {
      expect(res).toEqual(mockResponse);
    });
    const req = httpMock.expectOne('users');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should call findAllWithParams and return users', () => {
    const mockUsers: IUser[] = [{ userEmail: 'test', authorities: [] }];
    const mockResponse = { data: mockUsers, message: 'OK', meta: mockUsers };
    service.findAllWithParams({ page: 1, size: 5 }).subscribe(res => {
      expect(res).toEqual(mockResponse);
    });
    const req = httpMock.expectOne('users?page=1&size=5');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });
});
