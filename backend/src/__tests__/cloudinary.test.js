import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock cloudinary's v2 config method so we can assert it's called correctly
const mockConfig = vi.fn();
vi.mock("cloudinary", () => ({
    v2: {
        config: mockConfig,
        uploader: { upload: vi.fn() },
    },
}));

// Mock env.js with Cloudinary credentials
vi.mock("../lib/env.js", () => ({
    ENV: {
        CLOUDINARY_CLOUD_NAME: "test-cloud-name",
        CLOUDINARY_API_KEY: "test-api-key-123",
        CLOUDINARY_API_SECRET: "test-api-secret-xyz",
    },
}));

describe("cloudinary configuration", () => {
    it("calls cloudinary.config with the correct credentials from ENV", async () => {
        // Import the module (side effect: calls cloudinary.config)
        await import("../lib/cloudinary.js");

        expect(mockConfig).toHaveBeenCalledWith({
            cloud_name: "test-cloud-name",
            api_key: "test-api-key-123",
            api_secret: "test-api-secret-xyz",
        });
    });

    it("exports the configured cloudinary v2 instance as default", async () => {
        const cloudinaryModule = await import("../lib/cloudinary.js");
        const cloudinary = cloudinaryModule.default;

        // The exported default should be the v2 object (has uploader)
        expect(cloudinary).toBeDefined();
        expect(cloudinary.uploader).toBeDefined();
    });

    it("uses CLOUDINARY_CLOUD_NAME from ENV", async () => {
        const callArgs = mockConfig.mock.calls[0]?.[0];
        if (callArgs) {
            expect(callArgs.cloud_name).toBe("test-cloud-name");
        } else {
            // Module was already imported; check mockConfig was called at least once
            expect(mockConfig).toHaveBeenCalled();
            const allCallArgs = mockConfig.mock.calls.map((c) => c[0]);
            const hasCorrectCloudName = allCallArgs.some(
                (args) => args.cloud_name === "test-cloud-name"
            );
            expect(hasCorrectCloudName).toBe(true);
        }
    });

    it("uses CLOUDINARY_API_KEY from ENV", async () => {
        expect(mockConfig).toHaveBeenCalled();
        const allCallArgs = mockConfig.mock.calls.map((c) => c[0]);
        const hasCorrectApiKey = allCallArgs.some(
            (args) => args.api_key === "test-api-key-123"
        );
        expect(hasCorrectApiKey).toBe(true);
    });

    it("uses CLOUDINARY_API_SECRET from ENV", async () => {
        expect(mockConfig).toHaveBeenCalled();
        const allCallArgs = mockConfig.mock.calls.map((c) => c[0]);
        const hasCorrectApiSecret = allCallArgs.some(
            (args) => args.api_secret === "test-api-secret-xyz"
        );
        expect(hasCorrectApiSecret).toBe(true);
    });
});