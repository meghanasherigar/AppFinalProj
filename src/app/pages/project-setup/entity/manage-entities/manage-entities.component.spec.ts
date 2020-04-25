import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageEntitiesComponent } from './manage-entities.component';
import { TranslatePipe } from '@ngx-translate/core';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NbDialogModule } from '@nebular/theme';

describe('ManageEntitiesComponent', () => {
  let component: ManageEntitiesComponent;
  let fixture: ComponentFixture<ManageEntitiesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageEntitiesComponent, TranslatePipe],
      imports: [RouterTestingModule, HttpClientModule, NbDialogModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageEntitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
