import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VeiwAllNotificationComponent } from './veiw-all-notification.component';

describe('VeiwAllNotificationComponent', () => {
  let component: VeiwAllNotificationComponent;
  let fixture: ComponentFixture<VeiwAllNotificationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VeiwAllNotificationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VeiwAllNotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
