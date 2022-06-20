import React from "react";
import { Link } from "react-router-dom";
import { Card } from "antd";
import { clipStr } from "../scripts/utils.js";
import styles from "./link.module.less";

const Author = (props) => {
  const { author, maxLength = 0, disableTitleLink = false, ...other } = props;
  if (!author) return <Card loading {...other}></Card>;

  const { name, desc } = author;

  let titleNode = name;
  if (!disableTitleLink) {
    titleNode = (
      <Link to={`/author/${name}`} className={styles.link} target="_blank">
        {titleNode}
      </Link>
    );
  }

  return (
    <Card {...other}>
      <h4 style={{ whiteSpace: "initial", fontSize: "1.25rem" }}>
        {titleNode}
      </h4>
      <p>{desc ? clipStr(desc, maxLength) : "不详。"}</p>
    </Card>
  );
};

export default Author;
