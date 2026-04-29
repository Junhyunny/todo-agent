from unittest.mock import AsyncMock, MagicMock, patch

from tools.playwright_browser_control_toolkit import PlaywrightBrowserControlToolProvider


@patch("tools.playwright_browser_control_toolkit.PlayWrightBrowserToolkit")
@patch("tools.playwright_browser_control_toolkit.async_playwright")
async def test_get_tools_PlayWrightBrowserToolkit_도구를_반환한다(
  mock_async_playwright: MagicMock,
  mock_toolkit_cls: MagicMock,
) -> None:
  browser = AsyncMock()
  playwright = MagicMock()
  playwright.chromium.launch = AsyncMock(return_value=browser)
  mock_async_playwright.return_value.start = AsyncMock(return_value=playwright)
  expected_tool = MagicMock()
  toolkit = MagicMock()
  toolkit.get_tools.return_value = [expected_tool]
  mock_toolkit_cls.from_browser.return_value = toolkit
  sut = PlaywrightBrowserControlToolProvider()

  result = await sut.get_tools()

  assert result == [expected_tool]
  mock_async_playwright.return_value.start.assert_awaited_once_with()
  playwright.chromium.launch.assert_awaited_once_with(headless=True)
  mock_toolkit_cls.from_browser.assert_called_once_with(async_browser=browser)
  toolkit.get_tools.assert_called_once_with()


@patch("tools.playwright_browser_control_toolkit.PlayWrightBrowserToolkit")
@patch("tools.playwright_browser_control_toolkit.async_playwright")
async def test_close_브라우저와_playwright를_정리한다(mock_async_playwright: MagicMock, mock_toolkit_cls: MagicMock) -> None:
  browser = AsyncMock()
  playwright = MagicMock()
  playwright.chromium.launch = AsyncMock(return_value=browser)
  playwright.stop = AsyncMock()
  mock_async_playwright.return_value.start = AsyncMock(return_value=playwright)
  mock_toolkit_cls.from_browser.return_value = MagicMock(get_tools=MagicMock(return_value=[]))
  sut = PlaywrightBrowserControlToolProvider()
  await sut.get_tools()

  await sut.close()

  browser.close.assert_awaited_once_with()
  playwright.stop.assert_awaited_once_with()


async def test_close_생성된_리소스가_없어도_예외가_발생하지_않는다() -> None:
  sut = PlaywrightBrowserControlToolProvider()

  await sut.close()
