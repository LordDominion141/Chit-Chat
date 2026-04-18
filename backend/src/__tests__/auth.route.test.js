import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock all controller functions and the protectRoute middleware
const mockSignupRes = vi.fn((req, res) => res.status(201).json({ route: "signup" }));
const mockLoginRes = vi.fn((req, res) => res.status(200).json({ route: "login" }));
const mockLogoutRes = vi.fn((req, res) => res.status(200).json({ route: "logout" }));
const mockUpdateProfile = vi.fn((req, res) =>
    res.status(200).json({ route: "update-profile" })
);
const mockProtectRoute = vi.fn((req, res, next) => {
    req.user = { _id: "test-user-id", fullName: "Test User" };
    next();
});

vi.mock("../controllers/auth.controller.js", () => ({
    default: {
        signupRes: mockSignupRes,
        loginRes: mockLoginRes,
        logoutRes: mockLogoutRes,
        updateProfile: mockUpdateProfile,
    },
}));

vi.mock("../middleware/auth.middleware.js", () => ({
    protectRoute: mockProtectRoute,
}));

vi.mock("../lib/env.js", () => ({
    ENV: { JWT_SECRET: "test-secret" },
}));

// Import the router after mocking
const { default: authRouter } = await import("../routes/auth.route.js");

// Helper: find a layer in the router stack by HTTP method and path
function findRoute(router, method, path) {
    const stack = router.stack || [];
    return stack.find((layer) => {
        if (!layer.route) return false;
        const routePath = layer.route.path;
        const methods = layer.route.methods;
        return routePath === path && methods[method.toLowerCase()];
    });
}

// Helper to create a minimal mock req/res/next
function makeMocks() {
    const req = { body: {}, cookies: {}, user: null };
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
    };
    const next = vi.fn();
    return { req, res, next };
}

describe("auth route configuration", () => {
    it("registers POST /login route", () => {
        const layer = findRoute(authRouter, "post", "/login");
        expect(layer).toBeDefined();
    });

    it("registers POST /logout route", () => {
        const layer = findRoute(authRouter, "post", "/logout");
        expect(layer).toBeDefined();
    });

    it("registers POST /update-profile route", () => {
        const layer = findRoute(authRouter, "post", "/update-profile");
        expect(layer).toBeDefined();
    });

    it("registers GET /check route", () => {
        const layer = findRoute(authRouter, "get", "/check");
        expect(layer).toBeDefined();
    });

    it("POST /update-profile has protectRoute as a middleware in its stack", () => {
        const layer = findRoute(authRouter, "post", "/update-profile");
        expect(layer).toBeDefined();
        // The route.stack contains the handler chain: [protectRoute, updateProfile]
        const handlers = layer.route.stack.map((h) => h.handle);
        expect(handlers).toContain(mockProtectRoute);
    });

    it("POST /update-profile has updateProfile controller after protectRoute", () => {
        const layer = findRoute(authRouter, "post", "/update-profile");
        const handlers = layer.route.stack.map((h) => h.handle);
        const protectIdx = handlers.indexOf(mockProtectRoute);
        const updateIdx = handlers.indexOf(mockUpdateProfile);
        expect(protectIdx).toBeGreaterThanOrEqual(0);
        expect(updateIdx).toBeGreaterThan(protectIdx);
    });

    it("GET /check has protectRoute as a middleware in its stack", () => {
        const layer = findRoute(authRouter, "get", "/check");
        expect(layer).toBeDefined();
        const handlers = layer.route.stack.map((h) => h.handle);
        expect(handlers).toContain(mockProtectRoute);
    });

    it("POST /login does NOT use protectRoute middleware", () => {
        const layer = findRoute(authRouter, "post", "/login");
        const handlers = layer.route.stack.map((h) => h.handle);
        expect(handlers).not.toContain(mockProtectRoute);
    });

    it("POST /logout does NOT use protectRoute middleware", () => {
        const layer = findRoute(authRouter, "post", "/logout");
        const handlers = layer.route.stack.map((h) => h.handle);
        expect(handlers).not.toContain(mockProtectRoute);
    });
});

describe("auth route handler invocation", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("POST /login handler calls loginRes", () => {
        const layer = findRoute(authRouter, "post", "/login");
        const { req, res } = makeMocks();
        const handlers = layer.route.stack.map((h) => h.handle);
        handlers.forEach((h) => h(req, res, vi.fn()));
        expect(mockLoginRes).toHaveBeenCalled();
    });

    it("POST /logout handler calls logoutRes", () => {
        const layer = findRoute(authRouter, "post", "/logout");
        const { req, res } = makeMocks();
        const handlers = layer.route.stack.map((h) => h.handle);
        handlers.forEach((h) => h(req, res, vi.fn()));
        expect(mockLogoutRes).toHaveBeenCalled();
    });

    it("POST /update-profile calls updateProfile after protectRoute passes", () => {
        const layer = findRoute(authRouter, "post", "/update-profile");
        const { req, res } = makeMocks();

        // Simulate the middleware chain
        let handlerIndex = 0;
        const handlers = layer.route.stack.map((h) => h.handle);
        const runNext = () => {
            if (handlerIndex < handlers.length) {
                handlers[handlerIndex++](req, res, runNext);
            }
        };
        runNext();

        expect(mockProtectRoute).toHaveBeenCalled();
        expect(mockUpdateProfile).toHaveBeenCalled();
    });

    it("GET /check returns req.user set by protectRoute", () => {
        const layer = findRoute(authRouter, "get", "/check");
        const { req, res } = makeMocks();
        const fakeUser = { _id: "chk-uid", fullName: "Checker" };

        // Set req.user as protectRoute would
        req.user = fakeUser;

        // Find the inline handler (not protectRoute)
        const handlers = layer.route.stack.map((h) => h.handle);
        const inlineHandler = handlers.find((h) => h !== mockProtectRoute);
        inlineHandler(req, res, vi.fn());

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(fakeUser);
    });

    it("GET /check protectRoute blocks when it returns 401", () => {
        const layer = findRoute(authRouter, "get", "/check");
        const { req, res } = makeMocks();

        // Override protectRoute to block
        const blockingProtect = vi.fn((_req, _res) => {
            _res.status(401).json({ message: "Unauthorized - No token provided" });
            // Does NOT call next()
        });

        const handlers = layer.route.stack.map((h) => h.handle);
        // Replace the first handler (protectRoute) with blocking version
        const modifiedHandlers = handlers.map((h) =>
            h === mockProtectRoute ? blockingProtect : h
        );

        let handlerIndex = 0;
        const runNext = () => {
            if (handlerIndex < modifiedHandlers.length) {
                modifiedHandlers[handlerIndex++](req, res, runNext);
            }
        };
        runNext();

        expect(res.status).toHaveBeenCalledWith(401);
        // The inline handler should NOT be called
        expect(res.json).toHaveBeenCalledWith({
            message: "Unauthorized - No token provided",
        });
    });
});