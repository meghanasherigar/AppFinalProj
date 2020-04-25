import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ParagraphSpacingComponent } from './paragraph-spacing.component';

describe('ParagraphSpacingComponent', () => {
  let component: ParagraphSpacingComponent;
  let fixture: ComponentFixture<ParagraphSpacingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ParagraphSpacingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ParagraphSpacingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
