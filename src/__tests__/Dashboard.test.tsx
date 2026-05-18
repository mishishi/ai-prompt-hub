import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Dashboard } from "../components/dashboard/Dashboard";
import { LanguageProvider } from "../i18n/LanguageContext";
import { ToastProvider } from "../components/ui/Toast";

vi.mock("@clerk/clerk-react", () => ({ useUser: () => ({ user: null }) }));
vi.mock("../utils/analytics", () => ({ track: vi.fn(), getEvents: () => [], getDisplayName: () => "test" }));
vi.mock("../utils/storage", () => ({ getFavorites: () => [] }));

describe("Dashboard", () => {
  it("renders without crashing", () => {
    const { container } = render(
      <MemoryRouter>
        <LanguageProvider>
          <ToastProvider>
            <Dashboard />
          </ToastProvider>
        </LanguageProvider>
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
  });
});
