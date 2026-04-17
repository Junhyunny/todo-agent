import {
  getFastAPI,
  type PostTodoRequest,
  type TodoResponse,
} from "../api/generated/agents";

const { getTodosApiTodosGet, createTodoApiTodosPost } = getFastAPI();

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
