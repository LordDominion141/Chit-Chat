import { describe, it, expect } from "vitest";
import { createWelcomeEmailTemplate } from "../emails/emailTemplate.js";

describe("createWelcomeEmailTemplate", () => {
    it("returns a string", () => {
        const result = createWelcomeEmailTemplate("Alice", "https://example.com");
        expect(typeof result).toBe("string");
    });

    it("includes the provided name in the output", () => {
        const result = createWelcomeEmailTemplate("Alice", "https://example.com");
        expect(result).toContain("Alice");
    });

    it("includes the provided clientUrl as a link href", () => {
        const result = createWelcomeEmailTemplate("Alice", "https://example.com");
        expect(result).toContain("https://example.com");
    });

    it("includes DOCTYPE html declaration", () => {
        const result = createWelcomeEmailTemplate("Alice", "https://example.com");
        expect(result).toContain("<!DOCTYPE html>");
    });

    it("includes a verify account button/link", () => {
        const result = createWelcomeEmailTemplate("Alice", "https://example.com");
        expect(result).toContain("Verify Account");
    });

    it("contains Welcome to Chit-Chat branding", () => {
        const result = createWelcomeEmailTemplate("Alice", "https://example.com");
        expect(result).toContain("Chit-Chat");
    });

    it("interpolates a different name correctly", () => {
        const result = createWelcomeEmailTemplate("Bob Smith", "https://test.io");
        expect(result).toContain("Bob Smith");
        expect(result).toContain("https://test.io");
    });

    it("does not contain the other user name when called with a different name", () => {
        const result = createWelcomeEmailTemplate("Alice", "https://example.com");
        expect(result).not.toContain("Bob");
    });

    it("contains an anchor tag pointing to clientUrl", () => {
        const url = "https://chat.example.com";
        const result = createWelcomeEmailTemplate("User", url);
        expect(result).toContain(`href="${url}"`);
    });

    it("handles special characters in name without throwing", () => {
        expect(() =>
            createWelcomeEmailTemplate("<script>alert(1)</script>", "https://x.com")
        ).not.toThrow();
    });

    it("handles an empty name without throwing", () => {
        expect(() => createWelcomeEmailTemplate("", "https://x.com")).not.toThrow();
    });

    it("handles an empty clientUrl without throwing", () => {
        expect(() => createWelcomeEmailTemplate("Alice", "")).not.toThrow();
    });
});