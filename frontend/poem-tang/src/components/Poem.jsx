import React from "react";
import { Link } from "react-router-dom";
import { Card } from "antd";
import { clipLines } from "../scripts/utils.js";
import Highlighter from "react-highlight-words";
import styles from "./link.module.less";

const Poem = (props) => {
  const {
    poem,
    maxLines = 0,
    words = [],
    disableTitleLink = false,
    disableAuthorLink = false,
    ...other
  } = props;
  if (!poem) return <Card loading {...other}></Card>;

  const { title, author, paragraphs, id } = poem;
  const highlightStyle = {
    padding: 0,
    background: "none",
    color: "red",
  };

  let titleNode = (
    <Highlighter
      searchWords={words}
      textToHighlight={title}
      highlightStyle={highlightStyle}
    ></Highlighter>
  );
  if (!disableTitleLink) {
    titleNode = (
      <Link to={`/poem/${id}`} className={styles.link} target="_blank">
        {titleNode}
      </Link>
    );
  }

  let authorNode = author;
  if (!disableAuthorLink) {
    authorNode = (
      <Link
        to={`/author/${author}`}
        className={styles.linkGray}
        target="_blank"
      >
        {authorNode}
      </Link>
    );
  }

  return (
    <Card {...other}>
      <h4 style={{ whiteSpace: "initial", fontSize: "1.25rem" }}>
        {titleNode}
      </h4>
      <p style={{ fontSize: "0.75rem" }}>{authorNode}</p>
      {clipLines(paragraphs.split("\n"), maxLines).map((line, i) => (
        <p key={i} style={{ marginBottom: "0.5em" }}>
          <Highlighter
            searchWords={words}
            textToHighlight={line}
            highlightStyle={highlightStyle}
          ></Highlighter>
        </p>
      ))}
    </Card>
  );
};

export default Poem;
