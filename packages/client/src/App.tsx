import { Button, Checkbox, FormLabel, Input } from "@mui/material";
import React, { useCallback, useState } from "react";
import type { Todo } from "server/src/types/generated/graphql";
import todoApi from "./apiSlice";

const useInputText = (): [
  string,
  React.Dispatch<React.SetStateAction<string>>,
  (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
] => {
  const [inputText, setInputText] = useState<string>("");
  const onChangeInputText = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setInputText(e.target.value);
    },
    []
  );

  return [inputText, setInputText, onChangeInputText];
};

const TodoList = ({
  onClickTodoCheckbox,
  todoList,
  prefix,
}: {
  prefix: string;
  onClickTodoCheckbox: (e: React.MouseEvent<HTMLButtonElement>) => void;
  todoList?: readonly Todo[];
}) => {
  return (
    <>
      {(todoList ?? []).map((todo) => (
        <div key={`${prefix}-${todo.id}`}>
          <FormLabel>
            <Checkbox
              onClick={onClickTodoCheckbox}
              inputProps={
                {
                  "data-todo-id": todo.id,
                } as unknown as React.InputHTMLAttributes<HTMLInputElement>
              }
              checked={todo.status === "CLOSE"}
            />
            {todo.text}
          </FormLabel>
        </div>
      ))}
    </>
  );
};

function App() {
  const [inputText, setInputText, onChangeInputText] = useInputText();
  const [addTodoList] = todoApi.useAddTodoMutation();
  const [updateTodo] = todoApi.useUpdateTodoMutation();
  const { data: todoList } = todoApi.useGetTodoListQuery(null);
  const openTodoList = todoList?.filter((x) => x.status !== "CLOSE");
  const closeTodoList = todoList?.filter((x) => x.status === "CLOSE");

  const onPost = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setInputText("");
      await addTodoList({ text: inputText });
    },
    [addTodoList, inputText, setInputText]
  );

  const onClickTodoCheckbox = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      (async () => {
        const { todoId } = (
          e.target as unknown as { dataset: { todoId: string } }
        ).dataset;

        if (todoList == null) {
          return;
        }

        const idx = todoList.findIndex((todo) => todo.id == todoId);
        if (idx === -1) {
          return;
        }

        const todo = todoList[idx];
        const status: Todo["status"] =
          todo.status === "OPEN" ? "CLOSE" : "OPEN";
        updateTodo({ id: todo.id, status });
      })();
    },
    [todoList, updateTodo]
  );

  return (
    <div>
      <form onSubmit={onPost}>
        <Input
          value={inputText}
          onChange={onChangeInputText}
          inputProps={{ required: true }}
        />
        <Button type="submit">Add Todo</Button>

        <TodoList
          prefix="open"
          onClickTodoCheckbox={onClickTodoCheckbox}
          todoList={openTodoList}
        />
        <details>
          <summary>Completed</summary>
          <TodoList
            prefix="close"
            onClickTodoCheckbox={onClickTodoCheckbox}
            todoList={closeTodoList}
          />
        </details>
      </form>
    </div>
  );
}

export default App;
