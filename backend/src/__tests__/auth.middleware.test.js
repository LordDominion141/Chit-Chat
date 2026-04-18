import { describe, it, expect, vi, beforeEach } from "vitest";
import jwt from "jsonwebtoken";

// Mock dependencies
vi.mock("../models/User.js", () => ({
    default: {
        findById: vi.fn(),
    },
}));

vi.mock("../lib/env.js", () => ({
    ENV: {
        JWT_SECRET: "middleware-test-secret",
    },
}));

// Mock jsonwebtoken
vi.mock("jsonwebtoken", () => ({
    default: {
        verify: vi.fn(),
    },
}));

const { protectRoute } = await import("../middleware/auth.middleware.js");
import User from "../models/User.js";

// Helper to build mock req/res/next
function makeReqResNext(cookieJwt) {
    const req = {
        cookies: cookieJwt !== undefined ? { jwt: cookieJwt } : {},
    };
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
    };
    const next = vi.fn();
    return { req, res, next };
}

// Helper to build a fake user mock with .select() chain
function makeUserSelect(returnValue) {
    return {
        select: vi.fn().mockResolvedValue(returnValue),
    };
}

describe("protectRoute middleware", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns 401 when no jwt cookie is present", async () => {
        const { req, res, next } = makeReqResNext(undefined);
        await protectRoute(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            message: "Unauthorized - No token provided",
        });
        expect(next).not.toHaveBeenCalled();
    });

    it("returns 401 when jwt cookie is an empty string", async () => {
        const { req, res, next } = makeReqResNext("");
        await protectRoute(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            message: "Unauthorized - No token provided",
        });
        expect(next).not.toHaveBeenCalled();
    });

    it("returns 500 when jwt.verify throws (invalid/expired token)", async () => {
        jwt.verify.mockImplementation(() => {
            throw new Error("invalid signature");
        });

        const { req, res, next } = makeReqResNext("bad.token.value");
        await protectRoute(req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: "Internal Server Error!" });
        expect(next).not.toHaveBeenCalled();
    });

    it("returns 404 when user is not found in the database", async () => {
        jwt.verify.mockReturnValue({ userId: "uid-not-in-db" });
        User.findById.mockReturnValue(makeUserSelect(null));

        const { req, res, next } = makeReqResNext("valid.token.here");
        await protectRoute(req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
        expect(next).not.toHaveBeenCalled();
    });

    it("sets req.user and calls next() when token and user are valid", async () => {
        const fakeUser = {
            _id: "uid123",
            fullName: "Alice",
            email: "alice@example.com",
        };
        jwt.verify.mockReturnValue({ userId: "uid123" });
        User.findById.mockReturnValue(makeUserSelect(fakeUser));

        const { req, res, next } = makeReqResNext("good.token");
        await protectRoute(req, res, next);

        expect(req.user).toEqual(fakeUser);
        expect(next).toHaveBeenCalledOnce();
        expect(res.status).not.toHaveBeenCalled();
    });

    it("queries User.findById with the userId from the decoded token", async () => {
        const fakeUser = { _id: "specific-uid", fullName: "Bob" };
        jwt.verify.mockReturnValue({ userId: "specific-uid" });
        User.findById.mockReturnValue(makeUserSelect(fakeUser));

        const { req, res, next } = makeReqResNext("some.valid.token");
        await protectRoute(req, res, next);

        expect(User.findById).toHaveBeenCalledWith("specific-uid");
    });

    it("selects all fields except password (calls .select('-password'))", async () => {
        const selectMock = vi.fn().mockResolvedValue({ _id: "uid" });
        jwt.verify.mockReturnValue({ userId: "uid" });
        User.findById.mockReturnValue({ select: selectMock });

        const { req, res, next } = makeReqResNext("valid.token");
        await protectRoute(req, res, next);

        expect(selectMock).toHaveBeenCalledWith("-password");
    });

    it("verifies the token using ENV.JWT_SECRET", async () => {
        const fakeUser = { _id: "uid" };
        jwt.verify.mockReturnValue({ userId: "uid" });
        User.findById.mockReturnValue(makeUserSelect(fakeUser));

        const { req, res, next } = makeReqResNext("some.token");
        await protectRoute(req, res, next);

        expect(jwt.verify).toHaveBeenCalledWith("some.token", "middleware-test-secret");
    });

    it("returns 500 when User.findById throws", async () => {
        jwt.verify.mockReturnValue({ userId: "uid123" });
        User.findById.mockReturnValue({
            select: vi.fn().mockRejectedValue(new Error("DB error")),
        });

        const { req, res, next } = makeReqResNext("valid.token");
        await protectRoute(req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: "Internal Server Error!" });
        expect(next).not.toHaveBeenCalled();
    });

    it("does not leak user data in error responses", async () => {
        jwt.verify.mockImplementation(() => {
            throw new Error("token expired");
        });

        const { req, res, next } = makeReqResNext("expired.token");
        await protectRoute(req, res, next);

        const jsonArg = res.json.mock.calls[0][0];
        expect(jsonArg).not.toHaveProperty("user");
        expect(jsonArg).not.toHaveProperty("token");
    });
});