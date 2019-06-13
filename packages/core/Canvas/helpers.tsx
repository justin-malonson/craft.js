import React, { ReactNode, HTMLProps } from "react";
import { Node, NodeId, Nodes } from "~types";
import Canvas from ".";
const shortid = require("shortid");

const TextNode = (props: { text: string }): React.ReactElement => {
  return (
    <React.Fragment>
      {props.text}
    </React.Fragment>
  )
}

export const nodesToArray = (nodes: Nodes, bare: boolean = true) => {
  return Object.keys(nodes).map((nodeId) => {
    let node;
    const { type, props } = node = nodes[nodeId];
    if (bare) {
      return {
        type, props
      }
    } else {
      return node;
    }
  })
}

export const createNode = (component: React.ElementType, props: React.Props<any>, id: NodeId, parent?: NodeId): Node => {
  // const { draggable } = props;

  let node: Node = {
    type: component as React.ElementType,
    props,
    // draggable: draggable === undefined || draggable === null ? true : !!draggable
  };

  node["id"] = id;
  node["parent"] = parent;
  return node;
};

export const mapInnerChildren = (children: ReactNode) => {
  return React.Children.toArray(children).reduce(
    (result: any, child: React.ReactElement) => {
      // console.log("child", child);

      if (typeof (child) === "string") {
        child = <TextNode text={child} />
      }
      let { type, props } = child;
      let { children, ...otherProps } = (props ? props : {}) as HTMLProps<any>;
      let node: Node = {
        type: type as React.ElementType,
        props: otherProps
      };
      if (children) {
        node.props.children = mapInnerChildren(children);
      }
      result.push(node);
      return result;
    },
    []
  );
}

export const mapChildrenToNodes = (children: ReactNode, parent?: NodeId, hardId?: string): Nodes => {
  return React.Children.toArray(children).reduce(
    (result: Nodes, child: React.ReactElement | string) => {
      if (typeof (child) === "string") {
        child = <TextNode text={child} />
      }

      let { type, props } = child;
      const prefix = (type as Function) === Canvas ? "canvas" : "node";
      const id = hardId ? hardId : `${prefix}-${shortid.generate()}`;

      let node = createNode(type as React.ElementType, props, id, parent);
      result[node.id] = node;
      return result;
    },
    {}
  ) as Nodes;
};
