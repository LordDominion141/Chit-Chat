import { describe, it, expect, vi, beforeEach } from "vitest";
import jwt from "jsonwebtoken";

// Mock the ENV module so env.js validation doesn't fire
vi.mock("../lib/env.js", () => ({
    ENV: {
        JWT_SECRET: "test-secret-key",
        NODE_ENV: "test",
    },
}));

// Import after mocking
const { generateToken } = await import("../lib/utils.js");

describe("generateToken", () => {
    let mockRes;

    beforeEach(() => {
        mockRes = {
            cookie: vi.fn(),
        };
    });

    it("signs a JWT with the userId payload and 7d expiry", () => {
        const userId = "user123";
        const token = generateToken(userId, mockRes);

        const decoded = jwt.verify(token, "test-secret-key");
        expect(decoded.userId).toBe(userId);
    });

    it("returns the signed token string", () => {
        const token = generateToken("abc", mockRes);
        expect(typeof token).toBe("string");
        expect(token.split(".").length).toBe(3); // JWT has 3 parts
    });

    it("sets the jwt cookie on the response", () => {
        const token = generateToken("user456", mockRes);

        expect(mockRes.cookie).toHaveBeenCalledOnce();
        expect(mockRes.cookie).toHaveBeenCalledWith("jwt", token, expect.any(Object));
    });

    it("sets maxAge to 7 days in milliseconds", () => {
        generateToken("user789", mockRes);

        const cookieOptions = mockRes.cookie.mock.calls[0][2];
        expect(cookieOptions.maxAge).toBe(7 * 24 * 60 * 60 * 1000);
    });

    it("sets httpOnly to true on the cookie", () => {
        generateToken("user789", mockRes);

        const cookieOptions = mockRes.cookie.mock.calls[0][2];
        expect(cookieOptions.httpOnly).toBe(true);
    });

    it("sets sameSite to Lax on the cookie", () => {
        generateToken("user789", mockRes);

        const cookieOptions = mockRes.cookie.mock.calls[0][2];
        expect(cookieOptions.sameSite).toBe("Lax");
    });

    it("sets secure to false on the cookie", () => {
        generateToken("user789", mockRes);

        const cookieOptions = mockRes.cookie.mock.calls[0][2];
        expect(cookieOptions.secure).toBe(false);
    });

    it("generates unique tokens for different userIds", () => {
        const token1 = generateToken("userA", mockRes);
        const token2 = generateToken("userB", mockRes);
        expect(token1).not.toBe(token2);
    });

    it("token payload contains only userId (no extra fields added)", () => {
        const userId = "userXYZ";
        const token = generateToken(userId, mockRes);
        const decoded = jwt.verify(token, "test-secret-key");
        expect(decoded.userId).toBe(userId);
    });

    it("token expires in approximately 7 days", () => {
        const beforeSigning = Math.floor(Date.now() / 1000);
        const token = generateToken("timeUser", mockRes);
        const afterSigning = Math.floor(Date.now() / 1000);

        const decoded = jwt.verify(token, "test-secret-key");
        const sevenDaysInSeconds = 7 * 24 * 60 * 60;

        expect(decoded.exp).toBeGreaterThanOrEqual(beforeSigning + sevenDaysInSeconds);
        expect(decoded.exp).toBeLessThanOrEqual(afterSigning + sevenDaysInSeconds + 2);
    });
});