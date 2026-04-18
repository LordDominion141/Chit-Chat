import { describe, it, expect, vi, beforeEach } from "vitest";
import cookieParser from "cookie-parser";

// Tests for the middleware added to server.js in this PR:
// 1. cookieParser() - parses cookie headers into req.cookies
// 2. Request logging middleware - logs method/url/cookies and calls next()

// Helper to build a mock response object
function mockRes() {
    return {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
    };
}

// ──────────────────────────────────────────────────────────────
// cookieParser middleware tests
// ──────────────────────────────────────────────────────────────
describe("server middleware: cookieParser", () => {
    const middleware = cookieParser();

    it("parses a single cookie from the Cookie header", () => {
        const req = { headers: { cookie: "jwt=test-token-value" } };
        const res = mockRes();
        const next = vi.fn();

        middleware(req, res, next);

        expect(req.cookies).toHaveProperty("jwt", "test-token-value");
        expect(next).toHaveBeenCalledOnce();
    });

    it("parses multiple cookies from the Cookie header", () => {
        const req = {
            headers: { cookie: "jwt=token123; session=sess456" },
        };
        const res = mockRes();
        const next = vi.fn();

        middleware(req, res, next);

        expect(req.cookies).toHaveProperty("jwt", "token123");
        expect(req.cookies).toHaveProperty("session", "sess456");
        expect(next).toHaveBeenCalledOnce();
    });

    it("sets req.cookies to empty object when no Cookie header is present", () => {
        const req = { headers: {} };
        const res = mockRes();
        const next = vi.fn();

        middleware(req, res, next);

        expect(req.cookies).toEqual({});
        expect(next).toHaveBeenCalledOnce();
    });

    it("makes the jwt cookie accessible as req.cookies.jwt", () => {
        const jwtValue = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.payload.signature";
        const req = { headers: { cookie: "jwt=" + jwtValue } };
        const res = mockRes();
        const next = vi.fn();

        middleware(req, res, next);

        expect(req.cookies.jwt).toBe(jwtValue);
    });

    it("always calls next() after parsing", () => {
        const req = { headers: { cookie: "foo=bar" } };
        const next = vi.fn();

        middleware(req, mockRes(), next);

        expect(next).toHaveBeenCalledOnce();
    });

    it("handles cookie values with equals signs correctly", () => {
        const req = {
            headers: { cookie: "jwt=base64encoded==; other=value" },
        };
        const next = vi.fn();
        middleware(req, mockRes(), next);

        // cookie-parser should parse this correctly
        expect(req.cookies).toHaveProperty("jwt");
        expect(next).toHaveBeenCalled();
    });
});

// ──────────────────────────────────────────────────────────────
// Request logging middleware tests (added inline in server.js)
// ──────────────────────────────────────────────────────────────

// Replicate the exact logging middleware from server.js
const requestLoggingMiddleware = (req, res, next) => {
    console.log(`Incoming Request: ${req.method} ${req.url}`);
    console.log("Cookies attached:", req.cookies);
    next();
};

describe("server middleware: request logging", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it("calls next() to pass control to the next middleware", () => {
        const req = { method: "GET", url: "/api/test", cookies: {} };
        const next = vi.fn();
        const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

        requestLoggingMiddleware(req, mockRes(), next);

        expect(next).toHaveBeenCalledOnce();
        consoleSpy.mockRestore();
    });

    it("logs the HTTP method in the first console.log call", () => {
        const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
        const req = { method: "POST", url: "/api/auth/login", cookies: {} };

        requestLoggingMiddleware(req, mockRes(), vi.fn());

        const firstLog = consoleSpy.mock.calls[0][0];
        expect(firstLog).toContain("POST");
        consoleSpy.mockRestore();
    });

    it("logs the request URL in the first console.log call", () => {
        const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
        const req = { method: "GET", url: "/api/auth/check", cookies: {} };

        requestLoggingMiddleware(req, mockRes(), vi.fn());

        const firstLog = consoleSpy.mock.calls[0][0];
        expect(firstLog).toContain("/api/auth/check");
        consoleSpy.mockRestore();
    });

    it("logs 'Incoming Request:' prefix in the first console.log call", () => {
        const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
        const req = { method: "DELETE", url: "/api/test", cookies: {} };

        requestLoggingMiddleware(req, mockRes(), vi.fn());

        const firstLog = consoleSpy.mock.calls[0][0];
        expect(firstLog).toContain("Incoming Request:");
        consoleSpy.mockRestore();
    });

    it("logs 'Cookies attached:' with the req.cookies object in the second console.log call", () => {
        const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
        const cookiesObj = { jwt: "some-token" };
        const req = { method: "GET", url: "/api/test", cookies: cookiesObj };

        requestLoggingMiddleware(req, mockRes(), vi.fn());

        expect(consoleSpy).toHaveBeenCalledTimes(2);
        expect(consoleSpy.mock.calls[1][0]).toBe("Cookies attached:");
        expect(consoleSpy.mock.calls[1][1]).toBe(cookiesObj);
        consoleSpy.mockRestore();
    });

    it("logs empty cookies object when no cookies are present", () => {
        const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
        const req = { method: "GET", url: "/api/test", cookies: {} };

        requestLoggingMiddleware(req, mockRes(), vi.fn());

        expect(consoleSpy.mock.calls[1][1]).toEqual({});
        consoleSpy.mockRestore();
    });

    it("logs exactly two times per request", () => {
        const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
        const req = { method: "GET", url: "/api/test", cookies: {} };

        requestLoggingMiddleware(req, mockRes(), vi.fn());

        expect(consoleSpy).toHaveBeenCalledTimes(2);
        consoleSpy.mockRestore();
    });
});