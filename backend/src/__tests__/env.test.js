import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// env.js calls `import "dotenv/config"` and then throws if vars are missing.
// We test it by stubbing env vars before importing the module.

const REQUIRED_VARS = [
    "MONGO_URL",
    "JWT_SECRET",
    "RESEND_API_KEY",
    "EMAIL_FROM",
    "EMAIL_FROM_NAME",
    "CLIENT_URL",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
];

const FULL_ENV = {
    MONGO_URL: "mongodb://localhost/test",
    JWT_SECRET: "test-secret",
    RESEND_API_KEY: "re_testkey",
    EMAIL_FROM: "test@example.com",
    EMAIL_FROM_NAME: "Test Sender",
    CLIENT_URL: "http://localhost:3000",
    CLOUDINARY_CLOUD_NAME: "test-cloud",
    CLOUDINARY_API_KEY: "test-api-key",
    CLOUDINARY_API_SECRET: "test-api-secret",
    PORT: "4000",
    NODE_ENV: "test",
};

describe("ENV configuration", () => {
    describe("ENV object exports correct values", () => {
        it("exports all required environment variables", async () => {
            vi.stubEnv("MONGO_URL", FULL_ENV.MONGO_URL);
            vi.stubEnv("JWT_SECRET", FULL_ENV.JWT_SECRET);
            vi.stubEnv("RESEND_API_KEY", FULL_ENV.RESEND_API_KEY);
            vi.stubEnv("EMAIL_FROM", FULL_ENV.EMAIL_FROM);
            vi.stubEnv("EMAIL_FROM_NAME", FULL_ENV.EMAIL_FROM_NAME);
            vi.stubEnv("CLIENT_URL", FULL_ENV.CLIENT_URL);
            vi.stubEnv("CLOUDINARY_CLOUD_NAME", FULL_ENV.CLOUDINARY_CLOUD_NAME);
            vi.stubEnv("CLOUDINARY_API_KEY", FULL_ENV.CLOUDINARY_API_KEY);
            vi.stubEnv("CLOUDINARY_API_SECRET", FULL_ENV.CLOUDINARY_API_SECRET);
            vi.stubEnv("PORT", FULL_ENV.PORT);
            vi.stubEnv("NODE_ENV", FULL_ENV.NODE_ENV);

            // Re-import fresh module
            vi.resetModules();
            const { ENV } = await import("../lib/env.js");

            expect(ENV.MONGO_URL).toBe(FULL_ENV.MONGO_URL);
            expect(ENV.JWT_SECRET).toBe(FULL_ENV.JWT_SECRET);
            expect(ENV.RESEND_API_KEY).toBe(FULL_ENV.RESEND_API_KEY);
            expect(ENV.EMAIL_FROM).toBe(FULL_ENV.EMAIL_FROM);
            expect(ENV.EMAIL_FROM_NAME).toBe(FULL_ENV.EMAIL_FROM_NAME);
            expect(ENV.CLIENT_URL).toBe(FULL_ENV.CLIENT_URL);
            expect(ENV.PORT).toBe(FULL_ENV.PORT);
            expect(ENV.NODE_ENV).toBe(FULL_ENV.NODE_ENV);
        });

        it("exports CLOUDINARY_CLOUD_NAME from process.env", async () => {
            vi.stubEnv("MONGO_URL", FULL_ENV.MONGO_URL);
            vi.stubEnv("JWT_SECRET", FULL_ENV.JWT_SECRET);
            vi.stubEnv("RESEND_API_KEY", FULL_ENV.RESEND_API_KEY);
            vi.stubEnv("EMAIL_FROM", FULL_ENV.EMAIL_FROM);
            vi.stubEnv("EMAIL_FROM_NAME", FULL_ENV.EMAIL_FROM_NAME);
            vi.stubEnv("CLIENT_URL", FULL_ENV.CLIENT_URL);
            vi.stubEnv("CLOUDINARY_CLOUD_NAME", "my-cloud-name");
            vi.stubEnv("CLOUDINARY_API_KEY", FULL_ENV.CLOUDINARY_API_KEY);
            vi.stubEnv("CLOUDINARY_API_SECRET", FULL_ENV.CLOUDINARY_API_SECRET);

            vi.resetModules();
            const { ENV } = await import("../lib/env.js");

            expect(ENV.CLOUDINARY_CLOUD_NAME).toBe("my-cloud-name");
        });

        it("exports CLOUDINARY_API_KEY from process.env", async () => {
            vi.stubEnv("MONGO_URL", FULL_ENV.MONGO_URL);
            vi.stubEnv("JWT_SECRET", FULL_ENV.JWT_SECRET);
            vi.stubEnv("RESEND_API_KEY", FULL_ENV.RESEND_API_KEY);
            vi.stubEnv("EMAIL_FROM", FULL_ENV.EMAIL_FROM);
            vi.stubEnv("EMAIL_FROM_NAME", FULL_ENV.EMAIL_FROM_NAME);
            vi.stubEnv("CLIENT_URL", FULL_ENV.CLIENT_URL);
            vi.stubEnv("CLOUDINARY_CLOUD_NAME", FULL_ENV.CLOUDINARY_CLOUD_NAME);
            vi.stubEnv("CLOUDINARY_API_KEY", "my-api-key-123");
            vi.stubEnv("CLOUDINARY_API_SECRET", FULL_ENV.CLOUDINARY_API_SECRET);

            vi.resetModules();
            const { ENV } = await import("../lib/env.js");

            expect(ENV.CLOUDINARY_API_KEY).toBe("my-api-key-123");
        });

        it("exports CLOUDINARY_API_SECRET from process.env", async () => {
            vi.stubEnv("MONGO_URL", FULL_ENV.MONGO_URL);
            vi.stubEnv("JWT_SECRET", FULL_ENV.JWT_SECRET);
            vi.stubEnv("RESEND_API_KEY", FULL_ENV.RESEND_API_KEY);
            vi.stubEnv("EMAIL_FROM", FULL_ENV.EMAIL_FROM);
            vi.stubEnv("EMAIL_FROM_NAME", FULL_ENV.EMAIL_FROM_NAME);
            vi.stubEnv("CLIENT_URL", FULL_ENV.CLIENT_URL);
            vi.stubEnv("CLOUDINARY_CLOUD_NAME", FULL_ENV.CLOUDINARY_CLOUD_NAME);
            vi.stubEnv("CLOUDINARY_API_KEY", FULL_ENV.CLOUDINARY_API_KEY);
            vi.stubEnv("CLOUDINARY_API_SECRET", "my-api-secret-xyz");

            vi.resetModules();
            const { ENV } = await import("../lib/env.js");

            expect(ENV.CLOUDINARY_API_SECRET).toBe("my-api-secret-xyz");
        });
    });

    describe("required environment variable validation", () => {
        afterEach(() => {
            vi.unstubAllEnvs();
            vi.resetModules();
        });

        it.each(REQUIRED_VARS)(
            "throws when %s is missing",
            async (missingVar) => {
                // Set all vars except the one being tested
                for (const key of REQUIRED_VARS) {
                    if (key !== missingVar) {
                        vi.stubEnv(key, FULL_ENV[key]);
                    }
                }
                // Explicitly unset the missing var
                delete process.env[missingVar];

                vi.resetModules();
                await expect(import("../lib/env.js")).rejects.toThrow(
                    `Missing required environment variable: ${missingVar}`
                );
            }
        );

        it("throws specifically for missing CLOUDINARY_CLOUD_NAME", async () => {
            for (const key of REQUIRED_VARS) {
                if (key !== "CLOUDINARY_CLOUD_NAME") {
                    vi.stubEnv(key, FULL_ENV[key]);
                }
            }
            delete process.env.CLOUDINARY_CLOUD_NAME;

            vi.resetModules();
            await expect(import("../lib/env.js")).rejects.toThrow(
                "Missing required environment variable: CLOUDINARY_CLOUD_NAME"
            );
        });

        it("throws specifically for missing CLOUDINARY_API_KEY", async () => {
            for (const key of REQUIRED_VARS) {
                if (key !== "CLOUDINARY_API_KEY") {
                    vi.stubEnv(key, FULL_ENV[key]);
                }
            }
            delete process.env.CLOUDINARY_API_KEY;

            vi.resetModules();
            await expect(import("../lib/env.js")).rejects.toThrow(
                "Missing required environment variable: CLOUDINARY_API_KEY"
            );
        });

        it("throws specifically for missing CLOUDINARY_API_SECRET", async () => {
            for (const key of REQUIRED_VARS) {
                if (key !== "CLOUDINARY_API_SECRET") {
                    vi.stubEnv(key, FULL_ENV[key]);
                }
            }
            delete process.env.CLOUDINARY_API_SECRET;

            vi.resetModules();
            await expect(import("../lib/env.js")).rejects.toThrow(
                "Missing required environment variable: CLOUDINARY_API_SECRET"
            );
        });

        it("does not throw when all required vars are present", async () => {
            for (const key of REQUIRED_VARS) {
                vi.stubEnv(key, FULL_ENV[key]);
            }

            vi.resetModules();
            await expect(import("../lib/env.js")).resolves.not.toThrow();
        });
    });
});