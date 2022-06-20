import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Grid, Row, Col, Input } from "antd";
import api from "./scripts/api.js";
import logo from "./logo.png";
import PoemList from "./components/PoemList";

const { Search } = Input;
const { useBreakpoint } = Grid;

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const word = searchParams.get("q");
  const page = parseInt(searchParams.get("page"), 10) || 1;
  const pageSize = parseInt(searchParams.get("pageSize"), 10) || 10;
  let [poemData, setPoemData] = useState(null);

  const { md } = useBreakpoint();

  useEffect(() => {
    setPoemData("loading");
    api
      .get(`/poem/word/${word}`, {
        params: {
          start: (page - 1) * 10,
          count: pageSize,
        },
      })
      .then((res) => {
        setPoemData(res.data);
      })
      .catch(() => {
        setPoemData("error");
      });
  }, [page, pageSize, word]);

  if (poemData === "loading") poemData = null;
  if (poemData === "error") return <div>Error</div>;

  return (
    <>
      <Row>
        <Col
          flex={md ? "0 0 96px" : "1 0 96px"}
          style={{
            marginLeft: md ? 20 : 0,
            marginBottom: md ? 0 : 20,
          }}
        >
          <Link to="/">
            <img
              src={logo}
              alt="唐韵"
              style={{
                height: 40,
                position: "relative",
                left: "50%",
                marginLeft: -48,
              }}
            ></img>
          </Link>
        </Col>
        <Col
          flex={md ? "0 1 600px" : "0 1 100%"}
          style={{ paddingLeft: 20, paddingRight: 20 }}
        >
          <Search
            placeholder=""
            defaultValue={word}
            onSearch={(value) => {
              setPoemData(null);
              setSearchParams({ q: value });
            }}
            size="large"
            enterButton="搜索"
          />
        </Col>
      </Row>

      <PoemList
        poemData={poemData}
        empty={!word}
        emptyMessage={
          <p style={{ color: "gray", textAlign: "center" }}>请输入搜索内容。</p>
        }
        page={page}
        pageSize={pageSize}
        onPaginationChange={(page, pageSize) => {
          setPoemData(null);
          setSearchParams({ q: word, page, pageSize });
        }}
        style={{ marginTop: 30 }}
      />
    </>
  );
};

export default SearchPage;
