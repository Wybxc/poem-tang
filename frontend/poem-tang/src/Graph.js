import React, { useEffect, useRef, useState } from "react";
import { notification } from "antd";
import { InfoCircleTwoTone } from "@ant-design/icons";
import ReactDOM from "react-dom";
import G6 from "@antv/g6";
import api from "./scripts/api.js";
import Poem from "./components/Poem";

const GraphPage = () => {
  const ref = useRef(null);
  const graph = useRef(null);
  const [data, setData] = useState({ nodes: [], edges: [] });
  const [currentPoem, setCurrentPoem] = useState(null);

  useEffect(() => {
    window.graph = graph.current = new G6.Graph({
      container: ReactDOM.findDOMNode(ref.current),
      width: window.innerWidth,
      height: window.innerHeight - 118,
      modes: {
        default: ["drag-canvas", "click-select"],
      },
      layout: {
        type: "gForce",
        nodeSize: 60,
        preventOverlap: true,
        onTick: () => {
          graph.current.paint();
        },
      },
      animate: true,
      autoPaint: true,
      defaultNode: {
        type: "circle",
        size: 60,
        labelCfg: {
          style: {
            fill: "#000000A6",
            fontSize: 14,
          },
        },
        style: {
          stroke: "#72CC4A",
          width: 150,
        },
      },
      defaultEdge: {
        type: "line",
      },
      nodeStateStyles: {
        selected: {
          stroke: "#686A9E",
          lineWidth: 2,
        },
      },
    });
    graph.current.render();

    let nodes = [];
    let edges = [];
    (async () => {
      const poem = (await api.get("/poem/random")).data.data[0];
      const words = (await api.get(`word/poem/${poem.id}`)).data.data;
      nodes = [
        {
          id: "p_" + poem.id,
          label: poem.title,
          style: {
            stroke: "#9A9DEA",
            width: 150,
          },
        },
      ].concat(
        words.map((word) => ({
          id: "w_" + word.name,
          label: word.name,
        }))
      );
      edges = words.map((word) => ({
        source: "p_" + poem.id,
        target: "w_" + word.name,
      }));
      setData({ nodes, edges });
    })();

    let loaded = [];
    graph.current.on("node:dblclick", (evt) => {
      const { item } = evt;
      const id = item.getModel().id;
      if (loaded.indexOf(id) === -1) {
        loaded = [...loaded, id];
        const aid = id.slice(2);
        if (id.slice(0, 2) === "p_") {
          (async () => {
            const words = (await api.get(`word/poem/${aid}`)).data.data;
            nodes = nodes.concat(
              words.map((word) => ({
                id: "w_" + word.name,
                label: word.name,
              }))
            );
            edges = edges.concat(
              words.map((word) => ({
                source: id,
                target: "w_" + word.name,
              }))
            );
            setData({ nodes, edges });
          })();
        } else {
          (async () => {
            const poems = (await api.get(`poem/word/${aid}`)).data.data;
            nodes = nodes.concat(
              poems.map((poem) => ({
                id: "p_" + poem.id,
                label: poem.title,
                style: {
                  stroke: "#9A9DEA",
                  width: 150,
                },
              }))
            );
            edges = edges.concat(
              poems.map((poem) => ({
                source: id,
                target: "p_" + poem.id,
              }))
            );
            setData({ nodes, edges });
          })();
        }
      }
    });

    graph.current.on("nodeselectchange", (e) => {
      const { target, selectedItems } = e;
      const item = selectedItems.nodes[0];
      if (!item) return setCurrentPoem(null);
      const id = target.getModel().id;
      if (id.slice(0, 2) === "p_") {
        api
          .get(`poem/${id.slice(2)}`)
          .then((res) => {
            setCurrentPoem(res.data.data[0]);
          })
          .catch(() => {
            setCurrentPoem(null);
          });
      } else {
        setCurrentPoem(null);
      }
    });

    graph.current.on("node:dragend", () => {
      graph.current.layout();
    });

    graph.current.on("node:drag", (e) => {
      const model = e.item.get("model");
      model.fx = e.x;
      model.fy = e.y;
      model.x = e.x;
      model.y = e.y;
      graph.current.layout();
    });

    notification.open({
      message: "提示",
      description: (
        <>
          <p>蓝色节点为诗，绿色节点为词语。</p>
          <p>单击节点查看详情。</p>
          <p>双击节点获取更多与之相连的节点。</p>
        </>
      ),
      icon: <InfoCircleTwoTone />,
    });
  }, []);

  useEffect(() => {
    if (graph.current) {
      graph.current.changeData(data);
      graph.current.refresh();
    }
  }, [data]);

  return (
    <div ref={ref}>
      {currentPoem && (
        <Poem
          poem={currentPoem}
          style={{
            position: "absolute",
            right: 0,
            bottom: 0,
          }}
          maxLines={8}
        />
      )}
    </div>
  );
};

export default GraphPage;
