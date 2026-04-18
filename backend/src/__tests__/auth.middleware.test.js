import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock env.js to prevent module-load-time env validation
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

// Mock the User model
vi.mock("../models/User.js", () => ({
    default: {
        findById: vi.fn(),
    },
}));

import { protectRoute } from "../middleware/auth.middleware.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = "test-secret";

function makeRes() {
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
    };
    return res;
}

describe("protectRoute middleware", () => {
    let req, res, next;

    beforeEach(() => {
        req = { cookies: {} };
        res = makeRes();
        next = vi.fn();
        vi.clearAllMocks();
    });

    it("returns 401 when no token is in cookies", async () => {
        req.cookies = {};
        await protectRoute(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized - No token provided" });
        expect(next).not.toHaveBeenCalled();
    });

    it("returns 401 when jwt cookie is empty string", async () => {
        req.cookies = { jwt: "" };
        await protectRoute(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized - No token provided" });
        expect(next).not.toHaveBeenCalled();
    });

    it("returns 500 when token is invalid/malformed (jwt.verify throws)", async () => {
        req.cookies = { jwt: "not.a.valid.token" };
        await protectRoute(req, res, next);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(next).not.toHaveBeenCalled();
    });

    it("returns 404 when user is not found in DB", async () => {
        const userId = "507f1f77bcf86cd799439011";
        const token = jwt.sign({ userId }, JWT_SECRET);
        req.cookies = { jwt: token };

        User.findById.mockReturnValue({
            select: vi.fn().mockResolvedValue(null),
        });

        await protectRoute(req, res, next);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
        expect(next).not.toHaveBeenCalled();
    });

    it("attaches user to req and calls next when token and user are valid", async () => {
        const userId = "507f1f77bcf86cd799439011";
        const token = jwt.sign({ userId }, JWT_SECRET);
        req.cookies = { jwt: token };

        const mockUser = { _id: userId, fullName: "Alice", email: "alice@example.com" };
        User.findById.mockReturnValue({
            select: vi.fn().mockResolvedValue(mockUser),
        });

        await protectRoute(req, res, next);
        expect(req.user).toEqual(mockUser);
        expect(next).toHaveBeenCalledOnce();
        expect(res.status).not.toHaveBeenCalled();
    });

    it("calls User.findById with decoded userId", async () => {
        const userId = "507f1f77bcf86cd799439011";
        const token = jwt.sign({ userId }, JWT_SECRET);
        req.cookies = { jwt: token };

        const mockUser = { _id: userId, fullName: "Alice" };
        User.findById.mockReturnValue({
            select: vi.fn().mockResolvedValue(mockUser),
        });

        await protectRoute(req, res, next);
        expect(User.findById).toHaveBeenCalledWith(userId);
    });

    it("calls .select('-password') to exclude password", async () => {
        const userId = "507f1f77bcf86cd799439011";
        const token = jwt.sign({ userId }, JWT_SECRET);
        req.cookies = { jwt: token };

        const selectMock = vi.fn().mockResolvedValue({ _id: userId });
        User.findById.mockReturnValue({ select: selectMock });

        await protectRoute(req, res, next);
        expect(selectMock).toHaveBeenCalledWith("-password");
    });

    it("returns 500 when User.findById throws an error", async () => {
        const userId = "507f1f77bcf86cd799439011";
        const token = jwt.sign({ userId }, JWT_SECRET);
        req.cookies = { jwt: token };

        User.findById.mockReturnValue({
            select: vi.fn().mockRejectedValue(new Error("DB error")),
        });

        await protectRoute(req, res, next);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: "Internal Server Error!" });
        expect(next).not.toHaveBeenCalled();
    });

    it("returns 500 when token is signed with a different secret", async () => {
        const token = jwt.sign({ userId: "abc" }, "wrong-secret");
        req.cookies = { jwt: token };

        await protectRoute(req, res, next);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(next).not.toHaveBeenCalled();
    });

    it("returns 500 when an expired token is provided", async () => {
        const token = jwt.sign({ userId: "abc" }, JWT_SECRET, { expiresIn: -1 });
        req.cookies = { jwt: token };

        await protectRoute(req, res, next);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(next).not.toHaveBeenCalled();
    });
});