import {
  getFastAPI,
  type PostTodoRequest,
  type TodoResponse,
} from "../api/generated/agents";

const {
  getTodosApiTodosGet,
  createTodoApiTodosPost,
  deleteTodoApiTodosTodoIdDelete,
  reassignTodoApiTodosTodoIdReassignPost,
} = getFastAPI();

export const createTodo = async (
  request: PostTodoRequest,
): Promise<TodoResponse> => {
  const response = await createTodoApiTodosPost(request);
  return response.data;
};

export const getTodos = async (): Promise<TodoResponse[]> => {
  const response = await getTodosApiTodosGet();
  return response.data;
};

export const deleteTodo = async (id: string): Promise<void> => {
  await deleteTodoApiTodosTodoIdDelete(id);
};

export const reassignTodo = async (todoId: string): Promise<void> => {
  await reassignTodoApiTodosTodoIdReassignPost(todoId);
};
