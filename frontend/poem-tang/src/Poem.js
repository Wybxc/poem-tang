import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Breadcrumb, Grid, Row, Col, Card, List, Divider } from "antd";
import api from "./scripts/api.js";
import Poem from "./components/Poem";
import Author from "./components/Author";
import NoMatch from "./NoMatch";

const { useBreakpoint } = Grid;
const { Item } = Breadcrumb;

const PoemPage = () => {
  const { id } = useParams();
  const [poem, setPoem] = useState(null);
  const [similars, setSimilars] = useState([]);
  const [author, SetAuthor] = useState(null);
  const { md } = useBreakpoint();
  const dividerMaxLength = md ? 30 : 10;

  useEffect(() => {
    api
      .get(`poem/${id}`)
      .then((res) => {
        setPoem(res.data.data[0]);
        return api.get(`author/${res.data.data[0].author}`);
      })
      .then((res) => {
        SetAuthor(res.data.data[0]);
        return api.get(`poem/${id}/similar?count=5`);
      })
      .then((res) => {
        setSimilars(res.data.data);
      })
      .catch(() => {
        setPoem("error");
      });
  }, [id]);

  if (poem === "error") return <NoMatch />;

  return (
    <>
      <Row style={{ marginTop: 20 }}>
        <Col span={23} offset={1}>
          <Breadcrumb>
            <Item>
              <Link to="/">主页</Link>
            </Item>
            <Item>{poem ? poem.title : ""}</Item>
          </Breadcrumb>
        </Col>
      </Row>
      <Row style={{ marginTop: 30 }}>
        <Col xs={22} sm={22} md={16} lg={10} offset={1}>
          <Poem poem={poem} disableTitleLink></Poem>
          <List
            dataSource={similars}
            itemLayout="vertical"
            locale={{ emptyText: " " }}
            header={
              similars.length && poem ? (
                <Divider style={{ borderTopColor: "rgba(0,0,0,0.3)" }}>
                  与
                  {poem.title.length <= dividerMaxLength
                    ? `《${poem.title}》`
                    : "这首诗"}
                  相似的诗
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
        {author && poem ? (
          <Col xs={22} sm={22} md={10} lg={8} offset={1}>
            <Author
              author={author}
              maxLength={1000}
              title="诗人简介"
              style={{ cursor: "initial" }}
            />
            <Card style={{ marginTop: 20 }}>
              <Link to="similar">查看全部与《{poem.title}》相似的诗</Link>
            </Card>
          </Col>
        ) : (
          ""
        )}
      </Row>
    </>
  );
};

export default PoemPage;
