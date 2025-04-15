import { describe, expect, it, beforeEach, vi } from 'vitest';

// import { generateSysexData, parseSetupsFromSysex } from '@/memoryLayout.ts';
import { generateSysexData, parseSetupsFromSysex } from '../src/memoryLayout';
import { createEmptyEncoderSetups } from '../src/stores/faderfox-ec4';
import type { EncoderSetup } from '../src/domain/EncoderSetup';

describe('Sysex', () => {
  let emptySetups: EncoderSetup[];

  beforeEach(() => {
    emptySetups = createEmptyEncoderSetups();
  });

  it('should run tests', () => {
    expect(true).toBe(true);
  });

  it('should be able to serialize to a buffer', () => {
    const buffer = generateSysexData(emptySetups);
    expect(buffer.length).toBe(229340);
  });

  it('should produce correct empty setup', () => {
    expect(emptySetups.length).toBe(16);
    expect(emptySetups[0].name).toBe('SE01');
    expect(emptySetups[0].groups.length).toBe(16);
    expect(emptySetups[0].groups[0].name).toBe('GR01');
    expect(emptySetups[0].groups[0].controls.length).toBe(16);
    expect(emptySetups[0].groups[0].controls[0].name).toBe('----');
  });

  it('should be able to parse its own sysex', () => {
    const buffer = generateSysexData(emptySetups);
    parseSetupsFromSysex(buffer, emptySetups);
    expect(emptySetups.length).toBe(16);
    expect(emptySetups[0].name).toBe('SE01');
    expect(emptySetups[0].groups.length).toBe(16);
    expect(emptySetups[0].groups[0].name).toBe('GR01');
    expect(emptySetups[0].groups[0].controls.length).toBe(16);
    expect(emptySetups[0].groups[0].controls[0].name).toBe('----');
  });

  const byteVal = 0x7f;
  const nibbleVal = 0xe;

  describe('value round trips', () => {
    function roundTrip() {
      const buffer = generateSysexData(emptySetups);
      parseSetupsFromSysex(buffer, emptySetups);
    }
    it('should round trip setup name', () => {
      emptySetups[10].name = 'Foo';
      roundTrip();
      // Right padded with spaces
      expect(emptySetups[10].name).toBe('Foo ');
    });

    it('should round trip group name', () => {
      emptySetups[10].groups[10].name = 'Foo';
      roundTrip();
      // Right padded with spaces
      expect(emptySetups[10].groups[10].name).toBe('Foo ');
    });

    it('should round trip channel', () => {
      emptySetups[10].groups[10].controls[10].channel = nibbleVal;
      roundTrip();
      expect(emptySetups[10].groups[10].controls[10].channel).toBe(nibbleVal);
    });

    it('should round trip number', () => {
      emptySetups[10].groups[10].controls[10].number = byteVal;
      roundTrip();
      expect(emptySetups[10].groups[10].controls[10].number).toBe(byteVal);
    });

    it('should round trip number_h', () => {
      emptySetups[10].groups[10].controls[10].number_h = byteVal;
      roundTrip();
      expect(emptySetups[10].groups[10].controls[10].number_h).toBe(byteVal);
    });

    it('should round trip lower', () => {
      emptySetups[10].groups[10].controls[10].lower = byteVal;
      roundTrip();
      expect(emptySetups[10].groups[10].controls[10].lower).toBe(byteVal);
    });

    it('should round trip lower_msb', () => {
      emptySetups[10].groups[10].controls[10].lower_msb = nibbleVal;
      roundTrip();
      expect(emptySetups[10].groups[10].controls[10].lower_msb).toBe(nibbleVal);
    });

    it('should round trip upper', () => {
      emptySetups[10].groups[10].controls[10].upper = byteVal;
      roundTrip();
      expect(emptySetups[10].groups[10].controls[10].upper).toBe(byteVal);
    });

    it('should round trip upper_msb', () => {
      emptySetups[10].groups[10].controls[10].upper_msb = nibbleVal;
      roundTrip();
      expect(emptySetups[10].groups[10].controls[10].upper_msb).toBe(nibbleVal);
    });

    it('should round trip mode', () => {
      emptySetups[10].groups[10].controls[10].mode = 7;
      roundTrip();
      expect(emptySetups[10].groups[10].controls[10].mode).toBe(7);
    });

    it('should round trip type', () => {
      emptySetups[10].groups[10].controls[10].type = 7;
      roundTrip();
      expect(emptySetups[10].groups[10].controls[10].type).toBe(7);
    });

    it('should round trip scale', () => {
      emptySetups[10].groups[10].controls[10].scale = 7;
      roundTrip();
      expect(emptySetups[10].groups[10].controls[10].scale).toBe(7);
    });

    it('should round trip name', () => {
      emptySetups[10].groups[10].controls[10].name = 'Foo';
      roundTrip();
      // Right padded with spaces
      expect(emptySetups[10].groups[10].controls[10].name).toBe('Foo ');
    });

    it('should round trip link', () => {
      emptySetups[10].groups[10].controls[10].link = true;
      roundTrip();
      expect(emptySetups[10].groups[10].controls[10].link).toBe(true);
    });

    it('should round trip pb_channel', () => {
      emptySetups[10].groups[10].controls[10].pb_channel = nibbleVal;
      roundTrip();
      expect(emptySetups[10].groups[10].controls[10].pb_channel).toBe(nibbleVal);
    });

    it('should round trip pb_display', () => {
      emptySetups[10].groups[10].controls[10].pb_display = 1;
      roundTrip();
      expect(emptySetups[10].groups[10].controls[10].pb_display).toBe(1);
      emptySetups[10].groups[10].controls[10].pb_display = 0;
      roundTrip();
      expect(emptySetups[10].groups[10].controls[10].pb_display).toBe(0);
    });

    it('should round trip pb_type', () => {
      emptySetups[10].groups[10].controls[10].pb_type = 7;
      roundTrip();
      expect(emptySetups[10].groups[10].controls[10].pb_type).toBe(7);
    });

    it('should round trip pb_mode', () => {
      emptySetups[10].groups[10].controls[10].pb_mode = 1;
      roundTrip();
      expect(emptySetups[10].groups[10].controls[10].pb_mode).toBe(1);
      emptySetups[10].groups[10].controls[10].pb_mode = 0;
      roundTrip();
      expect(emptySetups[10].groups[10].controls[10].pb_mode).toBe(0);
    });

    it('should round trip pb_number', () => {
      emptySetups[10].groups[10].controls[10].pb_number = byteVal;
      roundTrip();
      expect(emptySetups[10].groups[10].controls[10].pb_number).toBe(byteVal);
    });

    it('should round trip pb_lower', () => {
      emptySetups[10].groups[10].controls[10].pb_lower = byteVal;
      roundTrip();
      expect(emptySetups[10].groups[10].controls[10].pb_lower).toBe(byteVal);
    });

    it('should round trip pb_upper', () => {
      emptySetups[10].groups[10].controls[10].pb_upper = byteVal;
      roundTrip();
      expect(emptySetups[10].groups[10].controls[10].pb_upper).toBe(byteVal);
    });

    it('should round trip pb_link', () => {
      emptySetups[10].groups[10].controls[10].pb_link = true;
      roundTrip();
      expect(emptySetups[10].groups[10].controls[10].pb_link).toBe(true);
    });
  });
});
