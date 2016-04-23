import _ from 'lodash';
import React from 'react';
import { connect } from 'react-redux';
import NetworkGraph from './networkGraph/NetworkGraph';
import { getNetwork, setSnapshotIndex } from './data/neuralNetworkActions';
// import json from './network/data.json';
import LayerModal from './networkModals/LayerModal';
import DrawingChooserModal from './networkModals/DrawingChooserModal';
import NetworkToolbar from './NetworkToolbar';
import RaisedButton from 'material-ui/lib/raised-button';
import './neuralNetwork.scss';
import * as graphConstants from './networkGraph/graphConstants';
import InfoButtons from './infoButtons/InfoButtons';

export class Main extends React.Component {
  constructor(props) {
    super(props);
    props.dispatch(getNetwork(null));
    this._onSliderChange = this._onSliderChange.bind(this);
    this.state = {
      layerModalIndex: null,
      drawingChooserModalOpen: false
      // biasModal
    };
    this.onLayerModalOpen = this.onLayerModalOpen.bind(this);
    this.onLayerModalClose = this.onLayerModalClose.bind(this);
    this._onDrawingChooserModalOpen = this._onDrawingChooserModalOpen.bind(this);
    this._onDrawingChooserModalClose = this._onDrawingChooserModalClose.bind(this);
  }
  onLayerModalOpen(index) {
    this.setState({ layerModalIndex: index });
  }
  onLayerModalClose() {
    this.setState({ layerModalIndex: null });
  }
  _onDrawingChooserModalOpen() {
    this.setState({ drawingChooserModalOpen: true });
  }
  _onDrawingChooserModalClose() {
    this.setState({ drawingChooserModalOpen: false });
  }
  _onSliderChange(index) {
    this.props.dispatch(setSnapshotIndex(index));
  }
  render() {
    // const trainingDataPoint = this.props.selectedDrawing;
      //json[3];
    // const trainingDataPoint = null;

    const $$snapshot = this.props.$$network.get(String(this.props.snapshotIndex));
    if (!$$snapshot) {
      return false;
    }

    const totalEpochs = _.max(
      this.props.$$network.keySeq().toJS().map(n => Number(n))
    );

    const isAnyModalOpen = _.isNumber(this.state.layerModalIndex);

        // <NetworkSummary $$testResults={$$snapshot.get('testResults')}/>


        // <div style={{ marginTop: '20px',  background: 'white' }}>
        //   <DrawingSlider dispatch={this.props.dispatch}/>
        // </div>
    return (
      <div className="container text-center" style={{ marginBottom: '50px' }}>
        <NetworkToolbar
          dispatch={this.props.dispatch}
          isDrawingSelected={!!this.props.$$selectedDrawing}
          snapshotIndex={this.props.snapshotIndex}
          onSliderChange={this._onSliderChange}
          testResultsSummary={this.props.testResultsSummary}
          totalEpochs={totalEpochs}
        />
        <div style={{ textAlign: 'center'}}>
          <NetworkGraph
            isAnyModalOpen={isAnyModalOpen}
            onLayerModalOpen={this.onLayerModalOpen}
            $$snapshot={$$snapshot}
            testResultsSummary={this.props.testResultsSummary}
            $$selectedDrawing={this.props.$$selectedDrawing}/>
            <InfoButtons/>
        </div>

        <div style={{marginTop: '100px'}}>
          Text
        </div>
        <DrawingChooserModal
          $$network={this.props.$$network}
          onClose={this._onDrawingChooserModalClose}
          isOpen={this.state.drawingChooserModalOpen}/>
        <LayerModal
          $$network={this.props.$$network}
          onClose={this.onLayerModalClose}
          layerModalIndex={this.state.layerModalIndex}/>
      </div>
    );
  }
}

const mapStateToProps = ($$state) => {
  const snapshotIndex = $$state.getIn(['neuralNetwork', 'snapshotIndex']);
  const $$network = $$state.getIn(['neuralNetwork', 'network']);
  const $$testResults = $$network.getIn([String(snapshotIndex), 'testResults']);
  const $$selectedDrawing = $$state.getIn(['neuralNetwork', 'selectedDrawing']);

  let testResultsSummary;
  if ($$testResults) {
    const testResults = $$testResults.toJS();
    testResultsSummary = Object.keys(testResults).reduce((prev, curr) => {
      const wrongCount = _.values(testResults[curr].wrong).reduce((prev1, curr2) => {
        return prev1 + curr2.length;
      }, 0);
      prev[curr] = {
        wrongCount,
        correctCount: testResults[curr].correct.length
      };
      return prev;
    }, {});
  }

  return { $$network, snapshotIndex, testResultsSummary, $$selectedDrawing };
};

export default connect(mapStateToProps)(Main);
