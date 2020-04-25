import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkToDeliverableComponent } from './link-to-deliverable.component';

describe('LinkToDeliverableComponent', () => {
  let component: LinkToDeliverableComponent;
  let fixture: ComponentFixture<LinkToDeliverableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LinkToDeliverableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LinkToDeliverableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
