import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { Row, Col, Breadcrumb } from "antd";
import api from "./scripts/api.js";
import PoemList from "./components/PoemList";

const { Item } = Breadcrumb;

const SimilarPoemsPage = () => {
  const { name } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get("page"), 10) || 1;
  const pageSize = parseInt(searchParams.get("pageSize"), 10) || 10;
  const [poemData, setPoemData] = useState(null);

  useEffect(() => {
    setPoemData("loading");
    api
      .get(`/poem/author/${name}`, {
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
  }, [name, page, pageSize]);

  if (poemData === "error") return <div>Error</div>;

  return (
    <>
      <Row style={{ marginTop: 20 }}>
        <Col span={23} offset={1}>
          <Breadcrumb>
            <Item>
              <Link to="/">主页</Link>
            </Item>
            <Item>
              <Link to={`/author/${name}`}>{name}</Link>
            </Item>
            <Item>全部作品</Item>
          </Breadcrumb>
        </Col>
      </Row>
      <PoemList
        poemData={poemData}
        page={page}
        pageSize={pageSize}
        onPaginationChange={(page, pageSize) => {
          setPoemData(null);
          setSearchParams({ page, pageSize });
        }}
      />
    </>
  );
};

export default SimilarPoemsPage;
