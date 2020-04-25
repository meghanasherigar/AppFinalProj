import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoSettingsComponent } from './info-settings.component';

describe('InfoSettingsComponent', () => {
  let component: InfoSettingsComponent;
  let fixture: ComponentFixture<InfoSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InfoSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InfoSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
