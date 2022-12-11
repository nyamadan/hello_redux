import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Todo } from "server/src/types/generated/graphql";

const TODO_FIELDS = ["createdAt", "id", "status", "text"] as const;

const GQL_GET_TODO_LIST = `#graphql
  query Query {
    getTodoList { ${TODO_FIELDS.join(" ")} }
  }
`;

const GQL_ADD_TODO = `#graphql
  mutation Mutation($text: String!) {
    addTodo(text: $text) { ${TODO_FIELDS.join(" ")} }
  }
`;

const GQL_UPDATE_TODO = `#graphql
  mutation UpdateTodo($id: String!, $text: String, $status: TodoStatus) {
    updateTodo(id: $id, text: $text, status: $status) {
      ${TODO_FIELDS.join(" ")}
    }
  }
`;

const GQL_GET_TODO = `#graphql
query Query($id: String!) {
  getTodo(id: $id) { ${TODO_FIELDS.join(" ")} }
}
`;

const todoApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:4000" }),
  tagTypes: ["Todo"],
  endpoints: (builder) => ({
    getTodo: builder.query<Todo, { id: string }>({
      query: ({ id }) => ({
        url: "/",
        method: "POST",
        body: {
          query: GQL_GET_TODO,
          variables: { id },
        },
      }),
      transformResponse: (response: { data: { getTodo: Todo } }) => {
        return response.data.getTodo;
      },
      providesTags: (result) => ["Todo", { type: "Todo", id: result?.id }],
    }),
    addTodo: builder.mutation<Todo, { text: string }>({
      query: ({ text }) => ({
        url: "/",
        method: "POST",
        body: {
          query: GQL_ADD_TODO,
          variables: { text },
        },
      }),
      transformResponse: (response: { data: { addTodo: Todo } }) => {
        return response.data.addTodo;
      },
      invalidatesTags: (result) => ["Todo", { type: "Todo", id: result?.id }],
    }),
    updateTodo: builder.mutation<
      Todo,
      { id: string; status?: Todo["status"]; text?: string }
    >({
      query: ({ id, text, status }) => ({
        url: "/",
        method: "POST",
        body: {
          query: GQL_UPDATE_TODO,
          variables: { id, text, status },
        },
      }),
      transformResponse: (response: { data: { updateTodo: Todo } }) => {
        return response.data.updateTodo;
      },
      invalidatesTags: (result) => {
        return ["Todo", { type: "Todo", id: result?.id }];
      },
    }),
    getTodoList: builder.query<ReadonlyArray<Todo>, null>({
      query: () => ({
        url: "/",
        method: "POST",
        body: {
          query: GQL_GET_TODO_LIST,
        },
      }),
      transformResponse: (response: {
        data: { getTodoList: ReadonlyArray<Todo> };
      }) => {
        return response.data.getTodoList;
      },
      providesTags: (result = []) => [
        "Todo",
        ...result.map<{ type: "Todo"; id: string }>(({ id }) => ({
          type: "Todo",
          id,
        })),
      ],
    }),
  }),
});

export default todoApi;
