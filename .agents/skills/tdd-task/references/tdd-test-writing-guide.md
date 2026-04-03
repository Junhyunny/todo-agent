# TDD 테스트 작성 가이드

지원되는 각 스택에 대한 상세 테스트 패턴입니다. 올바른 실패 테스트란:
1. 구문 오류 없이 컴파일/파싱됨
2. **올바른 이유**로 런타임에 실패함 (assertion 실패 또는 구현 누락 — import 오류나 잘못된 테스트 설정이 아님)
3. 사양 문장으로 읽히는 설명적인 이름을 가짐
4. 단일 동작에 집중함

---

## TypeScript + React

### 프레임워크
- **단위/컴포넌트:** Vitest + @testing-library/react OR Jest + @testing-library/react
- **E2E:** Playwright OR Cypress

### 파일 위치 규칙
```
src/
  components/
    UserProfile/
      UserProfile.tsx
      UserProfile.test.tsx   ← co-located test
  services/
    userService.ts
    userService.test.ts
e2e/
  user-profile.spec.ts       ← Playwright E2E
```

### 단위 테스트 구조 (Vitest)

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UserProfile } from './UserProfile'
import { userService } from '../services/userService'

vi.mock('../services/userService')

describe('UserProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should display user name when profile loads successfully', async () => {
    // Arrange
    vi.mocked(userService.getUser).mockResolvedValue({ name: 'Alice', email: 'alice@example.com' })

    // Act
    render(<UserProfile userId="123" />)

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument()
    })
  })

  it('should show error message when profile fetch fails', async () => {
    // Arrange
    vi.mocked(userService.getUser).mockRejectedValue(new Error('Not found'))

    // Act
    render(<UserProfile userId="invalid" />)

    // Assert
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Failed to load profile')
    })
  })
})
```

### 서비스 단위 테스트 (Vitest)

```typescript
import { describe, it, expect, vi } from 'vitest'
import { UserService } from './UserService'
import { UserRepository } from './UserRepository'

describe('UserService', () => {
  it('should return user when user exists', async () => {
    // Arrange
    const mockRepo = {
      findById: vi.fn().mockResolvedValue({ id: '1', name: 'Alice' })
    } as unknown as UserRepository
    const sut = new UserService(mockRepo)

    // Act
    const result = await sut.getUser('1')

    // Assert
    expect(result).toEqual({ id: '1', name: 'Alice' })
    expect(mockRepo.findById).toHaveBeenCalledWith('1')
  })
})
```

### 명명 규칙
- `it('should [expected behavior] when [context]', ...)`
- 컴포넌트/서비스 이름에 `describe`, 동작에 `it` 사용
- "test that", "verify that" 사용 금지 — "should"로 직접 시작

### 올바른 RED 실패 모습
```
FAIL src/services/UserService.test.ts
  UserService > should return user when user exists
    TypeError: sut.getUser is not a function
    ← method does not exist yet → correct RED
```
다음과 같은 경우는 안 됩니다 (잘못된 이유):
```
    SyntaxError: Cannot find module './UserService'
    ← file doesn't exist → fix the import, not the test
```

### E2E 테스트 (Playwright)

```typescript
// e2e/user-profile.spec.ts
import { test, expect } from '@playwright/test'

test.describe('User Profile', () => {
  test('should display updated name after profile edit', async ({ page }) => {
    // Arrange — navigate to page
    await page.goto('/profile/123')
    await expect(page.getByRole('heading')).toHaveText('Alice')

    // Act
    await page.getByRole('button', { name: 'Edit Profile' }).click()
    await page.getByLabel('Name').fill('Alice Updated')
    await page.getByRole('button', { name: 'Save' }).click()

    // Assert
    await expect(page.getByRole('heading')).toHaveText('Alice Updated')
    await expect(page.getByRole('status')).toHaveText('Profile updated successfully')
  })
})
```

---

## Kotlin + Spring

### 프레임워크
- **단위:** JUnit5 + MockK + AssertJ (또는 Kotest)
- **통합:** @SpringBootTest + MockMvc 또는 Testcontainers
- **E2E:** RestAssured

### 파일 위치 규칙
```
src/
  main/kotlin/com/example/
    domain/
      User.kt
      UserService.kt
    web/
      UserController.kt
  test/kotlin/com/example/
    domain/
      UserServiceTest.kt
    web/
      UserControllerTest.kt
      UserApiTest.kt           ← RestAssured E2E
```

### 단위 테스트 구조

```kotlin
import io.mockk.*
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows

@DisplayName("UserService")
class UserServiceTest {

    private val userRepository = mockk<UserRepository>()
    private val sut = UserService(userRepository)

    @BeforeEach
    fun setUp() {
        clearAllMocks()
    }

    @Nested
    @DisplayName("getUser")
    inner class GetUser {

        @Test
        @DisplayName("should return user when user exists")
        fun `should return user when user exists`() {
            // Arrange
            val userId = UserId("user-123")
            val expectedUser = User(id = userId, name = "Alice", email = "alice@example.com")
            every { userRepository.findById(userId) } returns expectedUser

            // Act
            val result = sut.getUser(userId)

            // Assert
            assertThat(result).isEqualTo(expectedUser)
            verify(exactly = 1) { userRepository.findById(userId) }
        }

        @Test
        @DisplayName("should throw UserNotFoundException when user does not exist")
        fun `should throw UserNotFoundException when user does not exist`() {
            // Arrange
            val userId = UserId("nonexistent")
            every { userRepository.findById(userId) } returns null

            // Act & Assert
            assertThrows<UserNotFoundException> {
                sut.getUser(userId)
            }
        }
    }
}
```

### 컨트롤러 통합 테스트 (@WebMvcTest)

```kotlin
@WebMvcTest(UserController::class)
@DisplayName("UserController")
class UserControllerTest {

    @Autowired private lateinit var mockMvc: MockMvc
    @MockkBean private lateinit var userService: UserService

    @Test
    @DisplayName("should return 200 with user when user exists")
    fun `should return 200 with user when user exists`() {
        // Arrange
        val userId = "user-123"
        every { userService.getUser(UserId(userId)) } returns
            User(id = UserId(userId), name = "Alice", email = "alice@example.com")

        // Act & Assert
        mockMvc.get("/api/users/$userId")
            .andExpect {
                status { isOk() }
                jsonPath("$.name") { value("Alice") }
                jsonPath("$.email") { value("alice@example.com") }
            }
    }

    @Test
    @DisplayName("should return 404 when user does not exist")
    fun `should return 404 when user does not exist`() {
        // Arrange
        every { userService.getUser(any()) } throws UserNotFoundException("not found")

        // Act & Assert
        mockMvc.get("/api/users/invalid")
            .andExpect { status { isNotFound() } }
    }
}
```

### E2E 테스트 (RestAssured)

```kotlin
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@DisplayName("User API")
class UserApiTest {

    @LocalServerPort private var port: Int = 0

    @BeforeEach
    fun setUp() {
        RestAssured.port = port
    }

    @Test
    @DisplayName("should update user name and return 200")
    fun `should update user name and return 200`() {
        // Arrange — create user first
        val userId = createUser("Alice")

        // Act
        given()
            .contentType(ContentType.JSON)
            .body("""{"name": "Alice Updated"}""")
        .`when`()
            .put("/api/users/$userId")
        .then()
            .statusCode(200)
            .body("name", equalTo("Alice Updated"))
    }
}
```

### 명명 규칙
- `@DisplayName("should [behavior] when [context]")`
- 가독성을 위한 Kotlin 백틱 함수명: `` `should return user when user exists` ``
- 메서드/기능별 그룹화를 위해 `@Nested`와 `@DisplayName` 사용

### 올바른 RED 실패 모습
```
UserServiceTest > getUser > should return user when user exists FAILED
  io.mockk.MockKException: no answer found for: UserRepository(#1).findById(UserId(value=user-123))
  ← method doesn't exist in UserService yet → correct RED
```

---

## Java + Spring

### 프레임워크
- **단위:** JUnit5 + Mockito + AssertJ
- **통합:** @SpringBootTest + MockMvc 또는 Testcontainers
- **E2E:** RestAssured

### 파일 위치 규칙
```
src/
  main/java/com/example/
    domain/UserService.java
    web/UserController.java
  test/java/com/example/
    domain/UserServiceTest.java
    web/UserControllerTest.java
    web/UserApiTest.java
```

### 단위 테스트 구조

```java
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserService")
class UserServiceTest {

    @Mock private UserRepository userRepository;
    @InjectMocks private UserService sut;

    @Nested
    @DisplayName("getUser")
    class GetUser {

        @Test
        @DisplayName("should return user when user exists")
        void shouldReturnUserWhenUserExists() {
            // Arrange
            var userId = new UserId("user-123");
            var expectedUser = new User(userId, "Alice", "alice@example.com");
            when(userRepository.findById(userId)).thenReturn(Optional.of(expectedUser));

            // Act
            var result = sut.getUser(userId);

            // Assert
            assertThat(result).isEqualTo(expectedUser);
            verify(userRepository).findById(userId);
        }

        @Test
        @DisplayName("should throw UserNotFoundException when user does not exist")
        void shouldThrowWhenUserDoesNotExist() {
            // Arrange
            var userId = new UserId("nonexistent");
            when(userRepository.findById(userId)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> sut.getUser(userId))
                .isInstanceOf(UserNotFoundException.class);
        }
    }
}
```

### 컨트롤러 통합 테스트

```java
@WebMvcTest(UserController.class)
@DisplayName("UserController")
class UserControllerTest {

    @Autowired private MockMvc mockMvc;
    @MockBean private UserService userService;

    @Test
    @DisplayName("should return 200 with user data when user exists")
    void shouldReturn200WithUserData() throws Exception {
        // Arrange
        var userId = "user-123";
        when(userService.getUser(new UserId(userId)))
            .thenReturn(new User(new UserId(userId), "Alice", "alice@example.com"));

        // Act & Assert
        mockMvc.perform(get("/api/users/" + userId))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("Alice"))
            .andExpect(jsonPath("$.email").value("alice@example.com"));
    }
}
```

### 명명 규칙
- 테스트 메서드에 `@DisplayName("should [behavior] when [context]")` 사용
- camelCase 메서드명: `shouldReturnUserWhenUserExists`
- 관련 테스트 그룹화를 위해 `@Nested` 사용

---

## Python + FastAPI

### 프레임워크
- **단위:** pytest + unittest.mock
- **통합:** pytest + httpx (ASGITransport를 사용한 AsyncClient)
- **E2E:** pytest + playwright (선택 사항)

### 파일 위치 규칙
```
app/
  domain/
    user_service.py
  api/
    users.py
    main.py
tests/
  unit/
    test_user_service.py
  integration/
    test_users_api.py
  e2e/
    test_user_profile.py     ← Playwright E2E
```

### 단위 테스트 구조

```python
# tests/unit/test_user_service.py
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from app.domain.user_service import UserService
from app.domain.exceptions import UserNotFoundException


class TestUserServiceGetUser:
    def setup_method(self):
        self.mock_repository = MagicMock()
        self.sut = UserService(repository=self.mock_repository)

    def test_should_return_user_when_user_exists(self):
        # Arrange
        expected_user = {"id": "user-123", "name": "Alice", "email": "alice@example.com"}
        self.mock_repository.find_by_id.return_value = expected_user

        # Act
        result = self.sut.get_user("user-123")

        # Assert
        assert result == expected_user
        self.mock_repository.find_by_id.assert_called_once_with("user-123")

    def test_should_raise_not_found_when_user_does_not_exist(self):
        # Arrange
        self.mock_repository.find_by_id.return_value = None

        # Act & Assert
        with pytest.raises(UserNotFoundException):
            self.sut.get_user("nonexistent")
```

### 비동기 단위 테스트

```python
import pytest
from unittest.mock import AsyncMock

class TestAsyncUserService:
    @pytest.mark.asyncio
    async def test_should_return_user_when_user_exists(self):
        # Arrange
        mock_repo = AsyncMock()
        mock_repo.find_by_id.return_value = {"id": "1", "name": "Alice"}
        sut = AsyncUserService(repository=mock_repo)

        # Act
        result = await sut.get_user("1")

        # Assert
        assert result["name"] == "Alice"
```

### 통합 테스트 (httpx + FastAPI)

```python
# tests/integration/test_users_api.py
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_should_return_200_with_user_when_user_exists(test_user):
    # test_user is a pytest fixture that creates a user in the test DB
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get(f"/api/users/{test_user['id']}")

    assert response.status_code == 200
    assert response.json()["name"] == test_user["name"]


@pytest.mark.asyncio
async def test_should_return_404_when_user_does_not_exist():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/users/nonexistent-id")

    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()
```

### E2E 테스트 (Playwright Python)

```python
# tests/e2e/test_user_profile.py
import pytest
from playwright.async_api import async_playwright

@pytest.mark.asyncio
async def test_should_display_updated_name_after_profile_edit():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # Arrange
        await page.goto("http://localhost:3000/profile/123")
        await page.wait_for_selector("h1:has-text('Alice')")

        # Act
        await page.click("button:has-text('Edit Profile')")
        await page.fill("input[name='name']", "Alice Updated")
        await page.click("button:has-text('Save')")

        # Assert
        await page.wait_for_selector("h1:has-text('Alice Updated')")
        assert await page.locator("h1").inner_text() == "Alice Updated"

        await browser.close()
```

### 명명 규칙
- 함수명: `test_should_[behavior]_when_[context]`
- 클래스명: `TestServiceNameMethodName`
- 비동기 테스트에 `pytest.mark.asyncio` 사용
- 공유 픽스처에 `conftest.py` 사용

### 올바른 RED 실패 모습
```
FAILED tests/unit/test_user_service.py::TestUserServiceGetUser::test_should_return_user_when_user_exists
  AttributeError: 'UserService' object has no attribute 'get_user'
  ← method doesn't exist yet → correct RED
```
다음과 같은 경우는 안 됩니다 (잘못된 이유):
```
  ImportError: cannot import name 'UserService' from 'app.domain.user_service'
  ← module doesn't exist → create the module first
```

---

## 흔한 안티패턴

| 안티패턴 | 문제 | 해결 방법 |
|----------|------|----------|
| 구현 세부사항 테스트 | 리팩토링 시 테스트 깨짐 | 메서드 호출이 아닌 동작을 테스트 |
| 한 테스트에 너무 많은 assertion | 실패 원인 파악 어려움 | 테스트당 단일 동작 |
| 소유한 것을 모킹 | 통합 버그 숨김 | 외부 의존성만 모킹 |
| `test1`, `testGetUser` 같은 테스트명 | 사양으로 읽히지 않음 | 완전한 문장 사용: `should return user when exists` |
| 픽스처 대신 테스트 본문에 설정 | 중복 | `beforeEach` / `setUp` / pytest 픽스처 사용 |
| 불필요한 모크 호출 횟수 검증 | 취약함 | 내부가 아닌 결과를 검증 |
