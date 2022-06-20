import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Breadcrumb, Row, Col, List, Divider, Card } from "antd";
import api from "./scripts/api.js";
import Author from "./components/Author";
import Poem from "./components/Poem";
import NoMatch from "./NoMatch";

const { Item } = Breadcrumb;

const AuthorPage = () => {
  const { name } = useParams();
  const [author, setAuthor] = useState(null);
  const [poems, setPoems] = useState([]);

  useEffect(() => {
    setAuthor("loading");
    api
      .get(`author/${name}`)
      .then((res) => {
        setAuthor(res.data.data[0]);
        return api.get(`poem/author/${name}?count=5`);
      })
      .then((res) => {
        setPoems(res.data.data);
      })
      .catch(() => {
        setAuthor("error");
      });
  }, [name]);

  if (author === "error") return <NoMatch />;

  return (
    <>
      <Row style={{ marginTop: 20 }}>
        <Col span={23} offset={1}>
          <Breadcrumb>
            <Item>
              <Link to="/">主页</Link>
            </Item>
            <Item>{name}</Item>
          </Breadcrumb>
        </Col>
      </Row>
      <Row style={{ marginTop: 10 }}>
        <Col xs={22} sm={22} md={16} lg={10} offset={1}>
          <Author author={author} disableTitleLink></Author>
          <List
            dataSource={poems}
            itemLayout="vertical"
            locale={{ emptyText: " " }}
            header={
              poems.length && author ? (
                <Divider style={{ borderTopColor: "rgba(0,0,0,0.3)" }}>
                  {author.name}的作品
                </Divider>
              ) : (
                ""
              )
            }
            renderItem={(item) => (
              <Poem
                poem={item}
                hoverable
                style={{ marginBottom: 5, cursor: "initial" }}
              ></Poem>
            )}
          ></List>
        </Col>
        {author ? (
          <Col xs={22} sm={22} md={10} lg={8} offset={1}>
            <Card>
              <Link to="poems">查看{author.name}的全部作品</Link>
            </Card>
          </Col>
        ) : (
          ""
        )}
      </Row>
    </>
  );
};

export default AuthorPage;
