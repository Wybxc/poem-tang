import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { ConfigProvider } from "antd";
import { setTwoToneColor } from "@ant-design/icons";
import "antd/dist/antd.less";
import zhCN from "antd/lib/locale/zh_CN";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

setTwoToneColor("#9A9DEA");
ReactDOM.render(
  <React.StrictMode>
    <ConfigProvider locale={zhCN}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ConfigProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
