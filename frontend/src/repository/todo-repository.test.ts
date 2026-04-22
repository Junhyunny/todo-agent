import { describe, expect, test, vi } from "vitest";
import { createTodo, deleteTodo, getTodos } from "./todo-repository";

const mockGetTodosApiTodosGet = vi.hoisted(() => vi.fn());
const mockCreateTodoApiTodosPost = vi.hoisted(() => vi.fn());
const mockDeleteTodoApiTodosTodoIdDelete = vi.hoisted(() => vi.fn());
vi.mock("../api/generated/agents", () => ({
  getFastAPI: () => ({
    getTodosApiTodosGet: mockGetTodosApiTodosGet,
    createTodoApiTodosPost: mockCreateTodoApiTodosPost,
    deleteTodoApiTodosTodoIdDelete: mockDeleteTodoApiTodosTodoIdDelete,
  }),
}));

describe("todo-repository", () => {
  test("getTodos는 GET /todos를 호출하고 TODO 목록을 반환한다", async () => {
    const todos = [
      { id: "1", title: "할 일 A", content: "내용 A", status: "pending" },
      { id: "2", title: "할 일 B", content: "내용 B", status: "pending" },
    ];
    mockGetTodosApiTodosGet.mockResolvedValue({ data: todos });

    const result = await getTodos();

    expect(result).toEqual(todos);
    expect(mockGetTodosApiTodosGet).toHaveBeenCalledTimes(1);
  });

  test("createTodo는 POST /todos를 호출하고 생성된 TODO를 반환한다", async () => {
    const request = { title: "새 할 일", content: "내용" };
    const created = {
      id: "1",
      title: "새 할 일",
      content: "내용",
      status: "pending",
    };
    mockCreateTodoApiTodosPost.mockResolvedValue({ data: created });

    const result = await createTodo(request);

    expect(result).toEqual(created);
    expect(mockCreateTodoApiTodosPost).toHaveBeenCalledWith(request);
  });

  test("deleteTodo는 DELETE /todos/{id}를 호출한다", async () => {
    mockDeleteTodoApiTodosTodoIdDelete.mockResolvedValue({});

    await deleteTodo("todo-id-1");

    expect(mockDeleteTodoApiTodosTodoIdDelete).toHaveBeenCalledWith(
      "todo-id-1",
    );
  });
});
