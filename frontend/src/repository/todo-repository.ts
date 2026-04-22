import {
  getFastAPI,
  type PostTodoRequest,
  type TodoResponse,
} from "../api/generated/agents";

const {
  getTodosApiTodosGet,
  createTodoApiTodosPost,
  deleteTodoApiTodosTodoIdDelete,
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
