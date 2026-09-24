import { describe, it, expect, vi } from 'vitest';
import { requireRole, requireAdmin } from '../middleware/roles.js';

function mockRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe('requireRole / requireAdmin', () => {
  it('calls next() when the user has an allowed role', () => {
    const req = { user: { role: 'admin' } };
    const res = mockRes();
    const next = vi.fn();

    requireAdmin(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 403 when the user has a disallowed role', () => {
    const req = { user: { role: 'user' } };
    const res = mockRes();
    const next = vi.fn();

    requireAdmin(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('returns 401 when req.user is missing entirely (auth middleware did not run)', () => {
    const req = {};
    const res = mockRes();
    const next = vi.fn();

    requireAdmin(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('requireRole supports multiple allowed roles', () => {
    const middleware = requireRole('admin', 'moderator');
    const next = vi.fn();

    middleware({ user: { role: 'moderator' } }, mockRes(), next);
    expect(next).toHaveBeenCalledOnce();
  });

  it('a role not in the allow-list is rejected even if it is a real role elsewhere in the app', () => {
    const middleware = requireRole('admin');
    const res = mockRes();
    const next = vi.fn();

    middleware({ user: { role: 'user' } }, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });
});
