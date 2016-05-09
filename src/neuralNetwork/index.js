import _ from 'lodash';
import React from 'react';
import { connect } from 'react-redux';
import NetworkGraph from './networkGraph/NetworkGraph';
import { getNetworks, getNetwork, setSnapshotIndex } from './data/neuralNetworkActions';
// import json from './network/data.json';
import LayerModal from './networkModals/LayerModal';
// import DrawingChooserModal from './networkModals/DrawingChooserModal';
import NetworkToolbar from './NetworkToolbar';
import RaisedButton from 'material-ui/lib/raised-button';
import './neuralNetwork.scss';
import * as graphConstants from './networkGraph/graphConstants';
import InfoButtons from './infoButtons/InfoButtons';
import BottomDescription from './BottomDescription';
import { feedDrawingThroughNetwork } from './networkUtils';

class Main extends React.Component {
  constructor(props) {
    super(props);
    props.dispatch(getNetworks());
    props.dispatch(getNetwork('eta_3_hidden_20_15.json'));
  }

  render() {
    if (this.props.isLoading || !this.props.selectedSnapshot) {
      return (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          Loading...
        </div>
      );
    }

    const totalEpochs = _.max(
      Object.keys(this.props.selectedNetwork.snapshots).map(n => Number(n))
    );

    return (
      <div className="container text-center">
        <NetworkToolbar
          dispatch={this.props.dispatch}
          isDrawingSelected={!!this.props.selectedDrawing}
          snapshotIndex={this.props.snapshotIndex}
          selectedNetworkSummary={this.props.selectedNetworkSummary}
          totalEpochs={totalEpochs}
        />

        <div style={{ textAlign: 'center' }}>
          <NetworkGraph
            dispatch={this.props.dispatch}
            snapshotIndex={this.props.snapshotIndex}
            selectedSnapshot={this.props.selectedSnapshot}
            testResultsSummary={this.props.testResultsSummary}
            selectedDrawing={this.props.selectedDrawing}
          />
          <InfoButtons
            selectedNetwork={this.props.selectedNetwork}
            selectedDrawing={this.props.selectedDrawing}
          />
        </div>
        <BottomDescription/>
        <LayerModal
          dispatch={this.props.dispatch}
          selectedSnapshot={this.props.selectedSnapshot}
          selectedDrawing={this.props.selectedDrawing}
        />
      </div>
    );

    // return false;


    // const $$snapshot = this.props.$$network.getIn(
    //   ['snapshots', String(this.props.snapshotIndex)]
    // );
    //
    // if (this.props.isLoading || !$$snapshot) {
    //   return (
    //     <div style={{ textAlign: 'center', marginTop: '20px' }}>
    //       Loading...
    //     </div>
    //   );
    // }
    //
    // const totalEpochs = _.max(
    //   this.props.$$network.get('snapshots').keySeq().toJS().map(n => Number(n))
    // );
    //
    // const isAnyModalOpen = _.isNumber(this.state.layerModalIndex);
    //
    // return (
    //   <div className="container text-center">
    //     <NetworkToolbar
    //       dispatch={this.props.dispatch}
    //       isDrawingSelected={!!this.props.$$selectedDrawing}
    //       snapshotIndex={this.props.snapshotIndex}
    //       onSliderChange={this._onSliderChange}
    //       testResultsSummary={this.props.testResultsSummary}
    //       totalEpochs={totalEpochs}
    //     />
    //     <div style={{ textAlign: 'center' }}>
    //       <NetworkGraph
    //         isAnyModalOpen={isAnyModalOpen}
    //         dispatch={this.props.dispatch}
    //         $$snapshot={$$snapshot}
    //         testResultsSummary={this.props.testResultsSummary}
    //         $$selectedDrawing={this.props.$$selectedDrawing}
    //       />
    //
    //       <InfoButtons
    //         $$network={this.props.$$network}
    //         $$selectedDrawing={this.props.$$selectedDrawing}
    //       />
    //     </div>
    //     <BottomDescription/>
    //     <LayerModal/>
    //   </div>
    // );
  }
}

const mapStateToProps = (state) => {
  const {
    isLoading,
    snapshotIndex,
    networkSummaries,
    selectedNetwork,
    selectedNetworkSummaryId,
    selectedDrawing
  } = state.neuralNetwork;

  const selectedSnapshot = selectedNetwork.snapshots
    && selectedNetwork.snapshots[String(snapshotIndex)];

  let testResultsSummary = null;
  if (selectedSnapshot) {
    const { testResults } = selectedSnapshot;
    testResultsSummary = Object.keys(testResults).reduce((prev, curr) => {
      const wrongCount = _.values(testResults[curr].wrong)
        .reduce((prev1, curr2) => prev1 + curr2.length, 0);
      return Object.assign({}, prev, {
        [curr]: {
          wrongCount,
          correctCount: testResults[curr].correct.length
        }
      });
    }, {});
  }

  if (selectedDrawing) {
    const [activations, zs] = feedDrawingThroughNetwork(
      selectedDrawing.x,
      selectedSnapshot.biases,
      selectedSnapshot.weights
    );
    /* Let's cheat a bit and just pass activations and zs down with drawing */
    Object.assign(selectedDrawing, { activations, zs });
  }

  return {
    isLoading,
    snapshotIndex,
    networkSummaries,
    selectedNetwork,
    selectedDrawing,
    selectedSnapshot,
    testResultsSummary,
    selectedNetworkSummary: _.find(networkSummaries, { path: selectedNetworkSummaryId })
  };

  // debugger
  //
  // const isLoading = $$state.getIn(['neuralNetwork', 'isLoading']);
  // const snapshotIndex = $$state.getIn(['neuralNetwork', 'snapshotIndex']);
  // const $$network = $$state.getIn(['neuralNetwork', 'network']);
  // const $$testResults = $$network.getIn(['snapshots', String(snapshotIndex), 'testResults']);
  // const $$selectedDrawing = $$state.getIn(['neuralNetwork', 'selectedDrawing']);
  //
  // let testResultsSummary;
  // if ($$testResults) {
  //   const testResults = $$testResults.toJS();
  //   testResultsSummary = Object.keys(testResults).reduce((prev, curr) => {
  //     const wrongCount = _.values(testResults[curr].wrong).reduce((prev1, curr2) => {
  //       return prev1 + curr2.length;
  //     }, 0);
  //     prev[curr] = {
  //       wrongCount,
  //       correctCount: testResults[curr].correct.length
  //     };
  //     return prev;
  //   }, {});
  // }
  //
  // return { $$network, snapshotIndex, testResultsSummary, $$selectedDrawing, isLoading};
};

export default connect(mapStateToProps)(Main);