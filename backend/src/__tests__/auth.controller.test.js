import { describe, it, expect, vi, beforeEach } from "vitest";

// Must mock env.js before any other module that imports it
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

vi.mock("../models/User.js", () => ({
    default: {
        findOne: vi.fn(),
        findById: vi.fn(),
        findByIdAndUpdate: vi.fn(),
    },
}));

vi.mock("../lib/utils.js", () => ({
    generateToken: vi.fn(),
}));

vi.mock("../emails/emailHandler.js", () => ({
    sendWelcomeEmail: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../lib/cloudinary.js", () => ({
    default: {
        uploader: {
            upload: vi.fn(),
        },
    },
}));

vi.mock("bcryptjs", () => ({
    default: {
        genSalt: vi.fn().mockResolvedValue("salt"),
        hash: vi.fn().mockResolvedValue("hashedpassword"),
        compare: vi.fn(),
    },
}));

import { loginRes, logoutRes, updateProfile } from "../controllers/auth.controller.js";
import User from "../models/User.js";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";
import bcrypt from "bcryptjs";

function makeRes() {
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
        cookie: vi.fn().mockReturnThis(),
    };
    return res;
}

// ─── loginRes ────────────────────────────────────────────────────────────────

describe("loginRes", () => {
    let req, res;

    beforeEach(() => {
        res = makeRes();
        vi.clearAllMocks();
    });

    it("returns 400 when email is missing", async () => {
        req = { body: { password: "pass123" } };
        await loginRes(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Email and password are required" });
    });

    it("returns 400 when password is missing", async () => {
        req = { body: { email: "a@b.com" } };
        await loginRes(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Email and password are required" });
    });

    it("returns 400 when both email and password are missing", async () => {
        req = { body: {} };
        await loginRes(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Email and password are required" });
    });

    it("returns 400 with 'Invalid Credentials' when user is not found", async () => {
        req = { body: { email: "notfound@example.com", password: "pass123" } };
        User.findOne.mockResolvedValue(null);

        await loginRes(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Invalid Credentials" });
    });

    it("returns 400 with 'Invalid Credentials' when password is incorrect", async () => {
        req = { body: { email: "user@example.com", password: "wrongpassword" } };
        User.findOne.mockResolvedValue({
            _id: "uid1",
            email: "user@example.com",
            password: "hashedpw",
            fullName: "Test User",
            profilePic: "",
        });
        bcrypt.compare.mockResolvedValue(false);

        await loginRes(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Invalid Credentials" });
    });

    it("returns 200 with user data on successful login", async () => {
        const mockUser = {
            _id: "uid1",
            email: "user@example.com",
            password: "hashedpw",
            fullName: "Test User",
            profilePic: "https://pic.url",
        };
        req = { body: { email: "user@example.com", password: "correctpassword" } };
        User.findOne.mockResolvedValue(mockUser);
        bcrypt.compare.mockResolvedValue(true);

        await loginRes(req, res);
        expect(generateToken).toHaveBeenCalledWith(mockUser._id, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            _id: mockUser._id,
            fullName: mockUser.fullName,
            email: mockUser.email,
            profilePic: mockUser.profilePic,
        });
    });

    it("calls User.findOne with the provided email", async () => {
        req = { body: { email: "search@example.com", password: "pass" } };
        User.findOne.mockResolvedValue(null);

        await loginRes(req, res);
        expect(User.findOne).toHaveBeenCalledWith({ email: "search@example.com" });
    });

    it("calls bcrypt.compare with provided password and stored hash", async () => {
        const mockUser = {
            _id: "uid1",
            email: "user@example.com",
            password: "stored-hash",
            fullName: "User",
            profilePic: "",
        };
        req = { body: { email: "user@example.com", password: "mypassword" } };
        User.findOne.mockResolvedValue(mockUser);
        bcrypt.compare.mockResolvedValue(false);

        await loginRes(req, res);
        expect(bcrypt.compare).toHaveBeenCalledWith("mypassword", "stored-hash");
    });

    it("returns 500 when User.findOne throws", async () => {
        req = { body: { email: "a@b.com", password: "pass" } };
        User.findOne.mockRejectedValue(new Error("DB error"));

        await loginRes(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: "Internal Server Error" });
    });

    it("does not include password in successful response", async () => {
        const mockUser = {
            _id: "uid1",
            email: "user@example.com",
            password: "hashedpw",
            fullName: "Test User",
            profilePic: "",
        };
        req = { body: { email: "user@example.com", password: "correct" } };
        User.findOne.mockResolvedValue(mockUser);
        bcrypt.compare.mockResolvedValue(true);

        await loginRes(req, res);
        const responseData = res.json.mock.calls[0][0];
        expect(responseData).not.toHaveProperty("password");
    });
});

// ─── logoutRes ───────────────────────────────────────────────────────────────

describe("logoutRes", () => {
    it("clears the jwt cookie by setting maxAge to 0", async () => {
        const res = makeRes();
        await logoutRes({}, res);
        expect(res.cookie).toHaveBeenCalledWith("jwt", "", { maxAge: 0 });
    });

    it("returns 200 with logout success message", async () => {
        const res = makeRes();
        await logoutRes({}, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: "Logout successfully" });
    });
});

// ─── updateProfile ────────────────────────────────────────────────────────────

describe("updateProfile", () => {
    let req, res;

    beforeEach(() => {
        res = makeRes();
        vi.clearAllMocks();
    });

    it("returns 400 when profilePic is missing", async () => {
        req = { body: {}, user: { _id: "uid1" } };
        await updateProfile(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Profile Picture Required." });
    });

    it("returns 400 when profilePic is empty string", async () => {
        req = { body: { profilePic: "" }, user: { _id: "uid1" } };
        await updateProfile(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Profile Picture Required." });
    });

    it("returns 500 due to undeclared uploadResponse variable (known bug)", async () => {
        // The current implementation uses `uploadResponse` without `const/let`,
        // causing a ReferenceError in strict mode (ESM modules are strict by default).
        req = { body: { profilePic: "data:image/jpeg;base64,abc" }, user: { _id: "uid1" } };
        cloudinary.uploader.upload.mockResolvedValue({ secure_url: "https://cdn.example.com/pic.jpg" });
        User.findByIdAndUpdate.mockResolvedValue({ _id: "uid1", profilePic: "https://cdn.example.com/pic.jpg" });

        await updateProfile(req, res);
        // Due to the undeclared variable bug, this will hit the catch block
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: "Internal Server Error" });
    });

    it("returns 500 when cloudinary.uploader.upload throws", async () => {
        req = { body: { profilePic: "data:image/jpeg;base64,abc" }, user: { _id: "uid1" } };
        cloudinary.uploader.upload.mockRejectedValue(new Error("Upload failed"));

        await updateProfile(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: "Internal Server Error" });
    });

    it("returns 500 when User.findByIdAndUpdate throws", async () => {
        req = { body: { profilePic: "data:image/jpeg;base64,abc" }, user: { _id: "uid1" } };
        cloudinary.uploader.upload.mockResolvedValue({ secure_url: "https://cdn.example.com/pic.jpg" });
        User.findByIdAndUpdate.mockRejectedValue(new Error("DB error"));

        await updateProfile(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: "Internal Server Error" });
    });
});