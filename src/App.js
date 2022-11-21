import React from "react";
import { PieceBin } from "./PieceBin";
import { Loader } from "./Loader";
import { StoreProvider } from "./store";
import { ImprovSpace } from "./ImprovSpace";
import { Layout } from "./Layout";
// import D3Graph from "./D3Graph";
import { D3Graph } from "./D3Graph";
import { D3DagreGraph } from "./D3DagreGraph";
import * as JSONdata from "./data.json";
import { Container, Row, Col } from "react-bootstrap";

// import { boundaryToSVG, scaleBoundaryToCanvas } from "./helpers";
import "./styles.css";

export default class App extends React.Component {
  componentDidMount() {
    this.setState({ data: JSONdata });
  }

  render() {
    return (
      <div className="App">
        <StoreProvider>
          <Loader data={JSONdata} />
          <div className="float-container">
            <ImprovSpace />
          </div>
          <PieceBin />
          <D3DagreGraph />
        </StoreProvider>
      </div>
    );
  }
}
