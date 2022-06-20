import React from "react";
import { Routes, Route, Outlet, useLocation } from "react-router-dom";
import MainFrame from "./MainFrame";
import Frame from "./Frame";
import Main from "./Main";
import Search from "./Search";
import Poem from "./Poem";
import SimilarPoems from "./SimilarPoems";
import Author from "./Author";
import AuthorPoems from "./AuthorPoems";
import Graph from "./Graph";
import NoMatch from "./NoMatch";

const App = () => {
  const { key } = useLocation();
  return (
    <Routes>
      <Route path="/" element={<MainFrame />}>
        <Route index element={<Main />}></Route>
        <Route path="search" element={<Search key={key} />}></Route>
      </Route>
      <Route path="/" element={<Frame />}>
        <Route path="poem" element={<Outlet />}>
          <Route path=":id" element={<Poem key={key} />}></Route>
          <Route
            path=":id/similar"
            element={<SimilarPoems key={key} />}
          ></Route>
        </Route>
        <Route path="author" element={<Outlet />}>
          <Route path=":name" element={<Author key={key} />}></Route>
          <Route path=":name/poems" element={<AuthorPoems key={key} />}></Route>
        </Route>
        <Route path="graph" element={<Graph />} />
        <Route path="*" element={<NoMatch />}></Route>
      </Route>
    </Routes>
  );
};

export default App;
