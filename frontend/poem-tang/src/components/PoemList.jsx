import React from "react";
import { Row, Col, List, Pagination } from "antd";
import Poem from "./Poem";

const PoemList = (props) => {
  const {
    poemData,
    empty = false,
    emptyMessage = "",
    page = 1,
    pageSize = 10,
    onPaginationChange = () => {},
    ...other
  } = props;

  const data = poemData ? poemData.data : [];
  const total = poemData ? poemData.total : 0;
  return (
    <div {...other}>
      <Row>
        <Col xs={22} sm={22} md={16} lg={10} offset={1}>
          {!empty ? (
            <List
              dataSource={data}
              itemLayout="vertical"
              locale={{ emptyText: "没有找到相关内容" }}
              header={
                poemData ? (
                  <span style={{ color: "gray", fontSize: "0.75rem" }}>
                    {poemData.total}条结果
                  </span>
                ) : (
                  ""
                )
              }
              renderItem={(item) => (
                <Poem
                  poem={item}
                  words={poemData.word}
                  hoverable
                  style={{ marginBottom: 5, cursor: "initial" }}
                ></Poem>
              )}
            ></List>
          ) : (
            emptyMessage
          )}
        </Col>
      </Row>
      <Row style={{ marginTop: 20 }}>
        <Col span={22} offset={1}>
          {total > pageSize ? (
            <Pagination
              current={page}
              total={total}
              showQuickJumper
              showSizeChanger
              pageSizeOptions={[10, 20, 40]}
              onChange={onPaginationChange}
            ></Pagination>
          ) : (
            ""
          )}
        </Col>
      </Row>
    </div>
  );
};

export default PoemList;
