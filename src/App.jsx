import "./App.css";
import {
  useState,
  useRef,
  useReducer,
  useCallback,
  createContext,
  useMemo,
  useEffect,
} from "react";
import Header from "./components/Header";
import Editor from "./components/Editor";
import List from "./components/List";

function reducer(state, action) {
  let nextState;

  switch (action.type) {
    case "INIT":
      return action.data;
    case "CREATE":
      nextState = [action.data, ...state];
      break;
    case "UPDATE":
      nextState = state.map((item) =>
        String(item.id) === String(action.targetId)
          ? { ...item, isDone: !item.isDone }
          : item
      );
      break;
    case "DELETE":
      nextState = state.filter((item) => item.id !== action.targetId);
      break;
    default:
      return state;
  }
  localStorage.setItem("myWork", JSON.stringify(nextState));
  return nextState;
}

export const TodoStateContext = createContext();
export const TodoDispatchContext = createContext();

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [todos, dispatch] = useReducer(reducer, []);
  const isRef = useRef(0);
  useEffect(() => {
    const storedData = localStorage.getItem("myWork");
    if (!storedData) {
      setIsLoading(false);
      return;
    }
    const parsedData = JSON.parse(storedData);
    if (!Array.isArray(parsedData)) {
      setIsLoading(false);
      return;
    }
    let maxId = 0;
    parsedData.forEach((item) => {
      if (Number(item.id) > maxId) {
        maxId = Number(item.id);
      }
    });
    isRef.current = maxId + 1;
    dispatch({ type: "INIT", data: parsedData });
    setIsLoading(false);
  }, []);

  const onCreate = useCallback((content) => {
    dispatch({
      type: "CREATE",
      data: {
        id: isRef.current++,
        isDone: false,
        content: content,
        date: new Date().getTime(),
      },
    });
  }, []);

  const onUpdate = useCallback((targetId) => {
    // todos State값들 중에
    // targetId와 일치하는 id를 갖는 투두 아이템의 isDone 변경
    dispatch({
      type: "UPDATE",
      targetId: targetId,
    });
  }, []);

  const onDelete = useCallback((targetId) => {
    dispatch({
      type: "DELETE",
      targetId: targetId,
    });
  }, []); //뎁스가 변경되었을때만 함수를 다시 생성하도록 바꿈

  const memoizedDispatch = useMemo(() => {
    return { onCreate, onDelete, onUpdate };
  }, []);

  if (isLoading) {
    return <div>데이터 로딩 중 입니다...</div>;
  }
  return (
    <div className="App">
      <Header />
      <TodoStateContext.Provider value={todos}>
        <TodoDispatchContext.Provider value={memoizedDispatch}>
          <Editor />
          <List />
        </TodoDispatchContext.Provider>
      </TodoStateContext.Provider>
    </div>
  );
}

export default App;
