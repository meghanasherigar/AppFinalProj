import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateLevel2MenuComponent } from './template-level2-menu.component';

describe('TemplateLevel2MenuComponent', () => {
  let component: TemplateLevel2MenuComponent;
  let fixture: ComponentFixture<TemplateLevel2MenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TemplateLevel2MenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TemplateLevel2MenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
