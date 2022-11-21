import React, { useState } from "react";
import { useStore } from "./store";
import { Container, Row, Col } from "react-bootstrap";

export const Layout = () => {
  const { state, dispatch } = useStore();
  const [showLayout, setShowLayout] = useState(false);

  return (
    <Container>
      <Row>
        <button
          onClick={() => {
            setShowLayout(!showLayout);
          }}
        >
          show layout
        </button>
      </Row>
      <Row>
        <div className={showLayout ? "layoutDiv" : "hiddenDiv"} />
      </Row>
    </Container>
  );
};
