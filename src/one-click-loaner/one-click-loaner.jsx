import React from 'react';
import {findDOMNode} from 'react-dom';
import {FormGroup, FormControl, ControlLabel, InputGroup, Button} from 'react-bootstrap';
import * as utils from '../lib/utils';
import taskcluster from 'taskcluster-client';
import LoanerButton from '../lib/ui/loaner-button';

const VALID_INPUT = /^[A-Za-z0-9_-]{8}[Q-T][A-Za-z0-9_-][CGKOSWaeimquy26-][A-Za-z0-9_-]{10}[AQgw]$/;

export default React.createClass({
  displayName: 'OneClickLoaner',

  mixins: [
    // Calls load() initially and on reload()
    utils.createTaskClusterMixin({
      clients: {
        queue: taskcluster.Queue,
      },
      // Reload when state.taskId changes, ignore credential changes
      reloadOnKeys: ['taskId'],
      reloadOnLogin: false,
    }),
    // Called handler when state.taskId changes
    utils.createWatchStateMixin({
      onKeys: {
        updateTaskIdInput: ['taskId'],
      },
    }),
    // Serialize state.taskId to location.hash as string
    utils.createLocationHashMixin({
      keys: ['taskId'],
      type: 'string',
    }),
  ],

  getInitialState() {
    return {
      taskId: '',
      taskLoaded: true,
      taskError: null,
      task: null,
      taskIdInput: '',
    };
  },

  /** Return promised state for TaskClusterMixin */
  load() {
    // Skip loading empty-strings
    if (this.state.taskId === '') {
      return {task: null};
    }

    // Reload task definition
    return {
      task: this.queue.task(this.state.taskId),
    };
  },

  /** When taskId changed we should update the input */
  updateTaskIdInput() {
    this.setState({taskIdInput: this.state.taskId});
  },

  // Render a task-inspector
  render() {
    const invalidInput = !VALID_INPUT.test(this.state.taskIdInput);

    return (
      <div>
        <h4>One-Click Loaner</h4>
        <p>
          This tool lets you create an interactive task given a <code>taskId</code>.
        </p>
        <hr />
        <form onSubmit={this.handleSubmit}>
          <FormGroup validationState={invalidInput ? 'error' : null}>
            <ControlLabel>Task ID</ControlLabel>
            <InputGroup>
              <FormControl
                type="text"
                ref="taskId"
                placeholder="Enter a taskId"
                value={this.state.taskIdInput}
                onChange={this.handleTaskIdInputChange} />
              <InputGroup.Button>
                <Button type="submit">Submit</Button>
              </InputGroup.Button>
            </InputGroup>
          </FormGroup>
        </form>
        <br /><br />
        {!invalidInput && (
          <div className="text-center">
            {this.renderWaitFor('task') || (this.state.task && (
              <LoanerButton
                buttonStyle="primary"
                buttonSize="large"
                taskId={this.state.taskId}
                task={this.state.task} />
            ))}
          </div>
        )}
      </div>
    );
  },

  /** Update TaskIdInput to reflect input */
  handleTaskIdInputChange() {
    const taskIdInput = findDOMNode(this.refs.taskId).value.trim();
    const invalidInput = !VALID_INPUT.test(taskIdInput);

    if (!invalidInput) {
      this.setState({
        taskIdInput,
        taskId: taskIdInput,
      });
    } else {
      this.setState({taskIdInput});
    }
  },

  /** Handle form submission */
  handleSubmit(e) {
    e.preventDefault();
    this.setState({taskId: this.state.taskIdInput});
  },
});
