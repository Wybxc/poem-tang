import { Outlet } from "react-router";
import { Link } from "react-router-dom";
import { Grid, Layout } from "antd";
import logo from "./logoWhite.png";

const { Header, Content, Footer } = Layout;

const Frame = () => {
  const { md } = Grid.useBreakpoint();
  return (
    <Layout style={{ minHeight: "100%", overflowX: "hidden" }}>
      <Header>
        <Link to="/">
          <img src={logo} alt="唐韵" style={{ height: 35, marginTop: -10 }} />
        </Link>
        <Link to="/graph">
          {md ? (
            <p
              style={{
                color: "rgba(255,255,255,0.85)",
                fontSize: "1.25em",
                marginLeft: 20,
                float: "right",
              }}
            >
              知识图谱
            </p>
          ) : (
            ""
          )}
        </Link>
      </Header>
      <Content>
        <Outlet />
      </Content>
      <Footer></Footer>
    </Layout>
  );
};

export default Frame;
