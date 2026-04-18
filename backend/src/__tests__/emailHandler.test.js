import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the resend client and sender
const mockSend = vi.fn();
vi.mock("../lib/resend.js", () => ({
    resendClient: {
        emails: {
            send: mockSend,
        },
    },
    sender: {
        email: "test@example.com",
        name: "Test Sender",
    },
}));

// Mock env.js
vi.mock("../lib/env.js", () => ({
    ENV: {
        CLIENT_URL: "http://localhost:3000",
        EMAIL_FROM: "test@example.com",
        EMAIL_FROM_NAME: "Test Sender",
    },
}));

// Mock emailTemplate to control output
vi.mock("../emails/emailTemplate.js", () => ({
    createWelcomeEmailTemplate: vi.fn(() => "<html>Welcome!</html>"),
}));

const { sendWelcomeEmail } = await import("../emails/emailHandler.js");

describe("sendWelcomeEmail", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("calls resend emails.send with correct from field", async () => {
        mockSend.mockResolvedValue({ data: { id: "email-id-123" }, error: null });

        await sendWelcomeEmail("user@example.com", "Alice", "http://localhost:3000");

        expect(mockSend).toHaveBeenCalledOnce();
        const callArgs = mockSend.mock.calls[0][0];
        expect(callArgs.from).toBe("Test Sender <test@example.com>");
    });

    it("sends to the provided email address", async () => {
        mockSend.mockResolvedValue({ data: { id: "email-id-123" }, error: null });

        await sendWelcomeEmail("user@example.com", "Alice", "http://localhost:3000");

        const callArgs = mockSend.mock.calls[0][0];
        expect(callArgs.to).toBe("user@example.com");
    });

    it("sends with subject 'Welcome to Chit-Chat'", async () => {
        mockSend.mockResolvedValue({ data: { id: "email-id-123" }, error: null });

        await sendWelcomeEmail("user@example.com", "Alice", "http://localhost:3000");

        const callArgs = mockSend.mock.calls[0][0];
        expect(callArgs.subject).toBe("Welcome to Chit-Chat");
    });

    it("includes HTML from createWelcomeEmailTemplate", async () => {
        mockSend.mockResolvedValue({ data: { id: "email-id-123" }, error: null });

        await sendWelcomeEmail("user@example.com", "Alice", "http://localhost:3000");

        const callArgs = mockSend.mock.calls[0][0];
        expect(callArgs.html).toBe("<html>Welcome!</html>");
    });

    it("does not throw when email sends successfully", async () => {
        mockSend.mockResolvedValue({ data: { id: "email-id-abc" }, error: null });

        await expect(
            sendWelcomeEmail("user@example.com", "Alice", "http://localhost:3000")
        ).resolves.not.toThrow();
    });

    it("throws an Error when resend returns an error object", async () => {
        mockSend.mockResolvedValue({
            data: null,
            error: { message: "Invalid API key" },
        });

        await expect(
            sendWelcomeEmail("user@example.com", "Alice", "http://localhost:3000")
        ).rejects.toThrow("Invalid API key");
    });

    it("throws with fallback message when error has no message property", async () => {
        mockSend.mockResolvedValue({
            data: null,
            error: {},
        });

        await expect(
            sendWelcomeEmail("user@example.com", "Alice", "http://localhost:3000")
        ).rejects.toThrow("Welcome email send failed");
    });

    it("throws an Error instance (not just a string) on failure", async () => {
        mockSend.mockResolvedValue({
            data: null,
            error: { message: "Some failure" },
        });

        await expect(
            sendWelcomeEmail("user@example.com", "Alice", "http://localhost:3000")
        ).rejects.toBeInstanceOf(Error);
    });

    it("passes name and clientUrl to createWelcomeEmailTemplate", async () => {
        mockSend.mockResolvedValue({ data: { id: "x" }, error: null });
        const { createWelcomeEmailTemplate } = await import("../emails/emailTemplate.js");

        await sendWelcomeEmail("user@example.com", "Bob", "http://myapp.com");

        expect(createWelcomeEmailTemplate).toHaveBeenCalledWith("Bob", "http://myapp.com");
    });

    it("logs the error object itself (not wrapped) when email fails", async () => {
        const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
        const errorObj = { message: "rate limited" };
        mockSend.mockResolvedValue({ data: null, error: errorObj });

        await expect(
            sendWelcomeEmail("user@example.com", "Alice", "http://localhost:3000")
        ).rejects.toThrow();

        // Error is logged as the raw error object (not wrapped in { message: ... })
        expect(consoleSpy).toHaveBeenCalledWith("Welcome email failed", errorObj);
        consoleSpy.mockRestore();
    });
});