import { afterEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import SettingsPage from "@/pages/Settings/SettingsPage.vue";

describe("SettingsPage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders a single scrolling page with the two sidebar entries and sections", () => {
    const wrapper = mount(SettingsPage);

    expect(wrapper.get("[data-test='settings-page-title']").text()).toBe("个人中心");
    expect(wrapper.get("[data-test='settings-sidebar-item-holdings']").classes()).toContain(
      "settings-sidebar__item--active",
    );
    expect(wrapper.get("[data-test='settings-section-holdings']").text()).toContain("我的持仓");
    expect(wrapper.get("[data-test='settings-section-preferences']").text()).toContain("偏好设置");
  });

  it("scrolls to the target section and updates the active item when a sidebar item is clicked", async () => {
    const scrollIntoView = vi.fn();
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: scrollIntoView,
    });

    const wrapper = mount(SettingsPage);

    await wrapper.get("[data-test='settings-sidebar-item-preferences']").trigger("click");

    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    expect(wrapper.get("[data-test='settings-sidebar-item-preferences']").classes()).toContain(
      "settings-sidebar__item--active",
    );
  });
});
