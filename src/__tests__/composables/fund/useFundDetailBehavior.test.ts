import { beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, ref } from "vue";
import { mount, flushPromises } from "@vue/test-utils";
import { QueryClient, VueQueryPlugin } from "@tanstack/vue-query";
import { useFundDetail } from "@/composables/fund/useFundDetail";

vi.mock("@/api/fundDetail", () => ({
  fetchFundDetail: vi.fn(),
}));

const { fetchFundDetail } = await import("@/api/fundDetail");
const mockedFetchFundDetail = vi.mocked(fetchFundDetail);

const mountUseFundDetail = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  let exposed!: ReturnType<typeof useFundDetail>;

  const Host = defineComponent({
    setup() {
      exposed = useFundDetail(ref("005827"));
      return () => null;
    },
  });

  const wrapper = mount(Host, {
    global: {
      plugins: [[VueQueryPlugin, { queryClient }]],
    },
  });

  return { exposed, wrapper, queryClient };
};

describe("useFundDetail behavior", () => {
  beforeEach(() => {
    mockedFetchFundDetail.mockReset();
  });

  it("keeps the initial detail request silent", async () => {
    mockedFetchFundDetail.mockResolvedValueOnce(null);

    const { wrapper, queryClient } = mountUseFundDetail();
    await flushPromises();

    expect(mockedFetchFundDetail).toHaveBeenCalledWith("005827", {
      suppressToast: true,
    });

    wrapper.unmount();
    queryClient.clear();
  });

  it("uses a non-silent request when retrying the detail query", async () => {
    mockedFetchFundDetail.mockResolvedValue(null);

    const { exposed, wrapper, queryClient } = mountUseFundDetail();
    await flushPromises();
    await exposed.retry();
    await flushPromises();

    expect(mockedFetchFundDetail).toHaveBeenNthCalledWith(2, "005827", {
      suppressToast: false,
    });

    wrapper.unmount();
    queryClient.clear();
  });
});
