/**
 * Tests for worst-case severity flagging system
 * Verifies that individual metric problems are always flagged
 */

import { describe, it, expect } from 'vitest';
import { calculatePropertyHealth } from '@/lib/correlation';

describe('Worst-Case Severity Flagging', () => {
  it('flags property <4.0 as RED even with perfect guests', () => {
    const health = calculatePropertyHealth(3.8, 5.0);

    expect(health.propertySeverity?.color).toBe('red');
    expect(health.propertySeverity?.level).toBe(2);
    expect(health.guestSeverity?.color).toBe('green');
    expect(health.worstCase?.color).toBe('red'); // Worst case wins
  });

  it('flags guests <4.5 as ORANGE even with perfect property', () => {
    const health = calculatePropertyHealth(4.8, 4.2);

    expect(health.propertySeverity?.color).toBe('green');
    expect(health.guestSeverity?.color).toBe('orange');
    expect(health.guestSeverity?.level).toBe(1);
    expect(health.worstCase?.color).toBe('orange'); // Worst case wins
  });

  it('shows GREEN only when both metrics are excellent', () => {
    const health = calculatePropertyHealth(4.8, 4.7);

    expect(health.propertySeverity?.color).toBe('green');
    expect(health.guestSeverity?.color).toBe('green');
    expect(health.worstCase?.color).toBe('green');
    expect(health.quadrant).toBe('well-managed');
  });

  it('flags property at 4.5 as YELLOW even with excellent guests', () => {
    const health = calculatePropertyHealth(4.5, 4.8);

    expect(health.propertySeverity?.color).toBe('yellow');
    expect(health.propertySeverity?.level).toBe(1);
    expect(health.guestSeverity?.color).toBe('green');
    expect(health.worstCase?.color).toBe('yellow'); // Worst case wins
  });

  it('flags both critical (<4.0) as systemic-failure', () => {
    const health = calculatePropertyHealth(3.5, 3.8);

    expect(health.propertySeverity?.color).toBe('red');
    expect(health.guestSeverity?.color).toBe('red');
    expect(health.worstCase?.color).toBe('red');
    expect(health.quadrant).toBe('systemic-failure');
  });

  it('never lets <4.0 property show yellow or green', () => {
    const testCases = [
      { property: 3.9, guests: 5.0 },
      { property: 3.5, guests: 4.9 },
      { property: 3.0, guests: 4.8 },
      { property: 2.5, guests: 5.0 },
    ];

    testCases.forEach(({ property, guests }) => {
      const health = calculatePropertyHealth(property, guests);
      expect(health.worstCase?.color).toBe('red');
      expect(health.worstCase?.level).toBe(2);
      expect(['property-issue', 'systemic-failure']).toContain(health.quadrant);
    });
  });

  it('uses worse severity when both are problematic', () => {
    // Property yellow (4.5), Guests orange (4.2)
    // Both level 1, but orange is "worse" conceptually for guest screening
    const health1 = calculatePropertyHealth(4.5, 4.2);
    expect(health1.worstCase?.color).toMatch(/yellow|orange/);

    // Property red (3.8), Guests orange (4.3)
    // Red (level 2) is worse than orange (level 1)
    const health2 = calculatePropertyHealth(3.8, 4.3);
    expect(health2.worstCase?.color).toBe('red');
    expect(health2.worstCase?.level).toBe(2);
  });

  it('provides detailed descriptions for tooltips', () => {
    const health = calculatePropertyHealth(3.8, 4.9);

    expect(health.propertySeverity?.description).toContain('3.8');
    expect(health.propertySeverity?.description).toContain('bottom 4%');
    expect(health.guestSeverity?.description).toContain('4.9');
    expect(health.worstCase?.description).toBeDefined();
  });
});
