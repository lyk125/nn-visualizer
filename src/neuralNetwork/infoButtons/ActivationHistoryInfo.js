import _ from 'lodash';
import React from 'react';
import InfoButtonTemplate from './InfoButtonTemplate';
import LineChart from '../networkModals/LineChart';
import { calculateActivations } from '../networkUtils';

export default class InfoButtons extends React.Component {
  constructor(props) {
    super(props);
    this._renderContent = this._renderContent.bind(this);
  }
  _renderContent() {
    const network = this.props.$$network.toJS();
    const selectedDrawing = this.props.$$selectedDrawing.toJS();

    const labels = [];
    const activations = [];
    const series = [];

    Object.keys(network).map(epochIndex => {
      labels.push(`Epoch ${epochIndex}`);
      const epochActivations = calculateActivations(
        selectedDrawing.x,
        network[epochIndex].biases,
        network[epochIndex].weights
      );
      activations.push(epochActivations[this.props.layer]);
    });

    debugger;

    for (let i = 0; i < activations.length; i++) {
      for (let j = 0; j < activations[i].length; j++) {
        if (!series[j]) {
          series[j] = [];
        }
        series[j].push(activations[i][j][0]);
      }
    }

    return <LineChart labels={labels} series={series} interpolation="monotone"/>;
  }
  render() {
    if (!this.props.$$selectedDrawing) {
      return false;
    }
    return (
      <InfoButtonTemplate
        {...this.props}
        buttonLabel="Activation History"
        modalTitle="Activation History"
      >
        {this._renderContent()}
      </InfoButtonTemplate>
    );
  }
}