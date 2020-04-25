import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateUserComponent } from './create-user.component';
import { AlertService } from '../../../shared/services/alert.service';
import { UserService } from '../user.service';
import { RegionService } from '../../../shared/services/region.service';
import { CountryService } from '../../../shared/services/country.service';
import { EntityService } from '../../../shared/services/entity.service';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { ThemeModule } from '../../../@theme/theme.module';

describe('CreateUserComponent', () => {
  let component: CreateUserComponent;
  let fixture: ComponentFixture<CreateUserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CreateUserComponent],
      providers: [UserService, RegionService, CountryService, EntityService, AlertService],
      imports:[TranslateModule, ThemeModule],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
