from langchain_community.agent_toolkits import PlayWrightBrowserToolkit
from langchain_core.tools import BaseTool
from playwright.async_api import Browser, Playwright, async_playwright


class PlaywrightBrowserControlToolProvider:
  def __init__(self) -> None:
    self._playwright: Playwright | None = None
    self._browser: Browser | None = None

  async def get_tools(self) -> list[BaseTool]:
    self._playwright = await async_playwright().start()
    self._browser = await self._playwright.chromium.launch(headless=True)
    toolkit = PlayWrightBrowserToolkit.from_browser(async_browser=self._browser)
    return toolkit.get_tools()

  async def close(self) -> None:
    if self._browser is not None:
      await self._browser.close()
      self._browser = None
    if self._playwright is not None:
      await self._playwright.stop()
      self._playwright = None
