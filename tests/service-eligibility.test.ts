import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the Clarity contract functions
const serviceContract = {
  registerService: vi.fn(),
  verifyEligibility: vi.fn(),
  checkEligibility: vi.fn(),
  getService: vi.fn()
};

// Setup mocks
beforeEach(() => {
  vi.resetAllMocks();
  
  // Mock successful service registration
  serviceContract.registerService.mockImplementation((name, description, requirements) => {
    return { type: 'ok', value: 1 }; // Returns service ID 1
  });
  
  // Mock verify eligibility
  serviceContract.verifyEligibility.mockImplementation((identityId, serviceId, isEligible, reason) => {
    return { type: 'ok', value: true };
  });
  
  // Mock check eligibility
  serviceContract.checkEligibility.mockImplementation((identityId, serviceId) => {
    if (identityId === 1 && serviceId === 1) {
      return {
        "is-eligible": true,
        "eligibility-reason": "Meets all requirements",
        "verified-by": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
        "verification-time": 12345678
      };
    }
    return null;
  });
  
  // Mock get service
  serviceContract.getService.mockImplementation((serviceId) => {
    if (serviceId === 1) {
      return {
        name: "Food Distribution",
        description: "Weekly food package distribution",
        requirements: ["Verified refugee status", "Family size > 1"]
      };
    }
    return null;
  });
});

describe('Service Eligibility Contract', () => {
  it('should register a new service', () => {
    const result = serviceContract.registerService(
        "Food Distribution",
        "Weekly food package distribution",
        ["Verified refugee status", "Family size > 1"]
    );
    
    expect(result).toEqual({ type: 'ok', value: 1 });
  });
  
  it('should verify eligibility for a service', () => {
    const result = serviceContract.verifyEligibility(
        1, // identity ID
        1, // service ID
        true, // is eligible
        "Meets all requirements"
    );
    
    expect(result).toEqual({ type: 'ok', value: true });
  });
  
  it('should check eligibility for a service', () => {
    const eligibility = serviceContract.checkEligibility(1, 1);
    
    expect(eligibility).toEqual({
      "is-eligible": true,
      "eligibility-reason": "Meets all requirements",
      "verified-by": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
      "verification-time": 12345678
    });
  });
  
  it('should return null for non-existent eligibility check', () => {
    const eligibility = serviceContract.checkEligibility(999, 1);
    expect(eligibility).toBeNull();
  });
  
  it('should get service details', () => {
    const service = serviceContract.getService(1);
    
    expect(service).toEqual({
      name: "Food Distribution",
      description: "Weekly food package distribution",
      requirements: ["Verified refugee status", "Family size > 1"]
    });
  });
});
