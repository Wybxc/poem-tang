import React from "react";
import { Link } from "react-router-dom";
import { Grid, Result, Button } from "antd";
import { ReactComponent as NoMatch } from "./404.svg";

const MoMatchPage = () => {
  const { xs, md } = Grid.useBreakpoint();
  const width = md ? 396 : xs ? "75%" : "60%";
  const height = md ? 373.3 : width;
  return (
    <Result
      title="404"
      icon={<NoMatch width={width} height={height} />}
      subTitle="诗无达诂，文无达诠。此处无诗，请寻他处。"
      extra={
        <Link to="/">
          <Button type="primary">去往首页</Button>
        </Link>
      }
    />
  );
};

export default MoMatchPage;
