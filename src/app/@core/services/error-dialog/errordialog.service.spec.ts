import { TestBed } from '@angular/core/testing';

import { ErrorDialogService } from './errordialog.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ErrordialogService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [HttpClientTestingModule], 
  }));

  it('should be created', () => {
    const service: ErrorDialogService = TestBed.get(ErrorDialogService);
    expect(service).toBeTruthy();
  });
});
