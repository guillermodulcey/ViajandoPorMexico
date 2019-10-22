import { TestBed } from '@angular/core/testing';

import { ItinerarioService } from './itinerario.service';

describe('ItinerarioService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ItinerarioService = TestBed.get(ItinerarioService);
    expect(service).toBeTruthy();
  });
});
