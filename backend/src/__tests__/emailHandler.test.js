import { describe, it, expect, vi, beforeEach } from "vitest";

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

// Use vi.hoisted so the fn is available when the factory is hoisted to the top
const { mockEmailsSend } = vi.hoisted(() => ({
    mockEmailsSend: vi.fn(),
}));

vi.mock("../lib/resend.js", () => ({
    resendClient: {
        emails: {
            send: mockEmailsSend,
        },
    },
    sender: {
        email: "test@example.com",
        name: "Test Sender",
    },
}));

vi.mock("../emails/emailTemplate.js", () => ({
    createWelcomeEmailTemplate: vi.fn().mockReturnValue("<html>Welcome!</html>"),
}));

import { sendWelcomeEmail } from "../emails/emailHandler.js";
import { createWelcomeEmailTemplate } from "../emails/emailTemplate.js";

describe("sendWelcomeEmail", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("calls resendClient.emails.send with correct parameters", async () => {
        mockEmailsSend.mockResolvedValue({ data: { id: "email-id-1" }, error: null });

        await sendWelcomeEmail("user@example.com", "Alice", "https://example.com");

        expect(mockEmailsSend).toHaveBeenCalledOnce();
        const callArg = mockEmailsSend.mock.calls[0][0];
        expect(callArg.to).toBe("user@example.com");
        expect(callArg.subject).toBe("Welcome to Chit-Chat");
    });

    it("sends from the configured sender address", async () => {
        mockEmailsSend.mockResolvedValue({ data: { id: "email-id-1" }, error: null });

        await sendWelcomeEmail("user@example.com", "Alice", "https://example.com");

        const callArg = mockEmailsSend.mock.calls[0][0];
        expect(callArg.from).toContain("test@example.com");
    });

    it("includes the rendered HTML template in the email", async () => {
        mockEmailsSend.mockResolvedValue({ data: { id: "email-id-1" }, error: null });

        await sendWelcomeEmail("user@example.com", "Alice", "https://example.com");

        const callArg = mockEmailsSend.mock.calls[0][0];
        expect(callArg.html).toBe("<html>Welcome!</html>");
    });

    it("calls createWelcomeEmailTemplate with name and clientUrl", async () => {
        mockEmailsSend.mockResolvedValue({ data: { id: "email-id-1" }, error: null });

        await sendWelcomeEmail("user@example.com", "Alice", "https://app.example.com");

        expect(createWelcomeEmailTemplate).toHaveBeenCalledWith("Alice", "https://app.example.com");
    });

    it("throws an error when resend returns an error object", async () => {
        mockEmailsSend.mockResolvedValue({
            data: null,
            error: { message: "Invalid API key" },
        });

        await expect(
            sendWelcomeEmail("user@example.com", "Alice", "https://example.com")
        ).rejects.toThrow("Invalid API key");
    });

    it("throws with fallback message when error has no message property", async () => {
        mockEmailsSend.mockResolvedValue({
            data: null,
            error: {},
        });

        await expect(
            sendWelcomeEmail("user@example.com", "Alice", "https://example.com")
        ).rejects.toThrow("Welcome email send failed");
    });

    it("does not throw when email is sent successfully", async () => {
        mockEmailsSend.mockResolvedValue({ data: { id: "abc123" }, error: null });

        await expect(
            sendWelcomeEmail("user@example.com", "Alice", "https://example.com")
        ).resolves.not.toThrow();
    });

    it("resolves to undefined on success", async () => {
        mockEmailsSend.mockResolvedValue({ data: { id: "abc" }, error: null });

        await expect(
            sendWelcomeEmail("user@example.com", "Bob", "https://example.com")
        ).resolves.toBeUndefined();
    });

    it("propagates unexpected exceptions from resendClient", async () => {
        mockEmailsSend.mockRejectedValue(new Error("Network failure"));

        await expect(
            sendWelcomeEmail("user@example.com", "Alice", "https://example.com")
        ).rejects.toThrow("Network failure");
    });
});