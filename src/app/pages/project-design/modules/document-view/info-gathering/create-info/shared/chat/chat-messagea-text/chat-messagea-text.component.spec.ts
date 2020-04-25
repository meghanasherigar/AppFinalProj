import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatMessageaTextComponent } from './chat-messagea-text.component';

describe('ChatMessageaTextComponent', () => {
  let component: ChatMessageaTextComponent;
  let fixture: ComponentFixture<ChatMessageaTextComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChatMessageaTextComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatMessageaTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
