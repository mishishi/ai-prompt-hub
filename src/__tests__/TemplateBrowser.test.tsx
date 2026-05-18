import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { TemplateBrowser } from "../components/templates/TemplateBrowser";
import { LanguageProvider } from "../i18n/LanguageContext";
import { ToastProvider } from "../components/ui/Toast";

vi.mock("@clerk/clerk-react", () => ({ useUser: () => ({ user: null }) }));
vi.mock("../utils/analytics", () => ({ track: vi.fn(), getEvents: () => [], getDisplayName: () => "test" }));
vi.mock("../utils/storage", () => ({ getFavorites: () => [], isFavorite: () => false }));

describe("TemplateBrowser", () => {
  it("renders without crashing", () => {
    const { container } = render(
      <MemoryRouter>
        <LanguageProvider>
          <ToastProvider>
            <TemplateBrowser />
          </ToastProvider>
        </LanguageProvider>
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
  });

  it("shows tabs and buttons", () => {
    const { container } = render(
      <MemoryRouter>
        <LanguageProvider>
          <ToastProvider>
            <TemplateBrowser />
          </ToastProvider>
        </LanguageProvider>
      </MemoryRouter>
    );
    expect(container.querySelectorAll("button").length).toBeGreaterThan(0);
  });
});
