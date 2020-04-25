import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TabletypeComponent } from './tabletype.component';

describe('TabletypeComponent', () => {
  let component: TabletypeComponent;
  let fixture: ComponentFixture<TabletypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TabletypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TabletypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
