import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Principal } from '@icp-sdk/core/principal';

// Mock @icp-sdk/core/agent Actor
vi.mock('@icp-sdk/core/agent', () => ({
  Actor: {
    createActor: vi.fn(),
  },
}));

// Mock the declarations
vi.mock('../declarations/my-canister-dashboard.did.js', () => ({
  idlFactory: vi.fn(),
}));

import { Actor } from '@icp-sdk/core/agent';
import { createMyCanisterActor, MyDashboardBackend } from '../src/actor';

describe('createMyCanisterActor', () => {
  const TEST_CANISTER_ID = 'rdmx6-jaaaa-aaaaa-aaadq-cai';

  const createMockAgent = () =>
    ({
      getPrincipal: vi.fn().mockResolvedValue(Principal.anonymous()),
      rootKey: new Uint8Array([]),
    }) as unknown as import('@icp-sdk/core/agent').HttpAgent;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create an actor with string canisterId', () => {
    const agent = createMockAgent();
    const mockActor = { http_request: vi.fn() };
    vi.mocked(Actor.createActor).mockReturnValue(mockActor as never);

    const result = createMyCanisterActor({ agent, canisterId: TEST_CANISTER_ID });

    expect(Actor.createActor).toHaveBeenCalledWith(expect.anything(), {
      agent,
      canisterId: TEST_CANISTER_ID,
    });
    expect(result).toBe(mockActor);
  });

  it('should create an actor with Principal canisterId', () => {
    const agent = createMockAgent();
    const principal = Principal.fromText(TEST_CANISTER_ID);
    const mockActor = { http_request: vi.fn() };
    vi.mocked(Actor.createActor).mockReturnValue(mockActor as never);

    const result = createMyCanisterActor({ agent, canisterId: principal });

    expect(Actor.createActor).toHaveBeenCalledWith(expect.anything(), {
      agent,
      canisterId: principal,
    });
    expect(result).toBe(mockActor);
  });

  it('should throw error when canisterId is empty string', () => {
    const agent = createMockAgent();

    expect(() => createMyCanisterActor({ agent, canisterId: '' })).toThrow(
      'canisterId is required'
    );
  });
});

describe('MyDashboardBackend', () => {
  const TEST_CANISTER_ID = 'rdmx6-jaaaa-aaaaa-aaadq-cai';

  const createMockAgent = () =>
    ({
      getPrincipal: vi.fn().mockResolvedValue(Principal.anonymous()),
      rootKey: new Uint8Array([]),
    }) as unknown as import('@icp-sdk/core/agent').HttpAgent;

  const createMockActor = () => ({
    http_request: vi.fn(),
    manage_alternative_origins: vi.fn(),
    manage_ii_principal: vi.fn(),
    wasm_status: vi.fn(),
    manage_top_up_rule: vi.fn(),
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create a MyDashboardBackend instance', () => {
      const agent = createMockAgent();
      const mockActor = createMockActor();
      vi.mocked(Actor.createActor).mockReturnValue(mockActor as never);

      const backend = MyDashboardBackend.create({
        agent,
        canisterId: TEST_CANISTER_ID,
      });

      expect(backend).toBeInstanceOf(MyDashboardBackend);
    });
  });

  describe('httpRequest', () => {
    it('should call http_request on the actor', async () => {
      const agent = createMockAgent();
      const mockActor = createMockActor();
      const mockResponse = {
        status_code: 200,
        headers: [],
        body: new Uint8Array([]),
      };
      mockActor.http_request.mockResolvedValue(mockResponse);
      vi.mocked(Actor.createActor).mockReturnValue(mockActor as never);

      const backend = MyDashboardBackend.create({
        agent,
        canisterId: TEST_CANISTER_ID,
      });
      const request = {
        method: 'GET',
        url: '/',
        headers: [],
        body: new Uint8Array([]),
        certificate_version: [],
      };
      const result = await backend.httpRequest(request);

      expect(mockActor.http_request).toHaveBeenCalledWith(request);
      expect(result).toBe(mockResponse);
    });
  });

  describe('manageAlternativeOrigins', () => {
    it('should call manage_alternative_origins with Add argument', async () => {
      const agent = createMockAgent();
      const mockActor = createMockActor();
      const mockResult = { Ok: null };
      mockActor.manage_alternative_origins.mockResolvedValue(mockResult);
      vi.mocked(Actor.createActor).mockReturnValue(mockActor as never);

      const backend = MyDashboardBackend.create({
        agent,
        canisterId: TEST_CANISTER_ID,
      });
      const arg = { Add: 'https://example.com' };
      const result = await backend.manageAlternativeOrigins(arg);

      expect(mockActor.manage_alternative_origins).toHaveBeenCalledWith(arg);
      expect(result).toBe(mockResult);
    });

    it('should call manage_alternative_origins with Remove argument', async () => {
      const agent = createMockAgent();
      const mockActor = createMockActor();
      const mockResult = { Ok: null };
      mockActor.manage_alternative_origins.mockResolvedValue(mockResult);
      vi.mocked(Actor.createActor).mockReturnValue(mockActor as never);

      const backend = MyDashboardBackend.create({
        agent,
        canisterId: TEST_CANISTER_ID,
      });
      const arg = { Remove: 'https://example.com' };
      const result = await backend.manageAlternativeOrigins(arg);

      expect(mockActor.manage_alternative_origins).toHaveBeenCalledWith(arg);
      expect(result).toBe(mockResult);
    });

  });

  describe('manageIIPrincipal', () => {
    it('should call manage_ii_principal with Get argument', async () => {
      const agent = createMockAgent();
      const mockActor = createMockActor();
      const mockPrincipal = Principal.fromText(TEST_CANISTER_ID);
      const mockResult = { Ok: mockPrincipal };
      mockActor.manage_ii_principal.mockResolvedValue(mockResult);
      vi.mocked(Actor.createActor).mockReturnValue(mockActor as never);

      const backend = MyDashboardBackend.create({
        agent,
        canisterId: TEST_CANISTER_ID,
      });
      const arg = { Get: null };
      const result = await backend.manageIIPrincipal(arg);

      expect(mockActor.manage_ii_principal).toHaveBeenCalledWith(arg);
      expect(result).toBe(mockResult);
    });

    it('should call manage_ii_principal with Set argument', async () => {
      const agent = createMockAgent();
      const mockActor = createMockActor();
      const mockPrincipal = Principal.fromText(TEST_CANISTER_ID);
      const mockResult = { Ok: null };
      mockActor.manage_ii_principal.mockResolvedValue(mockResult);
      vi.mocked(Actor.createActor).mockReturnValue(mockActor as never);

      const backend = MyDashboardBackend.create({
        agent,
        canisterId: TEST_CANISTER_ID,
      });
      const arg = { Set: mockPrincipal };
      const result = await backend.manageIIPrincipal(arg);

      expect(mockActor.manage_ii_principal).toHaveBeenCalledWith(arg);
      expect(result).toBe(mockResult);
    });

    it('should return Err result when not authenticated', async () => {
      const agent = createMockAgent();
      const mockActor = createMockActor();
      const mockResult = { Err: 'Not authorized' };
      mockActor.manage_ii_principal.mockResolvedValue(mockResult);
      vi.mocked(Actor.createActor).mockReturnValue(mockActor as never);

      const backend = MyDashboardBackend.create({
        agent,
        canisterId: TEST_CANISTER_ID,
      });
      const arg = { Get: null };
      const result = await backend.manageIIPrincipal(arg);

      expect(result).toBe(mockResult);
    });
  });

  describe('wasmStatus', () => {
    it('should call wasm_status and return result', async () => {
      const agent = createMockAgent();
      const mockActor = createMockActor();
      const mockStatus = {
        version: '1.0.0',
        git_sha: 'abc123',
      };
      mockActor.wasm_status.mockResolvedValue(mockStatus);
      vi.mocked(Actor.createActor).mockReturnValue(mockActor as never);

      const backend = MyDashboardBackend.create({
        agent,
        canisterId: TEST_CANISTER_ID,
      });
      const result = await backend.wasmStatus();

      expect(mockActor.wasm_status).toHaveBeenCalled();
      expect(result).toBe(mockStatus);
    });
  });

  describe('manageTopUpRule', () => {
    it('should call manage_top_up_rule with Get argument', async () => {
      const agent = createMockAgent();
      const mockActor = createMockActor();
      const mockResult = { Ok: { Disabled: null } };
      mockActor.manage_top_up_rule.mockResolvedValue(mockResult);
      vi.mocked(Actor.createActor).mockReturnValue(mockActor as never);

      const backend = MyDashboardBackend.create({
        agent,
        canisterId: TEST_CANISTER_ID,
      });
      const arg = { Get: null };
      const result = await backend.manageTopUpRule(arg);

      expect(mockActor.manage_top_up_rule).toHaveBeenCalledWith(arg);
      expect(result).toBe(mockResult);
    });

    it('should call manage_top_up_rule with Add argument', async () => {
      const agent = createMockAgent();
      const mockActor = createMockActor();
      const mockResult = { Ok: [] };
      mockActor.manage_top_up_rule.mockResolvedValue(mockResult);
      vi.mocked(Actor.createActor).mockReturnValue(mockActor as never);

      const backend = MyDashboardBackend.create({
        agent,
        canisterId: TEST_CANISTER_ID,
      });
      const topUpRule = {
        cycles_threshold: { _1T: null },
        cycles_amount: { _5T: null },
        interval: { Hourly: null },
      };
      const arg = { Add: topUpRule };
      const result = await backend.manageTopUpRule(arg);

      expect(mockActor.manage_top_up_rule).toHaveBeenCalledWith(arg);
      expect(result).toBe(mockResult);
    });

    it('should call manage_top_up_rule with Clear argument', async () => {
      const agent = createMockAgent();
      const mockActor = createMockActor();
      const mockResult = { Ok: [] };
      mockActor.manage_top_up_rule.mockResolvedValue(mockResult);
      vi.mocked(Actor.createActor).mockReturnValue(mockActor as never);

      const backend = MyDashboardBackend.create({
        agent,
        canisterId: TEST_CANISTER_ID,
      });
      const arg = { Clear: null };
      const result = await backend.manageTopUpRule(arg);

      expect(mockActor.manage_top_up_rule).toHaveBeenCalledWith(arg);
      expect(result).toBe(mockResult);
    });
  });
});
