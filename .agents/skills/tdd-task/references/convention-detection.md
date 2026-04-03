# 컨벤션 감지 가이드

기존 프로젝트에서 ping-pong TDD 세션을 진행할 때, AI는 먼저 프로젝트의 기존 코드를 읽어 새로운 테스트와 구현이 주변 스타일에 자연스럽게 맞도록 해야 합니다.

**원칙: 프로젝트의 실제 코드가 기본 패턴보다 우선합니다.**

---

## 실행 시점

Phase 2 Step 2에서, 스택 감지 직후에 실행합니다.

```
No test/source files found → new project → use default patterns from tdd-test-writing-guide.md
Test/source files exist    → existing project → follow this guide to read conventions
```

---

## 공통: 읽을 파일

스택에 관계없이 확인합니다.

### 1. 우선순위: 스토리와 동일한 영역의 파일

```
If the current story is about a "cart" feature:
  → Prefer: src/cart/, CartService*, cart.test.*, test_cart.py etc.
  → Fallback: the 2–3 most recently modified test files in the project
```

### 2. 코드 스타일 설정 파일

| 파일 | 스택 | 확인 사항 |
|------|------|----------|
| `.eslintrc*`, `eslint.config.*` | TypeScript | 세미콜론, 따옴표, import 순서 |
| `prettier.config.*`, `.prettierrc` | TypeScript | 들여쓰기, 줄 길이 |
| `.editorconfig` | 공통 | 탭/공백 들여쓰기, 줄 끝 문자 |
| `detekt.yml`, `.detekt.yml` | Kotlin | 함수 길이, 복잡도 임계값 |
| `pyproject.toml` `[tool.black]` | Python | 줄 길이 |
| `pyproject.toml` `[tool.ruff]` | Python | 린트 규칙 |

---

## TypeScript + React

### 읽을 파일

```
1. 2–3 existing test files
   Prefer: *.test.ts, *.test.tsx, *.spec.ts, *.spec.tsx
   Location: co-located (next to source) vs __tests__/ vs src/test/

2. 1–2 existing source files
   Prefer: same layer as the story (service, hook, component, etc.)
```

### 추출할 컨벤션

**테스트 구조**

```typescript
// Pattern A: describe + it (most common)
describe('ServiceName', () => {
  describe('methodName', () => {
    it('should ...', () => { ... })
  })
})

// Pattern B: describe + test
describe('ServiceName', () => {
  test('should ...', () => { ... })
})

// Pattern C: top-level test only (no describe nesting)
test('ServiceName should ...', () => { ... })
```

**확인 사항:**
- 프로젝트가 `it` 또는 `test`를 사용하는가?
- `describe` 중첩 레벨은 몇 단계인가?
- 테스트명 형식: `'should X when Y'` vs `'X when Y should Z'`
- `beforeEach` / `afterEach`의 위치 (`describe` 내부 또는 외부)?

**Mock 패턴**

```typescript
// Pattern A: vi.mock (module-level)
vi.mock('../services/userService')
const mockGetUser = vi.mocked(userService.getUser)

// Pattern B: vi.fn() injected directly
const mockRepository = { findById: vi.fn() }
const sut = new UserService(mockRepository as UserRepository)

// Pattern C: jest.spyOn
jest.spyOn(userService, 'getUser').mockResolvedValue(...)
```

**Assertion 패턴**
expect(result).toEqual(expected)
expect(result).toBe(expected)
expect(fn).toHaveBeenCalledWith(arg)

// @testing-library/jest-dom extensions
expect(element).toBeInTheDocument()
expect(element).toHaveTextContent('...')
```

**소스 파일 컨벤션**

```typescript
// Class vs functional style
class UserService { ... }           // class-based
function createUserService() { }    // factory function
export const userService = { }      // object literal

// Dependency injection
constructor(private readonly repo: UserRepository) {}  // constructor injection
function getUser(repo = defaultRepo) {}                // default parameter

// Error handling
throw new UserNotFoundError(id)           // custom error class
return { ok: false, error: 'NOT_FOUND' } // Result pattern
```

**파일/디렉토리 구조**

```
Feature-based:           Layer-based:
src/
  user/                  services/
    user.service.ts        user.service.ts
    user.service.test.ts components/
    user.types.ts           UserProfile.tsx
                         hooks/
                           useUser.ts
```

---

## Kotlin + Spring

### 읽을 파일

```
1. 2–3 test files
   Location: src/test/kotlin/.../**Test.kt or **Spec.kt

2. 1–2 source files
   Location: src/main/kotlin/.../
   Prefer: same layer as the story (domain, service, web, application, etc.)

3. Build file
   build.gradle.kts: check testImplementation dependencies
   (kotest vs JUnit5, mockk vs mockito-kotlin, etc.)
```

### 추출할 컨벤션

**테스트 클래스 구조**

```kotlin
// Pattern A: JUnit5 + @Nested (hierarchical)
@DisplayName("UserService")
class UserServiceTest {
    @Nested @DisplayName("getUser") inner class GetUser {
        @Test @DisplayName("should ...") fun `...`() { }
    }
}

// Pattern B: JUnit5 flat structure
class UserServiceTest {
    @Test fun `should return user when exists`() { }
    @Test fun `should throw when not found`() { }
}

// Pattern C: Kotest (BehaviorSpec / DescribeSpec)
class UserServiceTest : BehaviorSpec({
    Given("an existing user") {
        When("getUser is called") {
            Then("returns the user") { }
        }
    }
})
```

**Mock 패턴**

```kotlin
// MockK (most common)
private val repo = mockk<UserRepository>()
every { repo.findById(any()) } returns user
verify { repo.findById(userId) }

// Mockito-Kotlin
private val repo = mock<UserRepository>()
whenever(repo.findById(any())).thenReturn(user)
verify(repo).findById(userId)

// @MockkBean / @MockBean (Spring integration tests)
@MockkBean private lateinit var userService: UserService
@MockBean private lateinit var userService: UserService
```

**Assertion 패턴**

```kotlin
// AssertJ (most common)
assertThat(result).isEqualTo(expected)
assertThat(result.name).isEqualTo("Alice")

// Kotest Matchers
result shouldBe expected
result.name shouldBe "Alice"

// JUnit5 built-in
assertEquals(expected, result)
assertThrows<UserNotFoundException> { sut.getUser(id) }
```

**소스 파일 컨벤션**

```kotlin
// Package/directory structure — layer-based vs domain-based
com.example.user.UserService        // domain-based (hexagonal, etc.)
com.example.service.UserService     // layer-based

// Dependency injection — constructor vs field injection
class UserService(private val repo: UserRepository) {}                         // constructor (preferred)
@Service class UserService { @Autowired lateinit var repo: UserRepository }    // field injection

// Spring annotation patterns
@Service class UserService(...)             // service layer
@Repository interface UserRepository ...   // JPA repository
@RestController @RequestMapping("/api")    // controller
@Component                                 // generic bean

// Error handling patterns
throw UserNotFoundException("User $id not found")       // direct custom exception
throw NotFoundException(ErrorCode.USER_NOT_FOUND)       // shared exception + error code enum
return Result.failure(UserNotFoundError)                // Result type
```

**패키지 명명 규칙**

```
domain/ vs entity/ vs model/           → domain objects
service/ vs application/               → business logic
repository/ vs port/out/               → persistence
controller/ vs web/ vs adapter/in/     → controllers
```

---

## Java + Spring

### 읽을 파일

```
1. 2–3 test files: src/test/java/.../**Test.java
2. 1–2 source files: src/main/java/.../
3. Build file: test dependencies in pom.xml or build.gradle
```

### 추출할 컨벤션

**테스트 클래스 구조**

```java
// Pattern A: JUnit5 + @Nested
@DisplayName("UserService")
class UserServiceTest {
    @Nested @DisplayName("getUser")
    class GetUser {
        @Test @DisplayName("should return user when exists")
        void shouldReturnUserWhenExists() { }
    }
}

// Pattern B: flat structure (no nesting)
class UserServiceTest {
    @Test void shouldReturnUserWhenExists() { }
    @Test void shouldThrowWhenNotFound() { }
}
```

**메서드 명명**

```java
// camelCase verb form (most common)
void shouldReturnUserWhenExists()
void givenUserExists_whenGetUser_thenReturnUser()  // Given-When-Then style
void getUser_existingUser_returnsUser()             // underscore-separated
```

**Mock 패턴**

```java
// @ExtendWith(MockitoExtension.class) + annotations
@Mock UserRepository userRepository;
@InjectMocks UserService sut;

// Direct construction
UserRepository mockRepo = mock(UserRepository.class);
UserService sut = new UserService(mockRepo);

// BDDMockito
given(repo.findById(id)).willReturn(Optional.of(user));
then(repo).should().findById(id);
```

**소스 파일 컨벤션**

```java
// Constructor annotations
@RequiredArgsConstructor  // Lombok
public UserService(UserRepository userRepository) { }  // explicit constructor

// Immutability
private final UserRepository userRepository;  // final field
private UserRepository userRepository;        // mutable field

// Error code approach
throw new UserNotFoundException(id)                         // simple exception
throw new BusinessException(ErrorCode.USER_NOT_FOUND)       // error code enum
```

---

## Python + FastAPI

### 읽을 파일

```
1. 2–3 test files: tests/**test_*.py or tests/**/*_test.py
2. 1–2 source files: app/**/*.py
3. conftest.py: understand shared fixtures
4. pytest.ini or pyproject.toml [tool.pytest.ini_options]: test configuration
```

### 추출할 컨벤션

**테스트 구조**

```python
# Pattern A: class-based
class TestUserService:
    def setup_method(self):
        self.mock_repo = MagicMock()
        self.sut = UserService(repository=self.mock_repo)

    def test_should_return_user_when_exists(self):
        ...

# Pattern B: function-based (pytest style)
@pytest.fixture
def user_service(mock_repo):
    return UserService(repository=mock_repo)

def test_should_return_user_when_exists(user_service, mock_repo):
    ...

# Pattern C: async
@pytest.mark.asyncio
async def test_should_return_user_when_exists(async_client):
    ...
```

**픽스처 패턴**

```python
# Check conftest.py for shared fixtures
@pytest.fixture
def mock_repo():
    return MagicMock(spec=UserRepository)

@pytest.fixture
def async_client(app):
    return AsyncClient(transport=ASGITransport(app=app), base_url="http://test")
```

**Mock 패턴**

```python
# unittest.mock
from unittest.mock import MagicMock, AsyncMock, patch

mock_repo = MagicMock(spec=UserRepository)
mock_repo.find_by_id.return_value = user

# pytest-mock (mocker fixture)
def test_something(mocker):
    mock_fn = mocker.patch('app.services.some_function')
```

**소스 파일 컨벤션**

```python
# Dependency injection

# Pattern A: FastAPI Depends
async def get_user(
    user_id: str,
    user_service: UserService = Depends(get_user_service)
):

# Pattern B: constructor injection (class-based)
class UserService:
    def __init__(self, repository: UserRepository):
        self._repository = repository

# Error handling
raise HTTPException(status_code=404, detail="User not found")  # direct
raise UserNotFoundException(user_id)                             # custom exception
return None  # return None, handle in router
```

**명명 규칙**

```python
# File names: snake_case
user_service.py, user_repository.py, test_user_service.py

# Class names: PascalCase
class UserService, class UserRepository

# Function/method names: snake_case
def get_user(self, user_id: str)
async def find_by_id(self, user_id: str)
```

---

## 컨벤션 우선순위 규칙

기존 코드가 기본 가이드와 충돌하는 경우:

```
Priority 1: Patterns directly observed in existing project code
Priority 2: Code style config files (.eslintrc, detekt, etc.)
Priority 3: Default patterns from tdd-test-writing-guide.md
```

**예시 — 기본 패턴 vs 프로젝트 패턴 충돌:**

```typescript
// tdd-test-writing-guide.md default: vi.mock() module approach
vi.mock('../services/userService')

// But if the project consistently uses constructor injection:
const mockRepo = { findById: vi.fn() }
const sut = new UserService(mockRepo as UserRepository)
// → Follow the project's approach
```

---

## 주의사항

### 최근 수정된 파일 우선

- 테스트 파일을 선택할 때, 가장 최근에 수정된 파일을 우선 선택
- 레거시 패턴과 최신 패턴이 공존하는 경우, 더 일반적인 것을 따름
- 불확실한 경우, 개발자에게 질문: "코드베이스에 패턴 A와 패턴 B가 모두 있습니다. 새 코드에는 어느 것을 선호하시나요?"

### 감지 실패 시 폴백

- 파일을 읽었지만 특정 패턴을 판단할 수 없는 경우: 기본 패턴을 사용하고 REFACTOR에서 재검토
- 감지 실패로 인해 세션 진행을 중단하지 않음

### 개발자가 컨벤션과 다른 코드를 작성할 때

개발자가 감지된 컨벤션과 맞지 않는 RED 테스트를 붙여넣는 경우:
- 테스트 의도가 명확하다면, 그대로 진행 (REFACTOR에서 컨벤션 차이를 표시)
- REFACTOR에서: "기존 테스트는 `vi.mock()`을 사용하지만 이 테스트는 직접 주입을 사용합니다. 프로젝트 컨벤션에 맞추시겠습니까?"
