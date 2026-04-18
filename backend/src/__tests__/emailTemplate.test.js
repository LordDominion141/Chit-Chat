import { describe, it, expect } from "vitest";
import { createWelcomeEmailTemplate } from "../emails/emailTemplate.js";

describe("createWelcomeEmailTemplate", () => {
    it("returns a string", () => {
        const result = createWelcomeEmailTemplate("Alice", "http://localhost:3000");
        expect(typeof result).toBe("string");
    });

    it("includes the recipient's name in the output", () => {
        const result = createWelcomeEmailTemplate("Alice", "http://localhost:3000");
        expect(result).toContain("Alice");
    });

    it("includes the client URL as the verification link href", () => {
        const result = createWelcomeEmailTemplate("Bob", "http://myapp.com");
        expect(result).toContain("http://myapp.com");
    });

    it("contains 'Chit-Chat' branding", () => {
        const result = createWelcomeEmailTemplate("Alice", "http://localhost:3000");
        expect(result).toContain("Chit-Chat");
    });

    it("contains a DOCTYPE html declaration", () => {
        const result = createWelcomeEmailTemplate("Alice", "http://localhost:3000");
        expect(result).toContain("<!DOCTYPE html>");
    });

    it("contains an anchor tag linking to the clientUrl for account verification", () => {
        const url = "http://verify.example.com";
        const result = createWelcomeEmailTemplate("Charlie", url);
        expect(result).toMatch(new RegExp(`href="${url}"`));
    });

    it("addresses the user by name in the greeting", () => {
        const result = createWelcomeEmailTemplate("Diana", "http://localhost:3000");
        expect(result).toContain("Hello Diana");
    });

    it("renders correctly with a name containing special characters", () => {
        const result = createWelcomeEmailTemplate("O'Brien", "http://localhost:3000");
        expect(result).toContain("O'Brien");
    });

    it("contains 'Verify Account' button text", () => {
        const result = createWelcomeEmailTemplate("Alice", "http://localhost:3000");
        expect(result).toContain("Verify Account");
    });

    it("produces different output for different names", () => {
        const result1 = createWelcomeEmailTemplate("Alice", "http://localhost:3000");
        const result2 = createWelcomeEmailTemplate("Bob", "http://localhost:3000");
        expect(result1).not.toBe(result2);
    });

    it("produces different output for different client URLs", () => {
        const result1 = createWelcomeEmailTemplate("Alice", "http://app1.com");
        const result2 = createWelcomeEmailTemplate("Alice", "http://app2.com");
        expect(result1).not.toBe(result2);
    });

    it("contains a footer section", () => {
        const result = createWelcomeEmailTemplate("Alice", "http://localhost:3000");
        expect(result).toContain("footer");
    });
});