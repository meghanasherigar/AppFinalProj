import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewDocViewComponent } from './preview-doc-view.component';

describe('PreviewDocViewComponent', () => {
  let component: PreviewDocViewComponent;
  let fixture: ComponentFixture<PreviewDocViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreviewDocViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviewDocViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
