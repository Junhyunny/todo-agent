# RED-GREEN-REFACTOR 가이드

각 단계에서 "완료"의 의미, 일반적인 실패 유형, 그리고 리팩토링을 건너뛰어야 할 때를 정의합니다.

또한 각 RED, GREEN, REFACTOR 단계에 들어가기 전에는 반드시 이번 단계의 작업 주체(AI 또는 개발자)를 확인합니다.
AI는 자신이 담당자로 선택된 단계에서만 파일을 수정합니다.

---

## RED 단계 — 완료 기준

RED 단계는 다음 조건이 **모두** 충족되었을 때 완료됩니다:

1. **테스트가 컴파일/파싱됨** — 구문 오류 없음, 테스트 러너가 파일을 로드하는 것을 방해하는 누락된 import 없음
2. **테스트가 실행됨** — 테스트 러너가 테스트를 실행함 (setup에서 충돌하지 않음)
3. **테스트가 실패함** — 테스트 러너가 실패를 보고함 (exit code 0이 아님, 테스트가 FAILED로 표시됨)
4. **올바른 이유로 실패함** — 실패 메시지가 assertion 실패 또는 "method not found / function not defined" 오류이며, import 오류나 테스트 setup 충돌이 아님

### 스택별 "올바른 이유"의 예시

**TypeScript:**
```
✅ CORRECT
TypeError: sut.getUser is not a function
AssertionError: expected null to equal { name: 'Alice' }

❌ WRONG (fix before calling RED confirmed)
SyntaxError: Cannot find module './UserService'  → file doesn't exist, create the file first
TypeError: Cannot read properties of undefined (reading 'getUser')  → import is broken
```

**Kotlin:**
```
✅ CORRECT
io.mockk.MockKException: no answer found for: UserRepository(#1).findById(...)
org.opentest4j.AssertionFailedError: expected: <Alice> but was: <null>

❌ WRONG
error: unresolved reference: UserService  → class doesn't exist, create it first
```

**Java:**
```
✅ CORRECT
org.mockito.exceptions.base.MockitoException: Cannot mock final class UserService
java.lang.AssertionError: expected:<Alice> but was:<null>

❌ WRONG
java.lang.ClassNotFoundException: com.example.UserService  → class doesn't exist
```

**Python:**
```
✅ CORRECT
AttributeError: 'UserService' object has no attribute 'get_user'
AssertionError: assert None == {'name': 'Alice'}

❌ WRONG
ImportError: cannot import name 'UserService' from 'app.domain.user_service'  → module missing
ModuleNotFoundError: No module named 'app.domain'  → file missing
```

### 잘못된 RED 수정 후 계속하기

테스트가 잘못된 이유로 실패하는 경우:
1. import가 작동하도록 필요한 최소한의 파일/클래스/함수 스텁을 생성합니다
2. 스텁은 동작을 구현해서는 안 됩니다 — 비어 있거나 None/null/0을 반환합니다
3. 테스트를 다시 실행합니다 — 이제 올바른 이유로 실패해야 합니다
4. 그런 다음 "red confirmed"를 호출합니다

---

## GREEN 단계 — 완료 기준

GREEN 단계는 다음 조건이 **모두** 충족되었을 때 완료됩니다:

1. **모든 테스트 통과** — exit code 0, 모든 테스트 마커가 PASSED/OK로 표시됨
2. **구현 중 새로운 테스트를 작성하지 않음** (테스트와 구현은 별도의 단계)
3. **구현이 최소화됨** — 현재 실패하는 테스트를 통과시키는 데 필요한 코드만, 그 이상은 없음

### 최소 구현 원칙

테스트를 통과시키는 가장 단순한 코드를 작성합니다:

```typescript
// Test asserts: getUser("1") returns { name: "Alice" }

// ✅ Correct minimum implementation
async getUser(id: string) {
  return this.repository.findById(id);
}

// ❌ Over-engineering during GREEN
async getUser(id: string) {
  const cached = this.cache.get(id);      // no test for this yet
  if (cached) return cached;
  const user = await this.repository.findById(id);
  if (!user) throw new UserNotFoundException(id);  // no test for this yet
  this.cache.set(id, user);
  return user;
}
```

캐싱, 오류 처리 등은 테스트가 그렇게 유도할 때만 추가합니다.

### GREEN 단계에서 테스트 문제가 발견된 경우

구현 중 테스트가 잘못 작성되었음이 드러나는 경우:
1. **테스트를 몰래 수정하지 마십시오** — PAUSE하고 개발자와 논의합니다
2. 다음을 표시합니다: "구현 중 테스트에서 문제를 발견했습니다: [설명]. 테스트를 수정해야 할까요, 아니면 테스트가 맞고 구현을 조정해야 할까요?"
3. 안내를 기다립니다

---

## REFACTOR 단계 — 검토 사항

### 체크리스트 (영향도 순서)

**1. 중복**
- 테스트와 구현에 동일한 로직이 있습니까?
- 같은 일을 하는 두 개의 함수/메서드가 있습니까?
- 동일한 매직 값이 여러 곳에서 반복됩니까?

**2. 네이밍**
- 변수/함수/클래스 이름이 주석 없이도 의도를 드러냅니까?
- 이름이 나머지 코드베이스와 일관됩니까?
- 테스트 메서드 이름이 테스트 내용을 정확하게 설명합니까?

**3. 매직 값**
- 설명되지 않은 숫자나 문자열이 있습니까? 이름 있는 상수로 추출합니다.
- 예시: `if (attempts > 3)` → `if (attempts > MAX_LOGIN_ATTEMPTS)`

**4. 메서드 길이와 복잡도**
- 10줄이 넘는 함수/메서드가 있습니까? 추출을 고려합니다.
- 하나 이상의 일을 하는 함수가 있습니까?

**5. 프레임워크 관용구**
- **Spring:** 빈이 올바르게 스코프 지정되었습니까? `@Transactional`이 올바른 위치에 있습니까?
- **React:** 훅이 올바르게 호출됩니까? state 직접 변경을 피하고 있습니까?
- **FastAPI:** 의존성 주입 패턴을 따르고 있습니까? 라우트 핸들러가 얇습니까?
- **Kotlin:** 관용적인 Kotlin을 사용하고 있습니까 (data class, extension function, scope function)?

**6. 테스트 품질**
- 구현 리팩토링 후에도 테스트가 여전히 테스트해야 할 내용을 테스트합니까?
- 테스트 setup과 assertion이 여전히 명확합니까?
- 리팩토링으로 인해 테스트가 의도치 않게 중복되지는 않았습니까?

### 리팩토링 제안하기

각 제안에 대해 다음과 같이 표시합니다:
```
**Refactoring suggestion [N/total]:** [one-line title]

Reason: [why this matters]

Before:
```[language]
[old code]
```

After:
```[language]
[new code]
```

Apply this change?
→ **yes** — apply
→ **no** — skip
→ **modify** — suggest a different approach
```

### 리팩토링 건너뛰기

즉시 건너뜁니다 (아무것도 제안하지 않음):
- 코드가 명백히 깔끔하고 관용적이며 읽기 쉬운 경우
- 테스트에 하나의 assertion만 있고 구현이 한 줄인 경우
- 양측 모두 변경이 필요 없다고 동의하는 경우

다음을 표시합니다: "코드가 깔끔합니다. 이번 사이클에서는 리팩토링이 필요 없습니다."

### 리팩토링 후

항상 확인합니다:
1. 모든 테스트가 여전히 통과함 (테스트 스위트 실행)
2. 다음을 표시합니다: "리팩토링 완료. 모든 테스트가 여전히 GREEN인가요? **'green'**을 입력하여 다음 테스트로 넘어갑니다."

---

## 일반적인 실패 유형

### RED → GREEN이 즉시 실패 (테스트가 이미 GREEN이었음)

이는 해당 동작이 이미 존재한다는 의미입니다. 선택지:
1. 테스트를 삭제하고 더 구체적인 실패 테스트를 작성합니다
2. 이 테스트가 실제로 새 것인지 중복인지 확인합니다
3. 태스크가 이미 완료되었을 수 있습니다 — 개발자에게 확인합니다

### GREEN → 모든 테스트는 통과하지만 커버리지에 빈틈이 드러남

GREEN 이후, 전체 테스트 스위트를 실행합니다 (새 테스트만이 아님). 다른 테스트가 깨지면:
1. PAUSE — 어떤 테스트가 깨졌는지와 오류 메시지를 표시합니다
2. 논의합니다: "이 구현이 기존 테스트를 깨뜨렸습니다: [목록]. 기존 테스트를 수정해야 할까요, 아니면 구현 방식을 변경해야 할까요?"

### 리팩토링이 회귀를 유발하는 경우

제안한 리팩토링으로 인해 테스트가 실패하면:
1. 즉시 인정합니다: "이 리팩토링이 테스트를 깨뜨렸습니다."
2. 리팩토링을 되돌립니다
3. 다른 더 안전한 접근 방식을 시도하거나 이 리팩토링을 건너뜁니다

### 세션이 하나의 태스크에서 너무 길어지는 경우

하나의 태스크가 3-4 사이클이 넘도록 RED-GREEN-REFACTOR 상태인데 다음 테스트가 작성되지 않는 경우:
1. 태스크 분할을 제안합니다: "이 태스크가 예상보다 큰 것 같습니다. 지금까지 구현된 것을 완료로 표시하고 나머지를 새 태스크로 분할할까요?"
2. 개발자 결정을 위해 PAUSE합니다
