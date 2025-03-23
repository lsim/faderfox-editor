import { describe, expect, it, beforeEach } from 'vitest';
// import { generateSysexData, parseSetupsFromSysex } from '@/memoryLayout.ts';
import { generateSysexData, parseSetupsFromSysex } from '../src/memoryLayout';
import { createEmptyEncoderSetups } from '../src/stores/faderfox-ec4';

describe('Sysex', () => {
  let emptySetups;

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

  describe('Value round trips', () => {
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

    it('should round trip control name', () => {
      emptySetups[10].groups[10].controls[10].name = 'Foo';
      roundTrip();
      // Right padded with spaces
      expect(emptySetups[10].groups[10].controls[10].name).toBe('Foo ');
    });

    it('should round trip channel', () => {
      emptySetups[10].groups[10].controls[10].channel = 12;
      roundTrip();
      expect(emptySetups[10].groups[10].controls[10].channel).toBe(12);
    });
  });
});
