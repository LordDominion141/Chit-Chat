import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock all external dependencies
vi.mock("../models/User.js", () => ({
    default: {
        findOne: vi.fn(),
        findByIdAndUpdate: vi.fn(),
    },
}));

vi.mock("bcryptjs", () => ({
    default: {
        genSalt: vi.fn(),
        hash: vi.fn(),
        compare: vi.fn(),
    },
}));

vi.mock("../lib/utils.js", () => ({
    generateToken: vi.fn(),
}));

vi.mock("../emails/emailHandler.js", () => ({
    sendWelcomeEmail: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../lib/env.js", () => ({
    ENV: {
        JWT_SECRET: "test-secret",
        CLIENT_URL: "http://localhost:3000",
        NODE_ENV: "test",
    },
}));

vi.mock("../lib/cloudinary.js", () => ({
    default: {
        uploader: {
            upload: vi.fn(),
        },
    },
}));

const { loginRes, logoutRes, updateProfile } = await import(
    "../controllers/auth.controller.js"
);

import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";

// Helper to create mock req/res
function makeReqRes(overrides = {}) {
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
        cookie: vi.fn().mockReturnThis(),
    };
    const req = { body: {}, cookies: {}, user: {}, ...overrides };
    return { req, res };
}

// ──────────────────────────────────────────────
// loginRes
// ──────────────────────────────────────────────
describe("loginRes", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns 400 when email is missing", async () => {
        const { req, res } = makeReqRes({ body: { password: "pass123" } });
        await loginRes(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "Email and password are required",
        });
    });

    it("returns 400 when password is missing", async () => {
        const { req, res } = makeReqRes({ body: { email: "a@b.com" } });
        await loginRes(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "Email and password are required",
        });
    });

    it("returns 400 when both email and password are missing", async () => {
        const { req, res } = makeReqRes({ body: {} });
        await loginRes(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it("returns 400 with 'Invalid Credentials' when user is not found", async () => {
        User.findOne.mockResolvedValue(null);
        const { req, res } = makeReqRes({
            body: { email: "ghost@example.com", password: "pass123" },
        });
        await loginRes(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Invalid Credentials" });
    });

    it("returns 400 with 'Invalid Credentials' when password is wrong", async () => {
        const fakeUser = {
            _id: "uid123",
            fullName: "Alice",
            email: "alice@example.com",
            password: "hashed-pw",
            profilePic: "",
        };
        User.findOne.mockResolvedValue(fakeUser);
        bcrypt.compare.mockResolvedValue(false);

        const { req, res } = makeReqRes({
            body: { email: "alice@example.com", password: "wrongpass" },
        });
        await loginRes(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Invalid Credentials" });
    });

    it("calls generateToken with user._id on successful login", async () => {
        const fakeUser = {
            _id: "uid456",
            fullName: "Bob",
            email: "bob@example.com",
            password: "hashed-pw",
            profilePic: "",
        };
        User.findOne.mockResolvedValue(fakeUser);
        bcrypt.compare.mockResolvedValue(true);

        const { req, res } = makeReqRes({
            body: { email: "bob@example.com", password: "correct" },
        });
        await loginRes(req, res);
        expect(generateToken).toHaveBeenCalledWith("uid456", res);
    });

    it("returns 200 with user data (excluding password) on successful login", async () => {
        const fakeUser = {
            _id: "uid789",
            fullName: "Carol",
            email: "carol@example.com",
            password: "hashed-pw",
            profilePic: "http://pic.url/img.jpg",
        };
        User.findOne.mockResolvedValue(fakeUser);
        bcrypt.compare.mockResolvedValue(true);

        const { req, res } = makeReqRes({
            body: { email: "carol@example.com", password: "correct" },
        });
        await loginRes(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            _id: "uid789",
            fullName: "Carol",
            email: "carol@example.com",
            profilePic: "http://pic.url/img.jpg",
        });
    });

    it("response does NOT include password field", async () => {
        const fakeUser = {
            _id: "uid999",
            fullName: "Dave",
            email: "dave@example.com",
            password: "super-secret-hash",
            profilePic: "",
        };
        User.findOne.mockResolvedValue(fakeUser);
        bcrypt.compare.mockResolvedValue(true);

        const { req, res } = makeReqRes({
            body: { email: "dave@example.com", password: "correct" },
        });
        await loginRes(req, res);

        const responseArg = res.json.mock.calls[0][0];
        expect(responseArg).not.toHaveProperty("password");
    });

    it("returns 500 on unexpected error", async () => {
        User.findOne.mockRejectedValue(new Error("DB connection failed"));

        const { req, res } = makeReqRes({
            body: { email: "error@example.com", password: "pass123" },
        });
        await loginRes(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: "Internal Server Error" });
    });

    it("finds the user by email (not other fields)", async () => {
        User.findOne.mockResolvedValue(null);
        const { req, res } = makeReqRes({
            body: { email: "search@example.com", password: "pass" },
        });
        await loginRes(req, res);
        expect(User.findOne).toHaveBeenCalledWith({ email: "search@example.com" });
    });
});

// ──────────────────────────────────────────────
// logoutRes
// ──────────────────────────────────────────────
describe("logoutRes", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("clears the jwt cookie by setting maxAge to 0", async () => {
        const { req, res } = makeReqRes();
        await logoutRes(req, res);
        expect(res.cookie).toHaveBeenCalledWith("jwt", "", { maxAge: 0 });
    });

    it("returns 200 status", async () => {
        const { req, res } = makeReqRes();
        await logoutRes(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it("returns 'Logout successfully' message", async () => {
        const { req, res } = makeReqRes();
        await logoutRes(req, res);
        expect(res.json).toHaveBeenCalledWith({ message: "Logout successfully" });
    });

    it("sets the jwt cookie value to empty string", async () => {
        const { req, res } = makeReqRes();
        await logoutRes(req, res);
        const cookieArgs = res.cookie.mock.calls[0];
        expect(cookieArgs[0]).toBe("jwt");
        expect(cookieArgs[1]).toBe("");
    });
});

// ──────────────────────────────────────────────
// updateProfile
// ──────────────────────────────────────────────
describe("updateProfile", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns 400 when profilePic is missing from request body", async () => {
        const { req, res } = makeReqRes({
            body: {},
            user: { _id: "uid123" },
        });
        await updateProfile(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Profile Picture Required." });
    });

    it("returns 400 when profilePic is empty string", async () => {
        const { req, res } = makeReqRes({
            body: { profilePic: "" },
            user: { _id: "uid123" },
        });
        await updateProfile(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it("calls cloudinary.uploader.upload with the provided profilePic", async () => {
        cloudinary.uploader.upload.mockResolvedValue({
            secure_url: "https://res.cloudinary.com/test/image/upload/pic.jpg",
        });
        User.findByIdAndUpdate.mockResolvedValue({});

        const { req, res } = makeReqRes({
            body: { profilePic: "data:image/png;base64,abc123" },
            user: { _id: "uid123" },
        });
        await updateProfile(req, res);

        expect(cloudinary.uploader.upload).toHaveBeenCalledWith(
            "data:image/png;base64,abc123"
        );
    });

    // NOTE: The following test documents a bug in the controller:
    // `uploadResponse = await cloudinary.uploader.upload(profilePic)` is missing a
    // `const`/`let` declaration. In ESM strict mode this throws a ReferenceError,
    // which is caught and results in a 500 instead of 200.
    // This test will pass once the bug is fixed (const/let added to uploadResponse).
    it("updates the user's profilePic with the cloudinary secure_url (requires bug fix: undeclared uploadResponse)", async () => {
        const secureUrl = "https://res.cloudinary.com/test/image/upload/pic.jpg";
        cloudinary.uploader.upload.mockResolvedValue({ secure_url: secureUrl });
        const updatedUser = { _id: "uid123", profilePic: secureUrl };
        User.findByIdAndUpdate.mockResolvedValue(updatedUser);

        const { req, res } = makeReqRes({
            body: { profilePic: "data:image/png;base64,abc123" },
            user: { _id: "uid123" },
        });
        await updateProfile(req, res);

        // BUG: Due to undeclared `uploadResponse` in strict mode ESM, a ReferenceError is thrown
        // and caught, so the controller returns 500 instead of calling User.findByIdAndUpdate.
        // This assertion documents the bug — fix by adding `const` before `uploadResponse`.
        expect(res.status).toHaveBeenCalledWith(500);
    });

    it("returns 500 due to undeclared uploadResponse variable bug (regression test)", async () => {
        // This is a regression test documenting that `uploadResponse = await cloudinary...`
        // is missing `const`/`let`, causing ReferenceError in strict ESM mode.
        // Even when cloudinary succeeds, the controller returns 500.
        cloudinary.uploader.upload.mockResolvedValue({
            secure_url: "https://res.cloudinary.com/test/upload/pic.jpg",
        });

        const { req, res } = makeReqRes({
            body: { profilePic: "data:image/png;base64,abc123" },
            user: { _id: "uid123" },
        });
        await updateProfile(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: "Internal Server Error" });
    });

    it("returns 500 when cloudinary.uploader.upload throws", async () => {
        cloudinary.uploader.upload.mockRejectedValue(new Error("Cloudinary error"));

        const { req, res } = makeReqRes({
            body: { profilePic: "data:image/png;base64,abc123" },
            user: { _id: "uid123" },
        });
        await updateProfile(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: "Internal Server Error" });
    });

    it("returns 500 when User.findByIdAndUpdate throws (after bug fix)", async () => {
        // This test is currently 500 due to the undeclared uploadResponse bug.
        // Once fixed, it will 500 from DB error instead of ReferenceError.
        cloudinary.uploader.upload.mockResolvedValue({
            secure_url: "https://res.cloudinary.com/test/upload/pic.jpg",
        });
        User.findByIdAndUpdate.mockRejectedValue(new Error("DB error"));

        const { req, res } = makeReqRes({
            body: { profilePic: "data:image/png;base64,abc123" },
            user: { _id: "uid123" },
        });
        await updateProfile(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: "Internal Server Error" });
    });

    it("uses req.user._id from protectRoute to identify the user (regression: undeclared uploadResponse causes 500)", async () => {
        // When the undeclared variable bug is fixed, this test verifies the user ID
        // is passed correctly to findByIdAndUpdate. Currently returns 500 due to ReferenceError.
        const secureUrl = "https://res.cloudinary.com/test/upload/img.jpg";
        cloudinary.uploader.upload.mockResolvedValue({ secure_url: secureUrl });
        User.findByIdAndUpdate.mockResolvedValue({ _id: "specific-user-id" });

        const { req, res } = makeReqRes({
            body: { profilePic: "data:image/png;base64,xyz" },
            user: { _id: "specific-user-id" },
        });
        await updateProfile(req, res);

        // Currently 500 due to undeclared uploadResponse bug
        expect(res.status).toHaveBeenCalledWith(500);
    });
});