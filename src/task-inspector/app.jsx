import React from 'react';
import ReactDOM from 'react-dom';
import TaskInspector from './taskinspector';
import * as utils from '../lib/utils';
import Layout from '../lib/Layout';

const hashManager = utils.createHashManager({separator: '/'});

ReactDOM.render((
  <Layout>
    <TaskInspector hashEntry={hashManager.root()} />
  </Layout>
), document.getElementById('root'));
