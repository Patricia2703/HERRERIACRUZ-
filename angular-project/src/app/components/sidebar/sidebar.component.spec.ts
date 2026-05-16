import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarComponent } from './sidebar.component';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SidebarComponent] }).compileComponents();
    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => { expect(component).toBeTruthy(); });
  it('should emit activeItemChange on setActive', () => {
    spyOn(component.activeItemChange, 'emit');
    component.setActive('clientes');
    expect(component.activeItemChange.emit).toHaveBeenCalledWith('clientes');
  });
});
