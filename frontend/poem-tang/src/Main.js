import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Grid, Row, Col, Input } from "antd";
import { randInt } from "./scripts/utils.js";
import api from "./scripts/api.js";
import Poem from "./components/Poem";
import Author from "./components/Author";
import logo from "./logo.png";

const { Search } = Input;
const { useBreakpoint } = Grid;

const MainPage = () => {
  const navigate = useNavigate();

  const [line, setLine] = useState("");
  const [poem, setPoem] = useState(null);
  const [author, setAuthor] = useState(null);

  const { md, lg } = useBreakpoint();
  const minHeightMD = 400;
  const minHeightLG = 440;
  const getMinHeight = () =>
    md * minHeightMD + lg * (minHeightLG - minHeightMD) || 0;

  useEffect(() => {
    api
      .get("/poem/random?count=2")
      .then((res) => {
        const lines = res.data.data[0].paragraphs.split("\n");
        setLine(lines[randInt(0, lines.length - 1)]);
        let poem = res.data.data[1];
        setPoem(poem);
        return api.get(`/author/${poem.author}`);
      })
      .then((res) => {
        setAuthor(res.data.data[0]);
      })
      .catch();
  }, []);

  return (
    <>
      <Row justify="center">
        <Col xs={14} sm={10} md={6} lg={4}>
          <img src={logo} alt="唐韵" style={{ width: "100%" }}></img>
        </Col>
      </Row>
      <Row justify="center" style={{ marginTop: 20 }}>
        <Col xs={22} sm={20} md={16} lg={12}>
          <Search
            placeholder={line}
            onSearch={(value) => navigate(`/search?q=${value}`)}
            size="large"
            enterButton="搜索"
          />
        </Col>
      </Row>
      <Row justify="center" gutter={[20, 20]} style={{ marginTop: 60 }}>
        <Col xs={22} sm={22} md={12} lg={10}>
          <Poem
            poem={poem}
            maxLines={10}
            hoverable
            title="唐韵风采"
            style={{ minHeight: getMinHeight(), cursor: "initial" }}
          />
        </Col>
        <Col xs={22} sm={22} md={10} lg={8}>
          <Author
            author={author}
            maxLength={250}
            hoverable
            title="诗人简介"
            style={{ minHeight: getMinHeight(), cursor: "initial" }}
          />
        </Col>
      </Row>
    </>
  );
};

export default MainPage;
