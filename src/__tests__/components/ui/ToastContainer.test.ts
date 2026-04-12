import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import ToastContainer from "@/components/ui/Toast/ToastContainer.vue";
import { toast } from "@/composables/useToast";

describe("ToastContainer", () => {
  it("renders a toast after calling the global toast helper", async () => {
    vi.useFakeTimers();

    const wrapper = mount(ToastContainer, { attachTo: document.body });
    toast.error("请求失败");
    await nextTick();

    expect(document.body.textContent).toContain("请求失败");

    wrapper.unmount();
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });
});
