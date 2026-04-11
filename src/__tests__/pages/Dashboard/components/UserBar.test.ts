import { describe, it, expect, vi, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import UserBar from "@/pages/Dashboard/components/StatusBar/UserBar";

vi.mock("@/stores/auth", () => ({
  useAuthStore: () => ({
    isAuthenticated: false,
    nickname: null,
    email: null,
    avatarUrl: null,
    signOut: { mutateAsync: vi.fn() },
  }),
}));

describe("UserBar", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders guest mode badge when not authenticated", async () => {
    setActivePinia(createPinia());
    const wrapper = mount(UserBar, {
      global: {
        stubs: {
          Dialog: { template: "<div />" },
          Dropdown: { template: "<div />" },
          DropdownItem: { template: "<div />" },
          BrandLogo: { template: "<div />" },
        },
      },
    });

    expect(wrapper.text()).toContain("登录解锁全部功能");
    expect(wrapper.find(".user-bar__guest-action--text").exists()).toBe(true);
  });

  it("marks guest mode on the root element so full-bleed styling can bypass account padding", async () => {
    setActivePinia(createPinia());
    const wrapper = mount(UserBar, {
      global: {
        stubs: {
          Dialog: { template: "<div />" },
          Dropdown: { template: "<div />" },
          DropdownItem: { template: "<div />" },
          BrandLogo: { template: "<div />" },
        },
      },
    });

    expect(wrapper.get(".user-bar").classes()).toContain("user-bar--guest");
  });
});
