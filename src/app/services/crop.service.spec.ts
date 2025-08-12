import { TestBed } from '@angular/core/testing';
import { CropService } from './crop.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ICrop } from '../interfaces/crop.interface';

describe('CropService', () => {
  let service: CropService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CropService]
    });
    service = TestBed.inject(CropService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all crops', () => {
    const mockCrop = { id: 1, cropName: 'Maíz' };
    const mockResponse = { data: [mockCrop], totalPages: 1, totalElements: 1, number: 1, size: 5 };
    service.getAllCrops(1, 5).subscribe(res => {
      expect(res).toEqual(mockResponse);
    });
    const req = httpMock.expectOne('crops?page=1&size=5');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });
});
