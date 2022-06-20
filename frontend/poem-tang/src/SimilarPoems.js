import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { Row, Col, Breadcrumb } from "antd";
import api from "./scripts/api.js";
import PoemList from "./components/PoemList";

const { Item } = Breadcrumb;

const SimilarPoemsPage = () => {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get("page"), 10) || 1;
  const pageSize = parseInt(searchParams.get("pageSize"), 10) || 10;
  const [poemData, setPoemData] = useState(null);
  const [poem, setPoem] = useState(null);

  useEffect(() => {
    setPoemData("loading");
    api
      .get(`/poem/${id}/similar`, {
        params: {
          start: (page - 1) * 10,
          count: pageSize,
        },
      })
      .then((res) => {
        setPoemData(res.data);
        return api.get(`/poem/${id}`);
      })
      .then((res) => {
        setPoem(res.data.data[0]);
      })
      .catch(() => {
        setPoemData("error");
      });
  }, [id, page, pageSize]);

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
              <Link to={`/poem/${id}`}>{poem ? poem.title : ""}</Link>
            </Item>
            <Item>相似作品</Item>
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
