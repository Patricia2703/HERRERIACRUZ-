/*
import { TestBed } from '@angular/core/testing';
import { DataService } from './delete_data.service';

describe('DataService', () => {
  let service: DataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataService);
  });

  it('should be created', () => { expect(service).toBeTruthy(); });
  it('should add cliente', () => {
    const before = service.clientes().length;
    service.addCliente({ nombre: 'Test', telefono: '000', direccion: 'x', notas: '', estado: 'Activo' });
    expect(service.clientes().length).toBe(before + 1);
  });
  it('should delete cliente', () => {
    const id = service.clientes()[0].id;
    service.deleteCliente(id);
    expect(service.clientes().find(c => c.id === id)).toBeUndefined();
  });
});
*/