import { Outlet } from "react-router";
import { Link } from "react-router-dom";
import { Grid, Layout } from "antd";

const { Header, Content, Footer } = Layout;

const MainFrame = () => {
  const { md } = Grid.useBreakpoint();
  return (
    <Layout style={{ minHeight: "100%", overflowX: "hidden" }}>
      <Header style={{ background: "none" }}>
        <Link to="/graph">
          {md ? (
            <p
              style={{
                color: "rgba(0,0,0,0.85)",
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

export default MainFrame;
