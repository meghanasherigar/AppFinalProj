import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateEditEntityComponent } from './create-edit-entity.component';
import { TranslatePipe } from '@ngx-translate/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';

describe('CreateEditEntityComponent', () => {
  let component: CreateEditEntityComponent;
  let fixture: ComponentFixture<CreateEditEntityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateEditEntityComponent, TranslatePipe ],
      imports: [RouterTestingModule, HttpClientModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateEditEntityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
