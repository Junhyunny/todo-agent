import { beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import * as generatedAgents from "../api/generated/agents";

const mockGetTodosApiTodosGet = vi.fn();
const mockCreateTodoApiTodosPost = vi.fn();
const mockDeleteTodoApiTodosTodoIdDelete = vi.fn();
const mockReassignTodoApiTodosTodoIdReassignPost = vi.fn();
const actualFastAPI = generatedAgents.getFastAPI();

vi.spyOn(generatedAgents, "getFastAPI").mockReturnValue({
  ...actualFastAPI,
  getTodosApiTodosGet: mockGetTodosApiTodosGet,
  createTodoApiTodosPost: mockCreateTodoApiTodosPost,
  deleteTodoApiTodosTodoIdDelete: mockDeleteTodoApiTodosTodoIdDelete,
  reassignTodoApiTodosTodoIdReassignPost:
    mockReassignTodoApiTodosTodoIdReassignPost,
});

let repository: typeof import("./todo-repository");

describe("todo-repository", () => {
  beforeAll(async () => {
    repository = await import("./todo-repository.js");
  });

  beforeEach(() => {
    mockGetTodosApiTodosGet.mockReset();
    mockCreateTodoApiTodosPost.mockReset();
    mockDeleteTodoApiTodosTodoIdDelete.mockReset();
    mockReassignTodoApiTodosTodoIdReassignPost.mockReset();
  });

  test("getTodos는 GET /todos를 호출하고 TODO 목록을 반환한다", async () => {
    const todos = [
      { id: "1", title: "할 일 A", content: "내용 A", status: "pending" },
      { id: "2", title: "할 일 B", content: "내용 B", status: "pending" },
    ];
    mockGetTodosApiTodosGet.mockResolvedValue({ data: todos });

    const result = await repository.getTodos();

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

    const result = await repository.createTodo(request);

    expect(result).toEqual(created);
    expect(mockCreateTodoApiTodosPost).toHaveBeenCalledWith(request);
  });

  test("deleteTodo는 DELETE /todos/{id}를 호출한다", async () => {
    mockDeleteTodoApiTodosTodoIdDelete.mockResolvedValue({});

    await repository.deleteTodo("todo-id-1");

    expect(mockDeleteTodoApiTodosTodoIdDelete).toHaveBeenCalledWith(
      "todo-id-1",
    );
  });

  test("reassignTodo는 POST /todos/{id}/reassign을 호출한다", async () => {
    mockReassignTodoApiTodosTodoIdReassignPost.mockResolvedValue({});

    await repository.reassignTodo("todo-id-1");

    expect(mockReassignTodoApiTodosTodoIdReassignPost).toHaveBeenCalledWith(
      "todo-id-1",
    );
  });
});
