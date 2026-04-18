import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock env.js to avoid module-load-time validation throwing
vi.mock("../lib/env.js", () => ({
    ENV: {
        JWT_SECRET: "test-secret",
        PORT: "3000",
        MONGO_URL: "mongodb://localhost/test",
        NODE_ENV: "test",
        RESEND_API_KEY: "test-resend-key",
        EMAIL_FROM: "test@example.com",
        EMAIL_FROM_NAME: "Test Sender",
        CLIENT_URL: "https://example.com",
        CLOUDINARY_CLOUD_NAME: "test-cloud",
        CLOUDINARY_API_KEY: "test-api-key",
        CLOUDINARY_API_SECRET: "test-api-secret",
    },
}));

import { generateToken } from "../lib/utils.js";
import jwt from "jsonwebtoken";

describe("generateToken", () => {
    let mockRes;

    beforeEach(() => {
        mockRes = {
            cookie: vi.fn(),
        };
    });

    it("returns a JWT token string", () => {
        const token = generateToken("user123", mockRes);
        expect(typeof token).toBe("string");
        expect(token.split(".")).toHaveLength(3); // JWT has 3 parts
    });

    it("signs token with userId payload", () => {
        const userId = "user-abc-123";
        const token = generateToken(userId, mockRes);
        const decoded = jwt.verify(token, "test-secret");
        expect(decoded.userId).toBe(userId);
    });

    it("token expires in 7 days", () => {
        const token = generateToken("user123", mockRes);
        const decoded = jwt.decode(token);
        const now = Math.floor(Date.now() / 1000);
        const sevenDays = 7 * 24 * 60 * 60;
        expect(decoded.exp - decoded.iat).toBe(sevenDays);
    });

    it("calls res.cookie with name 'jwt'", () => {
        generateToken("user123", mockRes);
        expect(mockRes.cookie).toHaveBeenCalledOnce();
        expect(mockRes.cookie.mock.calls[0][0]).toBe("jwt");
    });

    it("sets cookie maxAge to 7 days in ms", () => {
        generateToken("user123", mockRes);
        const cookieOptions = mockRes.cookie.mock.calls[0][2];
        expect(cookieOptions.maxAge).toBe(7 * 24 * 60 * 60 * 1000);
    });

    it("sets cookie httpOnly to true", () => {
        generateToken("user123", mockRes);
        const cookieOptions = mockRes.cookie.mock.calls[0][2];
        expect(cookieOptions.httpOnly).toBe(true);
    });

    it("sets cookie sameSite to Lax", () => {
        generateToken("user123", mockRes);
        const cookieOptions = mockRes.cookie.mock.calls[0][2];
        expect(cookieOptions.sameSite).toBe("Lax");
    });

    it("sets cookie secure to false", () => {
        generateToken("user123", mockRes);
        const cookieOptions = mockRes.cookie.mock.calls[0][2];
        expect(cookieOptions.secure).toBe(false);
    });

    it("passes the token value as the cookie value", () => {
        const token = generateToken("user123", mockRes);
        const cookieValue = mockRes.cookie.mock.calls[0][1];
        expect(cookieValue).toBe(token);
    });

    it("generates different tokens for different userIds", () => {
        const token1 = generateToken("user1", mockRes);
        const token2 = generateToken("user2", mockRes);
        expect(token1).not.toBe(token2);
    });

    it("handles non-string userId (ObjectId-like)", () => {
        const userId = { toString: () => "objectid123" };
        expect(() => generateToken(userId, mockRes)).not.toThrow();
    });
});