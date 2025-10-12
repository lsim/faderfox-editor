import { describe, expect, it, beforeEach } from 'vitest';

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
      expect(emptySetups[10].name).toBe('Foo␣');
    });

    it('should round trip group name', () => {
      emptySetups[10].groups[10].name = 'Foo';
      roundTrip();
      // Right padded with spaces
      expect(emptySetups[10].groups[10].name).toBe('Foo␣');
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
      expect(emptySetups[10].groups[10].controls[10].name).toBe('Foo␣');
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

  describe('NRPN High Resolution Bug', () => {
    function setupNRPN(control: { type: number; scale: number; upper: number }, upper: number) {
      // Set up NRPN encoder with high-resolution mode
      control.type = 8; // NRPN type
      control.scale = 0; // Display off - enables high resolution
      control.upper = upper;
    }

    function roundTripNRPN(upper: number) {
      const control = emptySetups[0].groups[0].controls[0];
      setupNRPN(control, upper);

      // Generate sysex and parse it back
      const buffer = generateSysexData(emptySetups);
      parseSetupsFromSysex(buffer, emptySetups);

      return control.upper;
    }

    it('should correctly round-trip NRPN upper values in high-resolution mode', () => {
      // Test various upper values - these should all pass after fixing the bug
      const testCases = [
        { input: 100, expected: 100, description: 'low value within 7-bit range' },
        { input: 127, expected: 127, description: '7-bit boundary value' },
        { input: 128, expected: 128, description: 'first value requiring MSB' },
        { input: 1000, expected: 1000, description: 'mid-range high-res value' },
        { input: 3840, expected: 3840, description: 'problematic 0x0F00 value (30*128)' },
        { input: 3968, expected: 3968, description: '3840 + 128 boundary test' },
        { input: 4094, expected: 4094, description: 'max high-res value before capping' },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = roundTripNRPN(input);
        expect(result).toBe(expected);
      });
    });

    it('should correctly handle NRPN lower values in high-resolution mode', () => {
      // Test lower values as well, since the bug affects both upper and lower
      function roundTripNRPNLower(lower: number) {
        const control = emptySetups[0].groups[0].controls[0];
        control.type = 8; // NRPN type
        control.scale = 0; // Display off - enables high resolution
        control.lower = lower;

        const buffer = generateSysexData(emptySetups);
        parseSetupsFromSysex(buffer, emptySetups);

        return control.lower;
      }

      const testCases = [
        { input: 100, expected: 100 },
        { input: 1000, expected: 1000 },
        { input: 3840, expected: 3840 }, // Same problematic value
      ];

      testCases.forEach(({ input, expected }) => {
        const result = roundTripNRPNLower(input);
        expect(result).toBe(expected); // `NRPN lower: input ${input} became ${result}`
      });
    });

    it('should correctly handle the specific 200 -> 4040 bug case', () => {
      const control = emptySetups[0].groups[0].controls[0];

      // Set up NRPN encoder with high-resolution mode
      control.type = 8; // NRPN type
      control.scale = 0; // Display off - enables high resolution
      control.upper = 200;

      // Initialize upper_msb with garbage value (15) to simulate the bug
      // 15 << 8 = 3840, so 200 + 3840 = 4040
      control.upper_msb = 15;

      // Test the round-trip that the user is experiencing
      const result = roundTripNRPN(200);
      console.log(
        `Input 200 with garbage MSB=15, got back: ${result}, difference: ${result - 200}`,
      );

      // After the fix, this should be 200 regardless of garbage in upper_msb
      expect(result).toBe(200);
    });

    it('should correctly handle MSB values internally (integration test)', () => {
      // The main test is that round-trip values work correctly
      // The MSB fields are internal implementation details that may not be exposed
      const control = emptySetups[0].groups[0].controls[0];
      setupNRPN(control, 1000);

      const result = roundTripNRPN(1000);
      expect(result).toBe(1000); // 'High-resolution values should round-trip correctly'

      // Test edge cases that would fail without proper MSB handling
      expect(roundTripNRPN(127)).toBe(127); // '7-bit boundary should work'
      expect(roundTripNRPN(128)).toBe(128); // 'First MSB value should work'
      expect(roundTripNRPN(3840)).toBe(3840); // 'Problematic 0xF00 value should work'
    });

    it('should handle CCAh (CC 14bit absolute) high-resolution values correctly', () => {
      // Test that CCAh has the same issue as NRPN
      function roundTripCCAh(upper: number) {
        const control = emptySetups[0].groups[0].controls[0];
        control.type = 4; // CCAh (CC 14bit absolute)
        control.scale = 0; // Display off - enables high resolution
        control.upper = upper;

        const buffer = generateSysexData(emptySetups);
        parseSetupsFromSysex(buffer, emptySetups);

        return control.upper;
      }

      const testCases = [
        { input: 1000, expected: 1000 },
        { input: 3840, expected: 3840 }, // Same problematic value
      ];

      testCases.forEach(({ input, expected }) => {
        const result = roundTripCCAh(input);
        expect(result).toBe(expected); // `CCAh: input ${input} became ${result}`
      });
    });

    it('should handle PBnd (Pitch bend) high-resolution values correctly', () => {
      // Test that PBnd has the same issue as NRPN
      function roundTripPBnd(upper: number) {
        const control = emptySetups[0].groups[0].controls[0];
        control.type = 5; // PBnd (Pitch bend)
        control.scale = 0; // Display off - enables high resolution
        control.upper = upper;

        const buffer = generateSysexData(emptySetups);
        parseSetupsFromSysex(buffer, emptySetups);

        return control.upper;
      }

      const testCases = [
        { input: 1000, expected: 1000 },
        { input: 3840, expected: 3840 }, // Same problematic value
      ];

      testCases.forEach(({ input, expected }) => {
        const result = roundTripPBnd(input);
        expect(result).toBe(expected); // `PBnd: input ${input} became ${result}`
      });
    });
  });
});
